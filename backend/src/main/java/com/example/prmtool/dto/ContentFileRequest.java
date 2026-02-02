package com.example.prmtool.dto;

import com.example.prmtool.entity.ContentFile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * コンテンツファイルリクエストDTO
 * ファイルアップロード・更新時に使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentFileRequest {

  /**
   * 所属するフォルダID（必須）
   */
  @NotNull(message = "フォルダIDは必須です")
  private UUID folderId;

  /**
   * ファイル名（必須）
   */
  @NotBlank(message = "ファイル名は必須です")
  private String fileName;

  /**
   * タイトル（表示用）
   */
  private String title;

  /**
   * ファイルの説明
   */
  private String description;

  /**
   * ファイルURL（必須）
   */
  @NotBlank(message = "ファイルURLは必須です")
  private String fileUrl;

  /**
   * ファイルタイプ（MIMEタイプ、必須）
   */
  @NotBlank(message = "ファイルタイプは必須です")
  private String fileType;

  /**
   * ファイルサイズ（バイト単位、必須）
   */
  @NotNull(message = "ファイルサイズは必須です")
  private Long fileSize;

  /**
   * タグ（カンマ区切り）
   */
  private String tags;

  /**
   * バージョン番号
   */
  private String version;

  /**
   * アクセスレベル
   */
  private ContentFile.AccessLevel accessLevel;

  /**
   * 許可されたロール（JSON形式）
   */
  private String allowedRoles;

  /**
   * 許可されたパートナーID（JSON形式）
   */
  private String allowedPartnerIds;
}