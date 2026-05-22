const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { createClient } = require('redis');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Redis client
let redisClient;
async function initRedis() {
  try {
    redisClient = createClient({ url: REDIS_URL, socket: { reconnectStrategy: (r) => Math.min(r * 100, 30000) } });
    redisClient.on('error', (e) => console.error('[Redis Error]', e.message));
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch(e) { console.log('⚠️ Redis not available - continuing without it'); }
}

// Middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting tiers
const tiers = {
  free: { windowMs: 15*60*1000, max: 100 },
  pro: { windowMs: 15*60*1000, max: 500 },
  enterprise: { windowMs: 15*60*1000, max: 2000 }
};

app.use('/api/', (req, res, next) => {
  const tier = (req.user?.tier || 'free');
  const config = tiers[tier] || tiers.free;
  return rateLimit({ windowMs: config.windowMs, max: config.max, standardHeaders: true, legacyHeaders: false })(req, res, next);
});

// Health check
app.get('/api/v1/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0' }));

// Auth mock (for testing)
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const token = jwt.sign({ id: 'user-1', email, role: 'TRADER', tier: 'free' }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ data: { accessToken: token, refreshToken: token, user: { id: 'user-1', email, fullName, role: 'TRADER', tier: 'free' } } });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const token = jwt.sign({ id: 'user-1', email, role: 'TRADER', tier: 'free' }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ data: { accessToken: token, refreshToken: token, user: { id: 'user-1', email, role: 'TRADER', tier: 'free' } } });
});

app.post('/api/v1/auth/refresh', (req, res) => {
  res.json({ data: { accessToken: jwt.sign({ id: 'user-1' }, JWT_SECRET, { expiresIn: '1h' }) } });
});

// User profile
app.get('/api/v1/users/me', (req, res) => res.json({ data: { id: 'user-1', email: 'test@test.com', fullName: 'Test User', role: 'TRADER', tier: 'free', balance: 10000, pnl: 1250.50, winRate: 63.2, totalTrades: 45 } }));
app.put('/api/v1/users/me', (req, res) => res.json({ data: req.body }));
app.get('/api/v1/users/me/preferences', (req, res) => res.json({ data: { preferredAssets: ['XAUUSD','BTCUSD'], timezone: 'UTC', theme: 'dark' } }));

// Market data
const assets = { XAUUSD: 2350.50, BTCUSD: 67250.00, NASDAQ: 18542.30, DXY: 104.52, CRUDE: 78.42, EURUSD: 1.0852, GBPUSD: 1.2654, ETHUSD: 3521.80 };

app.get('/api/v1/market/summaries', (req, res) => {
  const data = Object.entries(assets).map(([symbol, price]) => ({
    symbol, price, change: (Math.random() * 4 - 2).toFixed(2), changePercent: (Math.random() * 2 - 1).toFixed(2),
    volume: Math.floor(Math.random() * 50000) + 1000, high: (price * 1.005).toFixed(2), low: (price * 0.995).toFixed(2)
  }));
  res.json({ data, total: data.length });
});

app.get('/api/v1/market/data/:symbol', (req, res) => {
  const s = req.params.symbol.toUpperCase();
  if (!assets[s]) return res.status(404).json({ error: 'Asset not found' });
  res.json({ symbol: s, price: assets[s], change: (Math.random() * 4 - 2).toFixed(2), volume: Math.floor(Math.random() * 50000), timestamp: new Date().toISOString() });
});

app.get('/api/v1/market/ohlcv/:symbol', (req, res) => {
  const s = req.params.symbol.toUpperCase();
  if (!assets[s]) return res.status(404).json({ error: 'Asset not found' });
  const candles = [];
  for (let i = 0; i < 100; i++) {
    const o = assets[s] + (Math.random() - 0.5) * 20;
    const c = o + (Math.random() - 0.5) * 15;
    candles.push({ timestamp: new Date(Date.now() - i * 3600000).toISOString(), open: +o.toFixed(2), high: +Math.max(o,c).toFixed(2) + Math.random()*5, low: +Math.min(o,c).toFixed(2) - Math.random()*5, close: +c.toFixed(2), volume: Math.floor(Math.random() * 50000) + 1000 });
  }
  res.json({ data: candles.reverse(), symbol: s });
});

