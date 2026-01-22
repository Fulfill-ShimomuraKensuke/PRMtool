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
 * Spring Data JPAを使用した永続化層
 */
@Repository
public interface CommissionRuleRepository extends JpaRepository<CommissionRule, UUID> {

  /**
   * 案件IDで手数料ルールを取得
   * 
   * @param projectId 案件ID
   * @return 該当する手数料ルールのリスト
   */
  List<CommissionRule> findByProjectId(UUID projectId);

  /**
   * 請求書で使用可能な手数料ルールを取得（確定状態のみ）
   * 
   * @param projectId 案件ID
   * @return 確定状態の手数料ルールのリスト
   */
  @Query("SELECT cr FROM CommissionRule cr WHERE cr.project.id = :projectId AND cr.status = 'CONFIRMED'")
  List<CommissionRule> findUsableRulesByProjectId(@Param("projectId") UUID projectId);

  /**
   * ステータスで手数料ルールを取得
   * 
   * @param status ステータス
   * @return 該当する手数料ルールのリスト
   */
  List<CommissionRule> findByStatus(CommissionRule.CommissionStatus status);

  /**
   * 案件IDとステータスで手数料ルールを取得
   * 
   * @param projectId 案件ID
   * @param status    ステータス
   * @return 該当する手数料ルールのリスト
   */
  List<CommissionRule> findByProjectIdAndStatus(UUID projectId, CommissionRule.CommissionStatus status);
}
