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
  private UUID id; // 一意識別子

  @Column(nullable = false)
  private String name; // ユーザー名

  @Column(nullable = false, unique = true)
  private String loginId; // ログインID

  @Column(nullable = false)
  private String passwordHash; // ハッシュ化されたパスワード

  @Column(nullable = false)
  private String email; // メールアドレス

  private String phone;// 電話番号
  private String address; // 住所
  private String position; // 役職

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private UserRole role; // ユーザーロール

  @Column(nullable = false)
  @Builder.Default
  private Boolean isSystemProtected = false; // システム保護フラグ

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt; // 作成日時

  @Column(nullable = false)
  private String createdBy; // 作成者

  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt; // 更新日時

  // ユーザーの役割を定義
  public enum UserRole {
    SYSTEM, // システム管理者：アカウント管理のみ可能、案件・パートナーへのアクセス不可
    ADMIN,  // 管理者：全ての機能にアクセス可能
    REP     // 担当者：限定的な機能にアクセス可能
  }
}
