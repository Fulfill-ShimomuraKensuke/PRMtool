-- 請求書送付テーブル
-- 請求書のメール送付履歴を管理
CREATE TABLE invoice_deliveries (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    template_id UUID,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    sent_by UUID NOT NULL,
    sent_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_invoice_delivery_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_delivery_template FOREIGN KEY (template_id) REFERENCES invoice_templates(id) ON DELETE SET NULL,
    CONSTRAINT fk_invoice_delivery_sent_by FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- インデックス作成（検索性能向上）
CREATE INDEX idx_invoice_deliveries_invoice_id ON invoice_deliveries(invoice_id);
CREATE INDEX idx_invoice_deliveries_sent_by ON invoice_deliveries(sent_by);
CREATE INDEX idx_invoice_deliveries_sent_at ON invoice_deliveries(sent_at DESC);
CREATE INDEX idx_invoice_deliveries_status ON invoice_deliveries(status);

-- コメント追加
COMMENT ON TABLE invoice_deliveries IS '請求書送付履歴テーブル';
COMMENT ON COLUMN invoice_deliveries.id IS '送付履歴ID';
COMMENT ON COLUMN invoice_deliveries.invoice_id IS '請求書ID';
COMMENT ON COLUMN invoice_deliveries.recipient_email IS '宛先メールアドレス';
COMMENT ON COLUMN invoice_deliveries.sender_email IS '送信元メールアドレス';
COMMENT ON COLUMN invoice_deliveries.subject IS 'メールの件名';
COMMENT ON COLUMN invoice_deliveries.body IS 'メール本文';
COMMENT ON COLUMN invoice_deliveries.template_id IS '使用した請求書テンプレートID';
COMMENT ON COLUMN invoice_deliveries.status IS '送信ステータス (SENT, FAILED, PENDING)';
COMMENT ON COLUMN invoice_deliveries.error_message IS 'エラーメッセージ（送信失敗時）';
COMMENT ON COLUMN invoice_deliveries.sent_by IS '送信者（ユーザーID）';
COMMENT ON COLUMN invoice_deliveries.sent_at IS '送信日時';
COMMENT ON COLUMN invoice_deliveries.created_at IS '作成日時';
COMMENT ON COLUMN invoice_deliveries.updated_at IS '更新日時';