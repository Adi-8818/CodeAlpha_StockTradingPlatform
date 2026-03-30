package com.bullrun.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TradeResponse {
    private boolean success;
    private String message;
    private Double executedPrice;
    private Integer quantity;
    private Double totalAmount;
    private Double remainingBalance;
}
