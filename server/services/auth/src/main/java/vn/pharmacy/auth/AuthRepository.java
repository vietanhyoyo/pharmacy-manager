package vn.pharmacy.auth;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
@Repository
public class AuthRepository {
  private final JdbcTemplate jdbc;
  public AuthRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

  public UserCredential findByUsername(String username) {
    var rows = jdbc.query("""
      SELECT u.id, u.organization_id, u.username, u.full_name, c.password_hash
      FROM users u
      JOIN organizations o ON o.id=u.organization_id AND o.code='PHARMACY_DEMO' AND o.status='ACTIVE'
      JOIN user_roles ur ON ur.user_id=u.id
      JOIN roles r ON r.id=ur.role_id AND r.code='ADMIN' AND r.organization_id=u.organization_id
      JOIN admin_credentials c ON c.user_id=u.id
      WHERE u.username=? AND u.status='ACTIVE' LIMIT 1
      """, (rs, row) -> new UserCredential(rs.getString("id"), rs.getString("organization_id"), rs.getString("username"), rs.getString("full_name"), rs.getString("password_hash")), username);
    return rows.isEmpty() ? null : rows.get(0);
  }

  public AdminUser findById(String id) {
    var rows = jdbc.query("""
      SELECT u.id, u.organization_id, u.username, u.full_name
      FROM users u
      JOIN organizations o ON o.id=u.organization_id AND o.code='PHARMACY_DEMO' AND o.status='ACTIVE'
      JOIN user_roles ur ON ur.user_id=u.id
      JOIN roles r ON r.id=ur.role_id AND r.code='ADMIN' AND r.organization_id=u.organization_id
      WHERE u.id=? AND u.status='ACTIVE' LIMIT 1
      """, (rs, row) -> new AdminUser(rs.getString("id"), rs.getString("organization_id"), rs.getString("username"), rs.getString("full_name")), id);
    return rows.isEmpty() ? null : rows.get(0);
  }

  public void changePassword(String userId, String passwordHash) {
    jdbc.update("UPDATE admin_credentials SET password_hash=? WHERE user_id=?", passwordHash, userId);
  }

  public void seedAdmin(String username, String passwordHash) {
    String organizationId = findOrCreate("SELECT id FROM organizations WHERE code=?", "INSERT INTO organizations (id,code,name) VALUES (?,?,?)", "PHARMACY_DEMO", "Nhà thuốc An Tâm");
    String roleId = findOrCreate("SELECT id FROM roles WHERE organization_id=? AND code=?", "INSERT INTO roles (id,organization_id,code,name) VALUES (?,?,?,?)", organizationId, "ADMIN", "Quản trị viên");
    String userId = findOrCreate("SELECT id FROM users WHERE organization_id=? AND username=?", "INSERT INTO users (id,organization_id,username,full_name) VALUES (?,?,?,?)", organizationId, username, "Quản trị viên");
    if (jdbc.queryForObject("SELECT COUNT(*) FROM user_roles WHERE user_id=? AND role_id=?", Integer.class, userId, roleId) == 0)
      jdbc.update("INSERT INTO user_roles (id,user_id,role_id) VALUES (?,?,?)", UUID.randomUUID().toString(), userId, roleId);
    if (jdbc.queryForObject("SELECT COUNT(*) FROM admin_credentials WHERE user_id=?", Integer.class, userId) == 0)
      jdbc.update("INSERT INTO admin_credentials (user_id,password_hash) VALUES (?,?)", userId, passwordHash);
  }

  private String findOrCreate(String selectSql, String insertSql, String... values) {
    Object[] findParams = new Object[values.length - 1];
    System.arraycopy(values, 0, findParams, 0, findParams.length);
    var found = jdbc.query(selectSql, (rs, row) -> rs.getString("id"), findParams);
    if (!found.isEmpty()) return found.get(0);
    String id = UUID.randomUUID().toString();
    Object[] insertParams = new Object[values.length + 1];
    insertParams[0] = id;
    System.arraycopy(values, 0, insertParams, 1, values.length);
    jdbc.update(insertSql, insertParams);
    return id;
  }

  public record UserCredential(String id, String organizationId, String username, String fullName, String passwordHash) {
    public AdminUser admin() { return new AdminUser(id, organizationId, username, fullName); }
  }
}
