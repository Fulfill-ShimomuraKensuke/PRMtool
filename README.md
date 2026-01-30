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

PRM Tool（Partner Relationship Management Tool）は、パートナー企業との関係管理、案件管理、手数料管理、請求書管理を統合的に行うWebアプリケーションです。

### ビジネス上の課題

- パートナー企業の情報が分散し、管理が煩雑
- 案件の進捗管理が非効率
- 手数料の計算と承認プロセスに時間がかかる
- 請求書作成に多くの手作業が必要
- ユーザー権限管理が不十分

### ソリューション

PRM Toolは、これらの課題を解決するために以下を提供します：

- **一元管理**: パートナー、案件、手数料、請求書の情報を一箇所で管理
- **自動化**: 手数料の自動計算、請求書の自動生成
- **権限管理**: ロールベースのアクセス制御で適切な権限分離
- **可視化**: ダッシュボードで重要な統計情報を視覚化
- **効率化**: スプレッドシート機能で柔軟なデータ管理

---

## 主要機能

### 🔐 認証・認可

- JWT トークンによる認証
- ロールベースアクセス制御（RBAC）
  - **SYSTEM**: システム管理者（初期セットアップ専用）
  - **ADMIN**: 管理者（全機能へのアクセス）
  - **ACCOUNTING**: 会計担当（手数料・請求書管理）
  - **REP**: 営業担当（案件の閲覧・編集）

### 👥 アカウント管理

- ユーザーの作成・編集・削除
- ロール管理
- ユーザー検索・フィルター機能

### 🏢 パートナー管理

- パートナー企業の登録・編集・削除
- 複数の担当者管理（姓名、役職、連絡先）
- 郵便番号自動検索機能（zipcloud API連携）
- パートナー情報の検索・フィルター

### 📊 案件管理

- 案件の作成・編集・削除
- ステータス管理（新規 / 進行中 / 完了）
- 複数担当者のアサイン
- スプレッドシート機能（Excel風のデータ管理）
- 案件別の権限制御

### 💰 手数料ルール管理

- 手数料ルールの作成・編集・確定
- 複数の手数料タイプ
  - **固定金額**: 数量に関係なく固定額
  - **割合**: 商品金額に対する割合
- ステータス管理（下書き / 確定）
- 確定後の編集制限で整合性を保証

### 📄 請求書管理

- 請求書の作成・編集・発行
- 複数明細の管理
- 手数料の自動計算
- 消費税の自動計算
- ステータス管理（下書き / 発行済 / 支払済 / キャンセル）
- PDF出力機能
- パートナー整合性チェック

### 📋 請求書テンプレート管理

- カスタマイズ可能なPDFテンプレート
- 会社ロゴ、ヘッダー、フッターの設定
- カラーカスタマイズ
- デフォルトテンプレート設定

### 📈 ダッシュボード

- パートナー統計
- 案件統計（ステータス別）
- 請求書統計
- 手数料統計
- 視覚的なグラフ表示

---

## 技術スタック

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Java | 17+ | プログラミング言語 |
| Spring Boot | 3.5.9 | アプリケーションフレームワーク |
| Spring Security | 6.x | 認証・認可 |
| Spring Data JPA | 3.x | データアクセス層 |
| Hibernate | 6.x | ORM |
| PostgreSQL | 16+ | データベース |
| Flyway | 10.x | データベースマイグレーション |
| Maven | 3.8+ | ビルドツール |
| Lombok | 1.18.x | ボイラープレートコード削減 |
| JWT | 0.11.x | トークン認証 |

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 19.2.3 | UIフレームワーク |
| React Router | 6.x | ルーティング |
| Axios | 1.x | HTTP クライアント |
| React Bootstrap | 2.x | UIコンポーネント |
| JavaScript | ES6+ | プログラミング言語 |

### インフラ・ツール

| 技術 | 用途 |
|------|------|
| Docker | コンテナ化 |
| Docker Compose | ローカル開発環境 |
| Render | 本番環境デプロイ |
| Git | バージョン管理 |
| GitHub | リポジトリホスティング |

