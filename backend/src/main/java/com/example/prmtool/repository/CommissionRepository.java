package com.example.prmtool.repository;

import com.example.prmtool.entity.Commission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, UUID> {

  // 案件IDで手数料を検索
  List<Commission> findByProjectId(UUID projectId);

  // パートナーIDで手数料を検索
  List<Commission> findByPartnerId(UUID partnerId);

  // ステータスで手数料を検索
  List<Commission> findByStatus(Commission.CommissionStatus status);

  // パートナーIDとステータスで手数料を検索
  List<Commission> findByPartnerIdAndStatus(UUID partnerId, Commission.CommissionStatus status);

  // パートナーIDで手数料の合計金額を計算
  @Query("SELECT COALESCE(SUM(c.amount), 0) FROM Commission c WHERE c.partner.id = :partnerId")
  BigDecimal sumAmountByPartnerId(@Param("partnerId") UUID partnerId);

  // パートナーIDとステータスで手数料の合計金額を計算
  @Query("SELECT COALESCE(SUM(c.amount), 0) FROM Commission c WHERE c.partner.id = :partnerId AND c.status = :status")
  BigDecimal sumAmountByPartnerIdAndStatus(@Param("partnerId") UUID partnerId, @Param("status") Commission.CommissionStatus status);

  // パートナーIDで手数料件数を取得
  @Query("SELECT COUNT(c) FROM Commission c WHERE c.partner.id = :partnerId")
  Long countByPartnerId(@Param("partnerId") UUID partnerId);

  // ステータス別の手数料件数を取得
  @Query("SELECT COUNT(c) FROM Commission c WHERE c.status = :status")
  Long countByStatus(@Param("status") Commission.CommissionStatus status);
}
