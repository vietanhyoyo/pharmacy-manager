package vn.pharmacy.auth.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class RpcMessageMapper {
  private final ObjectMapper objectMapper;

  public RpcMessageMapper(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  public RpcMessage read(String message) throws JsonProcessingException {
    return objectMapper.readValue(message, RpcMessage.class);
  }

  public String write(RpcReply reply) throws JsonProcessingException {
    return objectMapper.writeValueAsString(reply);
  }
}
