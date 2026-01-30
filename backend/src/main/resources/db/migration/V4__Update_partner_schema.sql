-- ==========================================
-- V4: パートナー管理機能の拡張
-- 作成日: 2026-01-30
-- 説明: 企業名の一意性、郵便番号・メールアドレス追加、担当者情報の拡張
-- ==========================================

-- ==========================================
-- 1. partnersテーブルの拡張
-- ==========================================

-- 郵便番号カラムを追加（7桁の数字、ハイフンなし）
ALTER TABLE partners
ADD COLUMN postal_code VARCHAR(8);

-- メールアドレスカラムを追加（企業代表メールアドレス）
ALTER TABLE partners
ADD COLUMN email VARCHAR(255);

-- 企業名にUNIQUE制約を追加（同じ企業名は登録不可）
ALTER TABLE partners
ADD CONSTRAINT uk_partners_name UNIQUE (name);

-- コメント追加
COMMENT ON COLUMN partners.phone IS '代表電話（形式: 03-1234-5678、数字とハイフンのみ）';
COMMENT ON COLUMN partners.postal_code IS '郵便番号（7桁の数字、ハイフンなし）';
COMMENT ON COLUMN partners.email IS '企業代表メールアドレス';

-- ==========================================
-- 2. partner_contactsテーブルの拡張
-- ==========================================

-- 新しいカラムを追加
ALTER TABLE partner_contacts
ADD COLUMN phone VARCHAR(20);

ALTER TABLE partner_contacts
ADD COLUMN email VARCHAR(255);

-- 既存データの移行
-- contact_infoが電話番号形式（ハイフン含む）の場合はphoneに、
-- @を含む場合はemailに移行
UPDATE partner_contacts
SET phone = contact_info
WHERE contact_info ~ '^\d{2,4}-\d{2,4}-\d{4}$';

UPDATE partner_contacts
SET email = contact_info
WHERE contact_info LIKE '%@%';

-- contact_infoがどちらでもない場合はphoneに移行（安全策）
UPDATE partner_contacts
SET phone = contact_info
WHERE phone IS NULL AND email IS NULL;

-- 古いcontact_infoカラムを削除
ALTER TABLE partner_contacts
DROP COLUMN contact_info;

-- 条件付き必須のCHECK制約を追加
-- 電話番号またはメールアドレスのどちらかは必須
ALTER TABLE partner_contacts
ADD CONSTRAINT chk_partner_contacts_info
CHECK (
  (phone IS NOT NULL AND phone <> '') OR 
  (email IS NOT NULL AND email <> '')
);

COMMENT ON COLUMN partner_contacts.phone IS '担当者電話番号（形式: 03-1234-5678）';
COMMENT ON COLUMN partner_contacts.email IS '担当者メールアドレス';
COMMENT ON CONSTRAINT chk_partner_contacts_info ON partner_contacts IS '電話番号またはメールアドレスのどちらかは必須';

-- ==========================================
-- 3. インデックスの追加（検索性能向上）
-- ==========================================

-- 郵便番号の検索用インデックス
CREATE INDEX idx_partners_postal_code ON partners(postal_code);

-- メールアドレスの検索用インデックス
CREATE INDEX idx_partners_email ON partners(email);