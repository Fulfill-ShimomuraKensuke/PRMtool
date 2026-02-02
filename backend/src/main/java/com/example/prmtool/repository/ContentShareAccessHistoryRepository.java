package com.example.prmtool.repository;

import com.example.prmtool.entity.ContentShareAccessHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 共有アクセス履歴リポジトリ
 */
@Repository
public interface ContentShareAccessHistoryRepository extends JpaRepository<ContentShareAccessHistory, UUID> {

  /**
   * 指定した共有のアクセス履歴を取得
   * アクセス日時の降順で返却
   */
  List<ContentShareAccessHistory> findByShareIdOrderByAccessedAtDesc(UUID shareId);

  /**
   * 指定したユーザーのアクセス履歴を取得
   */
  List<ContentShareAccessHistory> findByUserIdOrderByAccessedAtDesc(UUID userId);
}