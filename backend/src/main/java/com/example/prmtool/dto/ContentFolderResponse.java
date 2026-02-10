package com.example.prmtool.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * コンテンツフォルダーレスポンスDTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentFolderResponse {

  private UUID id;
  private String folderName;
  private String description;
  private UUID parentFolderId;
  private Integer fileCount;
  private String createdBy;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  /**
   * お気に入りフラグ
   * ログイン中のユーザーがこのフォルダーをお気に入り登録しているかどうか
   */
  private Boolean isFavorite;
}