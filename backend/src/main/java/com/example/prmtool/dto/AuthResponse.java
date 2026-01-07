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

    private String token;
    private UUID userId;
    private String loginId;  // emailの代わりにloginId
    private String name;     // 名前追加
    private User.UserRole role;
}