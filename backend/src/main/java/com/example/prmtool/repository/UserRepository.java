package com.example.prmtool.repository;

import com.example.prmtool.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

  // loginIdでユーザーを検索（ログイン用）
  Optional<User> findByLoginId(String loginId);

  // loginIdの存在確認
  boolean existsByLoginId(String loginId);

  // 後方互換性のため残す（既存コードで使用している可能性）
  Optional<User> findByEmail(String email);

  // emailの存在確認
  boolean existsByEmail(String email);

  // 指定した役割のユーザーが存在するか確認
  boolean existsByRole(User.UserRole role);

  // 指定した役割のユーザー数を排他ロック付きでカウント
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select count(u) from User u where u.role = :role")
  long countByRoleForUpdate(@Param("role") User.UserRole role);

  /**
   * 全ユーザーを作成日時の昇順で取得
   * 登録順を維持するため、createdAtの昇順でソート
   * 
   * @return 作成日時順のユーザー一覧
   */
  List<User> findAllByOrderByCreatedAtAsc();
}