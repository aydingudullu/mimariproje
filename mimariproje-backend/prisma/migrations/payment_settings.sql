-- Payment Gateway Default Settings
-- Insert default configuration for payment gateways

-- Set default active gateway to iyzico
INSERT INTO system_settings (key, value, data_type, description, category, is_public, created_at, updated_at)
VALUES 
  ('payment_active_gateway', 'iyzico', 'string', 'Aktif ödeme sistemi (iyzico veya paytr)', 'payment', false, NOW(), NOW()),
  ('payment_commission_rate', '0.10', 'number', 'Platform komisyon oranı (0.10 = %10)', 'payment', false, NOW(), NOW()),
  ('payment_iyzico_api_key', '', 'string', 'iyzico API anahtarı', 'payment', false, NOW(), NOW()),
  ('payment_iyzico_secret_key', '', 'string', 'iyzico gizli anahtar', 'payment', false, NOW(), NOW()),
  ('payment_iyzico_base_url', 'https://sandbox-api.iyzipay.com', 'string', 'iyzico API URL (sandbox veya production)', 'payment', false, NOW(), NOW()),
  ('payment_paytr_merchant_id', '', 'string', 'PayTR Merchant ID', 'payment', false, NOW(), NOW()),
  ('payment_paytr_merchant_key', '', 'string', 'PayTR Merchant Key', 'payment', false, NOW(), NOW()),
  ('payment_paytr_merchant_salt', '', 'string', 'PayTR Merchant Salt', 'payment', false, NOW(), NOW()),
  ('payment_paytr_base_url', 'https://www.paytr.com', 'string', 'PayTR API URL', 'payment', false, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
