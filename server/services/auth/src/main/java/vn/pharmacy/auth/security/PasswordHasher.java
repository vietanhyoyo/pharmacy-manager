package vn.pharmacy.auth.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;
import org.bouncycastle.crypto.generators.SCrypt;
import org.springframework.stereotype.Component;

@Component
public class PasswordHasher {
  private final SecureRandom secureRandom = new SecureRandom();

  public String hash(String password) {
    byte[] salt = new byte[16];
    secureRandom.nextBytes(salt);
    String saltHex = HexFormat.of().formatHex(salt);
    return saltHex + ":" + HexFormat.of().formatHex(derive(password, saltHex));
  }

  public boolean verify(String password, String stored) {
    if (stored == null) return false;
    String[] parts = stored.split(":", 2);
    if (parts.length != 2 || parts[0].length() != 32 || parts[1].length() != 128) return false;
    try {
      return MessageDigest.isEqual(HexFormat.of().parseHex(parts[1]), derive(password, parts[0]));
    } catch (IllegalArgumentException error) {
      return false;
    }
  }

  private byte[] derive(String password, String salt) {
    return SCrypt.generate(password.getBytes(StandardCharsets.UTF_8),
        salt.getBytes(StandardCharsets.UTF_8), 16_384, 8, 1, 64);
  }
}