---

## システム要件

### 開発環境

- **Java Development Kit (JDK)**: 17以上
- **Maven**: 3.8以上
- **Node.js**: 18以上
- **npm**: 9以上
- **Docker**: 20.x以上
- **Docker Compose**: 2.x以上
- **Git**: 2.x以上
- **PostgreSQL**: 16以上（Dockerで提供）

### 推奨環境

- **OS**: Windows 10/11, macOS 12+, Ubuntu 20.04+
- **メモリ**: 8GB以上
- **ストレージ**: 10GB以上の空き容量

### ブラウザ

- Google Chrome（最新版）
- Microsoft Edge（最新版）
- Safari（最新版）
- Firefox（最新版）

---

## セットアップ

### 1. 前提条件の確認

以下のソフトウェアがインストールされていることを確認してください：

```bash
# Java バージョン確認
java -version
# 出力例: openjdk version "17.0.x" ...

# Maven バージョン確認
mvn -version
# 出力例: Apache Maven 3.8.x ...

# Node.js バージョン確認
node -v
# 出力例: v18.x.x

# npm バージョン確認
npm -v
# 出力例: 9.x.x

# Docker バージョン確認
docker -v
# 出力例: Docker version 20.x.x ...

# Docker Compose バージョン確認
docker-compose -v
# 出力例: Docker Compose version 2.x.x
```

インストールされていない場合は、[開発者向けセットアップガイド](Materials/開発者向けセットアップガイド.md)を参照してください。

### 2. プロジェクトのクローン

```bash
# GitHubからクローン
git clone https://github.com/Fulfill-ShimomuraKensuke/PRMtool.git

# プロジェクトディレクトリに移動
cd PRMtool
```

### 3. データベースのセットアップ

#### Docker Composeを使用（推奨）

```bash
# PostgreSQLコンテナを起動
docker-compose up -d

# 起動確認
docker ps
# prmtool-postgres コンテナが起動していることを確認

# ログ確認
docker logs prmtool-postgres
```

**データベース接続情報**:
- ホスト: `localhost`
- ポート: `5432`
- データベース名: `prmdb`
- ユーザー名: `prmuser`
- パスワード: `devpassword123`

#### データベース接続確認

```bash
# PostgreSQLコンテナに接続
docker exec -it prmtool-postgres psql -U prmuser -d prmdb

# psqlプロンプトが表示されたら成功
prmdb=# \dt
# テーブル一覧が表示される
```

### 4. バックエンドのセットアップ

```bash
# backendディレクトリに移動
cd backend

# Mavenの依存関係をインストール
mvn clean install

# アプリケーションの起動
mvn spring-boot:run
```

**起動確認**:

```bash
# 別のターミナルを開いて確認
curl http://localhost:8080/api/health

# 正常な場合、200 OKが返る
```

**初回起動時の自動処理**:
- Flywayによるデータベーステーブルの自動作成
- 初期システム管理者アカウントの自動作成
  - ログインID: `system`
  - パスワード: `SystemPass123!`

### 5. フロントエンドのセットアップ

```bash
# 新しいターミナルを開く
cd frontend

# npm依存関係をインストール
npm install

# 開発サーバーを起動
npm start
```

**起動確認**:
- ブラウザが自動的に開き、`http://localhost:3000` が表示される
- ログイン画面が表示されれば成功

### 6. 初回ログイン

1. ブラウザで `http://localhost:3000` にアクセス
2. 以下の認証情報でログイン:
   - **ログインID**: `system`
   - **パスワード**: `SystemPass123!`
3. ダッシュボードが表示されれば、セットアップ完了です

### 7. 管理者ユーザーの作成（推奨）

初回ログイン後、実際に使用する管理者アカウントを作成してください：

