package com.example.prmtool.service;

import com.example.prmtool.dto.*;
import com.example.prmtool.entity.*;
import com.example.prmtool.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * コンテンツ管理サービス
 * フォルダとファイルの管理を担当
 */
@Service
@RequiredArgsConstructor
public class ContentManagementService {

  private final ContentFolderRepository folderRepository;
  private final ContentFileRepository fileRepository;
  private final ContentDownloadHistoryRepository downloadHistoryRepository;
  private final UserRepository userRepository;

  // ========================================
  // フォルダ管理
  // ========================================

  /**
   * 全フォルダを取得
   */
  @Transactional(readOnly = true)
  public List<ContentFolderResponse> getAllFolders() {
    return folderRepository.findAllByOrderByCreatedAtAsc().stream()
        .map(this::convertFolderToResponse)
        .collect(Collectors.toList());
  }

  /**
   * ルートフォルダを取得
   */
  @Transactional(readOnly = true)
  public List<ContentFolderResponse> getRootFolders() {
    return folderRepository.findByParentFolderIsNullOrderByCreatedAtAsc().stream()
        .map(this::convertFolderToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 指定したフォルダの子フォルダを取得
   */
  @Transactional(readOnly = true)
  public List<ContentFolderResponse> getSubFolders(UUID parentFolderId) {
    return folderRepository.findByParentFolderIdOrderByCreatedAtAsc(parentFolderId).stream()
        .map(this::convertFolderToResponse)
        .collect(Collectors.toList());
  }

  /**
   * フォルダをIDで取得
   */
  @Transactional(readOnly = true)
  public ContentFolderResponse getFolderById(UUID id) {
    ContentFolder folder = folderRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("フォルダが見つかりません: " + id));
    return convertFolderToResponse(folder);
  }

  /**
   * フォルダを作成
   */
  @Transactional
  public ContentFolderResponse createFolder(ContentFolderRequest request, UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + userId));

    ContentFolder folder = ContentFolder.builder()
        .folderName(request.getFolderName())
        .description(request.getDescription())
        .createdBy(user)
        .build();

    // 親フォルダが指定されている場合は設定
    if (request.getParentFolderId() != null) {
      ContentFolder parentFolder = folderRepository.findById(request.getParentFolderId())
          .orElseThrow(() -> new RuntimeException("親フォルダが見つかりません: " + request.getParentFolderId()));
      folder.setParentFolder(parentFolder);
    }

