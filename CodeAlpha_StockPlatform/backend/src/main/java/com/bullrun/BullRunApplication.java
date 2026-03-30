package com.bullrun;

import com.bullrun.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@RequiredArgsConstructor
public class BullRunApplication implements CommandLineRunner {

    private final MarketDataService marketDataService;

    public static void main(String[] args) {
        SpringApplication.run(BullRunApplication.class, args);
    }

    @Override
    public void run(String... args) {
        marketDataService.seedStocksIfEmpty();
    }
}
