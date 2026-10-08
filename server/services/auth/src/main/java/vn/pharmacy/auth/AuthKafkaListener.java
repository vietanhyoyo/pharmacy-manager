package vn.pharmacy.auth;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.concurrent.TimeUnit;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
@Component
public class AuthKafkaListener {
  private final AuthService auth;
  private final ObjectMapper mapper;
  private final KafkaTemplate<String, String> kafka;
  public AuthKafkaListener(AuthService auth, ObjectMapper mapper, KafkaTemplate<String, String> kafka) {
    this.auth = auth; this.mapper = mapper; this.kafka = kafka;
  }
  @KafkaListener(topics = "${app.kafka.auth-topic}")
  public void receive(ConsumerRecord<String, String> record) throws Exception {
    RpcMessage request = mapper.readValue(record.value(), RpcMessage.class);
    RpcReply reply;
    try { reply = RpcReply.success(request.id(), auth.handle(request.pattern(), request.payload())); }
    catch (AuthException error) { reply = RpcReply.failure(request.id(), error.status(), error.getMessage()); }
    catch (Exception error) { reply = RpcReply.failure(request.id(), 500, "Lỗi nội bộ auth service"); }
    String topic = request.replyTo() == null || request.replyTo().isBlank() ? "pharmacy.rpc.responses" : request.replyTo();
    kafka.send(topic, request.id(), mapper.writeValueAsString(reply)).get(10, TimeUnit.SECONDS);
  }
}
