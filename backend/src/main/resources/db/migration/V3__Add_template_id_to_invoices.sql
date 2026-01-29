-- invoicesテーブルにtemplate_idカラムを追加
-- PDF生成時に使用するテンプレートを記録

ALTER TABLE invoices
ADD COLUMN template_id UUID;

-- 外部キー制約を追加（invoice_templatesテーブルを参照）
ALTER TABLE invoices
ADD CONSTRAINT fk_invoices_template
FOREIGN KEY (template_id) REFERENCES invoice_templates(id)
ON DELETE SET NULL;

-- コメントを追加
COMMENT ON COLUMN invoices.template_id IS 'PDF生成時に使用するテンプレートID';