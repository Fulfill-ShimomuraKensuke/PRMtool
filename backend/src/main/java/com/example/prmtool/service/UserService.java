package com.example.prmtool.service;

import com.example.prmtool.dto.UserRequest;
import com.example.prmtool.dto.UserResponse;
import com.example.prmtool.entity.User;
import com.example.prmtool.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

  private final UserRepository userRepository; // UserRepository追加
  private final PasswordEncoder passwordEncoder; // PasswordEncoder追加

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  // 全ユーザーを取得
  @Transactional(readOnly = true)
  public List<UserResponse> getAllUsers() {
    return userRepository.findAll().stream()
        .map(UserResponse::from)
        .collect(Collectors.toList());
  }

  // IDでユーザーを取得
  @Transactional(readOnly = true)
  public UserResponse getUserById(UUID id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + id));
    return UserResponse.from(user);
  }

  // 案件担当者として割り当て可能なユーザーを取得（SYSTEMロールを除外）
  @Transactional(readOnly = true)
  public List<UserResponse> getAssignableUsers() {
    return userRepository.findAll().stream()
        .filter(user -> user.getRole() != User.UserRole.SYSTEM) // SYSTEMロールは案件担当者になれない
        .map(UserResponse::from)
        .collect(Collectors.toList());
  }

  // ユーザーを作成
  @Transactional
  public UserResponse createUser(UserRequest request, String createdBy) {
    // ログインIDの重複チェック
    if (userRepository.existsByLoginId(request.getLoginId())) {
      throw new RuntimeException("このログインIDは既に使用されています: " + request.getLoginId());
    }
    // パスワードは必須
    if (request.getPassword() == null || request.getPassword().isBlank()) {
      throw new RuntimeException("パスワードは必須です");
    }
    User user = User.builder()
        .name(request.getName())
        .loginId(request.getLoginId())
        .passwordHash(passwordEncoder.encode(request.getPassword()))
        .email(request.getEmail())
        .phone(request.getPhone())
        .address(request.getAddress())
        .position(request.getPosition())
        .role(request.getRole())
        .isSystemProtected(false)
        .createdBy(createdBy)
        .build();

    User savedUser = userRepository.save(user);
    return UserResponse.from(savedUser);
  }

  // ユーザーを更新
  @Transactional
  public UserResponse updateUser(UUID id, UserRequest request) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + id));

    // システム保護されたユーザーは編集不可
    if (Boolean.TRUE.equals(user.getIsSystemProtected())) {
      throw new RuntimeException("初回管理者アカウントは編集できません");
    }
    // ログインIDの変更がある場合は重複チェック
    if (!user.getLoginId().equals(request.getLoginId())) {
      if (userRepository.existsByLoginId(request.getLoginId())) {
        throw new RuntimeException("このログインIDは既に使用されています: " + request.getLoginId());
      }
    }
    // 基本情報の更新
    user.setName(request.getName());
    user.setLoginId(request.getLoginId());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhone());
    user.setAddress(request.getAddress());
    user.setPosition(request.getPosition());
    user.setRole(request.getRole());
    // パスワードが指定されている場合のみ更新
    if (request.getPassword() != null && !request.getPassword().isBlank()) {
      user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    }
    User updatedUser = userRepository.save(user);
    return UserResponse.from(updatedUser);
  }

  // ユーザーを削除
  @Transactional
  public void deleteUser(UUID id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + id));

    // システム保護されたユーザーは削除不可
    if (Boolean.TRUE.equals(user.getIsSystemProtected())) {
      throw new RuntimeException("初回管理者アカウントは削除できません");
    }
    userRepository.deleteById(id);
  }
}