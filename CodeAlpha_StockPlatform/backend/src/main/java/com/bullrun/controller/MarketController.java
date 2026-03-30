package com.bullrun.controller;

import com.bullrun.model.Stock;
import com.bullrun.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MarketController {

    private final MarketDataService marketDataService;

    @GetMapping("/stocks")
    public ResponseEntity<List<Stock>> getAllStocks() {
        return ResponseEntity.ok(marketDataService.getAllStocks());
    }

    @GetMapping("/stocks/{symbol}")
    public ResponseEntity<Stock> getStock(@PathVariable String symbol) {
        return marketDataService.getStockBySymbol(symbol)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/gainers")
    public ResponseEntity<List<Stock>> getTopGainers(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(marketDataService.getTopGainers(limit));
    }

    @GetMapping("/losers")
    public ResponseEntity<List<Stock>> getTopLosers(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(marketDataService.getTopLosers(limit));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Stock>> getMostActive(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(marketDataService.getMostActive(limit));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getMarketSummary() {
        List<Stock> all = marketDataService.getAllStocks();
        long advancers = all.stream().filter(s -> s.getChangePercent() > 0).count();
        long decliners = all.stream().filter(s -> s.getChangePercent() < 0).count();
        return ResponseEntity.ok(Map.of(
            "totalStocks", all.size(),
            "advancers", advancers,
            "decliners", decliners,
            "unchanged", all.size() - advancers - decliners
        ));
    }
}
