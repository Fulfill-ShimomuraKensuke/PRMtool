package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * お気に入りフォルダーエンティティ
 * ユーザーがよく使うフォルダーをお気に入り登録
 */
@Entity
@Table(name = "favorite_folders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteFolder {

  /**
   * お気に入りの一意識別子
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * お気に入り登録したユーザー
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  /**
   * お気に入り登録されたフォルダー
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "folder_id", nullable = false)
  private ContentFolder folder;

  /**
   * お気に入り登録日時（自動設定）
   */
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;
}