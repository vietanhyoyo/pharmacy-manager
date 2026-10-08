package vn.pharmacy.auth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
@Component
public class AdminSeed implements CommandLineRunner {
  private final AuthRepository repository;
  private final PasswordHasher passwords;
  private final boolean enabled;
  private final String username;
  private final String password;
  public AdminSeed(AuthRepository repository, PasswordHasher passwords,
      @Value("${app.seed-demo-data:true}") boolean enabled,
      @Value("${app.seed-admin-username:admin}") String username,
      @Value("${app.seed-admin-password:admin123456@}") String password) {
    this.repository = repository; this.passwords = passwords; this.enabled = enabled; this.username = username; this.password = password;
  }
  @Override public void run(String... args) {
    if (enabled) repository.seedAdmin(username, passwords.hash(password));
  }
}
