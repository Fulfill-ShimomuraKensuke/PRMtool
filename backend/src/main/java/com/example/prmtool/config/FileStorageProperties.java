package com.example.prmtool.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * ファイルストレージ設定プロパティ
 * application.ymlから設定を読み込む
 */
@Configuration
@ConfigurationProperties(prefix = "file.storage")
@Data
public class FileStorageProperties {

  /**
   * ストレージタイプ（local または s3）
   */
  private String type = "local";

  /**
   * ローカルストレージ設定
   */
  private Local local = new Local();

  /**
   * 最大ファイルサイズ
   */
  private String maxFileSize = "10MB";

  /**
   * 許可する拡張子リスト
   */
  private List<String> allowedExtensions;

  /**
   * ローカルストレージ設定
   */
  @Data
  public static class Local {
    /**
     * アップロードディレクトリのパス
     */
    private String uploadDir = "./uploads";
  }
}