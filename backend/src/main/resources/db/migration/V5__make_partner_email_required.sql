-- パートナーテーブルのemailカラムを必須に変更
-- 既存データでemailがNULLの場合はデフォルト値を設定

-- ステップ1: NULLのemailにダミー値を設定（既存データ保護）
UPDATE partners 
SET email = CONCAT('noreply-', LOWER(REPLACE(name, ' ', '-')), '@example.com')
WHERE email IS NULL OR email = '';

-- ステップ2: emailカラムをNOT NULLに変更
ALTER TABLE partners 
ALTER COLUMN email SET NOT NULL;