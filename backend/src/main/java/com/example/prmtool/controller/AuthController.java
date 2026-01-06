package com.example.prmtool.controller;

import com.example.prmtool.dto.AuthResponse;
import com.example.prmtool.dto.LoginRequest;
import com.example.prmtool.service.AuthService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("メールアドレスまたはパスワードが正しくありません"));
        }
    }
    // エラーレスポンス用の内部クラス
    private record ErrorResponse(String message) {
    }
}