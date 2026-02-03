package com.example.prmtool.service.impl;

import com.example.prmtool.config.FileStorageProperties;
import com.example.prmtool.exception.FileStorageException;
import com.example.prmtool.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * ローカルファイルストレージサービス実装
 * ローカルディスクにファイルを保存・読み込み・削除
 */
@Service
@Slf4j
public class LocalFileStorageService implements FileStorageService {

  private final Path fileStorageLocation;
  private final FileStorageProperties fileStorageProperties;

  /**
   * コンストラクタ
   * アップロードディレクトリを作成
   */
  public LocalFileStorageService(FileStorageProperties fileStorageProperties) {
    this.fileStorageProperties = fileStorageProperties;
    this.fileStorageLocation = Paths.get(fileStorageProperties.getLocal().getUploadDir())
        .toAbsolutePath().normalize();

    try {
      Files.createDirectories(this.fileStorageLocation);
      log.info("ファイルストレージディレクトリを作成しました: {}", this.fileStorageLocation);
    } catch (Exception ex) {
      throw new FileStorageException("ファイルを保存するディレクトリを作成できませんでした。", ex);
    }
  }

  /**
   * ファイルを保存
   * ファイル名を一意にするためにUUIDを使用
   */
  @Override
  public String storeFile(MultipartFile file) {
    // オリジナルファイル名を取得
    String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

    try {
      // ファイル名に不正な文字が含まれていないかチェック
      if (originalFileName.contains("..")) {
        throw new FileStorageException("ファイル名に不正な文字が含まれています: " + originalFileName);
      }

      // 拡張子を取得
      String fileExtension = "";
      int dotIndex = originalFileName.lastIndexOf('.');
      if (dotIndex > 0) {
        fileExtension = originalFileName.substring(dotIndex);
      }

      // 許可された拡張子かチェック
      if (!isAllowedExtension(fileExtension)) {
        throw new FileStorageException("許可されていない拡張子です: " + fileExtension);
      }

      // 一意のファイル名を生成（UUID + 元の拡張子）
      String storedFileName = UUID.randomUUID().toString() + fileExtension;

      // ファイルを保存
      Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
      Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

      log.info("ファイルを保存しました: {}", storedFileName);

      // ファイルURLを返却
      return "/api/files/" + storedFileName;

    } catch (IOException ex) {
      throw new FileStorageException("ファイル " + originalFileName + " を保存できませんでした。もう一度お試しください。", ex);
    }
  }

  /**
   * ファイルを読み込み
   */
  @Override
  public Resource loadFileAsResource(String fileName) {
    try {
      Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
      Resource resource = new UrlResource(filePath.toUri());

      if (resource.exists()) {
        return resource;
      } else {
        throw new FileStorageException("ファイルが見つかりません: " + fileName);
      }
    } catch (MalformedURLException ex) {
      throw new FileStorageException("ファイルが見つかりません: " + fileName, ex);
    }
  }

  /**
   * ファイルを削除
   */
  @Override
  public void deleteFile(String fileName) {
    try {
      Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
      Files.deleteIfExists(filePath);
      log.info("ファイルを削除しました: {}", fileName);
    } catch (IOException ex) {
      throw new FileStorageException("ファイル " + fileName + " を削除できませんでした。", ex);
    }
  }

  /**
   * ファイルパスを取得
   */
  @Override
  public Path getFilePath(String fileName) {
    return this.fileStorageLocation.resolve(fileName).normalize();
  }

  /**
   * 許可された拡張子かチェック
   */
  private boolean isAllowedExtension(String extension) {
    if (fileStorageProperties.getAllowedExtensions() == null) {
      return true; // 制限なし
    }

    String ext = extension.toLowerCase().replace(".", "");
    return fileStorageProperties.getAllowedExtensions().contains(ext);
  }
}