package org.example.Deliveries;

import java.sql.Time;
import java.time.LocalTime;

public class DeliveredTime {
    public LocalTime getDelivered_time() {
        return delivered_time;
    }

    public void setDelivered_time(LocalTime delivered_time) {
        this.delivered_time = delivered_time;
    }

    private LocalTime delivered_time;
}
