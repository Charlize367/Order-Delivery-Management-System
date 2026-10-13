package org.example.Analytics;

import java.math.BigDecimal;

public record AnalyticsResponse(
        Long totalOrders,
        BigDecimal totalRevenue,
        BigDecimal averageOrderValue
) {
}