1. 「アカウント管理」メニューをクリック
2. 「+ 新規ユーザー」ボタンをクリック
3. 必要な情報を入力:
   - 名前: 例）`管理者`
   - ログインID: 例）`admin`
   - パスワード: 強力なパスワードを設定
   - メールアドレス: 管理者のメールアドレス
   - ロール: `管理者（ADMIN）`
4. 「作成」ボタンをクリック
5. 作成後、ログアウトして新しいアカウントでログインし直す

**セキュリティのため、SYSTEM アカウントは通常業務では使用しないでください。**

---

## プロジェクト構造

```
PRMtool/
├── backend/                    # Spring Boot アプリケーション
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/prmtool/
│   │   │   │   ├── config/           # 設定クラス
│   │   │   │   │   ├── CorsConfig.java                # CORS設定
│   │   │   │   │   ├── DataInitializer.java           # 初期データ作成
│   │   │   │   │   ├── JwtAuthenticationFilter.java   # JWT認証フィルター
│   │   │   │   │   ├── JwtUtil.java                   # JWTユーティリティ
│   │   │   │   │   └── SecurityConfig.java            # Spring Security設定
│   │   │   │   │
│   │   │   │   ├── controller/       # REST APIコントローラー
│   │   │   │   │   ├── AuthController.java            # 認証API
│   │   │   │   │   ├── UserController.java            # ユーザー管理API
│   │   │   │   │   ├── PartnerController.java         # パートナー管理API
│   │   │   │   │   ├── ContactPersonController.java   # 担当者管理API
│   │   │   │   │   ├── ProjectController.java         # 案件管理API
│   │   │   │   │   ├── CommissionRuleController.java  # 手数料ルール管理API
│   │   │   │   │   ├── InvoiceController.java         # 請求書管理API
│   │   │   │   │   └── InvoiceTemplateController.java # テンプレート管理API
│   │   │   │   │
│   │   │   │   ├── dto/              # データ転送オブジェクト
│   │   │   │   │   ├── LoginRequest.java              # ログインリクエスト
│   │   │   │   │   ├── LoginResponse.java             # ログインレスポンス
│   │   │   │   │   ├── UserRequest.java               # ユーザーリクエスト
│   │   │   │   │   ├── UserResponse.java              # ユーザーレスポンス
│   │   │   │   │   └── ...                           # その他のDTO
│   │   │   │   │
│   │   │   │   ├── entity/           # エンティティクラス
│   │   │   │   │   ├── User.java                      # ユーザー
│   │   │   │   │   ├── Partner.java                   # パートナー
│   │   │   │   │   ├── ContactPerson.java             # 担当者
│   │   │   │   │   ├── Project.java                   # 案件
│   │   │   │   │   ├── ProjectAssignment.java         # 案件担当者
│   │   │   │   │   ├── ProjectTableData.java          # 案件テーブルデータ
│   │   │   │   │   ├── CommissionRule.java            # 手数料ルール
│   │   │   │   │   ├── Invoice.java                   # 請求書
│   │   │   │   │   ├── InvoiceItem.java               # 請求書明細
│   │   │   │   │   └── InvoiceTemplate.java           # 請求書テンプレート
│   │   │   │   │
│   │   │   │   ├── repository/       # JPA リポジトリ
│   │   │   │   │   ├── UserRepository.java            # ユーザーリポジトリ
│   │   │   │   │   ├── PartnerRepository.java         # パートナーリポジトリ
│   │   │   │   │   ├── ContactPersonRepository.java   # 担当者リポジトリ
│   │   │   │   │   ├── ProjectRepository.java         # 案件リポジトリ
│   │   │   │   │   ├── CommissionRuleRepository.java  # 手数料ルールリポジトリ
│   │   │   │   │   ├── InvoiceRepository.java         # 請求書リポジトリ
│   │   │   │   │   ├── InvoiceItemRepository.java     # 請求書明細リポジトリ
│   │   │   │   │   └── InvoiceTemplateRepository.java # テンプレートリポジトリ
│   │   │   │   │
│   │   │   │   ├── service/          # ビジネスロジック
│   │   │   │   │   ├── UserService.java               # ユーザーサービス
│   │   │   │   │   ├── PartnerService.java            # パートナーサービス
│   │   │   │   │   ├── ContactPersonService.java      # 担当者サービス
│   │   │   │   │   ├── ProjectService.java            # 案件サービス
│   │   │   │   │   ├── CommissionRuleService.java     # 手数料ルールサービス
│   │   │   │   │   ├── CommissionCalculationService.java # 手数料計算サービス
│   │   │   │   │   ├── InvoiceService.java            # 請求書サービス
│   │   │   │   │   ├── InvoiceTemplateService.java    # テンプレートサービス
│   │   │   │   │   └── DashboardService.java          # ダッシュボードサービス
│   │   │   │   │
│   │   │   │   └── util/             # ユーティリティ
│   │   │   │       └── ...
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.yml                     # アプリケーション設定
│   │   │       └── db/migration/                       # Flywayマイグレーション
│   │   │           ├── V1__initial_schema.sql
│   │   │           ├── V2__add_invoice_templates.sql
│   │   │           └── ...
│   │   │
│   │   └── test/                      # テストコード
│   │       └── ...
│   │
│   ├── Dockerfile                     # Dockerイメージ定義
│   └── pom.xml                        # Maven設定
│
├── frontend/                   # React アプリケーション
│   ├── public/
│   │   ├── index.html                 # HTMLテンプレート
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/        # 再利用可能コンポーネント
│   │   │   ├── Navbar.js              # ナビゲーションバー
│   │   │   ├── PrivateRoute.js        # 認証済みルート
│   │   │   └── Spreadsheet.js         # スプレッドシートコンポーネント
│   │   │
│   │   ├── context/           # コンテキスト
│   │   │   └── AuthContext.js         # 認証コンテキスト
│   │   │
│   │   ├── pages/             # ページコンポーネント
│   │   │   ├── Login.js               # ログイン画面
│   │   │   ├── Dashboard.js           # ダッシュボード
│   │   │   ├── Accounts.js            # アカウント管理
│   │   │   ├── Partners.js            # パートナー管理
│   │   │   ├── Projects.js            # 案件管理
│   │   │   ├── ProjectDetail.js       # 案件詳細
│   │   │   ├── CommissionRules.js     # 手数料ルール管理
│   │   │   ├── Invoices.js            # 請求書管理
│   │   │   └── InvoiceTemplates.js    # テンプレート管理
│   │   │
│   │   ├── services/          # API通信サービス
│   │   │   ├── api.js                 # Axiosインスタンス設定
│   │   │   ├── authService.js         # 認証サービス
│   │   │   ├── userService.js         # ユーザーサービス
│   │   │   ├── partnerService.js      # パートナーサービス
│   │   │   ├── contactPersonService.js # 担当者サービス
│   │   │   ├── projectService.js      # 案件サービス
│   │   │   ├── commissionRuleService.js # 手数料ルールサービス
│   │   │   ├── invoiceService.js      # 請求書サービス
│   │   │   └── invoiceTemplateService.js # テンプレートサービス
│   │   │
│   │   ├── App.js                     # ルートコンポーネント
│   │   ├── App.css                    # グローバルスタイル
│   │   └── index.js                   # エントリーポイント
│   │
│   └── package.json                   # npm設定
│
├── Materials/                  # ドキュメント
│   ├── ユーザー用手引書.md
│   ├── 開発者向けセットアップガイド.md
│   ├── PHASE1_CONFIRMED_PLAN.md
│   └── CODE_REVIEW_RESULTS.md
│
├── docker-compose.yml          # Docker Compose設定
├── .gitignore                  # Git除外設定
└── README.md                   # このファイル
```

