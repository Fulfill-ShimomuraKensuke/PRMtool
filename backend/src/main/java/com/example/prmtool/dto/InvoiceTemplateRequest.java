package com.example.prmtool.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * InvoiceTemplateリクエストDTO
 * テンプレート作成・更新時にクライアントから受け取るデータ
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceTemplateRequest {

  // テンプレート基本情報
  @NotBlank(message = "テンプレート名は必須です")
  @Size(max = 100, message = "テンプレート名は100文字以内で入力してください")
  private String templateName; // テンプレート名

  private String description; // 説明

  // ヘッダー設定
  private String logoUrl; // ロゴURL
  private String companyName; // 会社名
  private String companyAddress; // 住所
  private String companyPhone; // 電話番号
  private String companyEmail; // メールアドレス
  private String companyWebsite; // ウェブサイト

  // レイアウト・デザイン設定（旧形式、下位互換性のため保持）
  private String layoutSettings; // レイアウト設定JSON
  private String primaryColor; // プライマリカラー
  private String secondaryColor; // セカンダリカラー
  private String fontFamily; // フォント
  private String displaySettings; // 表示設定JSON

  // フッター設定
  private String footerText; // フッターテキスト
  private String bankInfo; // 銀行情報
  private String paymentTerms; // 支払条件

  // キャンバスレイアウト - エディタで作成したレイアウト情報
  private String canvasLayout; // JSON形式でキャンバス上の全要素の配置情報を保存

  // デフォルト設定
  private Boolean isDefault; // デフォルトフラグ
}