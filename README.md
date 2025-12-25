# シンプルPRMツール

パートナー企業と案件を管理するためのフルスタックWebアプリケーション（Spring Boot + React）

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.9-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![Status](https://img.shields.io/badge/Status-Completed-success)

## 🌐 デモ
- **フロントエンド**: https://prmtool-1.onrender.com
- **バックエンドAPI**: https://prmtool.onrender.com

## 目次
- [概要](#概要)
- [実装済み機能](#実装済み機能)
- [技術スタック](#技術スタック)
- [前提条件](#前提条件)
- [セットアップ](#セットアップ)
- [利用手順](#利用手順)
- [API仕様](#api仕様)
- [プロジェクト構成](#プロジェクト構成)
- [環境設定](#環境設定)
- [本番環境デプロイ](#本番環境デプロイ)
- [今後の実装予定](#今後の実装予定)

## 概要
シンプルPRMツールは、パートナー企業や案件の管理を効率的に行うためのポートフォリオ向けWebアプリケーションです。  
Spring BootバックエンドとReactフロントエンドで構成され、ロール（**ADMIN/REP**）に応じた権限制御をサポートします。

- **ADMIN（管理者）**: パートナーの登録/編集/削除が可能、案件削除も可能  
- **REP（担当者）**: パートナーは閲覧のみ、案件は閲覧/登録/編集が可能

## 実装済み機能

### バックエンド（Spring Boot）✅
#### 認証・認可
- ✅ ユーザー登録（メール・パスワード）
- ✅ JWTトークンによるログイン認証
- ✅ ロールベースのアクセス制御（ADMIN/REP）
- ✅ BCryptによるパスワードハッシュ化
- ✅ 自動ログアウト（トークン期限切れ時）

#### パートナー管理
- ✅ パートナー企業の登録・編集・削除（**管理者のみ**）
- ✅ パートナー一覧/詳細の取得（**全認証ユーザー**）
- ✅ 企業情報（名称、住所、電話番号）の管理

#### 案件管理
- ✅ 案件の登録・編集（**全認証ユーザー**）
- ✅ 案件の削除（**管理者のみ**）
- ✅ 案件一覧の取得（**全認証ユーザー - 全案件表示**）
- ✅ 案件状態の管理（NEW/IN_PROGRESS/DONE）
- ✅ パートナー企業との紐付け

#### データベース対応
- ✅ PostgreSQL 17（開発・本番環境）
- ✅ HikariCP接続プール
- ✅ プロファイルによる環境切り替え（dev/prod/test）

### フロントエンド（React）✅
#### 認証機能
- ✅ ログイン画面 / ユーザー登録画面
- ✅ JWT認証 / 自動ログアウト

#### メイン機能
- ✅ ダッシュボード（全案件のサマリー表示）
- ✅ パートナー管理（閲覧：全ユーザー、編集・削除：管理者のみ）
- ✅ 案件管理（閲覧・編集：全ユーザー、削除：管理者のみ）
- ✅ ナビゲーションバー / プライベートルート

#### UI/UX
- ✅ レスポンシブデザイン / ローディング表示 / エラーメッセージ
- ✅ モーダルダイアログ

## 技術スタック
### バックエンド
- Java 17 / Spring Boot 3.5.9 / Spring Security 6.x + JWT（JJWT 0.12.3）
- Spring Data JPA + Hibernate 6.6
- PostgreSQL 17 / HikariCP
- Maven 3.x

### フロントエンド
- React 18 / React Router DOM 6.x / Axios 1.6+ / Context API
- npm

### インフラ
- Docker & Docker Compose / Render.com

## 前提条件
- Java 17以上
- Node.js 16以上 / npm 8以上
- Maven 3.6以上（または同梱の `mvnw`）
- PostgreSQL（または Docker）
- Docker / Docker Compose（オプション）

## セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/Simomura0716/PRM_Tool.git
cd PRM_Tool
```

### 2. 環境変数ファイル
`.env` は **Git管理しません**。`.env.example` をコピーして作成してください。

```bash
cp .env.example .env
```

### 3. データベースのセットアップ（Docker Compose推奨）
```bash
docker-compose up -d
docker-compose ps
```

### 4. バックエンドの起動
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 5. フロントエンドの起動
```bash
cd frontend
npm install
npm start
```

- バックエンド: http://localhost:8080
- フロントエンド: http://localhost:3000

## 利用手順

### 初回セットアップ（例）
1. http://localhost:3000 にアクセス
2. 「新規登録」からユーザーを作成（ADMIN or REP）
3. ADMINでログイン → パートナー企業を登録
4. 案件を登録して運用開始

### 権限まとめ
| 機能 | ADMIN | REP |
|------|------:|----:|
| パートナー閲覧 | ✅ | ✅ |
| パートナー登録/編集/削除 | ✅ | ❌ |
| 案件閲覧（全案件） | ✅ | ✅ |
| 案件登録/編集 | ✅ | ✅ |
| 案件削除 | ✅ | ❌ |

## API仕様

### 認証エンドポイント

#### ユーザー登録
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "ADMIN"  // または "REP"
}

Response 201 Created:
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "userId": "uuid",
  "email": "user@example.com",
  "role": "ADMIN"
}
```

#### ログイン
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response 200 OK:
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "userId": "uuid",
  "email": "user@example.com",
  "role": "ADMIN"
}
```

### パートナー管理エンドポイント

#### パートナー一覧取得（全認証ユーザー）
```http
GET /api/partners
Authorization: Bearer {token}
```

#### パートナー詳細取得（全認証ユーザー）
```http
GET /api/partners/{id}
Authorization: Bearer {token}
```

#### パートナー登録（管理者のみ）
```http
POST /api/partners
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "株式会社サンプル",
  "address": "東京都渋谷区...",
  "phone": "03-1234-5678"
}
```

#### パートナー更新（管理者のみ）
```http
PUT /api/partners/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "株式会社サンプル（更新）",
  "address": "東京都新宿区...",
  "phone": "03-9876-5432"
}
```

#### パートナー削除（管理者のみ）
```http
DELETE /api/partners/{id}
Authorization: Bearer {token}

Response 204 No Content
```

### 案件管理エンドポイント

#### 案件一覧取得（全認証ユーザー - 全案件表示）
```http
GET /api/projects
Authorization: Bearer {token}
```

#### 案件詳細取得（全認証ユーザー）
```http
GET /api/projects/{id}
Authorization: Bearer {token}
```

#### 案件登録（全認証ユーザー）
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "新規プロジェクト",
  "status": "NEW",  // NEW, IN_PROGRESS, DONE
  "partnerId": "partner-uuid",
  "ownerId": "user-uuid"
}
```

#### 案件更新（全認証ユーザー）
```http
PUT /api/projects/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "プロジェクト（更新）",
  "status": "IN_PROGRESS",
  "partnerId": "partner-uuid",
  "ownerId": "user-uuid"
}
```

#### 案件削除（管理者のみ）
```http
DELETE /api/projects/{id}
Authorization: Bearer {token}

Response 204 No Content
```

## プロジェクト構成

```
PRM_Tool
├─ .mvn
│  └─ wrapper
│     └─ maven-wrapper.properties
├─ backend                         # バックエンド（Spring Boot）
│  ├─ src
│  │  ├─ main
│  │  │  ├─ java
│  │  │  │  └─ com
│  │  │  │     └─ example
│  │  │  │        └─ prmtool
│  │  │  │           ├─ config          # 設定クラス
│  │  │  │           │  ├─ CorsConfig.java
│  │  │  │           │  ├─ CustomUserDetailsService.java
│  │  │  │           │  ├─ JwtRequestFilter.java
│  │  │  │           │  ├─ JwtUtil.java
│  │  │  │           │  └─ SecurityConfig.java
│  │  │  │           ├─ controller      # REST APIコントローラ
│  │  │  │           │  ├─ AuthController.java
│  │  │  │           │  ├─ HealthController.java
│  │  │  │           │  ├─ PartnerController.java
│  │  │  │           │  ├─ ProjectController.java
│  │  │  │           │  └─ RootController.java
│  │  │  │           ├─ dto             # データ転送オブジェクト
│  │  │  │           │  ├─ AuthResponse.java
│  │  │  │           │  ├─ LoginRequest.java
│  │  │  │           │  ├─ PartnerRequest.java
│  │  │  │           │  ├─ PartnerResponse.java
│  │  │  │           │  ├─ ProjectRequest.java
│  │  │  │           │  ├─ ProjectResponse.java
│  │  │  │           │  └─ RegisterRequest.java
│  │  │  │           ├─ entity          # JPAエンティティ
│  │  │  │           │  ├─ Partner.java
│  │  │  │           │  ├─ Project.java
│  │  │  │           │  └─ User.java
│  │  │  │           ├─ repository      # JPA Repository
│  │  │  │           │  ├─ PartnerRepository.java
│  │  │  │           │  ├─ ProjectRepository.java
│  │  │  │           │  └─ UserRepository.java
│  │  │  │           ├─ service         # ビジネスロジック
│  │  │  │           │  ├─ AuthService.java
│  │  │  │           │  ├─ PartnerService.java
│  │  │  │           │  └─ ProjectService.java
│  │  │  │           └─ PrmtoolApplication.java
│  │  │  └─ resources
│  │  │     ├─ static
│  │  │     ├─ templates
│  │  │     └─ application.yml  # アプリケーション設定
│  │  └─ test
│  │     └─ java
│  │        └─ com
│  │           └─ example
│  │              └─ prmtool
│  │                 ├─ application-test.yml
│  │                 └─ PrmtoolApplicationTests.java
│  ├─ Dockerfile
│  └─ pom.xml
├─ frontend                        # フロントエンド（React）
│  ├─ public
│  │  ├─ favicon.ico
│  │  ├─ index.html
│  │  ├─ logo192.png
│  │  ├─ logo512.png
│  │  ├─ manifest.json
│  │  └─ robots.txt
│  ├─ src
│  │  ├─ components              # 再利用コンポーネント
│  │  │  ├─ Navbar.css
│  │  │  ├─ Navbar.js
│  │  │  └─ PrivateRoute.js
│  │  ├─ context                 # 状態管理
│  │  │  └─ AuthContext.js
│  │  ├─ pages                   # ページコンポーネント
│  │  │  ├─ Auth.css
│  │  │  ├─ Dashboard.css
│  │  │  ├─ Dashboard.js
│  │  │  ├─ Login.js
│  │  │  ├─ Partners.css
│  │  │  ├─ Partners.js
│  │  │  ├─ Projects.css
│  │  │  ├─ Projects.js
│  │  │  └─ Register.js
│  │  ├─ services                # API通信
│  │  │  ├─ api.js
│  │  │  ├─ authService.js
│  │  │  ├─ partnerService.js
│  │  │  └─ projectService.js
│  │  ├─ App.css
│  │  ├─ App.js
│  │  ├─ index.css
│  │  ├─ index.js
│  │  └─ logo.svg
│  ├─ .gitignore
│  ├─ package-lock.json
│  └─ package.json
├─ scripts
│  └─ print-tree.mjs
├─ .env.example              # 環境変数サンプル（.envはGit管理しない）
├─ .gitattributes
├─ .gitignore
├─ docker-compose.yml
├─ mvnw
├─ mvnw.cmd
├─ README.md
├─ tree.txt                 # 生成物（必要なら scripts/print-tree.mjs で再生成）
└─ 要件定義書.md
```

## 環境設定

### アプリケーションプロファイル

#### 1. dev（開発環境）- デフォルト
- PostgreSQL 17を使用
- DDL自動更新: `update`
- 詳細なログ出力

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### 2. prod（本番環境）
- PostgreSQL 17を使用
- DDL自動更新: `validate`
- 最適化設定

```bash
export DB_PASSWORD=securepassword
export JWT_SECRET=your-production-secret-key
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

#### 3. test（テスト環境）
- H2インメモリデータベース
- DDL自動更新: `create-drop`

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=test
```

### 環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|------------|------|
| `SPRING_PROFILES_ACTIVE` | `dev` | アクティブプロファイル |
| `DB_URL` | `jdbc:postgresql://localhost:5432/prmdb` | DB接続URL |
| `DB_USERNAME` | `prmuser` | DBユーザー名 |
| `DB_PASSWORD` | `devpassword123` | DBパスワード |
| `JWT_SECRET` | (デフォルト値あり) | JWT署名鍵 |
| `JWT_EXPIRATION` | `86400000` (24時間) | トークン有効期限 |
| `SERVER_PORT` | `8080` | サーバーポート |

### Docker Compose設定

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17
    container_name: prm_postgres
    environment:
      POSTGRES_DB: prmdb
      POSTGRES_USER: prmuser
      POSTGRES_PASSWORD: devpassword123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 本番環境デプロイ

### Render.comへのデプロイ

#### 前提条件
- GitHubリポジトリ
- Renderアカウント

#### 1. PostgreSQLデータベースの作成

1. Renderダッシュボードで「New +」→「PostgreSQL」
2. 名前: `prmtool-db`
3. Database: `prmdb_1id2`
4. User: `prmuser`
5. 「Create Database」をクリック

#### 2. バックエンド（Web Service）のデプロイ

1. 「New +」→「Web Service」
2. GitHubリポジトリを接続
3. 設定:
   - Name: `prmtool`
   - Root Directory: `backend`
   - Build Command: `./mvnw clean package -DskipTests`
   - Start Command: `java -jar target/prmtool-0.0.1-SNAPSHOT.jar`
4. 環境変数を設定:
   ```
   SPRING_PROFILES_ACTIVE=prod
   DB_URL=<Render PostgreSQL Internal URL>
   DB_USERNAME=prmuser
   DB_PASSWORD=<Renderが生成したパスワード>
   JWT_SECRET=<長いランダムな文字列>
   ```

#### 3. フロントエンド（Static Site）のデプロイ

1. 「New +」→「Static Site」
2. GitHubリポジトリを接続
3. 設定:
   - Name: `prmtool-1`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. 環境変数を設定:
   ```
   REACT_APP_API_BASE_URL=https://prmtool.onrender.com
   ```

#### 4. デプロイ完了

- フロントエンド: https://prmtool-1.onrender.com
- バックエンド: https://prmtool.onrender.com

## トラブルシューティング

### バックエンド起動時のエラー

#### 1. PostgreSQL接続エラー
```
HikariPool-1 - Exception during pool initialization
```

**解決方法:**
```bash
# Docker Composeの確認
docker-compose ps
docker-compose logs postgres

# PostgreSQL再起動
docker-compose restart postgres
```

#### 2. ポート8080が使用中
```
Port 8080 is already in use
```

**解決方法:**
```bash
# プロセス確認
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Mac/Linux

# または環境変数でポート変更
export SERVER_PORT=8081
```

### フロントエンド起動時のエラー

#### 1. npm install失敗
```
npm ERR! code ERESOLVE
```

**解決方法:**
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 2. ポート3000が使用中
```
Something is already running on port 3000
```

**解決方法:**
```bash
# 別のポートで起動
PORT=3001 npm start  # Mac/Linux
set PORT=3001 && npm start  # Windows
```

#### 3. ESLint警告
```
React Hook useEffect has a missing dependency
```

**対応:** この警告は動作に影響しません。無視して問題ありません。

### API接続エラー

#### CORS エラー
```
Access to XMLHttpRequest blocked by CORS policy
```

**解決方法:**
1. バックエンドが起動しているか確認
2. `.env`ファイルのAPI URLを確認
3. SecurityConfigのCORS設定を確認

#### 401 Unauthorized
```
JWT token expired
```

**解決方法:**
1. 再度ログイン
2. ブラウザのローカルストレージをクリア
3. トークン有効期限を確認

## 今後の実装予定

### 機能拡張 🔜
- [ ] パスワードリセット機能
- [ ] プロフィール編集機能
- [ ] 案件のフィルタリング・検索
- [ ] エクスポート機能（CSV/Excel）
- [ ] メール通知機能
- [ ] 担当者別案件フィルタリング機能

### UI/UX改善 🔜
- [ ] ダークモード対応
- [ ] より詳細なエラーメッセージ
- [ ] ページネーション
- [ ] ソート機能
- [ ] ドラッグ&ドロップUI

### インフラ 🔜
- [ ] Docker化（フルスタック）
- [ ] CI/CD パイプライン
- [ ] Kubernetes対応

### ドキュメント 🔜
- [ ] Swagger/OpenAPI統合
- [ ] API詳細ドキュメント
- [ ] ユーザーマニュアル

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 作者

Simomura0716 - [@Simomura0716](https://github.com/Simomura0716)

プロジェクトリンク: [https://github.com/Simomura0716/PRM_Tool](https://github.com/Simomura0716/PRM_Tool)

---

## 更新履歴

### v1.0.0 (2025-12-22) - 現在のバージョン ✅
- ✅ フルスタックアプリケーション完成
- ✅ バックエンドAPI実装完了
- ✅ Reactフロントエンド実装完了
- ✅ JWT認証機能実装
- ✅ ユーザー管理機能
- ✅ パートナー管理機能（閲覧：全ユーザー、編集・削除：管理者のみ）
- ✅ 案件管理機能（閲覧・編集：全ユーザー、削除：管理者のみ）
- ✅ ダッシュボード実装（全案件表示）
- ✅ PostgreSQL 17統合
- ✅ Docker Compose対応
- ✅ レスポンシブデザイン
- ✅ **本番環境デプロイ完了（Render.com）**

### v0.1.5 (2025-12-17)
- ✅ PostgreSQL対応完了
- ✅ プロファイル設定（dev/prod/test）追加
- ✅ HikariCP接続プール設定

### v0.1.0 (2025-12-17)
- ✅ プロジェクト初期セットアップ
- ✅ 基本的なエンティティ設計# PRMtool
