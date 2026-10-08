package vn.pharmacy.auth.dto.request;

public record ChangePasswordRequest(String currentPassword, String newPassword) {}
