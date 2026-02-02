package com.example.prmtool.repository;

import com.example.prmtool.entity.ContentShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * コンテンツ共有リポジトリ
 */
@Repository
public interface ContentShareRepository extends JpaRepository<ContentShare, UUID> {

  /**
   * 全共有を共有日時の降順で取得
   */
  List<ContentShare> findAllByOrderBySharedAtDesc();

  /**
   * 指定したファイルの共有を取得
   */
  List<ContentShare> findByFileIdOrderBySharedAtDesc(UUID fileId);

  /**
   * 指定したパートナーとの共有を取得backend/src/main/java/com/example/prmtool/entity/ContentShareAccessHistoryRepository.java backend/src/main/java/com/example/prmtool/entity/ContentShareRepository.java
   */
  List<ContentShare> findByPartnerIdOrderBySharedAtDesc(UUID partnerId);

  /**
   * 指定したユーザーが共有した共有を取得
   */
  List<ContentShare> findBySharedByIdOrderBySharedAtDesc(UUID sharedById);

  /**
   * ステータスで共有を取得
   */
  List<ContentShare> findByStatusOrderBySharedAtDesc(ContentShare.ShareStatus status);

  /**
   * 有効な共有（ACTIVE）のみ取得
   */
  List<ContentShare> findByStatusAndPartnerIdOrderBySharedAtDesc(
      ContentShare.ShareStatus status, UUID partnerId);
}