---

## 環境変数

### バックエンド環境変数

バックエンドの環境変数は `backend/src/main/resources/application.yml` で設定します。

#### 必須環境変数

| 変数名 | 説明 | デフォルト値 | 本番環境 |
|--------|------|------------|---------|
| `SPRING_DATASOURCE_URL` | データベース接続URL | `jdbc:postgresql://localhost:5432/prmdb` | 本番DB URL |
| `SPRING_DATASOURCE_USERNAME` | データベースユーザー名 | `prmuser` | 本番DBユーザー |
| `SPRING_DATASOURCE_PASSWORD` | データベースパスワード | `devpassword123` | **必須・機密** |
| `JWT_SECRET` | JWT署名キー（64文字以上推奨） | `mySecretKey...` | **必須・機密** |

#### 任意環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|------------|
| `INITIAL_ADMIN_PASSWORD` | 初期管理者パスワード | `SystemPass123!` |
| `SERVER_PORT` | サーバーポート | `8080` |

### フロントエンド環境変数

フロントエンドの環境変数は `.env` ファイルで設定します。

#### 必須環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|------------|
| `REACT_APP_API_BASE_URL` | バックエンドAPIのURL | `http://localhost:8080` |

### 環境変数の設定方法

#### ローカル開発環境

**バックエンド**:

