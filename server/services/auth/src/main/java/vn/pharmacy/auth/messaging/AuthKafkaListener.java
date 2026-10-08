package vn.pharmacy.auth.messaging;

import java.util.concurrent.TimeUnit;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import vn.pharmacy.auth.exception.AuthException;
import vn.pharmacy.auth.service.AuthRpcService;

@Component
public class AuthKafkaListener {
  private static final String DEFAULT_REPLY_TOPIC = "pharmacy.rpc.responses";

  private final AuthRpcService authRpcService;
  private final RpcMessageMapper messageMapper;
  private final KafkaTemplate<String, String> kafka;

  public AuthKafkaListener(
      AuthRpcService authRpcService,
      RpcMessageMapper messageMapper,
      KafkaTemplate<String, String> kafka) {
    this.authRpcService = authRpcService;
    this.messageMapper = messageMapper;
    this.kafka = kafka;
  }

  @KafkaListener(topics = "${app.kafka.auth-topic}")
  public void receive(ConsumerRecord<String, String> record) throws Exception {
    RpcMessage request = messageMapper.read(record.value());
    RpcReply reply;
    try {
      reply = RpcReply.success(request.id(), authRpcService.handle(request.pattern(), request.payload()));
    } catch (AuthException error) {
      reply = RpcReply.failure(request.id(), error.status(), error.getMessage());
    } catch (Exception error) {
      reply = RpcReply.failure(request.id(), 500, "Lỗi nội bộ auth service");
    }

    String replyTopic = request.replyTo() == null || request.replyTo().isBlank()
        ? DEFAULT_REPLY_TOPIC
        : request.replyTo();
    kafka.send(replyTopic, request.id(), messageMapper.write(reply)).get(10, TimeUnit.SECONDS);
  }
}
