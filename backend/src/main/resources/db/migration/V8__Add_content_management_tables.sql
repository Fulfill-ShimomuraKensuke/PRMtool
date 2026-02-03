-- ========================================
-- コンテンツフォルダテーブル
-- ファイルを整理するためのフォルダ階層構造を管理
-- ========================================
CREATE TABLE content_folders (
    id UUID PRIMARY KEY,
    folder_name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_folder_id UUID,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_content_folder_parent FOREIGN KEY (parent_folder_id) REFERENCES content_folders(id) ON DELETE CASCADE,
    CONSTRAINT fk_content_folder_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- インデックス作成
CREATE INDEX idx_content_folders_parent ON content_folders(parent_folder_id);
CREATE INDEX idx_content_folders_created_by ON content_folders(created_by);
CREATE INDEX idx_content_folders_created_at ON content_folders(created_at);

-- コメント追加
COMMENT ON TABLE content_folders IS 'コンテンツフォルダテーブル';
COMMENT ON COLUMN content_folders.id IS 'フォルダID';
COMMENT ON COLUMN content_folders.folder_name IS 'フォルダ名';
COMMENT ON COLUMN content_folders.description IS 'フォルダの説明';
COMMENT ON COLUMN content_folders.parent_folder_id IS '親フォルダID（nullの場合はルートフォルダ）';
COMMENT ON COLUMN content_folders.created_by IS '作成者（ユーザーID）';
COMMENT ON COLUMN content_folders.created_at IS '作成日時';
COMMENT ON COLUMN content_folders.updated_at IS '更新日時';

-- ========================================
-- コンテンツファイルテーブル
-- アップロードされたファイルの情報を管理
-- ========================================
CREATE TABLE content_files (
    id UUID PRIMARY KEY,
    folder_id UUID NOT NULL,
    file_name VARCHAR(200) NOT NULL,
    title VARCHAR(200),
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    tags VARCHAR(500),
    version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    previous_version_id UUID,
    access_level VARCHAR(20) NOT NULL DEFAULT 'PRIVATE',
    allowed_roles TEXT,
    allowed_partner_ids TEXT,
    download_count INTEGER NOT NULL DEFAULT 0,
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_content_file_folder FOREIGN KEY (folder_id) REFERENCES content_folders(id) ON DELETE CASCADE,
    CONSTRAINT fk_content_file_previous FOREIGN KEY (previous_version_id) REFERENCES content_files(id) ON DELETE SET NULL,
    CONSTRAINT fk_content_file_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_access_level CHECK (access_level IN ('PUBLIC', 'ROLE_BASED', 'PARTNER_BASED', 'PRIVATE'))
);

-- インデックス作成
CREATE INDEX idx_content_files_folder ON content_files(folder_id);
CREATE INDEX idx_content_files_uploaded_by ON content_files(uploaded_by);
CREATE INDEX idx_content_files_uploaded_at ON content_files(uploaded_at DESC);
CREATE INDEX idx_content_files_file_name ON content_files(file_name);
CREATE INDEX idx_content_files_tags ON content_files(tags);

-- コメント追加
COMMENT ON TABLE content_files IS 'コンテンツファイルテーブル';
COMMENT ON COLUMN content_files.id IS 'ファイルID';
COMMENT ON COLUMN content_files.folder_id IS '所属するフォルダID';
COMMENT ON COLUMN content_files.file_name IS 'ファイル名';
COMMENT ON COLUMN content_files.title IS 'タイトル（表示用）';
COMMENT ON COLUMN content_files.description IS 'ファイルの説明';
COMMENT ON COLUMN content_files.file_url IS 'ファイルURL（S3やストレージのURL）';
COMMENT ON COLUMN content_files.file_type IS 'ファイルタイプ（MIMEタイプ）';
COMMENT ON COLUMN content_files.file_size IS 'ファイルサイズ（バイト単位）';
COMMENT ON COLUMN content_files.tags IS 'タグ（カンマ区切り）';
COMMENT ON COLUMN content_files.version IS 'バージョン番号';
COMMENT ON COLUMN content_files.previous_version_id IS '前バージョンのファイルID';
COMMENT ON COLUMN content_files.access_level IS 'アクセスレベル (PUBLIC, ROLE_BASED, PARTNER_BASED, PRIVATE)';
COMMENT ON COLUMN content_files.allowed_roles IS '許可されたロール（JSON形式）';
COMMENT ON COLUMN content_files.allowed_partner_ids IS '許可されたパートナーID（JSON形式）';
COMMENT ON COLUMN content_files.download_count IS 'ダウンロード回数';
COMMENT ON COLUMN content_files.uploaded_by IS 'アップロード者（ユーザーID）';
COMMENT ON COLUMN content_files.uploaded_at IS 'アップロード日時';
COMMENT ON COLUMN content_files.updated_at IS '更新日時';

-- ========================================
-- ファイルダウンロード履歴テーブル
-- ファイルのダウンロード履歴を記録
-- ========================================
CREATE TABLE content_download_history (
    id UUID PRIMARY KEY,
    file_id UUID NOT NULL,
    user_id UUID,
    partner_id UUID,
    downloaded_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(50),
    
    CONSTRAINT fk_download_history_file FOREIGN KEY (file_id) REFERENCES content_files(id) ON DELETE CASCADE,
    CONSTRAINT fk_download_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_download_history_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL
);

-- インデックス作成
CREATE INDEX idx_download_history_file ON content_download_history(file_id);
CREATE INDEX idx_download_history_user ON content_download_history(user_id);
CREATE INDEX idx_download_history_partner ON content_download_history(partner_id);
CREATE INDEX idx_download_history_downloaded_at ON content_download_history(downloaded_at DESC);

-- コメント追加
COMMENT ON TABLE content_download_history IS 'ファイルダウンロード履歴テーブル';
COMMENT ON COLUMN content_download_history.id IS '履歴ID';
COMMENT ON COLUMN content_download_history.file_id IS 'ダウンロードされたファイルID';
COMMENT ON COLUMN content_download_history.user_id IS 'ダウンロードしたユーザーID（nullの場合は外部ユーザー）';
COMMENT ON COLUMN content_download_history.partner_id IS 'ダウンロードしたパートナーID（nullの場合は内部ユーザー）';
COMMENT ON COLUMN content_download_history.downloaded_at IS 'ダウンロード日時';
COMMENT ON COLUMN content_download_history.ip_address IS 'IPアドレス';

-- ========================================
-- ファイル共有テーブル
-- ファイルの共有設定と履歴を管理
-- ========================================
CREATE TABLE content_shares (
    id UUID PRIMARY KEY,
    file_id UUID NOT NULL,
    share_target VARCHAR(20) NOT NULL,
    partner_id UUID,
    share_method VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP,
    download_limit INTEGER,
    current_download_count INTEGER NOT NULL DEFAULT 0,
    notify_on_download BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    shared_by UUID NOT NULL,
    shared_at TIMESTAMP NOT NULL,
    last_accessed_at TIMESTAMP,
    
    CONSTRAINT fk_content_share_file FOREIGN KEY (file_id) REFERENCES content_files(id) ON DELETE CASCADE,
    CONSTRAINT fk_content_share_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    CONSTRAINT fk_content_share_shared_by FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_share_target CHECK (share_target IN ('SPECIFIC_PARTNER', 'ALL_PARTNERS')),
    CONSTRAINT chk_share_method CHECK (share_method IN ('SYSTEM_LINK', 'EMAIL_LINK', 'EMAIL_ATTACH')),
    CONSTRAINT chk_share_status CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED', 'EXHAUSTED'))
);

-- インデックス作成
CREATE INDEX idx_content_shares_file ON content_shares(file_id);
CREATE INDEX idx_content_shares_partner ON content_shares(partner_id);
CREATE INDEX idx_content_shares_shared_by ON content_shares(shared_by);
CREATE INDEX idx_content_shares_shared_at ON content_shares(shared_at DESC);
CREATE INDEX idx_content_shares_status ON content_shares(status);

-- コメント追加
COMMENT ON TABLE content_shares IS 'ファイル共有テーブル';
COMMENT ON COLUMN content_shares.id IS '共有ID';
COMMENT ON COLUMN content_shares.file_id IS '共有するファイルID';
COMMENT ON COLUMN content_shares.share_target IS '共有対象タイプ (SPECIFIC_PARTNER, ALL_PARTNERS)';
COMMENT ON COLUMN content_shares.partner_id IS '共有先パートナーID（特定パートナーの場合）';
COMMENT ON COLUMN content_shares.share_method IS '共有方法 (SYSTEM_LINK, EMAIL_LINK, EMAIL_ATTACH)';
COMMENT ON COLUMN content_shares.expires_at IS '有効期限（nullの場合は無期限）';
COMMENT ON COLUMN content_shares.download_limit IS 'ダウンロード回数制限（nullの場合は無制限）';
COMMENT ON COLUMN content_shares.current_download_count IS '現在のダウンロード数';
COMMENT ON COLUMN content_shares.notify_on_download IS 'ダウンロード時通知フラグ';
COMMENT ON COLUMN content_shares.message IS '共有時のメッセージ';
COMMENT ON COLUMN content_shares.status IS '共有ステータス (ACTIVE, EXPIRED, REVOKED, EXHAUSTED)';
COMMENT ON COLUMN content_shares.shared_by IS '共有者（ユーザーID）';
COMMENT ON COLUMN content_shares.shared_at IS '共有日時';
COMMENT ON COLUMN content_shares.last_accessed_at IS '最終アクセス日時';

-- ========================================
-- ファイル共有アクセス履歴テーブル
-- 共有ファイルへのアクセス履歴を記録
-- ========================================
CREATE TABLE content_share_access_history (
    id UUID PRIMARY KEY,
    share_id UUID NOT NULL,
    user_id UUID,
    access_type VARCHAR(20) NOT NULL,
    accessed_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(50),
    
    CONSTRAINT fk_share_access_share FOREIGN KEY (share_id) REFERENCES content_shares(id) ON DELETE CASCADE,
    CONSTRAINT fk_share_access_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_access_type CHECK (access_type IN ('VIEW', 'DOWNLOAD'))
);

-- インデックス作成
CREATE INDEX idx_share_access_share ON content_share_access_history(share_id);
CREATE INDEX idx_share_access_user ON content_share_access_history(user_id);
CREATE INDEX idx_share_access_accessed_at ON content_share_access_history(accessed_at DESC);

-- コメント追加
COMMENT ON TABLE content_share_access_history IS 'ファイル共有アクセス履歴テーブル';
COMMENT ON COLUMN content_share_access_history.id IS '履歴ID';
COMMENT ON COLUMN content_share_access_history.share_id IS '共有ID';
COMMENT ON COLUMN content_share_access_history.user_id IS 'アクセスしたユーザーID（nullの場合は外部ユーザー）';
COMMENT ON COLUMN content_share_access_history.access_type IS 'アクセスタイプ (VIEW, DOWNLOAD)';
COMMENT ON COLUMN content_share_access_history.accessed_at IS 'アクセス日時';
COMMENT ON COLUMN content_share_access_history.ip_address IS 'IPアドレス';