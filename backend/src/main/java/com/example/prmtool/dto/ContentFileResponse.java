package com.example.prmtool.dto;

import com.example.prmtool.entity.ContentFile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * コンテンツファイルレスポンスDTO
 * ファイル情報を返却する際に使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentFileResponse {

  /**
   * ファイルID
   */
  private UUID id;

  /**
   * 所属するフォルダID
   */
  private UUID folderId;

  /**
   * ファイル名
   */
  private String fileName;

  /**
   * タイトル
   */
  private String title;

  /**
   * ファイルの説明
   */
  private String description;

  /**
   * ファイルURL
   */
  private String fileUrl;

  /**
   * ファイルタイプ
   */
  private String fileType;

  /**
   * ファイルサイズ
   */
  private Long fileSize;

  /**
   * タグ
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
   * ダウンロード回数
   */
  private Integer downloadCount;

  /**
   * アップロード者名
   */
  private String uploadedBy;

  /**
   * アップロード日時
   */
  private LocalDateTime uploadedAt;

  /**
   * 更新日時
   */
  private LocalDateTime updatedAt;
}