-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    google_id VARCHAR(255) UNIQUE,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'elite')),
    status VARCHAR(20) DEFAULT 'trial' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT,
    metadata TEXT,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'Default',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);

-- Watchlist items table
CREATE TABLE IF NOT EXISTS watchlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    asset_type VARCHAR(20),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'Main Portfolio',
    balance DOUBLE PRECISION DEFAULT 100000.0,
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    asset_type VARCHAR(20),
    side VARCHAR(10) CHECK (side IN ('long', 'short')),
    quantity DOUBLE PRECISION,
    entry_price DOUBLE PRECISION,
    current_price DOUBLE PRECISION,
    stop_loss DOUBLE PRECISION,
    take_profit DOUBLE PRECISION,
    unrealized_pnl DOUBLE PRECISION DEFAULT 0,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_positions_portfolio_id ON positions(portfolio_id);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    asset_type VARCHAR(20),
    side VARCHAR(10) CHECK (side IN ('long', 'short')),
    status VARCHAR(10) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    entry_price DOUBLE PRECISION,
    exit_price DOUBLE PRECISION,
    quantity DOUBLE PRECISION,
    entry_fee DOUBLE PRECISION DEFAULT 0,
    exit_fee DOUBLE PRECISION DEFAULT 0,
    gross_pnl DOUBLE PRECISION DEFAULT 0,
    net_pnl DOUBLE PRECISION DEFAULT 0,
    return_pct DOUBLE PRECISION DEFAULT 0,
    notes TEXT,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_trades_portfolio_id ON trades(portfolio_id);
CREATE INDEX idx_trades_status ON trades(status);

-- Backtests table
CREATE TABLE IF NOT EXISTS backtests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    symbol VARCHAR(50),
    asset_type VARCHAR(20),
    timeframe VARCHAR(10) DEFAULT '1h',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    strategy TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    initial_capital DOUBLE PRECISION DEFAULT 10000.0,
    final_capital DOUBLE PRECISION,
    total_return DOUBLE PRECISION,
    return_pct DOUBLE PRECISION,
    win_rate DOUBLE PRECISION,
    profit_factor DOUBLE PRECISION,
    max_drawdown DOUBLE PRECISION,
    sharpe_ratio DOUBLE PRECISION,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backtests_user_id ON backtests(user_id);

-- Backtest trades table
CREATE TABLE IF NOT EXISTS backtest_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backtest_id UUID REFERENCES backtests(id) ON DELETE CASCADE,
    entry_time TIMESTAMPTZ,
    exit_time TIMESTAMPTZ,
    side VARCHAR(10),
    entry_price DOUBLE PRECISION,
    exit_price DOUBLE PRECISION,
    quantity DOUBLE PRECISION,
    pnl DOUBLE PRECISION,
    pnl_pct DOUBLE PRECISION,
    reason TEXT
);

CREATE INDEX idx_backtest_trades_backtest_id ON backtest_trades(backtest_id);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    asset_type VARCHAR(20),
    condition VARCHAR(30),
    value DOUBLE PRECISION,
    is_triggered BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    triggered_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(30),
    resource VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    source VARCHAR(255),
    url VARCHAR(2000) UNIQUE,
    summary TEXT,
    content TEXT,
    sentiment VARCHAR(20),
    sentiment_score DOUBLE PRECISION,
    impact VARCHAR(20),
    symbols VARCHAR(500),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Economic events table
CREATE TABLE IF NOT EXISTS economic_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    country VARCHAR(100),
    date TIMESTAMPTZ,
    impact VARCHAR(20),
    previous DOUBLE PRECISION,
    forecast DOUBLE PRECISION,
    actual DOUBLE PRECISION,
    category VARCHAR(100),
    description TEXT
);

CREATE INDEX idx_economic_events_date ON economic_events(date);

-- Create admin user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role, is_verified)
VALUES (
    uuid_generate_v4(),
    'admin@tradingplatform.com',
    crypt('admin123', gen_salt('bf')),
    'Admin',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Create free subscription for admin
INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'elite', 'active' FROM users WHERE email = 'admin@tradingplatform.com'
ON CONFLICT (user_id) DO NOTHING;
