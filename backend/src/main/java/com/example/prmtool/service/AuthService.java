package com.example.prmtool.service;

import com.example.prmtool.config.JwtUtil;
import com.example.prmtool.dto.AuthResponse;
import com.example.prmtool.dto.LoginRequest;
import com.example.prmtool.entity.User;
import com.example.prmtool.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                      JwtUtil jwtUtil,
                      AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse login(LoginRequest request) {
        // ログインIDで認証（emailからloginIdに変更）
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getLoginId(),  // emailからloginIdに変更
                        request.getPassword()));

        // ユーザー取得
        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));

        // JWTトークン生成（loginIdを使用）
        String token = jwtUtil.generateToken(user.getLoginId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .loginId(user.getLoginId())  // loginId追加
                .name(user.getName())        // name追加
                .role(user.getRole())
                .build();
    }
}