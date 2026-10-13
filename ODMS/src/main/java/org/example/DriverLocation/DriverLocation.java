package org.example.DriverLocation;

import java.time.LocalDateTime;

public record DriverLocation(
        Long driverId,
        Double latitude,
        Double longitude,
        LocalDateTime updatedAt
) {}