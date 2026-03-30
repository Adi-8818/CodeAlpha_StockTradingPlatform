package com.bullrun.service;

import com.bullrun.model.Stock;
import com.bullrun.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataService {

    private final StockRepository stockRepository;
    private final RestTemplate restTemplate;

    // NSE symbols tracked in this simulator
    private static final List<String> NSE_SYMBOLS = List.of(
        "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
        "WIPRO", "SBIN", "TATAMOTORS", "BHARTIARTL", "ADANIENT",
        "MARUTI", "SUNPHARMA"
    );

    // Simulated base prices (replace with real API in production)
    private static final Map<String, Double> BASE_PRICES = Map.ofEntries(
        Map.entry("RELIANCE",    2850.0),
        Map.entry("TCS",         3920.0),
        Map.entry("INFY",        1780.0),
        Map.entry("HDFCBANK",    1650.0),
        Map.entry("ICICIBANK",   1230.0),
        Map.entry("WIPRO",        580.0),
        Map.entry("SBIN",         820.0),
        Map.entry("TATAMOTORS",   960.0),
        Map.entry("BHARTIARTL",  1750.0),
        Map.entry("ADANIENT",    2980.0),
        Map.entry("MARUTI",     11200.0),
        Map.entry("SUNPHARMA",   1890.0)
    );

    private final Random random = new Random();

    /**
     * Fetch all stocks from DB.
     */
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    /**
     * Fetch a single stock by symbol.
     */
    public Optional<Stock> getStockBySymbol(String symbol) {
        return stockRepository.findById(symbol.toUpperCase());
    }

    /**
     * Get top gainers (sorted by changePercent desc).
     */
    public List<Stock> getTopGainers(int limit) {
        return stockRepository.findAll().stream()
            .sorted((a, b) -> Double.compare(b.getChangePercent(), a.getChangePercent()))
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Get top losers (sorted by changePercent asc).
     */
    public List<Stock> getTopLosers(int limit) {
        return stockRepository.findAll().stream()
            .sorted(Comparator.comparingDouble(Stock::getChangePercent))
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Get most active stocks by volume.
     */
    public List<Stock> getMostActive(int limit) {
        return stockRepository.findAll().stream()
            .sorted((a, b) -> Long.compare(b.getVolume(), a.getVolume()))
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Scheduled price update every 5 seconds (simulated tick).
     * In production: replace this with a real NSE API call (e.g., Yahoo Finance, Alpha Vantage).
     */
    @Scheduled(fixedRate = 5000)
    public void updatePrices() {
        List<Stock> stocks = stockRepository.findAll();
        if (stocks.isEmpty()) {
            log.warn("No stocks in DB — skipping price update");
            return;
        }
        stocks.forEach(stock -> {
            double base = BASE_PRICES.getOrDefault(stock.getSymbol(), stock.getCurrentPrice());
            double volatility = 0.003 + random.nextDouble() * 0.003;
            double drift = (random.nextDouble() - 0.49) * volatility;
            double meanRevert = (base - stock.getCurrentPrice()) / base * 0.05;
            double newPrice = Math.max(stock.getCurrentPrice() * (1 + drift + meanRevert), base * 0.5);
            newPrice = Math.round(newPrice * 100.0) / 100.0;

            stock.setPreviousClose(stock.getCurrentPrice());
            stock.setCurrentPrice(newPrice);
            stock.setDayHigh(Math.max(stock.getDayHigh() != null ? stock.getDayHigh() : newPrice, newPrice));
            stock.setDayLow(Math.min(stock.getDayLow() != null ? stock.getDayLow() : newPrice, newPrice));
        });
        stockRepository.saveAll(stocks);
        log.debug("Price tick updated for {} stocks", stocks.size());
    }

    /**
     * Seed initial stock data if table is empty.
     */
    public void seedStocksIfEmpty() {
        if (stockRepository.count() == 0) {
            Map<String, String[]> meta = Map.ofEntries(
                Map.entry("RELIANCE",   new String[]{"Reliance Industries Ltd", "Energy"}),
                Map.entry("TCS",        new String[]{"Tata Consultancy Services", "IT"}),
                Map.entry("INFY",       new String[]{"Infosys Limited", "IT"}),
                Map.entry("HDFCBANK",   new String[]{"HDFC Bank Ltd", "Banking"}),
                Map.entry("ICICIBANK",  new String[]{"ICICI Bank Ltd", "Banking"}),
                Map.entry("WIPRO",      new String[]{"Wipro Limited", "IT"}),
                Map.entry("SBIN",       new String[]{"State Bank of India", "Banking"}),
                Map.entry("TATAMOTORS", new String[]{"Tata Motors Ltd", "Auto"}),
                Map.entry("BHARTIARTL", new String[]{"Bharti Airtel Ltd", "Telecom"}),
                Map.entry("ADANIENT",   new String[]{"Adani Enterprises Ltd", "Conglomerate"}),
                Map.entry("MARUTI",     new String[]{"Maruti Suzuki India Ltd", "Auto"}),
                Map.entry("SUNPHARMA",  new String[]{"Sun Pharmaceutical Industries", "Pharma"})
            );

            List<Stock> seeds = new ArrayList<>();
            for (Map.Entry<String, String[]> e : meta.entrySet()) {
                String sym = e.getKey();
                double price = BASE_PRICES.get(sym);
                Stock s = new Stock();
                s.setSymbol(sym);
                s.setCompanyName(e.getValue()[0]);
                s.setSector(e.getValue()[1]);
                s.setCurrentPrice(price);
                s.setPreviousClose(price * (0.97 + random.nextDouble() * 0.06));
                s.setDayHigh(price * 1.015);
                s.setDayLow(price * 0.985);
                s.setVolume((long)(1000000 + random.nextInt(20000000)));
                seeds.add(s);
            }
            stockRepository.saveAll(seeds);
            log.info("Seeded {} stocks into DB", seeds.size());
        }
    }
}
