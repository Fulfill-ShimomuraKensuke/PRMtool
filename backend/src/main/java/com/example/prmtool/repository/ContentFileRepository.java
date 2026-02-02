package com.example.prmtool.repository;

import com.example.prmtool.entity.ContentFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * コンテンツファイルリポジトリ
 */
@Repository
public interface ContentFileRepository extends JpaRepository<ContentFile, UUID> {

  /**
   * 指定したフォルダ内のファイルを取得
   * アップロード日時の降順（新しい順）で返却
   */
  List<ContentFile> findByFolderIdOrderByUploadedAtDesc(UUID folderId);

  /**
   * 全ファイルをアップロード日時の降順で取得
   */
  List<ContentFile> findAllByOrderByUploadedAtDesc();

  /**
   * タグで検索（部分一致）
   */
  List<ContentFile> findByTagsContainingOrderByUploadedAtDesc(String tag);

  /**
   * ファイル名で検索（部分一致）
   */
  List<ContentFile> findByFileNameContainingIgnoreCaseOrderByUploadedAtDesc(String fileName);

  /**
   * アップロード者で検索
   */
  List<ContentFile> findByUploadedByIdOrderByUploadedAtDesc(UUID uploadedById);
}