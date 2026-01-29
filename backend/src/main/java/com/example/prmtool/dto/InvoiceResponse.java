package com.example.prmtool.dto;

import com.example.prmtool.entity.CommissionRule;
import com.example.prmtool.entity.Invoice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 請求書レスポンス
 * 
 * 更新: templateId, templateNameフィールド追加
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponse {

  private UUID id;
  private String invoiceNumber;
  private UUID partnerId;
  private String partnerName;
  private LocalDate issueDate;
  private LocalDate dueDate;
  private Invoice.TaxCategory taxCategory;
  private BigDecimal taxRate;
  private BigDecimal subtotal;
  private BigDecimal commissionSubtotal;
  private BigDecimal taxableAmount;
  private BigDecimal taxAmount;
  private BigDecimal totalAmount;
  private Invoice.InvoiceStatus status;
  private String notes;

  /**
   * 使用するテンプレートID
   * PDF生成時に参照
   */
  private UUID templateId;

  /**
   * 使用するテンプレート名
   * 画面表示用
   */
  private String templateName;

  private List<InvoiceItemResponse> items;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  /**
   * 請求書明細レスポンス
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class InvoiceItemResponse {

    private UUID id;
    private UUID commissionRuleId;
    private String commissionRuleName;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal productAmount;

    // 適用した手数料情報（コピー）
    private CommissionRule.CommissionType appliedCommissionType;
    private BigDecimal appliedRatePercent;
    private BigDecimal appliedFixedAmount;
    private BigDecimal commissionAmount;

    private BigDecimal itemTotal;
    private LocalDateTime createdAt;
  }
}