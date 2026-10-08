package vn.pharmacy.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.pharmacy.auth.dto.request.ChangePasswordRequest;
import vn.pharmacy.auth.dto.request.LoginRequest;
import vn.pharmacy.auth.dto.response.AuthSessionResponse;
import vn.pharmacy.auth.dto.response.MessageResponse;
import vn.pharmacy.auth.model.AdminUser;
import vn.pharmacy.auth.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthRestController {
  private final AuthService authService;

  public AuthRestController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public AuthSessionResponse login(@RequestBody(required = false) LoginRequest request) {
    return authService.login(request);
  }

  @GetMapping("/me")
  public AdminUser currentUser(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    return authService.authenticate(authorization);
  }

  @PostMapping("/change-password")
  public MessageResponse changePassword(
      @RequestBody(required = false) ChangePasswordRequest request,
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    return authService.changePassword(authorization, request);
  }
}
