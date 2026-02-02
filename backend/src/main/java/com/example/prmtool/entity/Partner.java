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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * パートナー企業エンティティ
 * パートナー企業の基本情報と複数の担当者情報を管理
 */
@Entity
@Table(name = "partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partner {

  /**
   * パートナーの一意識別子
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * 企業名（必須、一意）
   * 同じ企業名は登録不可
   */
  @Column(nullable = false, unique = true)
  @NotBlank(message = "企業名は必須です")
  private String name;

  /**
   * 業界（任意）
   */
  @Column(length = 100)
  private String industry;

  /**
   * 代表電話（任意）
   * 形式: 数字とハイフンのみ（例: 03-1234-5678、090-1234-5678）
   */
  @Column
  @Pattern(regexp = "^$|^\\d{2,4}-\\d{2,4}-\\d{4}$", message = "電話番号は「03-1234-5678」形式で入力してください")
  private String phone;

  /**
   * 郵便番号（任意）
   * 形式: 7桁の数字、ハイフンなし（例: 1234567）
   */
  @Column(length = 8)
  @Pattern(regexp = "^$|^\\d{7}$", message = "郵便番号は7桁の数字で入力してください")
  private String postalCode;

  /**
   * 住所（任意）
   */
  @Column
  private String address;

  /**
   * 企業代表メールアドレス（必須）
   * 形式: 標準的なメールアドレス形式
   */
  @Column(nullable = false, length = 255)
  @NotBlank(message = "企業代表メールアドレスは必須です")
  @Email(message = "正しいメールアドレス形式で入力してください")
  private String email;

  /**
   * 複数の担当者
   * カスケード削除により、パートナー削除時に担当者も削除
   */
  @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<PartnerContact> contacts = new ArrayList<>();

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
   * 担当者を追加するヘルパーメソッド
   * 双方向関連を正しく設定
   */
  public void addContact(PartnerContact contact) {
    contacts.add(contact);
    contact.setPartner(this);
  }

  /**
   * 担当者を削除するヘルパーメソッド
   * 双方向関連を正しく解除
   */
  public void removeContact(PartnerContact contact) {
    contacts.remove(contact);
    contact.setPartner(null);
  }
}