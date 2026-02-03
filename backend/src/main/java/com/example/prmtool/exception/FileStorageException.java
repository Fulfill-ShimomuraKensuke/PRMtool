package com.example.prmtool.exception;

/**
 * ファイルストレージ例外
 * ファイルの保存、読み込み、削除時のエラーを表す
 */
public class FileStorageException extends RuntimeException {

  /**
   * メッセージ付きコンストラクタ
   */
  public FileStorageException(String message) {
    super(message);
  }

  /**
   * メッセージと原因付きコンストラクタ
   */
  public FileStorageException(String message, Throwable cause) {
    super(message, cause);
  }
}