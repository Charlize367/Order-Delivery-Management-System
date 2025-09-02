package org.example.Deliveries;

import java.sql.Time;
import java.time.LocalTime;

public class EstimatedTime {
    public LocalTime getEstimated_time() {
        return estimated_time;
    }

    public void setEstimated_time(LocalTime estimated_time) {
        this.estimated_time = estimated_time;
    }

    private LocalTime estimated_time;
}
