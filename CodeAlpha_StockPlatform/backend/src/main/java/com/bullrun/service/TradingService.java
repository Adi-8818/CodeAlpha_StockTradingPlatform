package com.bullrun.service;

import com.bullrun.model.*;
import com.bullrun.repository.*;
import com.bullrun.dto.TradeRequest;
import com.bullrun.dto.TradeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradingService {

    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final PortfolioRepository portfolioRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Execute a BUY order.
     */
    @Transactional
    public TradeResponse buyStock(Long userId, TradeRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Stock stock = stockRepository.findById(request.getSymbol().toUpperCase())
            .orElseThrow(() -> new RuntimeException("Stock not found: " + request.getSymbol()));

        double marketPrice = stock.getCurrentPrice();
        double totalCost = marketPrice * request.getQuantity();

        if (user.getBalance() < totalCost) {
            throw new RuntimeException(String.format(
                "Insufficient balance. Required: ₹%.2f, Available: ₹%.2f", totalCost, user.getBalance()
            ));
        }
        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        // Deduct balance
        user.setBalance(user.getBalance() - totalCost);
        userRepository.save(user);

        // Update or create portfolio holding
        Portfolio holding = portfolioRepository.findByUserUserIdAndStockSymbol(userId, request.getSymbol())
            .orElse(new Portfolio());
        if (holding.getPortfolioId() == null) {
            holding.setUser(user);
            holding.setStockSymbol(request.getSymbol().toUpperCase());
            holding.setQuantity(0);
            holding.setAvgPrice(0.0);
            holding.setTotalInvested(0.0);
        }

        double prevInvested = holding.getTotalInvested() != null ? holding.getTotalInvested() : 0;
        int newQty = holding.getQuantity() + request.getQuantity();
        double newInvested = prevInvested + totalCost;
        holding.setQuantity(newQty);
        holding.setAvgPrice(newInvested / newQty);
        holding.setTotalInvested(newInvested);
        portfolioRepository.save(holding);

        // Log transaction
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setStockSymbol(request.getSymbol().toUpperCase());
        tx.setQuantity(request.getQuantity());
        tx.setPrice(marketPrice);
        tx.setType(Transaction.TransactionType.BUY);
        tx.setTotalAmount(totalCost);
        tx.setNotes(request.getNotes());
        transactionRepository.save(tx);

        log.info("BUY executed: user={} symbol={} qty={} price={}", userId, request.getSymbol(), request.getQuantity(), marketPrice);

        return TradeResponse.builder()
            .success(true)
            .message(String.format("Bought %d shares of %s @ ₹%.2f", request.getQuantity(), request.getSymbol(), marketPrice))
            .executedPrice(marketPrice)
            .quantity(request.getQuantity())
            .totalAmount(totalCost)
            .remainingBalance(user.getBalance())
            .build();
    }

    /**
     * Execute a SELL order.
     */
    @Transactional
    public TradeResponse sellStock(Long userId, TradeRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Stock stock = stockRepository.findById(request.getSymbol().toUpperCase())
            .orElseThrow(() -> new RuntimeException("Stock not found: " + request.getSymbol()));

        Portfolio holding = portfolioRepository.findByUserUserIdAndStockSymbol(userId, request.getSymbol().toUpperCase())
            .orElseThrow(() -> new RuntimeException("You don't hold any shares of " + request.getSymbol()));

        if (holding.getQuantity() < request.getQuantity()) {
            throw new RuntimeException(String.format(
                "Insufficient holdings. You have %d shares, trying to sell %d",
                holding.getQuantity(), request.getQuantity()
            ));
        }

        double marketPrice = stock.getCurrentPrice();
        double revenue = marketPrice * request.getQuantity();

        // Credit balance
        user.setBalance(user.getBalance() + revenue);
        userRepository.save(user);

        // Update portfolio
        int newQty = holding.getQuantity() - request.getQuantity();
        if (newQty == 0) {
            portfolioRepository.delete(holding);
        } else {
            double soldInvested = holding.getAvgPrice() * request.getQuantity();
            holding.setQuantity(newQty);
            holding.setTotalInvested(holding.getTotalInvested() - soldInvested);
            portfolioRepository.save(holding);
        }

        // Log transaction
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setStockSymbol(request.getSymbol().toUpperCase());
        tx.setQuantity(request.getQuantity());
        tx.setPrice(marketPrice);
        tx.setType(Transaction.TransactionType.SELL);
        tx.setTotalAmount(revenue);
        tx.setNotes(request.getNotes());
        transactionRepository.save(tx);

        log.info("SELL executed: user={} symbol={} qty={} price={}", userId, request.getSymbol(), request.getQuantity(), marketPrice);

        return TradeResponse.builder()
            .success(true)
            .message(String.format("Sold %d shares of %s @ ₹%.2f", request.getQuantity(), request.getSymbol(), marketPrice))
            .executedPrice(marketPrice)
            .quantity(request.getQuantity())
            .totalAmount(revenue)
            .remainingBalance(user.getBalance())
            .build();
    }
}
