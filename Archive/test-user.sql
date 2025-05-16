-- Create a test user with plaintext password for troubleshooting
INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES ('test123', 'test@celeste.cms', 'plaintext-password-for-testing', 'Test User', 'admin', '2025-05-12T23:12:00.000Z', '2025-05-12T23:12:00.000Z');