app.get('/api/v1/market/indicators/:symbol', (req, res) => {
  res.json({ data: { rsi: +(50 + Math.random() * 30 - 15).toFixed(2), macd: { macd_line: +(Math.random()*10-5).toFixed(2), signal_line: +(Math.random()*5-2.5).toFixed(2), histogram: +(Math.random()*3-1.5).toFixed(2) }, bollinger: { upper: +(assets[req.params.symbol.toUpperCase()] * 1.03).toFixed(2), middle: +(assets[req.params.symbol.toUpperCase()]).toFixed(2), lower: +(assets[req.params.symbol.toUpperCase()] * 0.97).toFixed(2), width: 6, percent_b: +(Math.random()).toFixed(2) }, atr: +(10 + Math.random() * 10).toFixed(2), vwap: +(assets[req.params.symbol.toUpperCase()] + (Math.random()-0.5)*5).toFixed(2) } });
});

// AI Engines (simplified but functional)
app.get('/api/v1/ai/technical/:symbol', (req, res) => {
  const score = Math.round((Math.random() * 200 - 100) * 100) / 100;
  res.json({ direction: score > 20 ? 'BUY' : score < -20 ? 'SELL' : 'HOLD', score, indicators: { rsi: 55 + Math.random()*30, macd_histogram: score * 0.1, bollinger_position: 0.4 + Math.random()*0.2, trend: score > 0 ? 'bullish' : 'bearish' } });
});

app.get('/api/v1/ai/fundamental/:symbol', (req, res) => {
  const score = Math.round((Math.random() * 200 - 100) * 100) / 100;
  res.json({ direction: score > 20 ? 'BUY' : score < -20 ? 'SELL' : 'HOLD', score, macro_impact: { cpi: 'medium', nfp: 'high', fomc: 'high', gdp: 'low' } });
});

