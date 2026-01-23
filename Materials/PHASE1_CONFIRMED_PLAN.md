# PRMTool Phase 1 実装計画（確定版）

**バージョン**: v2.1.0 → v3.0.0  
**期間**: 2026年Q2（2ヶ月）  
**テーマ**: ドキュメント管理とコミュニケーションの強化

---

## 📋 実装機能一覧（確定）

1. ✅ 請求書テンプレート機能（プレビュー方式）
2. ✅ 請求書送付機能（既存機能の拡張）
3. ✅ コンテンツ管理機能（ファイル保存倉庫）
4. ✅ コンテンツ共有機能（倉庫から共有 or アップロード共有）

**削除**: ~~チャット連携機能~~

---

## 🎯 機能1: 請求書テンプレート機能

### 概要
ユーザーが請求書のレイアウトをカスタマイズできる機能。複数のテンプレートを作成・保存し、プレビュー確認後に使用可能。

### 主要機能

#### 1.1 テンプレート管理
- テンプレートの作成・編集・削除
- 複数テンプレートの管理
- デフォルトテンプレートの設定

#### 1.2 テンプレート編集
**編集可能項目**:
- 会社ロゴ（画像アップロード）
- 会社情報（名前、住所、電話、メール、Webサイト）
- レイアウト設定（ヘッダー、請求書情報、明細表）
- デザイン設定（配色、フォント、罫線スタイル）
- フッター設定（備考欄、振込先情報、支払条件）

#### 1.3 プレビュー機能
- リアルタイムプレビュー
- サンプルデータでの表示確認
- PDF出力イメージの確認
- 印刷レイアウトの確認

### データ構造

```java
/**
 * 請求書テンプレートエンティティ
 */
@Entity
@Table(name = "invoice_templates")
public class InvoiceTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // テンプレート基本情報
    @Column(nullable = false, length = 100)
    private String templateName; // テンプレート名
    
    @Column(columnDefinition = "TEXT")
    private String description; // 説明
    
    // ヘッダー設定
    private String logoUrl; // 会社ロゴURL
    private String companyName; // 会社名
    private String companyAddress; // 会社住所
    private String companyPhone; // 電話番号
    private String companyEmail; // メールアドレス
    private String companyWebsite; // Webサイト
    
    // レイアウト設定（JSON形式で保存）
    @Column(columnDefinition = "TEXT")
    private String layoutSettings; // レイアウト設定JSON
    
    // デザイン設定
    private String primaryColor; // プライマリカラー
    private String secondaryColor; // セカンダリカラー
    private String fontFamily; // フォント
    
    // 表示設定（JSON形式で保存）
    @Column(columnDefinition = "TEXT")
    private String displaySettings; // 表示項目設定JSON
    
    // フッター設定
    @Column(columnDefinition = "TEXT")
    private String footerText; // フッターテキスト
    
    @Column(columnDefinition = "TEXT")
    private String bankInfo; // 振込先情報
    
    @Column(columnDefinition = "TEXT")
    private String paymentTerms; // 支払条件
    
    // デフォルトテンプレートフラグ
    private Boolean isDefault; // デフォルトフラグ
    
    // メタデータ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy; // 作成者
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 作成日時
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt; // 更新日時
}
```

### 実装ファイル

**バックエンド**:
```
backend/src/main/java/com/example/prmtool/
├── entity/
│   └── InvoiceTemplate.java
├── repository/
│   └── InvoiceTemplateRepository.java
├── service/
│   └── InvoiceTemplateService.java
├── controller/
│   └── InvoiceTemplateController.java
├── dto/
│   ├── InvoiceTemplateRequest.java
│   └── InvoiceTemplateResponse.java
└── util/
    └── PdfGenerator.java
```

**フロントエンド**:
```
frontend/src/
├── pages/
│   └── InvoiceTemplates.js
├── components/
│   ├── TemplateEditor.js
│   ├── TemplatePreview.js
│   └── ColorPicker.js
└── services/
    └── invoiceTemplateService.js
```

---

## 🎯 機能2: 請求書送付機能

### 概要
作成した請求書をメールで送付する機能。テンプレートに基づいてPDFを生成し、メール添付で送信。

### 主要機能

