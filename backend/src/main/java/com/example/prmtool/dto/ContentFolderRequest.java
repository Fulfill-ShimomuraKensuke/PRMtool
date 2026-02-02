package com.example.prmtool.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * コンテンツフォルダリクエストDTO
 * フォルダ作成・更新時に使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentFolderRequest {

  /**
   * フォルダ名（必須）
   */
  @NotBlank(message = "フォルダ名は必須です")
  private String folderName;

  /**
   * フォルダの説明
   */
  private String description;

  /**
   * 親フォルダID（オプション）
   * nullの場合はルートフォルダとして作成
   */
  private UUID parentFolderId;
}