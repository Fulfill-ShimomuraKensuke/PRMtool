package com.example.prmtool.service;

import com.example.prmtool.config.JwtUtil;
import com.example.prmtool.dto.AuthResponse;
import com.example.prmtool.dto.BootstrapRequest;
import com.example.prmtool.entity.User;
import com.example.prmtool.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBootstrapService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminBootstrapService(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse createInitialAdmin(BootstrapRequest request) {
        // 既に管理者が存在するかチェック
        if (userRepository.count() > 0) {
            throw new RuntimeException("Initial admin already exists");
        }

        // メールアドレスの重複チェック
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("このメールアドレスは既に登録されています");
        }

        // 初期管理者を作成（roleは常にADMIN）
        User admin = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.ADMIN)
                .createdBy("bootstrap")
                .build();

        User savedAdmin = userRepository.save(admin);

        // JWTトークン生成
        String token = jwtUtil.generateToken(savedAdmin.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(savedAdmin.getId())
                .email(savedAdmin.getEmail())
                .role(savedAdmin.getRole())
                .build();
    }
}