package com.example.prmtool.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 送信元メールアドレスエンティティ
 * 請求書送信時に使用する送信元メールアドレスを管理
 */
@Entity
@Table(name = "sender_email_addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SenderEmailAddress {

  /**
   * 送信元メールアドレスの一意識別子
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * メールアドレス（一意、必須）
   */
  @Column(nullable = false, unique = true, length = 255)
  @NotBlank(message = "メールアドレスは必須です")
  @Email(message = "正しいメールアドレス形式で入力してください")
  private String email;

  /**
   * 表示名（送信元名として表示される）
   */
  @Column(nullable = false, length = 255)
  @NotBlank(message = "表示名は必須です")
  private String displayName;

  /**
   * デフォルト送信元フラグ
   * trueの場合、請求書送信時のデフォルト送信元として使用される
   */
  @Column(nullable = false)
  @Builder.Default
  private Boolean isDefault = false;

  /**
   * 有効フラグ
   * falseの場合、選択肢に表示されない
   */
  @Column(nullable = false)
  @Builder.Default
  private Boolean isActive = true;

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
}