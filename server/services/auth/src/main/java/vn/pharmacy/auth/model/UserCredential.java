package vn.pharmacy.auth.model;

public record UserCredential(
    String id,
    String organizationId,
    String username,
    String fullName,
    String passwordHash) {
  public AdminUser admin() {
    return new AdminUser(id, organizationId, username, fullName);
  }
}
