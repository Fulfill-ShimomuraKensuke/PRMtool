package com.example.prmtool.repository;

import com.example.prmtool.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

  // 請求書番号で検索
  Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

  // パートナーIDで請求書を検索
  List<Invoice> findByPartnerId(UUID partnerId);

  // ステータスで請求書を検索
  List<Invoice> findByStatus(Invoice.InvoiceStatus status);

  // パートナーIDとステータスで請求書を検索
  List<Invoice> findByPartnerIdAndStatus(UUID partnerId, Invoice.InvoiceStatus status);

  // 最新の請求書番号を取得（請求書番号の自動採番用）
  @Query("SELECT i.invoiceNumber FROM Invoice i ORDER BY i.createdAt DESC LIMIT 1")
  Optional<String> findLatestInvoiceNumber();

  // パートナーIDで請求書の合計金額を計算
  @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.partner.id = :partnerId")
  BigDecimal sumTotalAmountByPartnerId(@Param("partnerId") UUID partnerId);

  // パートナーIDとステータスで請求書の合計金額を計算
  @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.partner.id = :partnerId AND i.status = :status")
  BigDecimal sumTotalAmountByPartnerIdAndStatus(@Param("partnerId") UUID partnerId, @Param("status") Invoice.InvoiceStatus status);

  // パートナーIDで請求書件数を取得
  @Query("SELECT COUNT(i) FROM Invoice i WHERE i.partner.id = :partnerId")
  Long countByPartnerId(@Param("partnerId") UUID partnerId);

  // ステータス別の請求書件数を取得
  @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = :status")
  Long countByStatus(@Param("status") Invoice.InvoiceStatus status);
}
