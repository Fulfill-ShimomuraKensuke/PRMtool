# PRM Tool - Partner Relationship Management System

パートナー企業との関係管理を効率化するためのWebアプリケーション

[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.9-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.3-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

---

## 📋 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [必要要件](#必要要件)
- [セットアップ](#セットアップ)
- [使用方法](#使用方法)
- [デプロイ](#デプロイ)
- [プロジェクト構成](#プロジェクト構成)
- [API仕様](#api仕様)
- [開発](#開発)
- [トラブルシューティング](#トラブルシューティング)
- [セキュリティ](#セキュリティ)
- [ライセンス](#ライセンス)

---

## 概要

PRM Tool（Partner Relationship Management Tool）は、パートナー企業との関係管理、案件管理、手数料管理、請求管理を統合的に行うためのWebアプリケーションです。

### 特徴

- 🏢 **パートナー管理**: パートナー企業の情報を一元管理、複数連絡先対応
- 📊 **案件管理**: 案件の進捗管理と担当者アサイン機能
- 💰 **手数料管理**: 手数料の申請・承認・支払いワークフロー
- 📄 **請求管理**: 請求書の作成と明細管理、消費税自動計算
- 👥 **ユーザー管理**: ロールベースのアクセス制御（ADMIN, REP）
- 🔒 **セキュリティ**: JWT認証による安全な認証・認可
- 📥 **データ管理**: CSV入出力による柔軟なデータ管理
- 📊 **ダッシュボード**: タブ形式の統計情報表示

---

## 主な機能

### 1. アカウント管理
- ユーザーの作成・編集・削除
- ロールベースアクセス制御（SYSTEM, ADMIN, REP）
- パスワード確認機能付きフォーム
- 検索・フィルター機能（名前、ログインID、メール、電話番号、役職、ロール）

### 2. パートナー管理
- パートナー企業の情報管理
- 業種別フィルタリング
- CSV入出力機能（UTF-8 BOM対応）
- 連絡先管理（複数登録可能、カンマ区切り）
- パートナー別ダッシュボード

### 3. 案件管理
- 案件の作成・編集・削除
- ステータス管理（新規・進行中・完了）
- 担当者アサイン機能（チェックボックス選択 + 検索）
- オーナー自動設定

### 4. 手数料管理
- 手数料の申請・承認・支払いフロー
- ステータス管理（保留中・承認済み・支払済み）
- 案件との紐付け
- 金額・日付管理

### 5. 請求管理
- 請求書の作成・編集・削除
- 請求明細の行単位管理
- 消費税自動計算（税率10%）
- 合計金額自動算出

### 6. ダッシュボード
- メインダッシュボード（タブ形式：概要・パートナー・案件・手数料・請求）
- パートナー別ダッシュボード
- 統計情報の可視化

### 7. 認証・認可
- JWT トークンベース認証
- ロール別アクセス制御
- セキュアなセッション管理

---

## 技術スタック

### Backend
| 項目 | 技術 | バージョン |
|------|------|----------|
| 言語 | Java | 17 |
| フレームワーク | Spring Boot | 3.5.9 |
| 認証 | Spring Security + JWT | - |
| ORM | Hibernate (JPA) | - |
| データベース | PostgreSQL | 16 |
| ビルドツール | Maven | - |
| CSV処理 | Apache Commons CSV | 1.10.0 |

### Frontend
| 項目 | 技術 | バージョン |
|------|------|----------|
| 言語 | JavaScript | ES6+ |
| ライブラリ | React | 19.2.3 |
| ルーティング | React Router | 6.x |
| HTTP クライアント | Axios | - |
| スタイリング | CSS3 | - |

### インフラ・デプロイ
| 項目 | 技術 |
|------|------|
| コンテナ | Docker |
| 本番環境 | Render.com |
| データベース | PostgreSQL (Render) |

---

## 必要要件

### 開発環境
- **Java**: 17以上
- **Node.js**: 18.x以上
- **Docker**: 20.x以上（ローカル開発用）
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
git clone https://github.com/Fulfill-ShimomuraKensuke/PRMtool.git
cd PRMtool
```

### 2. データベースの起動（ローカル開発用）

```bash
# Docker ComposeでPostgreSQLを起動
docker-compose up -d

# データベースが起動したことを確認
docker ps
```

### 3. Backendのセットアップ

```bash
cd backend

# 依存関係のインストール
./mvnw clean install

# アプリケーションの起動（開発環境）
./mvnw spring-boot:run
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
   - デフォルト認証情報（環境変数で設定可能）:
     - ログインID: `system`
     - パスワード: 環境変数で設定したパスワード

2. **ADMIN ユーザーの作成**
   - SYSTEM管理者でログイン
   - アカウント管理画面から ADMIN ユーザーを作成
   - 本番環境では必ずデフォルトパスワードを変更してください

3. **通常運用**
   - ADMIN ユーザーでログイン
   - 必要に応じて REP ユーザーを作成
   - パートナー、案件、手数料、請求の管理を開始

### ロール別の権限

| 機能 | SYSTEM | ADMIN | REP |
|------|--------|-------|-----|
| アカウント管理 | ✅ | ✅ | ❌ |
| パートナー管理 | ❌ | ✅ | 閲覧のみ |
| 案件管理 | ❌ | ✅ | ✅ |
| 手数料管理 | ❌ | ✅ | ✅ |
| 請求管理 | ❌ | ✅ | ✅ |
| ダッシュボード | ❌ | ✅ | ✅ |

**注意**: SYSTEMロールは初回セットアップ専用です。通常運用では使用しません。

---

## デプロイ

### Render.comへのデプロイ

本プロジェクトはRender.comでの本番運用を想定しています。

#### 必要なリソース

1. **PostgreSQL Database**
   - Region: Singapore (推奨)
   - Plan: Free (1GB)

2. **Web Service (Backend)**
   - Language: Docker
   - Root Directory: `backend`
   - Dockerfile Path: `backend/Dockerfile`
   - Instance Type: Free

3. **Static Site (Frontend)**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

#### 環境変数設定

**Backend**:
```bash
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
DB_URL=jdbc:postgresql://[Render Database URL]
DB_USERNAME=prmuser
DB_PASSWORD=[Render Database Password]
JWT_SECRET=[64文字以上のランダム文字列]
JWT_EXPIRATION=86400000
INITIAL_ADMIN_ENABLED=true
INITIAL_ADMIN_LOGIN_ID=system
INITIAL_ADMIN_PASSWORD=[強力なパスワード]
```

**Frontend**:
```bash
REACT_APP_API_BASE_URL=[Backend URL]
```

詳細なデプロイ手順は `RENDER_DEPLOYMENT_GUIDE.md` を参照してください。

---

## プロジェクト構成

```
PRMtool/
├── backend/                    # Spring Bootアプリケーション
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/prmtool/
│   │   │   │   ├── config/          # 設定クラス（CORS、Security、JWT）
│   │   │   │   ├── controller/      # REST APIコントローラー
│   │   │   │   ├── dto/             # データ転送オブジェクト
│   │   │   │   ├── entity/          # JPAエンティティ
│   │   │   │   ├── repository/      # JPAリポジトリ
│   │   │   │   ├── service/         # ビジネスロジック
│   │   │   │   ├── security/        # JWT認証フィルター
│   │   │   │   ├── init/            # データ初期化
│   │   │   │   └── util/            # ユーティリティ
│   │   │   └── resources/
│   │   │       └── application.yml      # アプリケーション設定
│   │   └── test/                        # テストコード
│   ├── Dockerfile                       # Docker設定
│   └── pom.xml                          # Maven設定
│
├── frontend/                   # Reactアプリケーション
│   ├── public/                 # 静的ファイル
│   ├── src/
│   │   ├── components/         # 再利用可能コンポーネント
│   │   ├── context/            # Context API（認証）
│   │   ├── pages/              # ページコンポーネント
│   │   │   ├── Accounts.js             # アカウント管理
│   │   │   ├── Partners.js             # パートナー管理
│   │   │   ├── Projects.js             # 案件管理
│   │   │   ├── Commissions.js          # 手数料管理
│   │   │   ├── Invoices.js             # 請求管理
│   │   │   ├── Dashboard.js            # メインダッシュボード
│   │   │   └── PartnerDashboard.js     # パートナーダッシュボード
│   │   ├── services/           # API通信
│   │   │   └── api.js                  # Axios設定
│   │   ├── App.js              # メインコンポーネント
│   │   └── index.js            # エントリーポイント
│   └── package.json            # npm設定
│
├── docker-compose.yml          # ローカル開発用Docker Compose
├── README.md                   # このファイル
└── 要件定義書.md               # システム要件定義書
```

---

## API仕様

### 認証エンドポイント
- `POST /api/auth/login` - ログイン（JWT発行）
- `POST /api/admin/bootstrap` - 初回管理者作成

### アカウント管理
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
- `POST /api/partners/import-csv` - CSV インポート
- `GET /api/partners/export-csv` - CSV エクスポート

### 案件管理
- `GET /api/projects` - 案件一覧取得
- `GET /api/projects/{id}` - 案件詳細取得
- `POST /api/projects` - 案件作成
- `PUT /api/projects/{id}` - 案件更新
- `DELETE /api/projects/{id}` - 案件削除
- `POST /api/projects/import-csv` - CSV インポート
- `GET /api/projects/export-csv` - CSV エクスポート

### 手数料管理
- `GET /api/commissions` - 手数料一覧取得
- `GET /api/commissions/{id}` - 手数料詳細取得
- `POST /api/commissions` - 手数料作成
- `PUT /api/commissions/{id}` - 手数料更新
- `DELETE /api/commissions/{id}` - 手数料削除
- `POST /api/commissions/import-csv` - CSV インポート
- `GET /api/commissions/export-csv` - CSV エクスポート

### 請求管理
- `GET /api/invoices` - 請求一覧取得
- `GET /api/invoices/{id}` - 請求詳細取得
- `POST /api/invoices` - 請求作成
- `PUT /api/invoices/{id}` - 請求更新
- `DELETE /api/invoices/{id}` - 請求削除
- `POST /api/invoices/import-csv` - CSV インポート
- `GET /api/invoices/export-csv` - CSV エクスポート

---

## 開発

### Backendの開発

#### テストの実行
```bash
cd backend
./mvnw test
```

#### ビルド
```bash
./mvnw clean package
```

#### 特定のプロファイルで起動
```bash
# 本番環境で起動
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod

# テスト環境で起動
./mvnw spring-boot:run -Dspring-boot.run.profiles=test
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
SERVER_PORT=8081 ./mvnw spring-boot:run
```

### CORS エラー

**問題**: Frontend から Backend への通信が CORS エラーになる

**解決策**:
- `backend/src/main/java/com/example/prmtool/config/CorsConfig.java` でフロントエンドのURLが許可されているか確認
- 本番環境では `https://*.onrender.com` ワイルドカードが設定されています

### JWT トークンエラー

**問題**: `WeakKeyException` または認証エラー

**解決策**:
- `JWT_SECRET` が64文字以上であることを確認
- トークンの有効期限を確認（デフォルト24時間）

---

## セキュリティ

### 本番環境での必須対応

1. **デフォルトパスワードの変更**
   ```
   初回管理者のパスワードを必ず変更してください
   ```

2. **JWT シークレットキーの生成**
   ```bash
   # 64文字以上のランダム文字列を生成
   openssl rand -base64 64
   ```

3. **データベースパスワードの管理**
   ```bash
   # 環境変数で管理、直接コードに書かない
   DB_PASSWORD=<your-secure-password>
   ```

4. **HTTPS の使用**
   ```
   本番環境では必ずHTTPSを使用してください
   Render.comは自動的にHTTPSを有効化します
   ```

5. **環境変数の管理**
   ```
   機密情報は全て環境変数で管理
   .envファイルはGitにコミットしない
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

### v1.0.0 (2026-01-21)
- 初回リリース
- ユーザー管理機能
- パートナー管理機能
- 案件管理機能
- 手数料管理機能
- 請求管理機能
- JWT認証実装
- CSV入出力機能実装
- ダッシュボード機能実装
- Render.comデプロイ対応

---

## 開発チーム

**プロジェクトオーナー**: Fulfill-ShimomuraKensuke

---

## 関連ドキュメント

- [要件定義書](./要件定義書.md)
- [ユーザー用手引き](./ユーザー用手引き.pdf)
- [Render.comデプロイガイド](./RENDER_DEPLOYMENT_GUIDE.md)

---

**Last Updated**: 2026-01-21
