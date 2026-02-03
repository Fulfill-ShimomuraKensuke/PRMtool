package com.example.prmtool.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

/**
 * ファイルストレージサービスインターフェース
 * ローカルストレージとS3を切り替え可能にするための抽象化
 */
public interface FileStorageService {

  /**
   * ファイルを保存
   * 
   * @param file アップロードされたファイル
   * @return 保存されたファイルのURL
   */
  String storeFile(MultipartFile file);

  /**
   * ファイルを読み込み
   * 
   * @param fileName ファイル名
   * @return ファイルリソース
   */
  Resource loadFileAsResource(String fileName);

  /**
   * ファイルを削除
   * 
   * @param fileName ファイル名
   */
  void deleteFile(String fileName);

  /**
   * ファイルパスを取得
   * 
   * @param fileName ファイル名
   * @return ファイルパス
   */
  Path getFilePath(String fileName);
}