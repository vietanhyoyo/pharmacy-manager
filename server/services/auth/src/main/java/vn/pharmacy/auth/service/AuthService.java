package vn.pharmacy.auth.service;

import org.springframework.stereotype.Service;
import vn.pharmacy.auth.dto.request.ChangePasswordRequest;
import vn.pharmacy.auth.dto.request.LoginRequest;
import vn.pharmacy.auth.dto.response.AuthHealthResponse;
import vn.pharmacy.auth.dto.response.AuthSessionResponse;
import vn.pharmacy.auth.dto.response.MessageResponse;
import vn.pharmacy.auth.exception.AuthException;
import vn.pharmacy.auth.model.AdminUser;
import vn.pharmacy.auth.model.UserCredential;
import vn.pharmacy.auth.repository.AuthRepository;
import vn.pharmacy.auth.security.JwtTokenService;
import vn.pharmacy.auth.security.PasswordHasher;

@Service
public class AuthService {
  private final AuthRepository repository;
  private final PasswordHasher passwords;
  private final JwtTokenService tokens;

  public AuthService(AuthRepository repository, PasswordHasher passwords, JwtTokenService tokens) {
    this.repository = repository;
    this.passwords = passwords;
    this.tokens = tokens;
  }

  public AuthHealthResponse health() {
    repository.checkConnection();
    return new AuthHealthResponse("ok", "auth");
  }

  public AuthSessionResponse login(LoginRequest request) {
    if (request == null || request.username() == null) throw missingField("username");
    if (request.password() == null) throw missingField("password");
    if (request.username().isBlank() || request.password().isEmpty()) {
      throw new AuthException(400, "Cần tài khoản và mật khẩu");
    }

    UserCredential user = repository.findByUsername(request.username().trim());
    if (user == null || !passwords.verify(request.password(), user.passwordHash())) {
      throw new AuthException(401, "Tài khoản hoặc mật khẩu không đúng");
    }
    AdminUser admin = user.admin();
    String token = tokens.issue(admin.id(), admin.organizationId());
    return new AuthSessionResponse(token, admin);
  }

  public AdminUser authenticate(String authorization) {
    JwtTokenService.TokenIdentity identity = tokens.verifyBearer(authorization);
    AdminUser user = repository.findById(identity.userId());
    if (user == null || !user.organizationId().equals(identity.organizationId())) {
      throw new AuthException(401, "Unauthorized");
    }
    return user;
  }

  public MessageResponse changePassword(String authorization, ChangePasswordRequest request) {
    AdminUser user = authenticate(authorization);
    if (request == null || request.currentPassword() == null) throw missingField("currentPassword");
    if (request.newPassword() == null) throw missingField("newPassword");
    if (request.newPassword().length() < 12 || request.newPassword().length() > 128) {
      throw new AuthException(400, "Mật khẩu mới cần từ 12 đến 128 ký tự");
    }

    UserCredential credentials = repository.findByUsername(user.username());
    if (credentials == null || !passwords.verify(request.currentPassword(), credentials.passwordHash())) {
      throw new AuthException(401, "Mật khẩu hiện tại không đúng");
    }
    repository.changePassword(user.id(), passwords.hash(request.newPassword()));
    return new MessageResponse("Đã đổi mật khẩu");
  }

  private AuthException missingField(String field) {
    return new AuthException(400, "Thiếu trường " + field);
  }
}