    ContentFolder saved = folderRepository.save(folder);
    return convertFolderToResponse(saved);
  }

  /**
   * フォルダを更新
   */
  @Transactional
  public ContentFolderResponse updateFolder(UUID id, ContentFolderRequest request) {
    ContentFolder folder = folderRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("フォルダが見つかりません: " + id));

    folder.setFolderName(request.getFolderName());
    folder.setDescription(request.getDescription());

    ContentFolder updated = folderRepository.save(folder);
    return convertFolderToResponse(updated);
  }

  /**
   * フォルダを削除
   */
  @Transactional
  public void deleteFolder(UUID id) {
    ContentFolder folder = folderRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("フォルダが見つかりません: " + id));

    // フォルダ内にファイルがある場合は削除不可
    if (!folder.getFiles().isEmpty()) {
      throw new RuntimeException("フォルダ内にファイルが存在するため削除できません");
    }

    // 子フォルダがある場合は削除不可
    if (!folder.getSubFolders().isEmpty()) {
      throw new RuntimeException("サブフォルダが存在するため削除できません");
    }

    folderRepository.delete(folder);
  }

  // ========================================
  // ファイル管理
  // ========================================

  /**
   * 全ファイルを取得
   */
  @Transactional(readOnly = true)
  public List<ContentFileResponse> getAllFiles() {
    return fileRepository.findAllByOrderByUploadedAtDesc().stream()
        .map(this::convertFileToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 指定したフォルダ内のファイルを取得
   */
  @Transactional(readOnly = true)
  public List<ContentFileResponse> getFilesByFolder(UUID folderId) {
    return fileRepository.findByFolderIdOrderByUploadedAtDesc(folderId).stream()
        .map(this::convertFileToResponse)
        .collect(Collectors.toList());
  }

  /**
   * ファイルをIDで取得
   */
  @Transactional(readOnly = true)
  public ContentFileResponse getFileById(UUID id) {
    ContentFile file = fileRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("ファイルが見つかりません: " + id));
    return convertFileToResponse(file);
  }

  /**
   * ファイルをアップロード
   * 注: 実際のファイルストレージ（S3など）へのアップロードは別途実装が必要
   */
  @Transactional
  public ContentFileResponse uploadFile(ContentFileRequest request, UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + userId));

    ContentFolder folder = folderRepository.findById(request.getFolderId())
        .orElseThrow(() -> new RuntimeException("フォルダが見つかりません: " + request.getFolderId()));

    ContentFile file = ContentFile.builder()
        .folder(folder)
        .fileName(request.getFileName())
        .title(request.getTitle())
        .description(request.getDescription())
        .fileUrl(request.getFileUrl())
        .fileType(request.getFileType())
        .fileSize(request.getFileSize())
        .tags(request.getTags())
        .version(request.getVersion() != null ? request.getVersion() : "v1.0")
        .accessLevel(request.getAccessLevel() != null ? request.getAccessLevel() : ContentFile.AccessLevel.PRIVATE)
        .allowedRoles(request.getAllowedRoles())
        .allowedPartnerIds(request.getAllowedPartnerIds())
        .uploadedBy(user)
        .uploadedAt(LocalDateTime.now())
        .build();

    ContentFile saved = fileRepository.save(file);
    return convertFileToResponse(saved);
  }

  /**
   * ファイル情報を更新
   */
  @Transactional
  public ContentFileResponse updateFile(UUID id, ContentFileRequest request) {
    ContentFile file = fileRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("ファイルが見つかりません: " + id));

    file.setFileName(request.getFileName());
    file.setTitle(request.getTitle());
    file.setDescription(request.getDescription());
    file.setTags(request.getTags());
    file.setAccessLevel(request.getAccessLevel());
    file.setAllowedRoles(request.getAllowedRoles());
    file.setAllowedPartnerIds(request.getAllowedPartnerIds());

    ContentFile updated = fileRepository.save(file);
    return convertFileToResponse(updated);
  }

  /**
   * ファイルを削除
   */
  @Transactional
  public void deleteFile(UUID id) {
    ContentFile file = fileRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("ファイルが見つかりません: " + id));

    // TODO: 実際のストレージ（S3など）からも削除

    fileRepository.delete(file);
  }

  /**
   * ファイルダウンロード記録
   */
  @Transactional
  public void recordDownload(UUID fileId, UUID userId, String ipAddress) {
    ContentFile file = fileRepository.findById(fileId)
        .orElseThrow(() -> new RuntimeException("ファイルが見つかりません: " + fileId));

    User user = null;
    if (userId != null) {
      user = userRepository.findById(userId).orElse(null);
    }

    // ダウンロード回数を増やす
    file.incrementDownloadCount();
    fileRepository.save(file);

    // ダウンロード履歴を記録
    ContentDownloadHistory history = ContentDownloadHistory.builder()
        .file(file)
        .user(user)
        .downloadedAt(LocalDateTime.now())
        .ipAddress(ipAddress)
        .build();

    downloadHistoryRepository.save(history);
  }

  // ========================================
  // 変換メソッド
  // ========================================

  private ContentFolderResponse convertFolderToResponse(ContentFolder folder) {
    return ContentFolderResponse.builder()
        .id(folder.getId())
        .folderName(folder.getFolderName())
        .description(folder.getDescription())
        .parentFolderId(folder.getParentFolder() != null ? folder.getParentFolder().getId() : null)
        .fileCount(folder.getFiles().size())
        .createdBy(folder.getCreatedBy().getName())
        .createdAt(folder.getCreatedAt())
        .updatedAt(folder.getUpdatedAt())
        .build();
  }

  private ContentFileResponse convertFileToResponse(ContentFile file) {
    return ContentFileResponse.builder()
        .id(file.getId())
        .folderId(file.getFolder().getId())
        .fileName(file.getFileName())
        .title(file.getTitle())
        .description(file.getDescription())
        .fileUrl(file.getFileUrl())
        .fileType(file.getFileType())
        .fileSize(file.getFileSize())
        .tags(file.getTags())
        .version(file.getVersion())
        .accessLevel(file.getAccessLevel())
        .downloadCount(file.getDownloadCount())
        .uploadedBy(file.getUploadedBy().getName())
        .uploadedAt(file.getUploadedAt())
        .updatedAt(file.getUpdatedAt())
        .build();
  }
}