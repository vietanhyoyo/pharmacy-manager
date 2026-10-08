package vn.pharmacy.auth.messaging;

import com.fasterxml.jackson.databind.JsonNode;

public record RpcMessage(String id, String pattern, JsonNode payload, String replyTo) {}
