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
public class LoginRequest {

    @NotBlank(message = "ログインIDは必須です")
    private String loginId;  // emailからloginIdに変更

    @NotBlank(message = "パスワードは必須です")
    private String password;
}