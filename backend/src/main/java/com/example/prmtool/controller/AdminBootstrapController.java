package com.example.prmtool.controller;

import com.example.prmtool.dto.AuthResponse;
import com.example.prmtool.dto.BootstrapRequest;
import com.example.prmtool.service.AdminBootstrapService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminBootstrapController {

  private final AdminBootstrapService adminBootstrapService;

  @Value("${app.initial-admin-key}")
  private String expectedAdminKey;

  public AdminBootstrapController(AdminBootstrapService adminBootstrapService) {
    this.adminBootstrapService = adminBootstrapService;
  }

  @PostMapping("/bootstrap")
  public ResponseEntity<?> bootstrap(
      @RequestHeader(value = "X-INITIAL-ADMIN-KEY", required = true) String providedKey,
      @Valid @RequestBody BootstrapRequest request) {

    // デバッグ用ログ
    System.out.println("Expected key: " + expectedAdminKey);
    System.out.println("Provided key: " + providedKey);

    if (!expectedAdminKey.equals(providedKey)) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Invalid initial admin key"));
    }

    try {
      AuthResponse response = adminBootstrapService.createInitialAdmin(request);
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(e.getMessage()));
    }
  }

  private record ErrorResponse(String message) {
  }
}