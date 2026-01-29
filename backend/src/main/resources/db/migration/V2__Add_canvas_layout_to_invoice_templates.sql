-- ==========================================
-- V2: canvas_layoutカラムをinvoice_templatesテーブルに追加
-- 作成日: 2026-01-29
-- 目的: テンプレートエディタで作成したレイアウト情報をJSON形式で保存するためのカラム
-- ==========================================

-- canvas_layoutカラムを追加
-- JSON形式でテンプレートのレイアウト情報（要素の位置、サイズ、スタイル等）を格納
ALTER TABLE invoice_templates 
ADD COLUMN canvas_layout TEXT;

-- コメント追加（PostgreSQL用）
COMMENT ON COLUMN invoice_templates.canvas_layout IS 'テンプレートのキャンバスレイアウト情報をJSON形式で保存';