package vn.pharmacy.auth.messaging;

public record RpcReply(String id, boolean ok, Object data, RpcFailure error) {
  public static RpcReply success(String id, Object data) {
    return new RpcReply(id, true, data, null);
  }

  public static RpcReply failure(String id, int status, String message) {
    return new RpcReply(id, false, null, new RpcFailure(status, message));
  }

  public record RpcFailure(int status, String message) {}
}
