package vn.pharmacy.auth;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
@Service
public class AuthService {
  private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
  private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();
  private final AuthRepository repository;
  private final PasswordHasher passwords;
  private final ObjectMapper mapper;
  private final JdbcTemplate jdbc;
  private final byte[] jwtSecret;

  public AuthService(AuthRepository repository, PasswordHasher passwords, ObjectMapper mapper, JdbcTemplate jdbc,
      @Value("${app.jwt-secret:}") String secret) {
    if (secret.length() < 32 || secret.startsWith("replace_with_")) throw new IllegalStateException("ADMIN_JWT_SECRET must be a random value of at least 32 characters");
    this.repository = repository; this.passwords = passwords; this.mapper = mapper; this.jdbc = jdbc;
    this.jwtSecret = secret.getBytes(StandardCharsets.UTF_8);
  }

  public Object handle(String pattern, JsonNode payload) {
    return switch (pattern) {
      case "auth.health" -> health();
      case "auth.login" -> login(text(payload, "username"), text(payload, "password"));
      case "auth.authenticate" -> authenticate(optionalText(payload, "authorization"));
      case "auth.change-password" -> changePassword(payload);
      default -> throw new AuthException(400, "Auth pattern không được hỗ trợ");
    };
  }

  private Object health() {
    jdbc.queryForObject("SELECT 1", Integer.class);
    return Map.of("status", "ok", "service", "auth");
  }

  private Object login(String username, String password) {
    if (username.isBlank() || password.isEmpty()) throw new AuthException(400, "Cần tài khoản và mật khẩu");
    AuthRepository.UserCredential user = repository.findByUsername(username.trim());
    if (user == null || !passwords.verify(password, user.passwordHash())) throw new AuthException(401, "Tài khoản hoặc mật khẩu không đúng");
    AdminUser admin = user.admin();
    Map<String, Object> claims = new LinkedHashMap<>();
    claims.put("sub", admin.id()); claims.put("org", admin.organizationId()); claims.put("exp", Instant.now().getEpochSecond() + 8 * 60 * 60);
    return Map.of("token", sign(claims), "user", admin);
  }

  private AdminUser authenticate(String authorization) {
    if (authorization == null || !authorization.startsWith("Bearer ")) throw new AuthException(401, "Unauthorized");
    String[] parts = authorization.substring(7).split("\\.");
    if (parts.length != 3) throw new AuthException(401, "Unauthorized");
    try {
      byte[] expected = hmac(parts[0] + "." + parts[1]);
      byte[] actual = URL_DECODER.decode(parts[2]);
      if (!MessageDigest.isEqual(expected, actual)) throw new AuthException(401, "Unauthorized");
      JsonNode claims = mapper.readTree(URL_DECODER.decode(parts[1]));
      String userId = claims.path("sub").asText();
      String organizationId = claims.path("org").asText();
      if (userId.isBlank() || organizationId.isBlank() || claims.path("exp").asLong(0) <= Instant.now().getEpochSecond()) throw new AuthException(401, "Unauthorized");
      AdminUser user = repository.findById(userId);
      if (user == null || !user.organizationId().equals(organizationId)) throw new AuthException(401, "Unauthorized");
      return user;
    } catch (AuthException error) { throw error; }
    catch (Exception error) { throw new AuthException(401, "Unauthorized"); }
  }

  private Object changePassword(JsonNode payload) {
    AdminUser user = authenticate(optionalText(payload, "authorization"));
    String current = text(payload, "currentPassword");
    String next = text(payload, "newPassword");
    if (next.length() < 12 || next.length() > 128) throw new AuthException(400, "Mật khẩu mới cần từ 12 đến 128 ký tự");
    AuthRepository.UserCredential credentials = repository.findByUsername(user.username());
    if (credentials == null || !passwords.verify(current, credentials.passwordHash())) throw new AuthException(401, "Mật khẩu hiện tại không đúng");
    repository.changePassword(user.id(), passwords.hash(next));
    return Map.of("message", "Đã đổi mật khẩu");
  }

  private String sign(Map<String, Object> claims) {
    try {
      Map<String, Object> header = new LinkedHashMap<>(); header.put("alg", "HS256"); header.put("typ", "JWT");
      String encodedHeader = URL_ENCODER.encodeToString(mapper.writeValueAsBytes(header));
      String encodedPayload = URL_ENCODER.encodeToString(mapper.writeValueAsBytes(claims));
      return encodedHeader + "." + encodedPayload + "." + URL_ENCODER.encodeToString(hmac(encodedHeader + "." + encodedPayload));
    } catch (Exception error) { throw new AuthException(500, "Không thể tạo phiên đăng nhập"); }
  }

  private byte[] hmac(String value) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(jwtSecret, "HmacSHA256"));
    return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
  }
  private static String optionalText(JsonNode payload, String key) {
    JsonNode value = payload == null ? null : payload.get(key);
    return value != null && value.isTextual() ? value.asText() : null;
  }
  private static String text(JsonNode payload, String key) {
    String value = optionalText(payload, key);
    if (value == null) throw new AuthException(400, "Thiếu trường " + key);
    return value;
  }
}
