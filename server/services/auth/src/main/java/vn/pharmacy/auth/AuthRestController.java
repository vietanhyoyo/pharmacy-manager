package vn.pharmacy.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthRestController {
  private final AuthService auth;
  private final ObjectMapper mapper;

  public AuthRestController(AuthService auth, ObjectMapper mapper) {
    this.auth = auth;
    this.mapper = mapper;
  }

  @PostMapping("/login")
  public Object login(@RequestBody(required = false) JsonNode body) {
    return auth.handle("auth.login", body);
  }

  @GetMapping("/me")
  public Object currentUser(@RequestHeader(value = "Authorization", required = false) String authorization) {
    ObjectNode payload = mapper.createObjectNode();
    if (authorization != null) payload.put("authorization", authorization);
    return auth.handle("auth.authenticate", payload);
  }

  @PostMapping("/change-password")
  public Object changePassword(@RequestBody(required = false) JsonNode body,
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    ObjectNode payload = body != null && body.isObject()
        ? ((ObjectNode) body).deepCopy()
        : mapper.createObjectNode();
    if (authorization != null) payload.put("authorization", authorization);
    return auth.handle("auth.change-password", payload);
  }
}
