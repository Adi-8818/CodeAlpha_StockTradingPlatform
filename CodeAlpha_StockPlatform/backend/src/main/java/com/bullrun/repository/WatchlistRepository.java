package com.bullrun.repository;

import com.bullrun.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUserUserId(Long userId);
    boolean existsByUserUserIdAndStockSymbol(Long userId, String stockSymbol);
    void deleteByUserUserIdAndStockSymbol(Long userId, String stockSymbol);
}
