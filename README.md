# PRM Tool - Partner Relationship Management System

パートナー企業との関係管理を効率化するためのWebアプリケーション

---

## 📋 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [必要要件](#必要要件)
- [セットアップ](#セットアップ)
- [使用方法](#使用方法)
- [プロジェクト構成](#プロジェクト構成)
- [環境設定](#環境設定)
- [開発](#開発)
- [トラブルシューティング](#トラブルシューティング)

---

## 概要

PRM Tool（Partner Relationship Management Tool）は、パートナー企業との関係管理、案件管理、ユーザー管理を統合的に行うためのWebアプリケーションです。

### 特徴

- 🏢 **パートナー管理**: パートナー企業の情報を一元管理
- 📊 **案件管理**: 案件の進捗管理とスプレッドシート機能
- 👥 **ユーザー管理**: ロールベースのアクセス制御
- 🔒 **セキュリティ**: JWT認証による安全な認証・認可
- 📥 **データ管理**: CSV入出力による柔軟なデータ管理

---

## 主な機能

### 1. アカウント管理
- ユーザーの作成・編集・削除
- ロールベースアクセス制御（ADMIN, REP）
- パスワード確認機能付き
- 検索・フィルター機能

### 2. パートナー管理
- パートナー企業の情報管理
- 業種別フィルタリング
- CSV入出力機能
- 連絡先管理（複数登録可能）

### 3. 案件管理
- 案件の作成・編集・削除
- ステータス管理（新規・進行中・完了）
- 担当者アサイン機能
- スプレッドシート形式での詳細管理

### 4. 認証・認可
- JWT トークンベース認証
- ロール別アクセス制御
- セキュアなセッション管理

---

## 技術スタック

### Backend
- **言語**: Java 17
- **フレームワーク**: Spring Boot 3.x
- **認証**: Spring Security + JWT
- **ORM**: Hibernate (JPA)
- **データベース**: PostgreSQL 15
- **ビルドツール**: Maven

### Frontend
- **言語**: JavaScript (ES6+)
- **ライブラリ**: React 18.x
- **ルーティング**: React Router v6
- **HTTP クライアント**: Axios
- **スタイリング**: CSS3

### インフラ
- **コンテナ**: Docker & Docker Compose
- **データベース**: PostgreSQL (Docker)

---

## 必要要件

### 開発環境
- **Java**: 17以上
- **Node.js**: 18.x以上
- **Docker**: 20.x以上
- **Docker Compose**: 2.x以上
- **Maven**: 3.8以上

### 推奨環境
- **OS**: Windows 10/11, macOS, Linux
- **IDE**: IntelliJ IDEA, VS Code
- **メモリ**: 8GB以上
- **ディスク**: 10GB以上の空き容量

---

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd prmtool
```

### 2. データベースの起動

```bash
# Docker ComposeでPostgreSQLを起動
docker-compose up -d
```

### 3. Backendのセットアップ

```bash
cd backend

# 依存関係のインストール
mvn clean install

# アプリケーションの起動
mvn spring-boot:run
```

Backend は `http://localhost:8080` で起動します。

### 4. Frontendのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# アプリケーションの起動
npm start
```

Frontend は `http://localhost:3000` で起動します。

---

## 使用方法

### 初回セットアップ

1. **初回管理者の作成**
   - アプリケーション起動時に自動的にSYSTEM管理者が作成されます
   - デフォルト認証情報:
     - ログインID: `system`
     - パスワード: `SystemPass123!`

2. **ADMIN ユーザーの作成**
   - SYSTEM管理者でログイン
   - アカウント管理画面から ADMIN ユーザーを作成
   - 本番環境では必ずデフォルトパスワードを変更してください

3. **通常運用**
   - ADMIN ユーザーでログイン
   - 必要に応じて REP ユーザーを作成

### ロール別の権限

| 機能 | SYSTEM | ADMIN | REP |
|------|--------|-------|-----|
| アカウント管理 | ✅ | ✅ | ❌ |
| パートナー管理 | ❌ | ✅ | 閲覧のみ |
| 案件管理 | ❌ | ✅ | ✅ |
| ダッシュボード | ❌ | ✅ | ✅ |

**注意**: SYSTEMロールは初回セットアップ専用です。通常運用では使用しません。

---

## プロジェクト構成

```
prmtool/
├── backend/                    # Springアプリケーション
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/example/prmtool/
│   │   │   │       ├── config/          # 設定クラス
│   │   │   │       ├── controller/      # REST API
│   │   │   │       ├── dto/             # データ転送オブジェクト
│   │   │   │       ├── entity/          # エンティティ
│   │   │   │       ├── repository/      # データアクセス
│   │   │   │       ├── service/         # ビジネスロジック
│   │   │   │       └── util/            # ユーティリティ
│   │   │   └── resources/
│   │   │       └── application.yml      # アプリケーション設定
│   │   └── test/                        # テストコード
│   └── pom.xml                          # Maven設定
│
├── frontend/                   # Reactアプリケーション
│   ├── public/                 # 静的ファイル
│   ├── src/
│   │   ├── components/         # 再利用可能コンポーネント
│   │   ├── context/            # Context API
│   │   ├── pages/              # ページコンポーネント
│   │   ├── services/           # API通信
│   │   ├── App.js              # メインコンポーネント
│   │   └── index.js            # エントリーポイント
│   └── package.json            # npm設定
│
├── docker-compose.yml          # Docker Compose設定
└── README.md                   # このファイル
```

---

## 環境設定

### application.yml の設定

アプリケーションは3つのプロファイルをサポートしています：

#### 開発環境 (dev) - デフォルト
```yaml
spring:
  profiles:
    active: dev
  datasource:
    url: jdbc:postgresql://localhost:5432/prmdb
    username: prmuser
    password: devpassword123
  jpa:
    hibernate:
      ddl-auto: update  # スキーマを自動更新
```

#### 本番環境 (prod)
```yaml
spring:
  profiles:
    active: prod
  jpa:
    hibernate:
      ddl-auto: validate  # スキーマ検証のみ
```

#### テスト環境 (test)
```yaml
spring:
  profiles:
    active: test
  datasource:
    url: jdbc:h2:mem:testdb
  jpa:
    hibernate:
      ddl-auto: create-drop  # テストごとにクリーン
```

### 環境変数

以下の環境変数で設定を上書きできます：

```bash
# データベース接続
DB_URL=jdbc:postgresql://localhost:5432/prmdb
DB_USERNAME=prmuser
DB_PASSWORD=your_password

# JWT設定
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# サーバー設定
SERVER_PORT=8080

# 初回管理者設定
INITIAL_ADMIN_ENABLED=true
INITIAL_ADMIN_NAME=初期システム管理者
INITIAL_ADMIN_LOGIN_ID=system
INITIAL_ADMIN_EMAIL=system@example.com
INITIAL_ADMIN_PASSWORD=SystemPass123!
```

---

## 開発

### Backendの開発

#### テストの実行
```bash
cd backend
mvn test
```

#### ビルド
```bash
mvn clean package
```

#### 特定のプロファイルで起動
```bash
# 本番環境で起動
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# テスト環境で起動
mvn spring-boot:run -Dspring-boot.run.profiles=test
```

### Frontendの開発

#### テストの実行
```bash
cd frontend
npm test
```

#### ビルド
```bash
npm run build
```

#### Lintの実行
```bash
npm run lint
```

---

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/admin/bootstrap` - 初回管理者作成

### ユーザー管理
- `GET /api/users` - ユーザー一覧取得
- `GET /api/users/{id}` - ユーザー詳細取得
- `POST /api/users` - ユーザー作成
- `PUT /api/users/{id}` - ユーザー更新
- `DELETE /api/users/{id}` - ユーザー削除

### パートナー管理
- `GET /api/partners` - パートナー一覧取得
- `GET /api/partners/{id}` - パートナー詳細取得
- `POST /api/partners` - パートナー作成
- `PUT /api/partners/{id}` - パートナー更新
- `DELETE /api/partners/{id}` - パートナー削除
- `POST /api/partners/import` - CSV インポート
- `GET /api/partners/export` - CSV エクスポート

### 案件管理
- `GET /api/projects` - 案件一覧取得
- `GET /api/projects/{id}` - 案件詳細取得
- `POST /api/projects` - 案件作成
- `PUT /api/projects/{id}` - 案件更新
- `DELETE /api/projects/{id}` - 案件削除
- `GET /api/projects/{id}/spreadsheet` - スプレッドシートデータ取得
- `PUT /api/projects/{id}/spreadsheet` - スプレッドシートデータ更新

---

## トラブルシューティング

### データベース接続エラー

**問題**: `Connection refused` エラーが発生する

**解決策**:
```bash
# Dockerコンテナが起動しているか確認
docker ps

# PostgreSQLが起動していない場合
docker-compose up -d

# ログの確認
docker logs prmtool-postgres
```

### ポートが既に使用されている

**問題**: `Port 8080 is already in use`

**解決策**:
```bash
# ポートを使用しているプロセスを確認
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# プロセスを停止するか、別のポートを使用
SERVER_PORT=8081 mvn spring-boot:run
```

### スキーマの不一致

**問題**: エンティティとDBスキーマが一致しない

**解決策**:
```bash
# 開発環境の場合：ddl-auto を create-drop に変更して再起動
# または、手動でテーブルを削除

# 本番環境の場合：マイグレーションスクリプトを作成
```

### Mavenキャッシュのクリア

**問題**: 依存関係が正しくダウンロードされない

**解決策**:
```bash
mvn clean install -U
```

---

## セキュリティに関する注意事項

### 本番環境での必須対応

1. **デフォルトパスワードの変更**
   ```
   初回管理者のパスワードを必ず変更してください
   ```

2. **JWT シークレットキーの変更**
   ```bash
   # 強力なランダム文字列を生成
   JWT_SECRET=<your-secure-random-string>
   ```

3. **データベースパスワードの変更**
   ```bash
   DB_PASSWORD=<your-secure-password>
   ```

4. **CORS設定の見直し**
   ```java
   // 本番環境では特定のドメインのみ許可
   @CrossOrigin(origins = "https://your-domain.com")
   ```

5. **HTTPS の使用**
   ```
   本番環境では必ずHTTPSを使用してください
   ```

---

## ライセンス

このプロジェクトは独自ライセンスの下で管理されています。

---

## サポート

問題が発生した場合は、以下の手順で報告してください：

1. 既存のIssueを確認
2. 新しいIssueを作成（該当する場合）
3. エラーログとスタックトレースを添付

---

## 変更履歴

### v1.0.0 (2026-01-16)
- 初回リリース
- ユーザー管理機能
- パートナー管理機能
- 案件管理機能
- JWT認証実装
- CSV入出力機能実装
- スプレッドシート機能実装

---

## 開発者

開発チーム: [Your Team Name]

---

**Last Updated**: 2026-01-16
