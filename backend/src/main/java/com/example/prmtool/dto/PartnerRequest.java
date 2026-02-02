package com.example.prmtool.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * パートナーリクエストDTO
 * パートナー企業の作成・更新リクエスト用オブジェクト
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRequest {

  /**
   * 企業名（必須、一意）
   */
  @NotBlank(message = "企業名は必須です")
  private String name;

  /**
   * 業界（任意）
   */
  private String industry;

  /**
   * 代表電話（任意）
   * 形式: 数字とハイフンのみ（例: 03-1234-5678）
   */
  @Pattern(regexp = "^$|^\\d{2,4}-\\d{2,4}-\\d{4}$", message = "電話番号は「03-1234-5678」形式で入力してください")
  private String phone;

  /**
   * 郵便番号（任意）
   * 形式: 7桁の数字、ハイフンなし（例: 1234567）
   */
  @Pattern(regexp = "^$|^\\d{7}$", message = "郵便番号は7桁の数字で入力してください")
  private String postalCode;

  /**
   * 住所（任意）
   */
  private String address;

  /**
   * 企業代表メールアドレス（必須）
   */
  @NotBlank(message = "企業代表メールアドレスは必須です")
  @Email(message = "正しいメールアドレス形式で入力してください")
  private String email;

  /**
   * 担当者リスト（最低1人必須）
   * 各担当者のバリデーションも実行
   */
  @NotEmpty(message = "担当者は最低1人必要です")
  @Valid
  private List<PartnerContactDTO> contacts;
}