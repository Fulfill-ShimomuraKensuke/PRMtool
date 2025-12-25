package com.example.prmtool.service;

import com.example.prmtool.config.JwtUtil;
import com.example.prmtool.dto.AuthResponse;
import com.example.prmtool.dto.LoginRequest;
import com.example.prmtool.dto.RegisterRequest;
import com.example.prmtool.entity.User;
import com.example.prmtool.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      JwtUtil jwtUtil,
                      AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // メールアドレスの重複チェック
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("このメールアドレスは既に登録されています");
        }

        // ユーザー作成
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        User savedUser = userRepository.save(
                Objects.requireNonNull(user)
        );

        // JWTトークン生成
        String token = jwtUtil.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // 認証
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // ユーザー取得
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));

        // JWTトークン生成
        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}