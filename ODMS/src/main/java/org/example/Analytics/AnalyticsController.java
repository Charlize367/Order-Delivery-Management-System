package org.example.Analytics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService
    ) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/sales")
    public ResponseEntity<AnalyticsResponse> getSalesAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getSalesAnalytics()
        );
    }
}