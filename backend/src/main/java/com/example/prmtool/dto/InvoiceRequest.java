package com.example.prmtool.dto;

import com.example.prmtool.entity.Invoice;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 請求書作成・更新リクエスト
 * 
 * 更新: templateIdフィールド追加
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceRequest {

  /**
   * パートナーID
   */
  @NotNull(message = "パートナーIDは必須です")
  private UUID partnerId;

  /**
   * 発行日
   */
  @NotNull(message = "発行日は必須です")
  private LocalDate issueDate;

  /**
   * 支払期限
   */
  @NotNull(message = "支払期限は必須です")
  private LocalDate dueDate;

  /**
   * 消費税区分
   */
  @NotNull(message = "消費税区分は必須です")
  private Invoice.TaxCategory taxCategory;

  /**
   * ステータス
   */
  @NotNull(message = "ステータスは必須です")
  private Invoice.InvoiceStatus status;

  /**
   * 備考
   */
  private String notes;

  /**
   * テンプレートID
   * PDF生成時に使用するテンプレート
   */
  @NotNull(message = "テンプレートIDは必須です")
  private UUID templateId;

  /**
   * 明細（最低1件必要）
   */
  @NotEmpty(message = "明細は最低1件必要です")
  @Valid
  private List<InvoiceItemRequest> items;

  /**
   * 請求書明細リクエスト
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class InvoiceItemRequest {

    /**
     * 手数料ルールID（任意）
     */
    private UUID commissionRuleId;

    /**
     * 明細の説明
     */
    @NotBlank(message = "説明は必須です")
    private String description;

    /**
     * 数量
     */
    @NotNull(message = "数量は必須です")
    @Min(value = 1, message = "数量は1以上である必要があります")
    private Integer quantity;

    /**
     * 単価
     */
    @NotNull(message = "単価は必須です")
    @DecimalMin(value = "0.0", message = "単価は0以上である必要があります")
    private BigDecimal unitPrice;
  }
}