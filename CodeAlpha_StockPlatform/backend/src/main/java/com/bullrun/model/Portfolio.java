package com.bullrun.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "portfolio", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "stock_symbol"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "portfolio_id")
    private Long portfolioId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "stock_symbol", nullable = false, length = 20)
    private String stockSymbol;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "avg_price", nullable = false)
    private Double avgPrice;

    @Column(name = "total_invested")
    private Double totalInvested;

    @Transient
    private Double currentPrice;

    @Transient
    private Double currentValue;

    @Transient
    private Double profitLoss;

    @Transient
    private Double profitLossPercent;

    public void calculatePnL(Double marketPrice) {
        this.currentPrice = marketPrice;
        this.currentValue = quantity * marketPrice;
        this.profitLoss = currentValue - totalInvested;
        this.profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
    }
}
