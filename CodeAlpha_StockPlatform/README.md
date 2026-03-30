# BullRun — NSE Stock Trading Simulator

A production-style full-stack stock trading simulator with live-simulated NSE data, JWT authentication, portfolio management, and real-time price updates.

---

## Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18 + Vite + TailwindCSS + Recharts  |
| Backend   | Java 17 + Spring Boot 3.2 + Spring Security |
| Database  | MySQL 8.0                                 |
| Auth      | JWT (JJWT)                               |
| DevOps    | Docker + Docker Compose                   |

---

## Features

- **Live price simulation** — 12 NSE stocks tick every 5 seconds with realistic volatility
- **JWT Authentication** — Register / Login with secure token-based auth
- **Market Dashboard** — Top gainers, losers, most active stocks
- **Stock Detail** — Price chart, day high/low, sentiment indicator, 52-week range
- **Trading Engine** — Buy/sell market orders with balance and holdings validation
- **Portfolio Management** — Live P&L, unrealized gains, portfolio growth chart
- **Transaction History** — Full audit log with timestamps and filters
- **Watchlist** — Add/remove stocks for tracking
- **₹1,00,000** starting virtual balance per user

---

## Project Structure

```
bullrun/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/com/bullrun/
│   │   ├── model/              # JPA entities
│   │   │   ├── Stock.java
│   │   │   ├── User.java
│   │   │   ├── Portfolio.java
│   │   │   ├── Transaction.java
│   │   │   └── Watchlist.java
│   │   ├── repository/         # Spring Data JPA repos
│   │   ├── service/            # Business logic
│   │   │   ├── MarketDataService.java
│   │   │   ├── TradingService.java
│   │   │   ├── PortfolioService.java
│   │   │   ├── UserService.java
│   │   │   └── WatchlistService.java
│   │   ├── controller/         # REST endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── MarketController.java
│   │   │   ├── TradingController.java
│   │   │   └── PortfolioController.java
│   │   ├── security/           # JWT filter + service
│   │   ├── config/             # Security config, CORS
│   │   └── dto/                # Request/Response DTOs
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── pages/              # Route-level pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Market.jsx
│   │   │   ├── Trade.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   ├── Watchlist.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.jsx
│   │   │   ├── StockCard.jsx
│   │   │   ├── PriceChart.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/            # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── MarketContext.jsx
│   │   ├── services/           # Axios API calls
│   │   │   ├── api.js
│   │   │   └── marketService.js
│   │   └── utils/helpers.js    # Formatting utilities
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker/
│   └── mysql-init.sql          # DB schema + seed data
└── docker-compose.yml
```

---

## Quick Start — Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running
- Ports 80, 8080, 3306 free

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/bullrun.git
cd bullrun

# 2. Start everything
docker-compose up --build

# 3. Open the app
open http://localhost
```

Demo credentials:
- **Username:** `demo`
- **Password:** `demo1234`

---

## Local Development Setup

### Backend (Spring Boot)

```bash
# Prerequisites: Java 17+, Maven 3.9+, MySQL 8 running

cd backend

# Create DB and user
mysql -u root -p -e "
  CREATE DATABASE bullrun_db;
  CREATE USER 'bullrun_user'@'localhost' IDENTIFIED BY 'bullrun_pass';
  GRANT ALL PRIVILEGES ON bullrun_db.* TO 'bullrun_user'@'localhost';
  FLUSH PRIVILEGES;
"

# Run schema
mysql -u bullrun_user -p bullrun_db < ../docker/mysql-init.sql

# Start server
mvn spring-boot:run
# → API running at http://localhost:8080
```

### Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → App running at http://localhost:3000
```

---

## API Endpoints

### Auth
| Method | Endpoint            | Description       | Auth |
|--------|---------------------|-------------------|------|
| POST   | /api/auth/register  | Register new user | No   |
| POST   | /api/auth/login     | Login             | No   |

### Market (Public)
| Method | Endpoint                   | Description          |
|--------|----------------------------|----------------------|
| GET    | /api/market/stocks         | All stocks           |
| GET    | /api/market/stocks/{sym}   | Single stock         |
| GET    | /api/market/gainers        | Top gainers          |
| GET    | /api/market/losers         | Top losers           |
| GET    | /api/market/active         | Most active          |
| GET    | /api/market/summary        | Market breadth       |

### Trading (JWT required)
| Method | Endpoint            | Description             |
|--------|---------------------|-------------------------|
| POST   | /api/trade/buy      | Execute buy order       |
| POST   | /api/trade/sell     | Execute sell order      |
| GET    | /api/trade/history  | Transaction history     |

### Portfolio (JWT required)
| Method | Endpoint                        | Description        |
|--------|---------------------------------|--------------------|
| GET    | /api/portfolio                  | Holdings + P&L     |
| GET    | /api/portfolio/summary          | Portfolio summary  |
| GET    | /api/portfolio/watchlist        | Watchlist          |
| POST   | /api/portfolio/watchlist/{sym}  | Add to watchlist   |
| DELETE | /api/portfolio/watchlist/{sym}  | Remove from watchlist |

---

## Connecting Real NSE Data

To replace simulated prices with real NSE data, update `MarketDataService.java`:

```java
// Option 1: Yahoo Finance (unofficial)
// GET https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS

// Option 2: Alpha Vantage API (free tier)
// GET https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=RELIANCE.BSE&apikey=YOUR_KEY

// Option 3: NSE India official (scraping, check ToS)
// GET https://www.nseindia.com/api/quote-equity?symbol=RELIANCE
```

Replace the `@Scheduled` `updatePrices()` method body with an HTTP call to your chosen data source.

---

## Environment Variables

### Backend
| Variable                    | Default            | Description           |
|-----------------------------|--------------------|-----------------------|
| SPRING_DATASOURCE_URL       | jdbc:mysql://...   | MySQL connection URL  |
| SPRING_DATASOURCE_USERNAME  | bullrun_user       | DB username           |
| SPRING_DATASOURCE_PASSWORD  | bullrun_pass       | DB password           |
| JWT_SECRET                  | (long string)      | JWT signing key       |
| JWT_EXPIRATION              | 86400000           | Token TTL (ms)        |

### Frontend
| Variable       | Default                 | Description       |
|----------------|-------------------------|-------------------|
| VITE_API_URL   | http://localhost:8080   | Backend base URL  |

---

## GitHub Portfolio Notes

This project demonstrates:
- **Spring Boot OOP design** — layered architecture (Controller → Service → Repository)
- **JWT security** — stateless authentication with Spring Security
- **React patterns** — Context API, custom hooks, protected routes
- **Database design** — normalized schema with foreign keys and indexes
- **Docker** — multi-stage builds, health checks, service orchestration
- **Real-time UX** — polling-based live price updates
