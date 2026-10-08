package vn.pharmacy.auth.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import vn.pharmacy.auth.exception.AuthException;

@Component
public class JwtTokenService {
  private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
  private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();

  private final ObjectMapper objectMapper;
  private final byte[] jwtSecret;

  public JwtTokenService(ObjectMapper objectMapper, @Value("${app.jwt-secret:}") String secret) {
    if (secret.length() < 32 || secret.startsWith("replace_with_")) {
      throw new IllegalStateException("ADMIN_JWT_SECRET must be a random value of at least 32 characters");
    }
    this.objectMapper = objectMapper;
    this.jwtSecret = secret.getBytes(StandardCharsets.UTF_8);
  }

  public String issue(String userId, String organizationId) {
    try {
      Map<String, Object> header = new LinkedHashMap<>();
      header.put("alg", "HS256");
      header.put("typ", "JWT");

      Map<String, Object> claims = new LinkedHashMap<>();
      claims.put("sub", userId);
      claims.put("org", organizationId);
      claims.put("exp", Instant.now().getEpochSecond() + 8 * 60 * 60);

      String encodedHeader = URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(header));
      String encodedPayload = URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(claims));
      String content = encodedHeader + "." + encodedPayload;
      return content + "." + URL_ENCODER.encodeToString(hmac(content));
    } catch (Exception error) {
      throw new AuthException(500, "Không thể tạo phiên đăng nhập");
    }
  }

  public TokenIdentity verifyBearer(String authorization) {
    if (authorization == null || !authorization.startsWith("Bearer ")) {
      throw unauthorized();
    }
    String[] parts = authorization.substring(7).split("\\.");
    if (parts.length != 3) throw unauthorized();

    try {
      byte[] expected = hmac(parts[0] + "." + parts[1]);
      byte[] actual = URL_DECODER.decode(parts[2]);
      if (!MessageDigest.isEqual(expected, actual)) throw unauthorized();

      JsonNode claims = objectMapper.readTree(URL_DECODER.decode(parts[1]));
      String userId = claims.path("sub").asText();
      String organizationId = claims.path("org").asText();
      long expiresAt = claims.path("exp").asLong(0);
      if (userId.isBlank() || organizationId.isBlank() || expiresAt <= Instant.now().getEpochSecond()) {
        throw unauthorized();
      }
      return new TokenIdentity(userId, organizationId);
    } catch (AuthException error) {
      throw error;
    } catch (Exception error) {
      throw unauthorized();
    }
  }

  private byte[] hmac(String value) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(jwtSecret, "HmacSHA256"));
    return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
  }

  private AuthException unauthorized() {
    return new AuthException(401, "Unauthorized");
  }

  public record TokenIdentity(String userId, String organizationId) {}
}