#### 2.1 送付設定
- 送付先メールアドレス設定
- CCメールアドレス設定
- メール件名・本文のカスタマイズ
- テンプレート選択
- 開封確認の設定

#### 2.2 送付履歴管理
- 送信履歴の記録
- 送信ステータスの管理
- 開封確認の追跡
- 再送機能

### データ構造

```java
/**
 * 請求書送付履歴エンティティ
 */
@Entity
@Table(name = "invoice_deliveries")
public class InvoiceDelivery {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // 請求書への参照
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice; // 請求書
    
    // 送付先情報
    @Column(nullable = false, length = 255)
    private String recipientEmail; // 送付先メールアドレス
    
    @Column(length = 1000)
    private String ccEmails; // CCメールアドレス（カンマ区切り）
    
    // メール内容
    @Column(nullable = false, length = 200)
    private String subject; // 件名
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String body; // 本文
    
    // テンプレート情報
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private InvoiceTemplate template; // 使用したテンプレート
    
    // 添付ファイル
    @Column(length = 500)
    private String attachmentUrl; // 生成されたPDFのURL
    
    // 送信情報
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeliveryStatus status; // 送信ステータス
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage; // エラーメッセージ
    
    // 開封確認
    private Boolean trackOpening; // 開封追跡フラグ
    
    private Boolean isOpened; // 開封済みフラグ
    
    private LocalDateTime openedAt; // 開封日時
    
    // メタデータ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sent_by", nullable = false)
    private User sentBy; // 送信者
    
    @Column(nullable = false)
    private LocalDateTime sentAt; // 送信日時
    
    /**
     * 送信ステータス
     */
    public enum DeliveryStatus {
        PENDING,    // 送信待ち
        SENDING,    // 送信中
        SENT,       // 送信成功
        FAILED,     // 送信失敗
        BOUNCED     // バウンス（配信不可）
    }
}
```

### 実装ファイル

**バックエンド**:
```
backend/src/main/java/com/example/prmtool/
├── entity/
│   └── InvoiceDelivery.java
├── repository/
│   └── InvoiceDeliveryRepository.java
├── service/
│   ├── InvoiceDeliveryService.java
│   ├── EmailService.java
│   └── PdfGeneratorService.java
├── controller/
│   └── InvoiceDeliveryController.java
└── dto/
    ├── InvoiceDeliveryRequest.java
    └── InvoiceDeliveryResponse.java
```

**フロントエンド**:
```
frontend/src/
├── pages/
│   └── InvoiceDeliveries.js
├── components/
│   ├── DeliveryModal.js
│   └── DeliveryHistory.js
└── services/
    └── invoiceDeliveryService.js
```

---

## 🎯 機能3: コンテンツ管理機能

### 概要
ファイルを一元管理する「倉庫」機能。アップロードしたファイルをカテゴリ分けして保存・管理。

### 主要機能

#### 3.1 フォルダ管理
- フォルダ階層構造の作成
- フォルダの作成・編集・削除
- フォルダ間のファイル移動

#### 3.2 ファイル管理
- ファイルのアップロード（ドラッグ&ドロップ対応）
- ファイルのプレビュー
- ファイルのダウンロード
- ファイルのバージョン管理
- タグ付け・検索機能

#### 3.3 アクセス権限
- ロールベースのアクセス制御
- パートナーベースのアクセス制御
- ファイルごとの権限設定

#### 3.4 ダウンロード履歴
- ダウンロード回数の記録
- ダウンロード者の記録
- ダウンロード日時の記録

### データ構造

