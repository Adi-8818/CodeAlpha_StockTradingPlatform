package com.bullrun.repository;

import com.bullrun.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserUserId(Long userId, Pageable pageable);
    List<Transaction> findByUserUserIdAndStockSymbol(Long userId, String symbol);
}
