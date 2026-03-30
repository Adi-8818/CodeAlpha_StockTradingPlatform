package com.bullrun.service;

import com.bullrun.model.Portfolio;
import com.bullrun.model.Stock;
import com.bullrun.repository.PortfolioRepository;
import com.bullrun.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final StockRepository stockRepository;

    /**
     * Get all holdings for a user with live P&L calculated.
     */
    public List<Portfolio> getPortfolio(Long userId) {
        List<Portfolio> holdings = portfolioRepository.findByUserUserId(userId);

        // Fetch all needed stock prices in one query
        List<String> symbols = holdings.stream().map(Portfolio::getStockSymbol).toList();
        Map<String, Double> priceMap = stockRepository.findAllById(symbols).stream()
            .collect(Collectors.toMap(Stock::getSymbol, Stock::getCurrentPrice));

        // Enrich with live P&L
        holdings.forEach(h -> {
            Double price = priceMap.getOrDefault(h.getStockSymbol(), h.getAvgPrice());
            h.calculatePnL(price);
        });
        return holdings;
    }

    /**
     * Total portfolio market value.
     */
    public double getTotalPortfolioValue(Long userId) {
        return getPortfolio(userId).stream()
            .mapToDouble(h -> h.getCurrentValue() != null ? h.getCurrentValue() : 0)
            .sum();
    }

    /**
     * Total unrealized P&L.
     */
    public double getTotalPnL(Long userId) {
        return getPortfolio(userId).stream()
            .mapToDouble(h -> h.getProfitLoss() != null ? h.getProfitLoss() : 0)
            .sum();
    }

    /**
     * Portfolio summary object.
     */
    public Map<String, Object> getPortfolioSummary(Long userId, double cashBalance) {
        List<Portfolio> holdings = getPortfolio(userId);
        double portfolioValue = holdings.stream()
            .mapToDouble(h -> h.getCurrentValue() != null ? h.getCurrentValue() : 0).sum();
        double totalInvested = holdings.stream()
            .mapToDouble(h -> h.getTotalInvested() != null ? h.getTotalInvested() : 0).sum();
        double totalPnL = portfolioValue - totalInvested;
        double totalAssets = cashBalance + portfolioValue;

        return Map.of(
            "totalAssets", totalAssets,
            "cashBalance", cashBalance,
            "portfolioValue", portfolioValue,
            "totalInvested", totalInvested,
            "totalPnL", totalPnL,
            "totalPnLPercent", totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0,
            "holdingsCount", holdings.size()
        );
    }
}