```java
/**
 * コンテンツフォルダエンティティ
 */
@Entity
@Table(name = "content_folders")
public class ContentFolder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // フォルダ名
    @Column(nullable = false, length = 100)
    private String folderName; // フォルダ名
    
    @Column(columnDefinition = "TEXT")
    private String description; // 説明
    
    // 親フォルダ（階層構造）
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_folder_id")
    private ContentFolder parentFolder; // 親フォルダ
    
    // 子フォルダ
    @OneToMany(mappedBy = "parentFolder", cascade = CascadeType.ALL)
    private List<ContentFolder> subFolders; // 子フォルダ
    
    // フォルダ内のファイル
    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL)
    private List<ContentFile> files; // ファイルリスト
    
    // メタデータ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy; // 作成者
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 作成日時
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt; // 更新日時
}

/**
 * コンテンツファイルエンティティ
 */
@Entity
@Table(name = "content_files")
public class ContentFile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // フォルダへの参照
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    private ContentFolder folder; // 所属フォルダ
    
    // ファイル情報
    @Column(nullable = false, length = 200)
    private String fileName; // ファイル名
    
    @Column(length = 200)
    private String title; // タイトル
    
    @Column(columnDefinition = "TEXT")
    private String description; // 説明
    
    @Column(nullable = false, length = 500)
    private String fileUrl; // ファイルURL（S3など）
    
    @Column(nullable = false, length = 50)
    private String fileType; // ファイルタイプ（MIME Type）
    
    @Column(nullable = false)
    private Long fileSize; // ファイルサイズ（バイト）
    
    // タグ（カンマ区切り）
    @Column(length = 500)
    private String tags; // タグ
    
    // バージョン管理
    @Column(nullable = false, length = 20)
    private String version; // バージョン（例: v1.0, v2.0）
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_version_id")
    private ContentFile previousVersion; // 前バージョン
    
    // アクセス権限
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccessLevel accessLevel; // アクセスレベル
    
    @Column(columnDefinition = "TEXT")
    private String allowedRoles; // 許可されたロール（JSON形式）
    
    @Column(columnDefinition = "TEXT")
    private String allowedPartnerIds; // 許可されたパートナーID（JSON形式）
    
    // ダウンロード統計
    @Column(nullable = false)
    private Integer downloadCount; // ダウンロード数
    
    // メタデータ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy; // アップロード者
    
    @Column(nullable = false)
    private LocalDateTime uploadedAt; // アップロード日時
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt; // 更新日時
    
    /**
     * アクセスレベル
     */
    public enum AccessLevel {
        PUBLIC,         // 全ユーザー
        ROLE_BASED,     // ロールベース
        PARTNER_BASED,  // パートナーベース
        PRIVATE         // プライベート（アップロード者のみ）
    }
}

/**
 * ファイルダウンロード履歴エンティティ
 */
@Entity
@Table(name = "content_download_history")
public class ContentDownloadHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // ファイルへの参照
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private ContentFile file; // ファイル
    
    // ダウンロード者情報
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // ユーザー
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private Partner partner; // パートナー
    
    // ダウンロード日時
    @Column(nullable = false)
    private LocalDateTime downloadedAt; // ダウンロード日時
    
    // IPアドレス（オプション）
    @Column(length = 50)
    private String ipAddress; // IPアドレス
}
```

### 実装ファイル

**バックエンド**:
```
backend/src/main/java/com/example/prmtool/
├── entity/
│   ├── ContentFolder.java
│   ├── ContentFile.java
│   └── ContentDownloadHistory.java
├── repository/
│   ├── ContentFolderRepository.java
│   ├── ContentFileRepository.java
│   └── ContentDownloadHistoryRepository.java
├── service/
│   ├── ContentManagementService.java
│   └── FileStorageService.java
├── controller/
│   └── ContentManagementController.java
└── dto/
    ├── ContentFolderRequest.java
    ├── ContentFolderResponse.java
    ├── ContentFileRequest.java
    └── ContentFileResponse.java
```

**フロントエンド**:
```
frontend/src/
├── pages/
│   └── ContentManagement.js
├── components/
│   ├── FolderTree.js
│   ├── FileList.js
│   ├── FileUpload.js
│   └── FilePreview.js
└── services/
    └── contentManagementService.js
```

---

## 🎯 機能4: コンテンツ共有機能

### 概要
保存したファイルをパートナーと共有する機能。倉庫から選択して共有、または共有時に新規アップロードも可能。

### 主要機能

#### 4.1 共有方法
- **倉庫から共有**: 既存ファイルを選択して共有
- **新規アップロード共有**: 共有時にファイルをアップロード

#### 4.2 共有設定
- 共有先パートナーの選択
- 有効期限の設定
- ダウンロード回数制限
- メッセージの添付

#### 4.3 共有履歴
- 共有履歴の記録
- アクセス履歴の追跡
- 共有の無効化

### データ構造