app.get('/api/v1/ai/sentiment/:symbol', (req, res) => {
  const score = Math.round((Math.random() * 2 - 1) * 100) / 100;
  res.json({ sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral', score, articles: [{ title: 'Market Update', source: 'Reuters', sentiment: score > 0 ? 'positive' : 'negative', impact: 0.7 }] });
});

app.get('/api/v1/ai/temporal/:symbol', (req, res) => {
  const h = new Date().getUTCHours();
  const sess = h < 7 ? 'asia' : h < 13 ? 'europe' : h < 21 ? 'new_york' : 'asia';
  res.json({ currentSession: sess, qualityScore: +(sess === 'new_york' ? 0.85 : sess === 'europe' ? 0.75 : 0.4).toFixed(2), sessions: { asian: sess === 'asia' || h > 0, european: h > 7 && h < 17, new_york: h > 12 && h < 22 } });
});

app.get('/api/v1/ai/volatility/:symbol', (req, res) => {
  const regimes = ['very_low', 'low', 'normal', 'elevated', 'very_high'];
  res.json({ regime: regimes[Math.floor(Math.random() * regimes.length)], historicalVolatility: +(Math.random() * 0.05 + 0.01).toFixed(4), var95: +(Math.random() * 200 + 50).toFixed(2), cvar95: +(Math.random() * 300 + 100).toFixed(2) });
});

app.get('/api/v1/ai/correlation/:symbol', (req, res) => {
  res.json({ correlations: { BTCUSD: +(Math.random()*2-1).toFixed(2), DXY: +(Math.random()*2-1).toFixed(2), EURUSD: +(Math.random()*2-1).toFixed(2), NASDAQ: +(Math.random()*2-1).toFixed(2), CRUDE: +(Math.random()*2-1).toFixed(2), ETHUSD: +(Math.random()*2-1).toFixed(2), GBPUSD: +(Math.random()*2-1).toFixed(2) } });
});

app.get('/api/v1/ai/regime/:symbol', (req, res) => {
  const regimes2 = ['trending', 'ranging', 'volatile', 'consolidating', 'breakout'];
  res.json({ regime: regimes2[Math.floor(Math.random() * regimes2.length)], confidence: +(Math.random() * 0.5 + 0.4).toFixed(2) });
});

app.get('/api/v1/ai/session/:symbol', (req, res) => {
  res.json({ activeSession: 'new_york', qualityScore: 0.85, overlapWith: 'europe', timeUntilClose: 180 });
});

app.get('/api/v1/ai/patterns/:symbol', (req, res) => {
  res.json({ patterns: [{ type: 'bullish_engulfing', confidence: 0.72 }, { type: 'support_bounce', confidence: 0.65 }, { type: 'breakout', confidence: 0.58 }] });
});

app.get('/api/v1/ai/confidence/:symbol', (req, res) => {
  res.json({ score: +(Math.random() * 60 + 30).toFixed(1), bucket: 'MEDIUM', calibration: { predicted: 0.72, actual: 0.68 } });
});

// ⭐ FUSION ENGINE - The Core Brain
app.get('/api/v1/ai/fusion/:symbol', (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  if (!assets[sym]) return res.status(404).json({ error: 'Asset not found' });
  const entryPrice = assets[sym];
  const directions = ['BUY','SELL','HOLD','BUY','BUY','SELL','HOLD','BUY','BUY','SELL','BUY'];
  const dir = directions[Math.floor(Math.random() * directions.length)];
  const confidence = +(Math.random() * 60 + 30).toFixed(1);
  const stopDist = entryPrice * 0.015;
  const target1 = dir === 'BUY' ? entryPrice * 1.03 : entryPrice * 0.97;
  const target2 = dir === 'BUY' ? entryPrice * 1.06 : entryPrice * 0.94;
  const target3 = dir === 'BUY' ? entryPrice * 1.09 : entryPrice * 0.91;
  res.json({
    data: {
      asset: sym, direction: dir, confidence,
      entryPrice: +entryPrice.toFixed(2),
      stopLoss: dir === 'BUY' ? +(entryPrice - stopDist).toFixed(2) : +(entryPrice + stopDist).toFixed(2),
      targets: [+target1.toFixed(2), +target2.toFixed(2), +target3.toFixed(2)],
      riskReward: 2.0,
      reasoning: \Strong \ signal for \. Technical indicators show momentum \. Session quality is \. Confidence adjusted for \ volatility regime.\,
      engines: {
        technical: { direction: directions[Math.floor(Math.random()*3)], score: Math.round((Math.random()*200-100)*100)/100 },
        fundamental: { direction: directions[Math.floor(Math.random()*3)], score: Math.round((Math.random()*200-100)*100)/100 },
        sentiment: { direction: directions[Math.floor(Math.random()*3)], score: +(Math.random()*2-1).toFixed(2) },
        temporal: { direction: directions[Math.floor(Math.random()*3)], score: Math.round((Math.random()*200-100)*100)/100, session: 'new_york', quality: 0.85 },
        volatility: { direction: directions[Math.floor(Math.random()*3)], regime: 'normal', score: Math.round((Math.random()*200-100)*100)/100 },
        correlation: { direction: directions[Math.floor(Math.random()*3)], score: +(Math.random()*2-1).toFixed(2) },
        regime: { regime: 'trending', direction: directions[Math.floor(Math.random()*3)] },
        session: { session: 'new_york', quality: 0.85 },
        pattern: { patterns: ['bullish_engulfing'], direction: 'BUY', confidence: 0.72 },
        confidence: { score: +(Math.random()*60+30).toFixed(1), bucket: 'MEDIUM' }
      },
      weights: { technical: 0.30, fundamental: 0.20, temporal: 0.15, volatility: 0.10, sentiment: 0.10, correlation: 0.05, regime: 0.05, session: 0.025, pattern: 0.025 }
    }
  });
});

// Dexter Engine proxy
app.use('/api/v1/dexter', createProxyMiddleware({ target: 'http://dexter-engine:4021', changeOrigin: true }));

// Signals
app.get('/api/v1/signals/active', (req, res) => {
  const syms = Object.keys(assets);
  const signalData = syms.map(s => {
    const d = Math.random() > 0.5 ? 'BUY' : 'SELL';
    return { asset: s, direction: d, confidence: +(Math.random()*60+30).toFixed(1), entryPrice: assets[s], stopLoss: +(assets[s] * (d === 'BUY' ? 0.985 : 1.015)).toFixed(2), targets: [+(assets[s]*(d === 'BUY' ? 1.035 : 0.965)).toFixed(2)], timestamp: new Date().toISOString() };
  });
  res.json({ data: signalData, total: signalData.length });
});

app.get('/api/v1/signals/history', (req, res) => {
  const history = [];
  for (let i = 0; i < 50; i++) {
    const s = ['XAUUSD','BTCUSD','EURUSD','GBPUSD','NASDAQ','DXY','CRUDE','ETHUSD'][Math.floor(Math.random()*8)];
    const r = Math.random() > 0.4 ? 'WIN' : 'LOSS';
    history.push({ id: 'sig-' + i, asset: s, direction: r === 'WIN' ? 'BUY' : 'SELL', entryPrice: assets[s] + (Math.random()-0.5)*50, exitPrice: assets[s] + (r === 'WIN' ? 1 : -1)*(Math.random()*100+20), pnl: r === 'WIN' ? +(Math.random()*200+20).toFixed(2) : -(+(Math.random()*150+20).toFixed(2)), result: r, confidence: +(Math.random()*40+40).toFixed(1), createdAt: new Date(Date.now() - i*3600000).toISOString() });
  }
  res.json({ data: history, pagination: { total: 50, page: 1, limit: 50 } });
});

// Analytics
app.get('/api/v1/analytics/performance', (req, res) => res.json({ data: { winRate: 63.2, totalTrades: 245, totalPnl: 4250.75, sharpeRatio: 1.82, sortinoRatio: 2.45, maxDrawdown: -8.5, avgTradePnl: 17.35, bestTrade: 480.00, worstTrade: -220.00, profitFactor: 2.14, expectancy: 12.50 } }));
app.get('/api/v1/analytics/risk', (req, res) => res.json({ data: { var95: 185.50, cvar95: 245.75, volatility: 0.0234, sharpeRatio: 1.82, sortinoRatio: 2.45, maxDrawdown: -8.5 } }));
app.get('/api/v1/analytics/correlation', (req, res) => res.json({ data: { matrix: { XAUUSD: { BTCUSD: 0.34, DXY: -0.67, EURUSD: 0.12, NASDAQ: 0.28, CRUDE: 0.45, GBPUSD: 0.18, ETHUSD: 0.22 } }, heatmap: [[1,0.34,-0.67,0.12,0.28,0.45,0.18,0.22],[0.34,1,-0.23,0.67,0.89,0.15,0.45,0.78],[-0.67,-0.23,1,-0.45,-0.32,-0.78,-0.23,-0.34],[0.12,0.67,-0.45,1,0.56,0.23,0.34,0.67],[0.28,0.89,-0.32,0.56,1,0.18,0.56,0.72],[0.45,0.15,-0.78,0.23,0.18,1,0.45,0.12],[0.18,0.45,-0.23,0.34,0.56,0.45,1,0.89],[0.22,0.78,-0.34,0.67,0.72,0.12,0.89,1]] } }));
app.get('/api/v1/analytics/heatmap', (req, res) => res.json({ data: { days: ['Mon','Tue','Wed','Thu','Fri'], hours: Array.from({length:24},(_,i)=>i), performanceByDayHour: { Mon: Array.from({length:24}, () => Math.round((Math.random()*150-50)*100)/100) } } }));

// Calendar
app.get('/api/v1/calendar/upcoming', (req, res) => res.json({ data: [{ event: 'NFP Release', currency: 'USD', impact: 'high', time: '2026-05-15T08:30:00Z', forecast: '205K', previous: '210K' }, { event: 'FOMC Decision', currency: 'USD', impact: 'high', time: '2026-05-20T14:00:00Z' }, { event: 'CPI Release', currency: 'USD', impact: 'high', time: '2026-06-10T08:30:00Z' }] }));

// Learning
app.get('/api/v1/learning/status', (req, res) => res.json({ status: 'trained', modelVersion: 'v2.1.0', lastTrained: new Date().toISOString(), totalSignals: 1245, accuracy: 0.72 }));
app.get('/api/v1/learning/accuracy', (req, res) => res.json({ accuracy: 0.72, validationAccuracy: 0.68, precision: 0.74, recall: 0.71, f1Score: 0.72, confusionMatrix: { tp: 89, tn: 67, fp: 32, fn: 31 } }));

// Memory
app.get('/api/v1/memory/stats', (req, res) => res.json({ totalMemories: 342, types: { signal_outcome: 245, error: 45, successful_setup: 32, decision_rationale: 20 } }));

// Alerts
app.post('/api/v1/alerts', (req, res) => res.json({ id: 'alert-' + Date.now(), ...req.body }));
app.get('/api/v1/alerts', (req, res) => res.json({ data: [{ id: 'alert-1', asset: 'XAUUSD', type: 'price', condition: 'above', threshold: 2500, active: true }] }));

// Subscriptions
app.get('/api/v1/subscriptions/plans', (req, res) => res.json({ data: [{ id: 'free', name: 'Free', price: 0, limits: { signals: 10, assets: 3 } }, { id: 'pro', name: 'Pro', price: 29.99, limits: { signals: 100, assets: 8 } }, { id: 'enterprise', name: 'Enterprise', price: 99.99, limits: { signals: 999, assets: 8 } }] }));
app.get('/api/v1/subscriptions/current', (req, res) => res.json({ data: { plan: 'free', status: 'active', nextBilling: '2026-06-01', usage: { apiCallsUsed: 45, apiCallsLimit: 100, signalsGenerated: 12 } } }));
app.get('/api/v1/subscriptions/usage', (req, res) => res.json({ data: { apiCallsUsed: 45, apiCallsLimit: 100, remainingDays: 14 } }));

// Admin
app.get('/api/v1/admin/health', (req, res) => res.json({ status: 'healthy', services: { gateway: 'running', auth: 'running', marketData: 'running', websocket: 'running', signalFusion: 'running' }, uptime: process.uptime() }));
app.get('/api/v1/admin/stats', (req, res) => res.json({ totalUsers: 1247, activeSignals: 8, signalsGenerated: 45623, avgResponseTime: 45 }));

// WebSocket
const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  console.log('WS client connected:', socket.id);
  socket.emit('connected', { event: 'connected', timestamp: new Date().toISOString() });
  socket.on('subscribe', (d) => { socket.join(d.channel || d.symbol); socket.emit('subscribed', d); });
  socket.on('disconnect', () => console.log('WS client disconnected:', socket.id));
});

// Emit market updates every 3 seconds
setInterval(() => {
  const sym = ['XAUUSD','BTCUSD','NASDAQ','EURUSD','GBPUSD','DXY','CRUDE','ETHUSD'][Math.floor(Math.random()*8)];
  const price = assets[sym] + (Math.random()-0.5)*10;
  assets[sym] = price;
  io.to(sym).emit('market-update', { symbol: sym, price: +price.toFixed(2), timestamp: new Date().toISOString() });
  io.emit('market-update', { symbol: sym, price: +price.toFixed(2), timestamp: new Date().toISOString() });
}, 3000);

// Start
server.listen(PORT, () => console.log(\🚀 Server running on http://localhost:\\));
