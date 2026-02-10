-- ========================================
-- V9: お気に入りフォルダーテーブル
-- ユーザーがよく使うフォルダーをお気に入り登録
-- ========================================

-- お気に入りフォルダーテーブル作成
CREATE TABLE favorite_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    folder_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 外部キー制約
    CONSTRAINT fk_favorite_folder_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorite_folder_folder FOREIGN KEY (folder_id) 
        REFERENCES content_folders(id) ON DELETE CASCADE,
    
    -- 同じユーザーが同じフォルダーを複数回お気に入り登録できないようにする
    CONSTRAINT uk_favorite_folders_user_folder UNIQUE(user_id, folder_id)
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_favorite_folders_user ON favorite_folders(user_id);
CREATE INDEX idx_favorite_folders_folder ON favorite_folders(folder_id);
CREATE INDEX idx_favorite_folders_created_at ON favorite_folders(created_at DESC);

-- テーブルとカラムへのコメント追加
COMMENT ON TABLE favorite_folders IS 'お気に入りフォルダーテーブル（ユーザーごとに最大10個まで登録可能）';
COMMENT ON COLUMN favorite_folders.id IS 'お気に入りID';
COMMENT ON COLUMN favorite_folders.user_id IS 'ユーザーID';
COMMENT ON COLUMN favorite_folders.folder_id IS 'フォルダーID';
COMMENT ON COLUMN favorite_folders.created_at IS 'お気に入り登録日時';