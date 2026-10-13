package org.example.Analytics;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsService(
            AnalyticsRepository analyticsRepository
    ) {
        this.analyticsRepository = analyticsRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getSalesAnalytics() {

        // Calculate total orders
        Long orderCount = analyticsRepository.countTotalOrders();

        // Handle a potentially null count
        if (orderCount == null) {
            orderCount = 0L;
        }

        // Calculate total revenue
        BigDecimal totalRevenue = analyticsRepository.getTotalRevenue();

        // Handle no matching orders
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        // Calculate average order value
        BigDecimal averageOrderValue;

        if (orderCount == 0) {
            averageOrderValue = BigDecimal.ZERO;
        } else {
            averageOrderValue = totalRevenue.divide(
                    BigDecimal.valueOf(orderCount),
                    2,
                    RoundingMode.HALF_UP
            );
        }

        return new AnalyticsResponse(
                orderCount,
                totalRevenue,
                averageOrderValue
        );
    }
}