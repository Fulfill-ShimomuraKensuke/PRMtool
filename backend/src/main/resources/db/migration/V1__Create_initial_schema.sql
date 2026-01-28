-- ==========================================
-- V1: PRMTool 初期スキーマ作成
-- 作成日: 2026-01-28
-- 説明: 既存のテーブル構造を記録（invoice_templates含む）
-- ==========================================

-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    login_id VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    address VARCHAR(255),
    position VARCHAR(255),
    role VARCHAR(20) NOT NULL,
    is_system_protected BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT chk_users_role CHECK (role IN ('SYSTEM', 'ADMIN', 'ACCOUNTING', 'REP'))
);

CREATE INDEX idx_users_login_id ON users(login_id);
CREATE INDEX idx_users_role ON users(role);

-- パートナーテーブル
CREATE TABLE partners (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    phone VARCHAR(255),
    address VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_partners_name ON partners(name);

-- パートナー連絡先テーブル
CREATE TABLE partner_contacts (
    id UUID PRIMARY KEY,
    partner_id UUID NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_partner_contacts_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

CREATE INDEX idx_partner_contacts_partner_id ON partner_contacts(partner_id);

-- 案件テーブル
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    partner_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_projects_partner FOREIGN KEY (partner_id) REFERENCES partners(id),
    CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT chk_projects_status CHECK (status IN ('NEW', 'IN_PROGRESS', 'DONE'))
);

CREATE INDEX idx_projects_partner_id ON projects(partner_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);

-- 案件担当者アサインテーブル
CREATE TABLE project_assignments (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    assigned_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_project_assignments_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_assignments_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_user_id ON project_assignments(user_id);

-- 案件テーブルデータ（スプレッドシート用JSON）
CREATE TABLE project_table_data (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL UNIQUE,
    table_data_json TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_project_table_data_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 手数料ルールテーブル
CREATE TABLE commission_rules (
    id UUID PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL,
    commission_type VARCHAR(20) NOT NULL,
    rate_percent DECIMAL(5, 2),
    fixed_amount DECIMAL(15, 2),
    status VARCHAR(20) NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    notes TEXT,
    CONSTRAINT fk_commission_rules_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_commission_rules_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT chk_commission_rules_type CHECK (commission_type IN ('RATE', 'FIXED')),
    CONSTRAINT chk_commission_rules_status CHECK (status IN ('UNAPPROVED', 'REVIEWING', 'CONFIRMED', 'PAID', 'DISABLED'))
);

CREATE INDEX idx_commission_rules_project_id ON commission_rules(project_id);
CREATE INDEX idx_commission_rules_status ON commission_rules(status);

-- 請求書テンプレートテーブル
CREATE TABLE invoice_templates (
    id UUID PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    company_name VARCHAR(200),
    company_address VARCHAR(500),
    company_phone VARCHAR(50),
    company_email VARCHAR(100),
    company_website VARCHAR(200),
    logo_url VARCHAR(500),
    primary_color VARCHAR(20),
    secondary_color VARCHAR(20),
    font_family VARCHAR(50),
    layout_settings TEXT,
    display_settings TEXT,
    payment_terms TEXT,
    bank_info TEXT,
    footer_text TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_invoice_templates_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_invoice_templates_created_by ON invoice_templates(created_by);
CREATE INDEX idx_invoice_templates_is_default ON invoice_templates(is_default);

-- 請求書テーブル
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    partner_id UUID NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    tax_category VARCHAR(30) NOT NULL,
    tax_rate DECIMAL(5, 4) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    commission_subtotal DECIMAL(15, 2) NOT NULL,
    taxable_amount DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_invoices_partner FOREIGN KEY (partner_id) REFERENCES partners(id),
    CONSTRAINT chk_invoices_tax_category CHECK (tax_category IN ('TAX_INCLUDED', 'TAX_ON_PRODUCT_ONLY', 'TAX_EXEMPT')),
    CONSTRAINT chk_invoices_status CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED'))
);

CREATE INDEX idx_invoices_partner_id ON invoices(partner_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- 請求書明細テーブル
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL,
    commission_rule_id UUID,
    description VARCHAR(500) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    product_amount DECIMAL(15, 2) NOT NULL,
    applied_commission_type VARCHAR(20),
    applied_rate_percent DECIMAL(5, 2),
    applied_fixed_amount DECIMAL(15, 2),
    commission_amount DECIMAL(15, 2) NOT NULL,
    item_total DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_items_commission_rule FOREIGN KEY (commission_rule_id) REFERENCES commission_rules(id)
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_commission_rule_id ON invoice_items(commission_rule_id);

-- コメント追加
COMMENT ON TABLE users IS 'システムユーザー情報';
COMMENT ON TABLE partners IS 'パートナー企業情報';
COMMENT ON TABLE partner_contacts IS 'パートナー企業の連絡先情報';
COMMENT ON TABLE projects IS '案件情報';
COMMENT ON TABLE project_assignments IS '案件への担当者アサイン情報';
COMMENT ON TABLE project_table_data IS '案件のスプレッドシートデータ（JSON形式）';
COMMENT ON TABLE commission_rules IS '手数料ルール情報';
COMMENT ON TABLE invoice_templates IS '請求書テンプレート情報';
COMMENT ON TABLE invoices IS '請求書情報';
COMMENT ON TABLE invoice_items IS '請求書明細情報';