-- Seed demo users
INSERT INTO users (email, password_hash, name, role, is_verified)
SELECT 'demo@tradingplatform.com', crypt('demo123', gen_salt('bf')), 'Demo User', 'user', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@tradingplatform.com');

-- Seed demo portfolio
INSERT INTO portfolios (user_id, name, balance)
SELECT id, 'Demo Portfolio', 50000 FROM users WHERE email = 'demo@tradingplatform.com'
ON CONFLICT DO NOTHING;

-- Seed demo positions
INSERT INTO positions (portfolio_id, symbol, asset_type, side, quantity, entry_price, current_price, unrealized_pnl)
SELECT p.id, 'EURUSD', 'forex', 'long', 1000, 1.0850, 1.0920, 70.0
FROM portfolios p JOIN users u ON p.user_id = u.id WHERE u.email = 'demo@tradingplatform.com'
ON CONFLICT DO NOTHING;

INSERT INTO positions (portfolio_id, symbol, asset_type, side, quantity, entry_price, current_price, unrealized_pnl)
SELECT p.id, 'BTC-USD', 'crypto', 'short', 0.5, 65000, 63200, 900.0
FROM portfolios p JOIN users u ON p.user_id = u.id WHERE u.email = 'demo@tradingplatform.com'
ON CONFLICT DO NOTHING;

-- Seed demo trades
INSERT INTO trades (portfolio_id, symbol, asset_type, side, status, entry_price, exit_price, quantity, gross_pnl, net_pnl, return_pct, opened_at, closed_at)
SELECT p.id, 'AAPL', 'stock', 'long', 'closed', 175.50, 182.30, 10, 68.0, 65.0, 3.87, NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days'
FROM portfolios p JOIN users u ON p.user_id = u.id WHERE u.email = 'demo@tradingplatform.com'
ON CONFLICT DO NOTHING;

-- Seed economic events
INSERT INTO economic_events (title, country, date, impact, previous, forecast, category)
VALUES
('Fed Interest Rate Decision', 'US', NOW() + INTERVAL '3 days', 'high', 5.50, 5.50, 'Central Bank'),
('US Non-Farm Payrolls', 'US', NOW() + INTERVAL '5 days', 'high', 275000, 240000, 'Employment'),
('ECB Main Refinancing Rate', 'EU', NOW() + INTERVAL '7 days', 'high', 4.25, 4.00, 'Central Bank'),
('UK CPI Data', 'UK', NOW() + INTERVAL '10 days', 'medium', 3.4, 3.2, 'Inflation'),
('US Consumer Confidence', 'US', NOW() + INTERVAL '14 days', 'medium', 104.7, 106.0, 'Consumer')
ON CONFLICT DO NOTHING;
