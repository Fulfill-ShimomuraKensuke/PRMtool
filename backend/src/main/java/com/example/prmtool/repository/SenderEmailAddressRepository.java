package com.example.prmtool.repository;

import com.example.prmtool.entity.SenderEmailAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 送信元メールアドレスリポジトリ
 * データベースアクセスを担当
 */
@Repository
public interface SenderEmailAddressRepository extends JpaRepository<SenderEmailAddress, UUID> {

  /**
   * 有効な送信元メールアドレスを作成日時の昇順で取得
   */
  List<SenderEmailAddress> findByIsActiveTrueOrderByCreatedAtAsc();

  /**
   * 全ての送信元メールアドレスを作成日時の昇順で取得
   */
  List<SenderEmailAddress> findAllByOrderByCreatedAtAsc();

  /**
   * デフォルトの送信元メールアドレスを取得
   */
  Optional<SenderEmailAddress> findByIsDefaultTrue();

  /**
   * メールアドレスで検索
   */
  Optional<SenderEmailAddress> findByEmail(String email);

  /**
   * メールアドレスが既に存在するかチェック
   */
  boolean existsByEmail(String email);

  /**
   * 指定したID以外でメールアドレスが存在するかチェック（更新時の重複チェック用）
   */
  boolean existsByEmailAndIdNot(String email, UUID id);
}