```bash
# backend/src/main/resources/application.yml を編集
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/prmdb
    username: prmuser
    password: devpassword123

jwt:
  secret: mySecretKeyForJwtTokenGenerationAndValidationPurpose12345678901234567890
```

**フロントエンド**:

```bash
# frontend/.env を作成
echo "REACT_APP_API_BASE_URL=http://localhost:8080" > frontend/.env
```

#### 本番環境（Render）

Render のダッシュボードで環境変数を設定:

1. Renderダッシュボードにログイン
2. サービスを選択
3. 「Environment」タブを開く
4. 環境変数を追加:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `JWT_SECRET`

**セキュリティ注意事項**:
- `JWT_SECRET` は64文字以上のランダムな文字列を使用してください
- パスワードや秘密鍵は `.gitignore` に含めて、Gitにコミットしないでください
- 本番環境では必ず環境変数を使用してください

---

## 使用方法

### ユーザーロール

システムには4つのロールがあります：

| ロール | 説明 | 権限 |
|--------|------|------|
| **SYSTEM** | システム管理者 | 全機能へのアクセス（初期セットアップ専用） |
| **ADMIN** | 管理者 | ユーザー管理、データ削除を含む全機能 |
| **ACCOUNTING** | 会計担当 | 手数料・請求書の管理、パートナー管理 |
| **REP** | 営業担当 | 案件の閲覧・編集（削除不可） |

詳細な権限マトリックスは[ユーザー手引書](Materials/ユーザー用手引書_v3.0.md)を参照してください。

### 基本的なワークフロー

1. **パートナー登録**
   - パートナー企業の情報を登録
   - 担当者情報を追加

2. **案件作成**
   - パートナーに紐づく案件を作成
   - 担当者をアサイン
   - スプレッドシートで詳細データを管理

3. **手数料ルール設定**
   - 案件に対する手数料ルールを作成
   - 固定金額または割合を設定
   - ルールを確定（確定後は編集不可）

4. **請求書作成**
   - パートナーを選択
   - 明細を追加（手数料ルールを適用）
   - 手数料と消費税が自動計算される
   - 請求書を発行

5. **支払管理**
   - 発行済の請求書を「支払済」に変更
   - ダッシュボードで統計を確認

詳細な使用方法は[ユーザー手引書](Materials/ユーザー用手引書_v3.0.md)を参照してください。

---

## API ドキュメント

### エンドポイント一覧

#### 認証 API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|--------------|------|------|
| POST | `/api/auth/login` | ログイン | 不要 |

#### ユーザー管理 API

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|------|
| GET | `/api/users` | ユーザー一覧取得 | SYSTEM, ADMIN |
| GET | `/api/users/{id}` | ユーザー詳細取得 | SYSTEM, ADMIN |
| POST | `/api/users` | ユーザー作成 | SYSTEM, ADMIN |
| PUT | `/api/users/{id}` | ユーザー更新 | SYSTEM, ADMIN |
| DELETE | `/api/users/{id}` | ユーザー削除 | SYSTEM, ADMIN |

