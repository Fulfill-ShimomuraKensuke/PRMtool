package com.example.prmtool.repository;

import com.example.prmtool.entity.CommissionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 手数料ルールリポジトリ
 */
@Repository
public interface CommissionRuleRepository extends JpaRepository<CommissionRule, UUID> {

  // 案件IDで手数料ルールを取得
  List<CommissionRule> findByProjectId(UUID projectId);

  // 案件IDとステータスで手数料ルールを取得
  List<CommissionRule> findByProjectIdAndStatus(UUID projectId, CommissionRule.CommissionStatus status);

  // ステータスで手数料ルールを取得
  List<CommissionRule> findByStatus(CommissionRule.CommissionStatus status);

  // 請求書で使用可能な手数料ルール（確定状態）を取得
  @Query("SELECT cr FROM CommissionRule cr WHERE cr.project.id = :projectId AND cr.status = 'CONFIRMED'")
  List<CommissionRule> findUsableRulesByProjectId(@Param("projectId") UUID projectId);

  // 案件に紐づく手数料ルールが存在するかチェック
  boolean existsByProjectId(UUID projectId);
}