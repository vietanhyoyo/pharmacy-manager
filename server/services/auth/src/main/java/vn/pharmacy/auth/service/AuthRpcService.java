package vn.pharmacy.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import vn.pharmacy.auth.dto.request.ChangePasswordRequest;
import vn.pharmacy.auth.dto.request.LoginRequest;
import vn.pharmacy.auth.exception.AuthException;

@Service
public class AuthRpcService {
  private final AuthService authService;

  public AuthRpcService(AuthService authService) {
    this.authService = authService;
  }

  public Object handle(String pattern, JsonNode payload) {
    return switch (pattern) {
      case "auth.health" -> authService.health();
      case "auth.login" -> authService.login(new LoginRequest(
          requiredText(payload, "username"), requiredText(payload, "password")));
      case "auth.authenticate" -> authService.authenticate(optionalText(payload, "authorization"));
      case "auth.change-password" -> authService.changePassword(
          optionalText(payload, "authorization"),
          new ChangePasswordRequest(
              optionalText(payload, "currentPassword"),
              optionalText(payload, "newPassword")));
      default -> throw new AuthException(400, "Auth pattern không được hỗ trợ");
    };
  }

  private String requiredText(JsonNode payload, String key) {
    String value = optionalText(payload, key);
    if (value == null) throw new AuthException(400, "Thiếu trường " + key);
    return value;
  }

  private String optionalText(JsonNode payload, String key) {
    JsonNode value = payload == null ? null : payload.get(key);
    return value != null && value.isTextual() ? value.asText() : null;
  }
}
