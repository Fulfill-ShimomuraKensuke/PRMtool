# PRM Tool - Partner Relationship Management System

<div align="center">

**パートナー企業との関係管理を効率化する統合Webアプリケーション**

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.9-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.3-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

</div>

---

## 📚 目次

- [概要](#概要)
- [主要機能](#主要機能)
- [技術スタック](#技術スタック)
- [システム要件](#システム要件)
- [セットアップ](#セットアップ)
- [プロジェクト構造](#プロジェクト構造)
- [環境変数](#環境変数)
- [使用方法](#使用方法)
- [API ドキュメント](#api-ドキュメント)
- [開発ガイド](#開発ガイド)
- [デプロイ](#デプロイ)
- [トラブルシューティング](#トラブルシューティング)
- [ライセンス](#ライセンス)

---

## 概要

PRM Tool（Partner Relationship Management Tool）は、パートナー企業との関係管理、プロジェクト管理、手数料管理、請求書管理、コンテンツ管理を統合的に行うWebアプリケーションです。

### ビジネス上の課題

- パートナー企業の情報が分散し、管理が煩雑
- プロジェクトの進捗管理が非効率
- 手数料の計算と承認プロセスに時間がかかる
- 請求書作成に多くの手作業が必要
- ユーザー権限管理が不十分
- ファイル共有が煩雑

### ソリューション

PRM Toolは、これらの課題を解決するために以下を提供します：

- **一元管理**: パートナー、プロジェクト、手数料、請求書、コンテンツの情報を一箇所で管理
- **自動化**: 手数料の自動計算、請求書の自動生成、郵便番号からの住所自動入力
- **権限管理**: ロールベースのアクセス制御で適切な権限分離
- **可視化**: ダッシュボードで重要な統計情報を視覚化
- **効率化**: スプレッドシート機能で柔軟なデータ管理
- **安全な共有**: パートナー企業とのファイル共有を安全かつ効率的に実現

---

## 主要機能

### 🔐 認証・認可

- JWT トークンによる認証
- ロールベースアクセス制御（RBAC）
  - **SYSTEM**: システム管理者（初期セットアップ専用）
  - **ADMIN**: 管理者（全機能へのアクセス）
  - **ACCOUNTING**: 会計担当（手数料・請求書管理）
  - **REP**: 営業担当（プロジェクトの閲覧・編集）

### 👥 アカウント管理

- ユーザーの作成・編集・削除
- ロール管理
- ユーザー検索・フィルター機能

### 🏢 パートナー管理

- パートナー企業の登録・編集・削除
- 複数の担当者管理（氏名、役職、連絡先）
- 郵便番号自動検索機能（zipcloud API連携）
- パートナー情報の検索・フィルター

### 📊 プロジェクト管理

- プロジェクトの作成・編集・削除
- ステータス管理（新規 / 進行中 / 完了）
- 複数担当者のアサイン
- スプレッドシート機能（Excel風のデータ管理）
- プロジェクト別の権限制御

### 💰 手数料ルール管理

- 手数料ルールの作成・編集・確定
- 複数の手数料タイプ
  - **固定金額**: 数量に関係なく固定額
  - **割合**: 商品金額に対する割合
- ステータス管理（下書き / 確定）
- 確定後の編集制限で整合性を保証

### 📄 請求書管理

- 請求書の作成・編集・削除
- 自動計算機能（小計、手数料、消費税、合計）
- 請求書番号の自動生成（INV-YYYYMMDD-NNNN）
- PDF出力機能
- カスタマイズ可能なテンプレート
- 手数料ルールの適用

### 📁 コンテンツ管理

- **フォルダー・ファイル管理**
  - フォルダー階層構造（無制限の深さ）
  - ファイルアップロード（複数選択可、最大50MB）
  - ファイルダウンロード
  - フォルダー・ファイル削除

- **お気に入り機能**
  - よく使うフォルダーをお気に入り登録（最大10個）
  - ワンクリックでアクセス
  - 個人ごとに管理

- **パンくずリスト**
  - フォルダー階層の表示
  - 深い階層の省略表示（ホーム › ... › 東京 › 23区 › 港区）
  - クリックで階層移動

- **サブフォルダー表示**
  - フォルダーをクリックすると1階層下のサブフォルダーとファイルを表示

- **コンテンツ共有**
  - パートナー企業とのファイル共有
  - 特定パートナーまたは全パートナーへの共有
  - 有効期限設定
  - ダウンロード回数制限
  - 共有ステータス管理（有効/期限切れ/制限到達/無効化）

### 📈 ダッシュボード

- パートナー数、プロジェクト数、手数料ルール数、請求書数の統計表示
- リアルタイム更新

---

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 19.2.3 | UIフレームワーク |
| React Router | 7.1.3 | ルーティング |
| Axios | 1.7.9 | HTTPクライアント |
| CSS | - | スタイリング |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Java | 17 | プログラミング言語 |
| Spring Boot | 3.5.9 | アプリケーションフレームワーク |
| Spring Security | - | 認証・認可 |
| Spring Data JPA | - | ORM |
| Flyway | - | データベースマイグレーション |
| JWT | - | トークン認証 |
| BCrypt | - | パスワードハッシュ化 |
| Apache PDFBox | 3.0.3 | PDF生成 |
| Lombok | - | ボイラープレートコード削減 |

### データベース

| 技術 | バージョン | 用途 |
|------|-----------|------|
| PostgreSQL | 16 | RDBMS |

### 開発ツール

| 技術 | 用途 |
|------|------|
| Maven | ビルドツール |
| npm | パッケージ管理 |
| Git | バージョン管理 |

### 外部API

| API | 用途 |
|-----|------|
| zipcloud API | 郵便番号から住所検索 |

---

## システム要件

### 開発環境

- **OS**: Windows / macOS / Linux
- **Java**: JDK 17 以上
- **Node.js**: 18.x 以上
- **PostgreSQL**: 16 以上
- **Maven**: 3.8.x 以上
- **ブラウザ**: Google Chrome、Firefox、Safari、Edge（最新版）

### 本番環境

- **メモリ**: 4GB 以上推奨
- **ストレージ**: 20GB 以上推奨
- **CPU**: 2コア以上推奨

---

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-org/prm-tool.git
cd prm-tool
```

### 2. データベースセットアップ

```bash
# PostgreSQLにログイン
psql -U postgres

# データベース作成
CREATE DATABASE prmtool;

# ユーザー作成（任意）
CREATE USER prmuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE prmtool TO prmuser;

# 終了
\q
```

### 3. バックエンドセットアップ

```bash
cd backend

# 環境変数設定（application.propertiesまたは環境変数）
# src/main/resources/application.properties を編集

# ビルド
mvn clean install

# 起動
mvn spring-boot:run
```

**バックエンドが起動したら:** http://localhost:8080

### 4. フロントエンドセットアップ

```bash
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm start
```

**フロントエンドが起動したら:** http://localhost:3000

### 5. 初期ユーザーでログイン

```
ログインID: system
パスワード: system123
```

**重要:** 初回ログイン後、必ずパスワードを変更してください。

---

## プロジェクト構造

```
prm-tool/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/prmtool/
│   │   │   │   ├── config/          # 設定クラス
│   │   │   │   ├── controller/      # RESTコントローラー
│   │   │   │   ├── dto/             # データ転送オブジェクト
│   │   │   │   ├── entity/          # エンティティ
│   │   │   │   ├── repository/      # リポジトリ
│   │   │   │   ├── security/        # セキュリティ設定
│   │   │   │   └── service/         # サービスクラス
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/    # Flywayマイグレーション
│   │   └── test/                    # テストコード
│   └── pom.xml                      # Maven設定
├── frontend/
│   ├── public/                      # 静的ファイル
│   ├── src/
│   │   ├── components/              # Reactコンポーネント
│   │   ├── pages/                   # ページコンポーネント
│   │   ├── services/                # APIサービス
│   │   ├── App.js                   # メインアプリ
│   │   └── index.js                 # エントリーポイント
│   └── package.json                 # npm設定
├── docs/                            # ドキュメント
│   ├── ユーザー用手引き.md
│   ├── 開発者向けセットアップガイド.md
│   ├── 要件定義書.md
│   └── PRMTool_クラス図.pu
└── README.md
```

---

## 環境変数

### バックエンド（application.properties）

```properties
# データベース接続
spring.datasource.url=jdbc:postgresql://localhost:5432/prmtool
spring.datasource.username=prmuser
spring.datasource.password=your_password

# JPA設定
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Flyway設定
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true

# JWT設定
jwt.secret=your-secret-key-min-256-bits
jwt.expiration=86400000

# ファイルアップロード設定
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB

# ファイルストレージパス
file.storage.path=/var/prm-tool/files
```

### フロントエンド（.env）

```env
REACT_APP_API_URL=http://localhost:8080
```

---

## 使用方法

### ログイン

1. http://localhost:3000 にアクセス
2. ログインIDとパスワードを入力
3. 「ログイン」ボタンをクリック

### ダッシュボード

ログイン後、ダッシュボードに以下の統計情報が表示されます：
- パートナー数
- プロジェクト数
- 手数料ルール数
- 請求書数

### 各機能の使い方

詳細な操作方法は、[ユーザー用手引き](docs/ユーザー用手引き.md) を参照してください。

---

## API ドキュメント

### 認証

#### ログイン
```http
POST /api/auth/login
Content-Type: application/json

{
  "loginId": "system",
  "password": "system123"
}
```

**レスポンス:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "uuid",
  "name": "システム管理者",
  "role": "SYSTEM"
}
```

### パートナー管理

#### パートナー一覧取得
```http
GET /api/partners
Authorization: Bearer {token}
```

#### パートナー作成
```http
POST /api/partners
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "株式会社サンプル",
  "industry": "IT",
  "phone": "03-1234-5678",
  "postalCode": "1234567",
  "address": "東京都...",
  "email": "info@example.com"
}
```

### プロジェクト管理

#### プロジェクト一覧取得
```http
GET /api/projects
Authorization: Bearer {token}
```

#### プロジェクト作成
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "プロジェクトA",
  "partnerId": "uuid",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "status": "NEW",
  "description": "説明..."
}
```

### コンテンツ管理

#### フォルダー一覧取得（ルート）
```http
GET /api/contents/folders/root
Authorization: Bearer {token}
```

#### サブフォルダー取得
```http
GET /api/contents/folders/{folderId}/subfolders
Authorization: Bearer {token}
```

#### ファイルアップロード
```http
POST /api/contents/folders/{folderId}/files
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary]
```

#### お気に入りフォルダー取得
```http
GET /api/contents/folders/favorites
Authorization: Bearer {token}
```

#### お気に入り追加
```http
POST /api/contents/folders/{folderId}/favorite
Authorization: Bearer {token}
```

---

## 開発ガイド

### コーディング規約

#### Java
- **命名規則**: キャメルケース
- **インデント**: スペース4つ
- **コメント**: 日本語で記載
- **Lombok**: 積極的に使用

#### JavaScript/React
- **命名規則**: キャメルケース
- **インデント**: スペース2つ
- **コメント**: 日本語で記載
- **関数コンポーネント**: Hooksを使用

### データベースマイグレーション

Flywayを使用してデータベースマイグレーションを管理しています。

**新しいマイグレーションファイルの作成:**

```bash
cd backend/src/main/resources/db/migration
```

**ファイル名規則:**
```
V{バージョン番号}__{説明}.sql
例: V10__Add_new_table.sql
```

**マイグレーション実行:**
```bash
mvn spring-boot:run
# Flywayが自動的に実行されます
```

### テスト

#### バックエンドテスト
```bash
cd backend
mvn test
```

#### フロントエンドテスト
```bash
cd frontend
npm test
```

---

## デプロイ

### Render でのデプロイ

#### バックエンド

1. Renderダッシュボードで新しいWeb Serviceを作成
2. GitHubリポジトリを接続
3. ビルドコマンド: `mvn clean install -DskipTests`
4. 起動コマンド: `java -jar target/prmtool-0.0.1-SNAPSHOT.jar`
5. 環境変数を設定

#### フロントエンド

1. Renderダッシュボードで新しいStatic Siteを作成
2. GitHubリポジトリを接続
3. ビルドコマンド: `cd frontend && npm install && npm run build`
4. 公開ディレクトリ: `frontend/build`

### 環境変数（本番環境）

**バックエンド:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
FILE_STORAGE_PATH=/opt/render/project/src/files
```

**フロントエンド:**
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## トラブルシューティング

### バックエンドが起動しない

**問題:** `Connection refused`

**解決策:**
1. PostgreSQLが起動しているか確認
2. データベース接続情報が正しいか確認
3. ポート8080が使用されていないか確認

### フロントエンドがバックエンドに接続できない

**問題:** `Network Error`

**解決策:**
1. バックエンドが起動しているか確認（http://localhost:8080）
2. CORS設定を確認
3. `REACT_APP_API_URL` が正しいか確認

### ファイルアップロードが失敗する

**問題:** `413 Payload Too Large`

**解決策:**
1. ファイルサイズが50MB以下か確認
2. `spring.servlet.multipart.max-file-size` の設定を確認

### データベースマイグレーションが失敗する

**問題:** `FlywayException: Validate failed`

**解決策:**
1. `spring.jpa.hibernate.ddl-auto=validate` を確認
2. Flywayのマイグレーション履歴を確認
3. 必要に応じてFlywayの履歴をクリア（開発環境のみ）

---

## ライセンス

このプロジェクトは proprietary ライセンスの下でライセンスされています。

---

## お問い合わせ

技術的な質問や問題がある場合は、以下までご連絡ください：

- **Email:** support@example.com
- **GitHub Issues:** https://github.com/your-org/prm-tool/issues

---

**開発者向けの詳細なセットアップガイドは [開発者向けセットアップガイド.md](docs/開発者向けセットアップガイド.md) を参照してください。**