CREATE DATABASE IF NOT EXISTS bullrun_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bullrun_db;

CREATE TABLE IF NOT EXISTS users (
    user_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    balance    DECIMAL(15,2) NOT NULL DEFAULT 100000.00,
    role       VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email    (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stocks (
    symbol         VARCHAR(20)   NOT NULL PRIMARY KEY,
    company_name   VARCHAR(100)  NOT NULL,
    sector         VARCHAR(50),
    current_price  DECIMAL(12,2) NOT NULL,
    previous_close DECIMAL(12,2),
    day_high       DECIMAL(12,2),
    day_low        DECIMAL(12,2),
    volume         BIGINT,
    market_cap     DECIMAL(20,2),
    pe_ratio       DECIMAL(8,2),
    week_52_high   DECIMAL(12,2),
    week_52_low    DECIMAL(12,2),
    INDEX idx_sector (sector)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS portfolio (
    portfolio_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT        NOT NULL,
    stock_symbol   VARCHAR(20)   NOT NULL,
    quantity       INT           NOT NULL DEFAULT 0,
    avg_price      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_invested DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    UNIQUE KEY uq_user_stock (user_id, stock_symbol),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT        NOT NULL,
    stock_symbol   VARCHAR(20)   NOT NULL,
    quantity       INT           NOT NULL,
    price          DECIMAL(12,2) NOT NULL,
    type           ENUM('BUY','SELL') NOT NULL,
    total_amount   DECIMAL(15,2) NOT NULL,
    notes          VARCHAR(255),
    timestamp      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id  (user_id),
    INDEX idx_symbol   (stock_symbol),
    INDEX idx_timestamp(timestamp)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS watchlist (
    watchlist_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT      NOT NULL,
    stock_symbol VARCHAR(20) NOT NULL,
    added_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_watch (user_id, stock_symbol),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

INSERT IGNORE INTO stocks
    (symbol, company_name, sector, current_price, previous_close,
     day_high, day_low, volume, week_52_high, week_52_low)
VALUES
    ('RELIANCE',   'Reliance Industries Ltd',         'Energy',        2850.00, 2820.00, 2890.00, 2810.00, 12500000, 3024.00, 2220.00),
    ('TCS',        'Tata Consultancy Services',        'IT',            3920.00, 3880.00, 3955.00, 3870.00,  4200000, 4255.00, 3312.00),
    ('INFY',       'Infosys Limited',                  'IT',            1780.00, 1760.00, 1798.00, 1750.00,  8900000, 1953.00, 1351.00),
    ('HDFCBANK',   'HDFC Bank Ltd',                    'Banking',       1650.00, 1630.00, 1668.00, 1622.00, 11200000, 1794.00, 1363.00),
    ('ICICIBANK',  'ICICI Bank Ltd',                   'Banking',       1230.00, 1215.00, 1248.00, 1208.00,  9800000, 1318.00,  899.00),
    ('WIPRO',      'Wipro Limited',                    'IT',             580.00,  572.00,  588.00,  568.00,  7600000,  672.00,  430.00),
    ('SBIN',       'State Bank of India',              'Banking',        820.00,  810.00,  832.00,  806.00, 18900000,  912.00,  543.00),
    ('TATAMOTORS', 'Tata Motors Ltd',                  'Auto',           960.00,  948.00,  975.00,  940.00, 13400000, 1063.00,  601.00),
    ('BHARTIARTL', 'Bharti Airtel Ltd',                'Telecom',       1750.00, 1728.00, 1772.00, 1718.00,  5600000, 1779.00, 1087.00),
    ('ADANIENT',   'Adani Enterprises Ltd',            'Conglomerate',  2980.00, 2945.00, 3010.00, 2920.00,  4100000, 3743.00, 1900.00),
    ('MARUTI',     'Maruti Suzuki India Ltd',           'Auto',         11200.00,11050.00,11320.00,11020.00,  1200000,12694.00, 8822.00),
    ('SUNPHARMA',  'Sun Pharmaceutical Industries',    'Pharma',        1890.00, 1868.00, 1912.00, 1855.00,  3800000, 1960.00, 1174.00);

INSERT IGNORE INTO users (username, email, password, balance)
VALUES ('demo', 'demo@bullrun.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy.', 100000.00);
