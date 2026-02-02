package com.example.prmtool.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * コンテンツフォルダレスポンスDTO
 * フォルダ情報を返却する際に使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentFolderResponse {

  /**
   * フォルダID
   */
  private UUID id;

  /**
   * フォルダ名
   */
  private String folderName;

  /**
   * フォルダの説明
   */
  private String description;

  /**
   * 親フォルダID
   */
  private UUID parentFolderId;

  /**
   * フォルダ内のファイル数
   */
  private Integer fileCount;

  /**
   * 作成者名
   */
  private String createdBy;

  /**
   * 作成日時
   */
  private LocalDateTime createdAt;

  /**
   * 更新日時
   */
  private LocalDateTime updatedAt;
}