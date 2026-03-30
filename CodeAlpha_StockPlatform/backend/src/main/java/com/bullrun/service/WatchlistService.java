package com.bullrun.service;

import com.bullrun.model.User;
import com.bullrun.model.Watchlist;
import com.bullrun.repository.UserRepository;
import com.bullrun.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;

    public List<Watchlist> getWatchlist(Long userId) {
        return watchlistRepository.findByUserUserId(userId);
    }

    @Transactional
    public Watchlist addToWatchlist(Long userId, String symbol) {
        if (watchlistRepository.existsByUserUserIdAndStockSymbol(userId, symbol.toUpperCase())) {
            throw new RuntimeException(symbol + " is already in your watchlist");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return watchlistRepository.save(new Watchlist(user, symbol.toUpperCase()));
    }

    @Transactional
    public void removeFromWatchlist(Long userId, String symbol) {
        watchlistRepository.deleteByUserUserIdAndStockSymbol(userId, symbol.toUpperCase());
    }
}
