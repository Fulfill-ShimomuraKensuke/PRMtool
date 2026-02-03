package com.example.prmtool.controller;

import com.example.prmtool.dto.*;
import com.example.prmtool.service.ContentManagementService;
import com.example.prmtool.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * コンテンツ管理コントローラ
 * ADMIN、ACCOUNTING、REPがアクセス可能（SYSTEMは制限）
 */
@RestController
@RequestMapping("/api/contents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ContentManagementController {

  private final ContentManagementService service;
  private final FileStorageService fileStorageService;

  // ========================================
  // フォルダ管理（既存のコードはそのまま）
  // ========================================

  /**
   * 全フォルダを取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/folders")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<ContentFolderResponse>> getAllFolders() {
    List<ContentFolderResponse> folders = service.getAllFolders();
    return ResponseEntity.ok(folders);
  }

  /**
   * ルートフォルダを取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/folders/root")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<ContentFolderResponse>> getRootFolders() {
    List<ContentFolderResponse> folders = service.getRootFolders();
    return ResponseEntity.ok(folders);
  }

  /**
   * 指定したフォルダの子フォルダを取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/folders/{parentId}/sub-folders")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<ContentFolderResponse>> getSubFolders(@PathVariable UUID parentId) {
    List<ContentFolderResponse> folders = service.getSubFolders(parentId);
    return ResponseEntity.ok(folders);
  }

  /**
   * フォルダをIDで取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/folders/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<ContentFolderResponse> getFolderById(@PathVariable UUID id) {
    ContentFolderResponse folder = service.getFolderById(id);
    return ResponseEntity.ok(folder);
  }

  /**
   * フォルダを作成
   * 権限: ADMIN, ACCOUNTING
   */
  @PostMapping("/folders")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<ContentFolderResponse> createFolder(
      @Valid @RequestBody ContentFolderRequest request,
      Authentication authentication) {
    // TODO: 認証情報からユーザーIDを正しく取得
    UUID userId = UUID.fromString(authentication.getName());
    ContentFolderResponse created = service.createFolder(request, userId);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  /**
   * フォルダを更新
   * 権限: ADMIN, ACCOUNTING
   */
  @PutMapping("/folders/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<ContentFolderResponse> updateFolder(
      @PathVariable UUID id,
      @Valid @RequestBody ContentFolderRequest request) {
    ContentFolderResponse updated = service.updateFolder(id, request);
    return ResponseEntity.ok(updated);
  }

  /**
   * フォルダを削除
   * 権限: ADMIN のみ
   */
  @DeleteMapping("/folders/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteFolder(@PathVariable UUID id) {
    service.deleteFolder(id);
    return ResponseEntity.noContent().build();
  }

  // ========================================
  // ファイル管理
  // ========================================

  /**
   * 全ファイルを取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/files")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<ContentFileResponse>> getAllFiles() {
    List<ContentFileResponse> files = service.getAllFiles();
    return ResponseEntity.ok(files);
  }

  /**
   * 指定したフォルダ内のファイルを取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/folders/{folderId}/files")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<ContentFileResponse>> getFilesByFolder(@PathVariable UUID folderId) {
    List<ContentFileResponse> files = service.getFilesByFolder(folderId);
    return ResponseEntity.ok(files);
  }

  /**
   * ファイルをIDで取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/files/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<ContentFileResponse> getFileById(@PathVariable UUID id) {
    ContentFileResponse file = service.getFileById(id);
    return ResponseEntity.ok(file);
  }

  /**
   * ファイルをアップロード（マルチパート対応）
   * 権限: ADMIN, ACCOUNTING
   */
  @PostMapping(value = "/files/upload", consumes = "multipart/form-data")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<ContentFileResponse> uploadFile(
      @RequestParam("file") MultipartFile file,
      @RequestParam("folderId") UUID folderId,
      @RequestParam(value = "title", required = false) String title,
      @RequestParam(value = "description", required = false) String description,
      @RequestParam(value = "tags", required = false) String tags,
      Authentication authentication) {

    // ファイルをストレージに保存
    String fileUrl = fileStorageService.storeFile(file);

    // ファイル情報をデータベースに保存
    ContentFileRequest request = ContentFileRequest.builder()
        .folderId(folderId)
        .fileName(file.getOriginalFilename())
        .title(title != null ? title : file.getOriginalFilename())
        .description(description)
        .fileUrl(fileUrl)
        .fileType(file.getContentType())
        .fileSize(file.getSize())
        .tags(tags)
        .build();

    // TODO: 認証情報からユーザーIDを正しく取得
    UUID userId = UUID.fromString(authentication.getName());
    ContentFileResponse created = service.uploadFile(request, userId);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  /**
   * ファイル情報を更新
   * 権限: ADMIN, ACCOUNTING
   */
  @PutMapping("/files/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<ContentFileResponse> updateFile(
      @PathVariable UUID id,
      @Valid @RequestBody ContentFileRequest request) {
    ContentFileResponse updated = service.updateFile(id, request);
    return ResponseEntity.ok(updated);
  }

  /**
   * ファイルを削除
   * 権限: ADMIN のみ
   */
  @DeleteMapping("/files/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteFile(@PathVariable UUID id) {
    // ファイル情報を取得
    ContentFileResponse file = service.getFileById(id);

    // ストレージからファイルを削除
    String fileName = file.getFileUrl().substring(file.getFileUrl().lastIndexOf("/") + 1);
    fileStorageService.deleteFile(fileName);

    // データベースから削除
    service.deleteFile(id);
    return ResponseEntity.noContent().build();
  }

  /**
   * ファイルダウンロード記録
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @PostMapping("/files/{id}/download")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<Void> recordDownload(
      @PathVariable UUID id,
      Authentication authentication,
      @RequestParam(required = false) String ipAddress) {
    // TODO: 認証情報からユーザーIDを正しく取得
    UUID userId = UUID.fromString(authentication.getName());
    service.recordDownload(id, userId, ipAddress);
    return ResponseEntity.ok().build();
  }
}