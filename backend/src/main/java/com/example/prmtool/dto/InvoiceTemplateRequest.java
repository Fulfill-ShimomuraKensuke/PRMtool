package com.example.prmtool.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * InvoiceTemplateリクエストDTO
 * クライアントから受け取るテンプレートデータを検証
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceTemplateRequest {

  // テンプレート基本情報
  @NotBlank(message = "テンプレート名は必須です")
  @Size(max = 100, message = "テンプレート名は100文字以内で入力してください")
  private String templateName; // テンプレート識別名

  @Size(max = 1000, message = "説明は1000文字以内で入力してください")
  private String description; // テンプレートの用途説明

  // ヘッダー設定
  @Size(max = 500, message = "ロゴURLは500文字以内で入力してください")
  private String logoUrl; // 会社ロゴのURL

  @Size(max = 200, message = "会社名は200文字以内で入力してください")
  private String companyName; // 請求元会社名

  @Size(max = 500, message = "住所は500文字以内で入力してください")
  private String companyAddress; // 会社住所

  @Size(max = 50, message = "電話番号は50文字以内で入力してください")
  private String companyPhone; // 連絡先電話番号

  @Size(max = 100, message = "メールアドレスは100文字以内で入力してください")
  private String companyEmail; // 連絡先メールアドレス

  @Size(max = 200, message = "ウェブサイトURLは200文字以内で入力してください")
  private String companyWebsite; // 会社ウェブサイト

  // レイアウト・デザイン設定
  private String layoutSettings; // JSON形式のレイアウト設定

  @Size(max = 20, message = "プライマリカラーは20文字以内で入力してください")
  private String primaryColor; // メインカラーコード

  @Size(max = 20, message = "セカンダリカラーは20文字以内で入力してください")
  private String secondaryColor; // サブカラーコード

  @Size(max = 50, message = "フォント名は50文字以内で入力してください")
  private String fontFamily; // 使用フォント

  private String displaySettings; // JSON形式の表示項目設定

  // フッター設定
  private String footerText; // フッターに表示するテキスト

  private String bankInfo; // 振込先銀行情報

  private String paymentTerms; // 支払条件

  // デフォルト設定
  private Boolean isDefault; // デフォルトテンプレートとして設定するか
}