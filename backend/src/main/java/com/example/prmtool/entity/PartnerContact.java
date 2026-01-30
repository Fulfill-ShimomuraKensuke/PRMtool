package com.example.prmtool.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * パートナー連絡先エンティティ
 * パートナー企業の担当者情報を管理
 * 電話番号またはメールアドレスのどちらかは必須
 */
@Entity
@Table(name = "partner_contacts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerContact {

  /**
   * 連絡先の一意識別子
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * 所属するパートナー企業
   * 必須の関連
   */
  @ManyToOne
  @JoinColumn(name = "partner_id", nullable = false)
  private Partner partner;

  /**
   * 担当者名（必須）
   */
  @Column(nullable = false)
  @NotBlank(message = "担当者名は必須です")
  private String contactName;

  /**
   * 担当者電話番号（任意）
   * 形式: 数字とハイフンのみ（例: 03-1234-5678、090-1234-5678）
   * メールアドレスとどちらかは必須
   */
  @Column(length = 20)
  @Pattern(regexp = "^$|^\\d{2,4}-\\d{2,4}-\\d{4}$", message = "電話番号は「03-1234-5678」形式で入力してください")
  private String phone;

  /**
   * 担当者メールアドレス（任意）
   * 形式: 標準的なメールアドレス形式
   * 電話番号とどちらかは必須
   */
  @Column(length = 255)
  @Email(message = "正しいメールアドレス形式で入力してください")
  private String email;

  /**
   * 作成日時（自動設定）
   */
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /**
   * 更新日時（自動設定）
   */
  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt;

  /**
   * 電話番号またはメールアドレスのバリデーション
   * どちらかは必須
   * データベース制約と併用
   */
  public boolean hasValidContactInfo() {
    return (phone != null && !phone.isBlank()) ||
        (email != null && !email.isBlank());
  }
}