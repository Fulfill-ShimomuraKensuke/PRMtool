package com.example.prmtool.service;

import com.example.prmtool.entity.CommissionRule;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 手数料計算専用サービス
 * 計算ロジックを一箇所に集約し、DRY原則に従う
 */
@Service
public class CommissionCalculationService {

  /**
   * 手数料を計算する
   * 
   * @param rule       手数料ルール
   * @param baseAmount 基準金額（商品金額）
   * @param quantity   数量
   * @return 手数料額
   */
  public BigDecimal calculateCommission(
      CommissionRule rule,
      BigDecimal baseAmount,
      Integer quantity) {

    if (rule == null) {
      return BigDecimal.ZERO;
    }

    BigDecimal commission;

    switch (rule.getCommissionType()) {
      case RATE:
        // %計算: baseAmount × (ratePercent / 100)
        // 例: 10,000円 × (3.5 / 100) = 350円
        commission = baseAmount
            .multiply(rule.getRatePercent())
            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        break;

      case FIXED:
        // 固定金額: fixedAmount × quantity
        // 例: 5,000円/件 × 3件 = 15,000円
        commission = rule.getFixedAmount()
            .multiply(BigDecimal.valueOf(quantity));
        break;

      default:
        throw new IllegalArgumentException("未対応の手数料タイプ: " + rule.getCommissionType());
    }

    // 負の値にならないようにチェック
    return commission.max(BigDecimal.ZERO);
  }
}