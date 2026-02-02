package com.example.prmtool.repository;

import com.example.prmtool.entity.ContentFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * コンテンツフォルダリポジトリ
 */
@Repository
public interface ContentFolderRepository extends JpaRepository<ContentFolder, UUID> {

  /**
   * ルートフォルダ（親フォルダがnull）を取得
   * 作成日時の昇順で返却
   */
  List<ContentFolder> findByParentFolderIsNullOrderByCreatedAtAsc();

  /**
   * 指定した親フォルダの子フォルダを取得
   * 作成日時の昇順で返却
   */
  List<ContentFolder> findByParentFolderIdOrderByCreatedAtAsc(UUID parentFolderId);

  /**
   * 全フォルダを作成日時の昇順で取得
   */
  List<ContentFolder> findAllByOrderByCreatedAtAsc();
}