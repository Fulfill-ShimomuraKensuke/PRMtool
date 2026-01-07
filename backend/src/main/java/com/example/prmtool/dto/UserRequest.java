package com.example.prmtool.dto;

import com.example.prmtool.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequest {

    @NotBlank(message = "名前は必須です")
    private String name;

    @NotBlank(message = "ログインIDは必須です")
    private String loginId;

    private String password;  // 新規作成時は必須、更新時は任意

    private String email;
    private String phone;
    private String address;
    private String position;

    @NotNull(message = "役割は必須です")
    private User.UserRole role;
}