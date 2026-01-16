package com.example.prmtool.dto;

import com.example.prmtool.entity.Commission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionResponse {

  // 手数料ID
  private UUID id;

  // 案件情報
  private UUID projectId;
  private String projectName;

  // パートナー情報
  private UUID partnerId;
  private String partnerName;

  // 金額情報
  private BigDecimal baseAmount;      // 基準金額
  private BigDecimal rate;            // 手数料率
  private BigDecimal amount;          // 手数料金額

  // ステータス情報
  private Commission.CommissionStatus status;
  private String statusLabel;         // ステータスの日本語表示

  // 支払情報
  private LocalDate paymentDate;

  // その他
  private String notes;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // ステータスを日本語に変換するヘルパーメソッド
  public static String getStatusLabel(Commission.CommissionStatus status) {
    switch (status) {
      case PENDING:
        return "未承認";
      case APPROVED:
        return "承認済";
      case PAID:
        return "支払済";
      default:
        return status.name();
    }
  }
}
