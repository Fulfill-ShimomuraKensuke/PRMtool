package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;  // 名前（必須）

    @Column(nullable = false, unique = true)
    private String loginId;  // ログインID（必須・ユニーク）

    @Column(nullable = false)
    private String passwordHash;  // パスワード（必須）

    @Column
    private String email;  // メールアドレス（任意）

    @Column
    private String phone;  // 電話番号（任意）

    @Column
    private String address;  // 住所（任意）

    @Column
    private String position;  // 役職（任意）

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;  // 役割（必須）

    @Column(nullable = false)
    private String createdBy;

    // システム保護フラグ（初回管理者を削除・編集不可にする）
    @Column(nullable = false)
    @Builder.Default
    private Boolean isSystemProtected = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * ユーザーロールの定義
     * ADMIN: 管理者
     * REP: 担当者
     */
    public enum UserRole {
        ADMIN,
        REP
    }
}