#### パートナー管理 API

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|------|
| GET | `/api/partners` | パートナー一覧取得 | 全ロール |
| GET | `/api/partners/{id}` | パートナー詳細取得 | 全ロール |
| POST | `/api/partners` | パートナー作成 | ADMIN, ACCOUNTING, REP |
| PUT | `/api/partners/{id}` | パートナー更新 | ADMIN, ACCOUNTING, REP |
| DELETE | `/api/partners/{id}` | パートナー削除 | ADMIN |

#### 担当者管理 API

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|------|
| GET | `/api/partners/{partnerId}/contacts` | 担当者一覧取得 | 全ロール |
| POST | `/api/partners/{partnerId}/contacts` | 担当者作成 | ADMIN, ACCOUNTING, REP |
| PUT | `/api/contacts/{id}` | 担当者更新 | ADMIN, ACCOUNTING, REP |
| DELETE | `/api/contacts/{id}` | 担当者削除 | ADMIN, ACCOUNTING, REP |

#### 案件管理 API

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|------|
| GET | `/api/projects` | 案件一覧取得 | 全ロール |
| GET | `/api/projects/{id}` | 案件詳細取得 | 全ロール |
| POST | `/api/projects` | 案件作成 | ADMIN, ACCOUNTING, REP |
| PUT | `/api/projects/{id}` | 案件更新 | ADMIN, ACCOUNTING, REP |
| DELETE | `/api/projects/{id}` | 案件削除 | ADMIN, ACCOUNTING |

#### 手数料ルール管理 API

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|------|
| GET | `/api/commission-rules` | ルール一覧取得 | 全ロール |
| GET | `/api/commission-rules/{id}` | ルール詳細取得 | 全ロール |
| POST | `/api/commission-rules` | ルール作成 | ADMIN, ACCOUNTING |
| PUT | `/api/commission-rules/{id}` | ルール更新 | ADMIN, ACCOUNTING |
| PUT | `/api/commission-rules/{id}/confirm` | ルール確定 | ADMIN, ACCOUNTING |
| DELETE | `/api/commission-rules/{id}` | ルール削除 | ADMIN |

#### 請求書管理 API

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|------|
| GET | `/api/invoices` | 請求書一覧取得 | 全ロール |
| GET | `/api/invoices/{id}` | 請求書詳細取得 | 全ロール |
| GET | `/api/invoices/{id}/pdf` | PDF出力 | 全ロール |
| POST | `/api/invoices` | 請求書作成 | ADMIN, ACCOUNTING |
| PUT | `/api/invoices/{id}` | 請求書更新 | ADMIN, ACCOUNTING |
| PUT | `/api/invoices/{id}/issue` | 請求書発行 | ADMIN, ACCOUNTING |
| PUT | `/api/invoices/{id}/mark-as-paid` | 支払済に変更 | ADMIN, ACCOUNTING |
| DELETE | `/api/invoices/{id}` | 請求書削除 | ADMIN |

#### 請求書テンプレート管理 API

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|------|
| GET | `/api/invoice-templates` | テンプレート一覧取得 | 全ロール |
| GET | `/api/invoice-templates/{id}` | テンプレート詳細取得 | 全ロール |
| POST | `/api/invoice-templates` | テンプレート作成 | ADMIN, ACCOUNTING |
| PUT | `/api/invoice-templates/{id}` | テンプレート更新 | ADMIN, ACCOUNTING |
| PUT | `/api/invoice-templates/{id}/set-default` | デフォルト設定 | ADMIN, ACCOUNTING |
| DELETE | `/api/invoice-templates/{id}` | テンプレート削除 | ADMIN |

### API 使用例

#### ログイン

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "system",
    "password": "SystemPass123!"
  }'
```

**レスポンス**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "System Admin",
  "loginId": "system",
  "email": "system@example.com",
  "role": "SYSTEM"
}
```

