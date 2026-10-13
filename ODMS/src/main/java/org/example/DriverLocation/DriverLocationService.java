package org.example.DriverLocation;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DriverLocationService {

    private final Map<Long, DriverLocation> locations = new ConcurrentHashMap<>();

    public DriverLocation updateLocation(
            Long driverId,
            Double latitude,
            Double longitude
    ) {
        DriverLocation location = new DriverLocation(
                driverId,
                latitude,
                longitude,
                LocalDateTime.now()
        );

        locations.put(driverId, location);

        return location;
    }

    public DriverLocation getLocation(Long driverId) {
        return locations.get(driverId);
    }
}