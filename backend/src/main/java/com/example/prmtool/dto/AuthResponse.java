package com.example.prmtool.dto;

import com.example.prmtool.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

  private String token; // 認証トークン
  private UUID userId; // ユーザーID
  private String loginId; // ログインID
  private String name; // ユーザー名
  private User.UserRole role; // ユーザーロール
}