```java
/**
 * ファイル共有エンティティ
 */
@Entity
@Table(name = "content_shares")
public class ContentShare {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // 共有ファイルへの参照
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private ContentFile file; // 共有ファイル
    
    // 共有先情報
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShareTarget shareTarget; // 共有対象タイプ
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private Partner partner; // 共有先パートナー（特定パートナーの場合）
    
    // 共有設定
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShareMethod shareMethod; // 共有方法
    
    private LocalDateTime expiresAt; // 有効期限
    
    private Integer downloadLimit; // ダウンロード回数制限
    
    private Integer currentDownloadCount; // 現在のダウンロード数
    
    // 通知設定
    private Boolean notifyOnDownload; // ダウンロード時通知
    
    // メッセージ
    @Column(columnDefinition = "TEXT")
    private String message; // 共有時のメッセージ
    
    // ステータス
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShareStatus status; // ステータス
    
    // メタデータ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_by", nullable = false)
    private User sharedBy; // 共有者
    
    @Column(nullable = false)
    private LocalDateTime sharedAt; // 共有日時
    
    private LocalDateTime lastAccessedAt; // 最終アクセス日時
    
    /**
     * 共有対象タイプ
     */
    public enum ShareTarget {
        SPECIFIC_PARTNER,   // 特定のパートナー
        ALL_PARTNERS        // 全パートナー
    }
    
    /**
     * 共有方法
     */
    public enum ShareMethod {
        SYSTEM_LINK,    // システム内リンク
        EMAIL_LINK,     // メールでリンク送付
        EMAIL_ATTACH    // メールで添付
    }
    
    /**
     * 共有ステータス
     */
    public enum ShareStatus {
        ACTIVE,     // 有効
        EXPIRED,    // 期限切れ
        REVOKED,    // 無効化
        EXHAUSTED   // 回数制限到達
    }
}

/**
 * ファイル共有アクセス履歴エンティティ
 */
@Entity
@Table(name = "content_share_access_history")
public class ContentShareAccessHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // 共有への参照
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "share_id", nullable = false)
    private ContentShare share; // 共有
    
    // アクセス者情報
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // ユーザー
    
    // アクセス情報
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccessType accessType; // アクセスタイプ
    
    @Column(nullable = false)
    private LocalDateTime accessedAt; // アクセス日時
    
    @Column(length = 50)
    private String ipAddress; // IPアドレス
    
    /**
     * アクセスタイプ
     */
    public enum AccessType {
        VIEW,       // 閲覧
        DOWNLOAD    // ダウンロード
    }
}
```

### 実装ファイル

**バックエンド**:
```
backend/src/main/java/com/example/prmtool/
├── entity/
│   ├── ContentShare.java
│   └── ContentShareAccessHistory.java
├── repository/
│   ├── ContentShareRepository.java
│   └── ContentShareAccessHistoryRepository.java
├── service/
│   └── ContentShareService.java
├── controller/
│   └── ContentShareController.java
└── dto/
    ├── ContentShareRequest.java
    └── ContentShareResponse.java
```

**フロントエンド**:
```
frontend/src/
├── pages/
│   ├── ContentShares.js
│   └── SharedWithMe.js
├── components/
│   ├── ShareModal.js
│   ├── ShareHistory.js
│   └── SharedFileList.js
└── services/
    └── contentShareService.js
```

---

## 📊 実装スケジュール

### 2ヶ月計画（8週間）

```
Week 1-2: 請求書テンプレート機能
├─ エンティティ・Repository作成
├─ Service・Controller実装
├─ PDF生成機能実装
└─ フロントエンド画面作成

Week 3-4: 請求書送付機能
├─ InvoiceDeliveryエンティティ作成
├─ メール送信サービス実装
├─ PDF生成連携
└─ フロントエンド実装

Week 5-6: コンテンツ管理機能
├─ ContentFolder・ContentFileエンティティ作成
├─ S3連携実装
├─ アップロード機能実装
├─ フォルダ階層管理実装
└─ フロントエンド実装

Week 7: コンテンツ共有機能
├─ ContentShareエンティティ作成
├─ 共有ロジック実装
├─ 権限管理実装
└─ フロントエンド実装

Week 8: 統合テスト・リリース
├─ 単体テスト
├─ 結合テスト
├─ バグ修正
└─ ドキュメント作成・リリース
```

