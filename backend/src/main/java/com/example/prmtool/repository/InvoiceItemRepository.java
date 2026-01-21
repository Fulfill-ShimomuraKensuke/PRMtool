package com.example.prmtool.repository;

import com.example.prmtool.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, UUID> {

  // 請求書IDで明細を取得
  List<InvoiceItem> findByInvoiceId(UUID invoiceId);

  // 手数料ルールIDで明細を取得
  List<InvoiceItem> findByAppliedCommissionRuleId(UUID commissionRuleId);

  // --- 以下、ダッシュボード用の集計メソッド ---

  /**
   * パートナーIDで手数料の合計を計算（全ステータス）
   * 実際に請求した手数料額の合計
   */
  @Query("SELECT COALESCE(SUM(item.commissionAmount), 0) " +
      "FROM InvoiceItem item " +
      "WHERE item.invoice.partner.id = :partnerId")
  BigDecimal sumCommissionByPartnerId(@Param("partnerId") UUID partnerId);

  /**
   * パートナーIDと請求書ステータスで手数料の合計を計算
   * 例: 「発行済の請求書」に含まれる手数料額
   */
  @Query("SELECT COALESCE(SUM(item.commissionAmount), 0) " +
      "FROM InvoiceItem item " +
      "WHERE item.invoice.partner.id = :partnerId " +
      "AND item.invoice.status = :invoiceStatus")
  BigDecimal sumCommissionByPartnerIdAndInvoiceStatus(
      @Param("partnerId") UUID partnerId,
      @Param("invoiceStatus") com.example.prmtool.entity.Invoice.InvoiceStatus invoiceStatus);
}