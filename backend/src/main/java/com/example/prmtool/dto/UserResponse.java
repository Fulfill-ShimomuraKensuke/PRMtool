package com.example.prmtool.dto;

import com.example.prmtool.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private UUID id;
    private String name;
    private String loginId;
    private String email;
    private String phone;
    private String address;
    private String position;
    private User.UserRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .loginId(user.getLoginId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .position(user.getPosition())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
