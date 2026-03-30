package com.bullrun.controller;

import com.bullrun.dto.TradeRequest;
import com.bullrun.dto.TradeResponse;
import com.bullrun.model.Transaction;
import com.bullrun.repository.TransactionRepository;
import com.bullrun.service.TradingService;
import com.bullrun.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TradingController {

    private final TradingService tradingService;
    private final TransactionRepository transactionRepository;
    private final JwtService jwtService;

    @PostMapping("/buy")
    public ResponseEntity<TradeResponse> buy(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody TradeRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(tradingService.buyStock(userId, request));
    }

    @PostMapping("/sell")
    public ResponseEntity<TradeResponse> sell(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody TradeRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(tradingService.sellStock(userId, request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Transaction>> getHistory(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(
            transactionRepository.findByUserUserId(
                userId, PageRequest.of(page, size, Sort.by("timestamp").descending())
            ).getContent()
        );
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}