#### パートナー一覧取得

```bash
curl -X GET http://localhost:8080/api/partners \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 請求書作成

```bash
curl -X POST http://localhost:8080/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "partnerId": "550e8400-e29b-41d4-a716-446655440000",
    "invoiceNumber": "INV-2026-001",
    "issueDate": "2026-01-30",
    "items": [
      {
        "description": "商品A",
        "quantity": 10,
        "unitPrice": 1000,
        "commissionRuleId": "660e8400-e29b-41d4-a716-446655440000"
      }
    ]
  }'
```

---

## 開発ガイド

### コーディング規約

#### Java

- **命名規則**: キャメルケース（変数・メソッド）、パスカルケース（クラス）
- **コメント**: 
  - 「何をするのか」「何のためにあるのか」を記述
  - 「追加した」「修正した」などの履歴コメントは不要（Gitで管理）
- **パッケージ構造**: レイヤー別に明確に分離

#### JavaScript

- **命名規則**: キャメルケース
- **コンポーネント**: 機能ごとに分割
- **スタイル**: CSS ファイルを分離

### Git ワークフロー

#### ブランチ戦略

```
main (本番環境)
  └── develop (開発環境)
       ├── feature/new-feature
       ├── feature/another-feature
       └── bugfix/fix-description
```

#### コミットメッセージ規約

```
<type>: <subject>

<body>

<footer>
```

**Type**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・設定変更

**例**:
```bash
git commit -m "feat: パートナー郵便番号自動検索機能を追加"
git commit -m "fix: ログイン時のトークン検証エラーを修正"
git commit -m "docs: README にセットアップ手順を追加"
```

### 開発サイクル

1. **要件確認**: GitHub Issues でタスクを確認
2. **ブランチ作成**: `feature/` または `bugfix/` ブランチを作成
3. **実装**: Entity → Repository → Service → Controller の順で実装
4. **テスト**: 単体テスト・統合テストを実施
5. **コミット**: 適切なコミットメッセージで記録
6. **プルリクエスト**: developブランチへのマージを申請
7. **レビュー**: コードレビュー後にマージ

詳細は[開発者向けセットアップガイド](Materials/開発者向けセットアップガイド.md)を参照してください。

### データベースマイグレーション

Flywayを使用してデータベースのバージョン管理を行っています。

#### 新しいマイグレーションの作成

```bash
# backend/src/main/resources/db/migration/ に新しいファイルを作成
# 命名規則: V{バージョン番号}__{説明}.sql
# 例: V3__add_email_to_partners.sql
```

**マイグレーションファイルの例**:

```sql
-- V3__add_email_to_partners.sql
ALTER TABLE partners ADD COLUMN email VARCHAR(255);
```

**注意事項**:
- マイグレーションファイルは一度適用されると変更できません
- 新しい変更は新しいバージョンのファイルとして作成してください
- ロールバックは新しいマイグレーションで行ってください

---

## デプロイ

### Render へのデプロイ

#### 前提条件

- Renderアカウント
- GitHubリポジトリ

#### バックエンドのデプロイ

1. Renderダッシュボードで「New +」→「Web Service」を選択
2. GitHubリポジトリを接続
3. 設定:
   - **Name**: `prmtool-backend`
   - **Environment**: `Docker`
   - **Region**: 適切なリージョンを選択
   - **Branch**: `main`
   - **Dockerfile Path**: `backend/Dockerfile`

4. 環境変数を設定:
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://[DATABASE_URL]
   SPRING_DATASOURCE_USERNAME=[DB_USERNAME]
   SPRING_DATASOURCE_PASSWORD=[DB_PASSWORD]
   JWT_SECRET=[RANDOM_64_CHAR_STRING]
   ```

5. 「Create Web Service」をクリック

#### フロントエンドのデプロイ

