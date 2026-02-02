package com.example.prmtool.repository;

import com.example.prmtool.entity.ContentDownloadHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * ダウンロード履歴リポジトリ
 */
@Repository
public interface ContentDownloadHistoryRepository extends JpaRepository<ContentDownloadHistory, UUID> {

  /**
   * 指定したファイルのダウンロード履歴を取得
   * ダウンロード日時の降順で返却
   */
  List<ContentDownloadHistory> findByFileIdOrderByDownloadedAtDesc(UUID fileId);

  /**
   * 指定したユーザーのダウンロード履歴を取得
   */
  List<ContentDownloadHistory> findByUserIdOrderByDownloadedAtDesc(UUID userId);

  /**
   * 指定したパートナーのダウンロード履歴を取得
   */
  List<ContentDownloadHistory> findByPartnerIdOrderByDownloadedAtDesc(UUID partnerId);
}