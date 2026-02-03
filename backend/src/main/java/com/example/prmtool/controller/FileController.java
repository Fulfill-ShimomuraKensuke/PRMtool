package com.example.prmtool.controller;

import com.example.prmtool.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * ファイルコントローラ
 * ファイルのダウンロードを処理
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class FileController {

  private final FileStorageService fileStorageService;

  /**
   * ファイルをダウンロード
   * 認証不要（共有リンクでも使用するため）
   */
  @GetMapping("/{fileName:.+}")
  public ResponseEntity<Resource> downloadFile(
      @PathVariable String fileName,
      HttpServletRequest request) {

    // ファイルを読み込み
    Resource resource = fileStorageService.loadFileAsResource(fileName);

    // ファイルのContent-Typeを判定
    String contentType = null;
    try {
      contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
    } catch (IOException ex) {
      log.info("ファイルのタイプを判定できませんでした。");
    }

    // Content-Typeが判定できない場合はデフォルト値を設定
    if (contentType == null) {
      contentType = "application/octet-stream";
    }

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
        .body(resource);
  }
}