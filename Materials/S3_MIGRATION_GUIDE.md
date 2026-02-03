# S3ストレージ移行ガイド

## 概要

このドキュメントは、PRMツールのファイルストレージをローカルディスクからAWS S3に移行する際の詳細な手順を記載しています。

## 前提条件

- AWSアカウントを持っていること
- AWS CLI がインストールされていること
- IAMユーザーの作成権限があること

## 詳細手順

### 1. AWS環境のセットアップ

#### 1.1 S3バケットの作成
```bash
aws s3 mb s3://prmtool-files-prod --region ap-northeast-1
```

#### 1.2 バケットポリシーの設定
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PRMToolAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/prmtool-s3-user"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::prmtool-files-prod/*"
    }
  ]
}
```

### 2. コード変更

#### 2.1 pom.xml
```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.26</version>
</dependency>
```

#### 2.2 S3FileStorageService.java の実装

詳細は `FileStorageProperties.java` のコメントを参照。

### 3. 設定ファイルの更新

`application-prod.yml`:
```yaml
file:
  storage:
    type: s3
    s3:
      bucket-name: prmtool-files-prod
      region: ap-northeast-1
      access-key: ${AWS_ACCESS_KEY}
      secret-key: ${AWS_SECRET_KEY}
```

### 4. デプロイ

#### 4.1 環境変数の設定

Renderまたは本番環境で：
```
AWS_ACCESS_KEY=AKIA...
AWS_SECRET_KEY=wJalr...
```

#### 4.2 既存ファイルの移行
```bash
# ローカルからS3へ
aws s3 sync ./uploads/ s3://prmtool-files-prod/

# 確認
aws s3 ls s3://prmtool-files-prod/
```

### 5. トラブルシューティング

#### アクセス拒否エラー

- IAMユーザーの権限を確認
- バケットポリシーを確認
- アクセスキーが正しいか確認

#### 接続エラー

- リージョンが正しいか確認
- バケット名が正しいか確認

## ロールバック手順

問題が発生した場合：

1. `application.yml` の `type` を `local` に戻す
2. アプリケーションを再起動
3. S3からローカルにファイルをダウンロード:
```bash
   aws s3 sync s3://prmtool-files-prod/ ./uploads/
```

## 参考リンク

- [AWS SDK for Java v2 - S3](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/examples-s3.html)
- [S3 料金](https://aws.amazon.com/jp/s3/pricing/)