**合計**: 8週間（約2ヶ月）

---

## 🔧 技術スタック

### バックエンド
- **フレームワーク**: Spring Boot 3.x
- **メール送信**: Spring Mail / SendGrid / AWS SES
- **PDF生成**: iText 7
- **ファイルストレージ**: AWS S3 / Azure Blob Storage
- **データベース**: PostgreSQL
- **認証**: JWT

### フロントエンド
- **フレームワーク**: React 18
- **状態管理**: React Hooks
- **UI**: React Bootstrap / Material-UI
- **ファイルアップロード**: Dropzone

---

## 📁 全実装ファイル一覧

### バックエンド

```
backend/src/main/java/com/example/prmtool/
├── entity/
│   ├── InvoiceTemplate.java
│   ├── InvoiceDelivery.java
│   ├── ContentFolder.java
│   ├── ContentFile.java
│   ├── ContentDownloadHistory.java
│   ├── ContentShare.java
│   └── ContentShareAccessHistory.java
│
├── repository/
│   ├── InvoiceTemplateRepository.java
│   ├── InvoiceDeliveryRepository.java
│   ├── ContentFolderRepository.java
│   ├── ContentFileRepository.java
│   ├── ContentDownloadHistoryRepository.java
│   ├── ContentShareRepository.java
│   └── ContentShareAccessHistoryRepository.java
│
├── service/
│   ├── InvoiceTemplateService.java
│   ├── InvoiceDeliveryService.java
│   ├── EmailService.java
│   ├── PdfGeneratorService.java
│   ├── ContentManagementService.java
│   ├── FileStorageService.java
│   └── ContentShareService.java
│
├── controller/
│   ├── InvoiceTemplateController.java
│   ├── InvoiceDeliveryController.java
│   ├── ContentManagementController.java
│   └── ContentShareController.java
│
└── dto/
    ├── InvoiceTemplateRequest.java
    ├── InvoiceTemplateResponse.java
    ├── InvoiceDeliveryRequest.java
    ├── InvoiceDeliveryResponse.java
    ├── ContentFolderRequest.java
    ├── ContentFolderResponse.java
    ├── ContentFileRequest.java
    ├── ContentFileResponse.java
    ├── ContentShareRequest.java
    └── ContentShareResponse.java
```

### フロントエンド

```
frontend/src/
├── pages/
│   ├── InvoiceTemplates.js
│   ├── InvoiceDeliveries.js
│   ├── ContentManagement.js
│   ├── ContentShares.js
│   └── SharedWithMe.js
│
├── components/
│   ├── TemplateEditor.js
│   ├── TemplatePreview.js
│   ├── ColorPicker.js
│   ├── DeliveryModal.js
│   ├── DeliveryHistory.js
│   ├── FolderTree.js
│   ├── FileList.js
│   ├── FileUpload.js
│   ├── FilePreview.js
│   ├── ShareModal.js
│   ├── ShareHistory.js
│   └── SharedFileList.js
│
└── services/
    ├── invoiceTemplateService.js
    ├── invoiceDeliveryService.js
    ├── contentManagementService.js
    └── contentShareService.js
```

---

## 🔧 必要な依存関係

### Maven依存関係

```xml
<!-- pom.xml -->
<dependencies>
    <!-- PDF生成 -->
    <dependency>
        <groupId>com.itextpdf</groupId>
        <artifactId>itext7-core</artifactId>
        <version>7.2.5</version>
        <type>pom</type>
    </dependency>
    
    <!-- メール送信 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>
    
    <!-- AWS S3 -->
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
        <version>2.20.0</version>
    </dependency>
    
    <!-- JSON処理 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

### NPM依存関係

```json
// package.json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "react-bootstrap": "^2.0.0",
    "axios": "^1.0.0",
    "react-dropzone": "^14.0.0"
  }
}
```

---

## 📝 次のステップ

1. ✅ 実装計画の承認
2. ✅ 詳細設計の作成
3. ✅ 開発環境のセットアップ
4. ✅ Week 1から実装開始

---

**この計画で実装を開始してよろしいでしょうか？**
