package com.example.prmtool.dto;

import com.example.prmtool.entity.InvoiceTemplate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * InvoiceTemplateレスポンスDTO
 * テンプレート情報をクライアントに返却
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceTemplateResponse {

  private UUID id; // テンプレート識別子

  // テンプレート基本情報
  private String templateName; // テンプレート名
  private String description; // 説明

  // ヘッダー設定
  private String logoUrl; // 会社ロゴURL
  private String companyName; // 会社名
  private String companyAddress; // 住所
  private String companyPhone; // 電話番号
  private String companyEmail; // メールアドレス
  private String companyWebsite; // ウェブサイト

  // レイアウト・デザイン設定
  private String layoutSettings; // レイアウト設定JSON
  private String primaryColor; // プライマリカラー
  private String secondaryColor; // セカンダリカラー
  private String fontFamily; // フォント
  private String displaySettings; // 表示設定JSON

  // フッター設定
  private String footerText; // フッターテキスト
  private String bankInfo; // 銀行情報
  private String paymentTerms; // 支払条件

  // デフォルト設定
  private Boolean isDefault; // デフォルトフラグ

  // メタデータ
  private UUID createdById; // 作成者ID
  private String createdByName; // 作成者名
  private LocalDateTime createdAt; // 作成日時
  private LocalDateTime updatedAt; // 更新日時

  /**
   * InvoiceTemplateエンティティからレスポンスDTOに変換
   * データベースのエンティティをクライアント向けに整形
   */
  public static InvoiceTemplateResponse from(InvoiceTemplate template) {
    return InvoiceTemplateResponse.builder()
        .id(template.getId())
        .templateName(template.getTemplateName())
        .description(template.getDescription())
        .logoUrl(template.getLogoUrl())
        .companyName(template.getCompanyName())
        .companyAddress(template.getCompanyAddress())
        .companyPhone(template.getCompanyPhone())
        .companyEmail(template.getCompanyEmail())
        .companyWebsite(template.getCompanyWebsite())
        .layoutSettings(template.getLayoutSettings())
        .primaryColor(template.getPrimaryColor())
        .secondaryColor(template.getSecondaryColor())
        .fontFamily(template.getFontFamily())
        .displaySettings(template.getDisplaySettings())
        .footerText(template.getFooterText())
        .bankInfo(template.getBankInfo())
        .paymentTerms(template.getPaymentTerms())
        .isDefault(template.getIsDefault())
        .createdById(template.getCreatedBy().getId())
        .createdByName(template.getCreatedBy().getName())
        .createdAt(template.getCreatedAt())
        .updatedAt(template.getUpdatedAt())
        .build();
  }
}