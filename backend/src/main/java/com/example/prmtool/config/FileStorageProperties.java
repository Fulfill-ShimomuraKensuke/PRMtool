package com.example.prmtool.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * 【S3への移行手順】
 * 1. pom.xmlに依存関係を追加:
 * <dependency>
 * <groupId>software.amazon.awssdk</groupId>
 * <artifactId>s3</artifactId>
 * <version>2.20.26</version>
 * </dependency>
 *
 * 2. このクラスに以下のS3設定を追加:
 * private S3 s3 = new S3();
 *
 * @Data
 * public static class S3 {
 *       private String bucketName;
 *       private String region;
 *       private String accessKey;
 *       private String secretKey;
 * }
 *
 * 3. application.ymlのfile.storage.typeを"s3"に変更
 *
 * 4. S3FileStorageService.javaを実装（LocalFileStorageServiceを参考に）
 *
 * 5. FileStorageServiceをS3実装に切り替え（@Primaryアノテーションまたは@Conditionalを使用）
 */

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

  // ========================================
  // S3移行時に以下のコメントを外して使用
  // ========================================
  // /**
  // * S3ストレージ設定
  // */
  // private S3 s3 = new S3();
  //
  // @Data
  // public static class S3 {
  // /**
  // * S3バケット名
  // */
  // private String bucketName;
  //
  // /**
  // * AWSリージョン（例: ap-northeast-1）
  // */
  // private String region;
  //
  // /**
  // * AWSアクセスキー
  // */
  // private String accessKey;
  //
  // /**
  // * AWSシークレットキー
  // */
  // private String secretKey;
  // }
}