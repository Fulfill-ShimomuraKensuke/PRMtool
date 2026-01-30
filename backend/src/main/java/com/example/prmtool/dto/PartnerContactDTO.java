package com.example.prmtool.dto;

import com.example.prmtool.entity.PartnerContact;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * パートナー連絡先DTO
 * 担当者情報のデータ転送用オブジェクト
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerContactDTO {

  /**
   * 担当者ID（更新時に使用）
   */
  private UUID id;

  /**
   * 担当者名（必須）
   */
  @NotBlank(message = "担当者名は必須です")
  private String contactName;

  /**
   * 担当者電話番号（任意）
   * 形式: 数字とハイフンのみ（例: 03-1234-5678）
   * メールアドレスとどちらかは必須
   */
  @Pattern(regexp = "^$|^\\d{2,4}-\\d{2,4}-\\d{4}$", message = "電話番号は「03-1234-5678」形式で入力してください")
  private String phone;

  /**
   * 担当者メールアドレス（任意）
   * 電話番号とどちらかは必須
   */
  @Email(message = "正しいメールアドレス形式で入力してください")
  private String email;

  /**
   * PartnerContactエンティティからDTOに変換
   */
  public static PartnerContactDTO from(PartnerContact contact) {
    if (contact == null)
      return null;

    return PartnerContactDTO.builder()
        .id(contact.getId())
        .contactName(contact.getContactName())
        .phone(contact.getPhone())
        .email(contact.getEmail())
        .build();
  }
}