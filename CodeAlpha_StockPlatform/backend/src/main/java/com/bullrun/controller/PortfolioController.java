package com.bullrun.controller;

import com.bullrun.model.Portfolio;
import com.bullrun.model.User;
import com.bullrun.model.Watchlist;
import com.bullrun.service.PortfolioService;
import com.bullrun.service.UserService;
import com.bullrun.service.WatchlistService;
import com.bullrun.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final WatchlistService watchlistService;
    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<Portfolio>> getPortfolio(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(portfolioService.getPortfolio(userId(auth)));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@RequestHeader("Authorization") String auth) {
        Long uid = userId(auth);
        User user = userService.getUserById(uid);
        return ResponseEntity.ok(portfolioService.getPortfolioSummary(uid, user.getBalance()));
    }

    @GetMapping("/watchlist")
    public ResponseEntity<List<Watchlist>> getWatchlist(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(watchlistService.getWatchlist(userId(auth)));
    }

    @PostMapping("/watchlist/{symbol}")
    public ResponseEntity<Watchlist> addWatch(@RequestHeader("Authorization") String auth, @PathVariable String symbol) {
        return ResponseEntity.ok(watchlistService.addToWatchlist(userId(auth), symbol));
    }

    @DeleteMapping("/watchlist/{symbol}")
    public ResponseEntity<Void> removeWatch(@RequestHeader("Authorization") String auth, @PathVariable String symbol) {
        watchlistService.removeFromWatchlist(userId(auth), symbol);
        return ResponseEntity.noContent().build();
    }

    private Long userId(String authHeader) {
        return jwtService.extractUserId(authHeader.substring(7));
    }
}
