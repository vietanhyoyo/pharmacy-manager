package vn.pharmacy.auth.dto.response;

import vn.pharmacy.auth.model.AdminUser;

public record AuthSessionResponse(String token, AdminUser user) {}
