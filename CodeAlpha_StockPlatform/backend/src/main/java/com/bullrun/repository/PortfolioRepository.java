package com.bullrun.repository;

import com.bullrun.model.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByUserUserId(Long userId);
    Optional<Portfolio> findByUserUserIdAndStockSymbol(Long userId, String stockSymbol);
}
