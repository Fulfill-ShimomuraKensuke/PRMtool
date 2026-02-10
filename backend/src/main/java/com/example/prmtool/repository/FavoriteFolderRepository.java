package com.example.prmtool.repository;

import com.example.prmtool.entity.FavoriteFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * お気に入りフォルダーリポジトリ
 * お気に入りフォルダーのCRUD操作を提供
 */
@Repository
public interface FavoriteFolderRepository extends JpaRepository<FavoriteFolder, UUID> {

  /**
   * 指定したユーザーのお気に入りフォルダー一覧を取得
   * 登録日時の降順（新しい順）で取得
   */
  @Query("SELECT ff FROM FavoriteFolder ff WHERE ff.user.id = :userId ORDER BY ff.createdAt DESC")
  List<FavoriteFolder> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

  /**
   * 指定したユーザーのお気に入りフォルダー数を取得
   * 最大10個制限のチェックに使用
   */
  @Query("SELECT COUNT(ff) FROM FavoriteFolder ff WHERE ff.user.id = :userId")
  long countByUserId(@Param("userId") UUID userId);

  /**
   * 指定したユーザーとフォルダーの組み合わせが存在するか確認
   * 重複登録チェックに使用
   */
  @Query("SELECT CASE WHEN COUNT(ff) > 0 THEN true ELSE false END FROM FavoriteFolder ff WHERE ff.user.id = :userId AND ff.folder.id = :folderId")
  boolean existsByUserIdAndFolderId(@Param("userId") UUID userId, @Param("folderId") UUID folderId);

  /**
   * 指定したユーザーとフォルダーの組み合わせでお気に入りを取得
   * 削除時に使用
   */
  @Query("SELECT ff FROM FavoriteFolder ff WHERE ff.user.id = :userId AND ff.folder.id = :folderId")
  Optional<FavoriteFolder> findByUserIdAndFolderId(@Param("userId") UUID userId, @Param("folderId") UUID folderId);
}