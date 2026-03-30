package com.bullrun.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "stocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    @Id
    @Column(name = "symbol", length = 20)
    private String symbol;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "sector")
    private String sector;

    @Column(name = "current_price", nullable = false)
    private Double currentPrice;

    @Column(name = "previous_close")
    private Double previousClose;

    @Column(name = "day_high")
    private Double dayHigh;

    @Column(name = "day_low")
    private Double dayLow;

    @Column(name = "volume")
    private Long volume;

    @Column(name = "market_cap")
    private Double marketCap;

    @Column(name = "pe_ratio")
    private Double peRatio;

    @Column(name = "week_52_high")
    private Double week52High;

    @Column(name = "week_52_low")
    private Double week52Low;

    @Transient
    private Double changePercent;

    @Transient
    private Double changeAmount;

    public Double getChangePercent() {
        if (previousClose != null && previousClose != 0) {
            return ((currentPrice - previousClose) / previousClose) * 100;
        }
        return 0.0;
    }

    public Double getChangeAmount() {
        if (previousClose != null) {
            return currentPrice - previousClose;
        }
        return 0.0;
    }
}