1. Renderダッシュボードで「New +」→「Static Site」を選択
2. GitHubリポジトリを接続
3. 設定:
   - **Name**: `prmtool-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. 環境変数を設定:
   ```
   REACT_APP_API_BASE_URL=[BACKEND_URL]
   ```

5. 「Create Static Site」をクリック

#### データベースのデプロイ

1. Renderダッシュボードで「New +」→「PostgreSQL」を選択
2. 設定:
   - **Name**: `prmtool-db`
   - **Database**: `prmdb`
   - **User**: `prmuser`
   - **Region**: バックエンドと同じリージョン

3. 「Create Database」をクリック
4. 接続情報をバックエンドの環境変数に設定

---

## トラブルシューティング

### よくある問題と解決方法

#### 問題1: データベースに接続できない

**症状**: `Connection refused` または `Connection timeout` エラー

**原因**:
- PostgreSQLコンテナが起動していない
- 接続情報が間違っている
- ファイアウォールがブロックしている

**解決方法**:
```bash
# PostgreSQLコンテナの起動状態を確認
docker ps

# コンテナが起動していない場合
docker-compose up -d

# ログを確認
docker logs prmtool-postgres

# 接続テスト
docker exec -it prmtool-postgres psql -U prmuser -d prmdb
```

#### 問題2: バックエンドが起動しない

**症状**: `mvn spring-boot:run` でエラーが発生する

**原因**:
- Javaバージョンが17未満
- Mavenの依存関係が解決されていない
- ポート8080が既に使用されている

**解決方法**:
```bash
# Javaバージョンを確認
java -version

# 依存関係を再インストール
mvn clean install

# ポート使用状況を確認
# Windows
netstat -ano | findstr :8080

# macOS/Linux
lsof -i :8080
```

#### 問題3: フロントエンドが起動しない

**症状**: `npm start` でエラーが発生する

**原因**:
- Node.jsバージョンが18未満
- npm依存関係が解決されていない
- ポート3000が既に使用されている

**解決方法**:
```bash
# Node.jsバージョンを確認
node -v

# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install

# 別のポートで起動
PORT=3001 npm start
```

#### 問題4: ログインできない

**症状**: ログインIDとパスワードを入力しても「認証に失敗しました」と表示される

**解決方法**:
1. バックエンドが起動しているか確認
2. フロントエンドの環境変数 `REACT_APP_API_BASE_URL` が正しいか確認
3. ブラウザのコンソールでエラーを確認
4. 初回ログイン情報を確認:
   - ログインID: `system`
   - パスワード: `SystemPass123!`

#### 問題5: CORS エラーが発生する

**症状**: ブラウザのコンソールに `CORS policy` エラーが表示される

**原因**: バックエンドのCORS設定が正しくない

**解決方法**:
1. `backend/src/main/java/com/example/prmtool/config/CorsConfig.java` を確認
2. フロントエンドのURLが許可されているか確認
3. バックエンドを再起動

#### 問題6: データベースマイグレーションが失敗する

**症状**: バックエンド起動時にFlywayエラーが発生する

**解決方法**:
```bash
# データベースをリセット（開発環境のみ）
docker-compose down -v
docker-compose up -d

# バックエンドを再起動
cd backend
mvn spring-boot:run
```

**注意**: 本番環境ではデータベースをリセットしないでください。

### さらなるサポート

上記で解決しない場合は、以下を確認してください：

1. [開発者向けセットアップガイド](Materials/開発者向けセットアップガイド.md)
2. [コードレビュー結果](CODE_REVIEW_RESULTS.md)
3. GitHubのIssuesページ

---

## ライセンス

このプロジェクトはプロプライエタリライセンスです。無断での複製、配布、変更は禁止されています。

**Copyright © 2026 Fulfill-ShimomuraKensuke. All Rights Reserved.**

---

## 貢献

バグ報告や機能要望は、GitHubのIssuesページで受け付けています。

---

## 連絡先

- **プロジェクトオーナー**: 下村健介
- **GitHub**: [Fulfill-ShimomuraKensuke/PRMtool](https://github.com/Fulfill-ShimomuraKensuke/PRMtool)

---