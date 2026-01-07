package com.example.prmtool.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BootstrapRequest {

    private String name;  // 名前（任意、デフォルト"Admin"）

    @NotBlank(message = "ログインIDは必須です")
    private String loginId;  // ログインID（必須）

    @NotBlank(message = "パスワードは必須です")
    private String password;  // パスワード（必須）

    private String email;  // メールアドレス（任意）
}