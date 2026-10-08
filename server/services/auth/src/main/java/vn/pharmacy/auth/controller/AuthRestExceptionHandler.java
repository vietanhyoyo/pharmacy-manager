package vn.pharmacy.auth.controller;

import java.util.Map;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.pharmacy.auth.exception.AuthException;

@RestControllerAdvice
public class AuthRestExceptionHandler {
  @ExceptionHandler(AuthException.class)
  public ResponseEntity<Map<String, String>> handleAuthException(AuthException error) {
    return ResponseEntity.status(HttpStatusCode.valueOf(error.status()))
        .body(Map.of("message", error.getMessage()));
  }
}
