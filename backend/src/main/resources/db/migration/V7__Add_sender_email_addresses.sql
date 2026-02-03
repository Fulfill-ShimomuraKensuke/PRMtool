-- 送信元メールアドレステーブル
-- 請求書送信時に使用する送信元メールアドレスを管理
CREATE TABLE sender_email_addresses (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- デフォルト送信元は1つのみ許可する一意制約
CREATE UNIQUE INDEX idx_sender_emails_default 
ON sender_email_addresses(is_default) 
WHERE is_default = TRUE;

-- インデックス作成
CREATE INDEX idx_sender_emails_email ON sender_email_addresses(email);
CREATE INDEX idx_sender_emails_active ON sender_email_addresses(is_active);

-- コメント追加
COMMENT ON TABLE sender_email_addresses IS '送信元メールアドレステーブル';
COMMENT ON COLUMN sender_email_addresses.id IS '送信元メールアドレスID';
COMMENT ON COLUMN sender_email_addresses.email IS 'メールアドレス（一意）';
COMMENT ON COLUMN sender_email_addresses.display_name IS '表示名（送信元名）';
COMMENT ON COLUMN sender_email_addresses.is_default IS 'デフォルト送信元フラグ';
COMMENT ON COLUMN sender_email_addresses.is_active IS '有効フラグ';
COMMENT ON COLUMN sender_email_addresses.created_at IS '作成日時';
COMMENT ON COLUMN sender_email_addresses.updated_at IS '更新日時';

-- 初期データ投入（デフォルトの送信元メールアドレス）
INSERT INTO sender_email_addresses (
    id,
    email,
    display_name,
    is_default,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'info@example.com',
    'PRM Tool',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);