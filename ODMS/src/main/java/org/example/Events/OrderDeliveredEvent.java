package org.example.Events;

import java.time.Instant;
import java.time.LocalTime;

public record OrderDeliveredEvent(Long orderId, Long deliveryId, LocalTime deliveredAt) {}
