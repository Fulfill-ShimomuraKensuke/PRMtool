package com.example.prmtool.service;

import com.example.prmtool.config.JwtUtil;
import com.example.prmtool.dto.AuthResponse;
import com.example.prmtool.dto.LoginRequest;
import com.example.prmtool.dto.RegisterRequest;
import com.example.prmtool.entity.User;
import com.example.prmtool.entity.User.UserRole;
import com.example.prmtool.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

@Service
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final AuthenticationManager authenticationManager;

        @Value("${app.initial-admin-key}")
        private String initialAdminKey;

        public AuthService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil,
                        AuthenticationManager authenticationManager) {
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtUtil = jwtUtil;
                this.authenticationManager = authenticationManager;
        }

        public AuthResponse register(RegisterRequest request) {
                throw new UnsupportedOperationException(
                                "Direct registration is disabled. Use bootstrap registration.");
        }

        public AuthResponse login(LoginRequest request) {
                // 認証
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

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

        @Transactional
        public AuthResponse bootstrapRegister(RegisterRequest request, String secret) {

                // ① Secretチェック
                if (!initialAdminKey.equals(secret)) {
                        throw new RuntimeException("Invalid initial admin key");
                }

                // ② ADMIN が既に存在したら終了
                long adminCount = userRepository.countByRoleForUpdate(UserRole.ADMIN);
                if (adminCount > 0) {
                        throw new RuntimeException("Admin already exists");
                }

                // ③ メール重複チェック
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("このメールアドレスは既に登録されています");
                }

                // ④ 初期管理者作成
                User admin = User.builder()
                                .email(request.getEmail())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .role(UserRole.ADMIN)
                                .createdBy("SYSTEM")
                                .build();

                User savedUser = userRepository.save(admin);

                // ⑤ JWT 発行
                String token = jwtUtil.generateToken(savedUser.getEmail());

                return AuthResponse.builder()
                                .token(token)
                                .userId(savedUser.getId())
                                .email(savedUser.getEmail())
                                .role(savedUser.getRole())
                                .build();
        }
}