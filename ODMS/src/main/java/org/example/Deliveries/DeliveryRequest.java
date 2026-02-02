package org.example.Deliveries;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.Orders.Orders;
import org.example.Users.Users;

import java.time.LocalTime;

public class DeliveryRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotBlank(message = "Order status cannot be blank")
    @Size(min = 1, max = 50, message = "Order status must have at least 1-50 characters")
    private String delivery_status;


    @NotBlank(message = "Order status cannot be blank")
    @Size(min = 1, max = 50, message = "Order status must have at least 1-50 characters")
    private String address;

    @NotNull(message = "Estimated time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime estimated_time;

    @NotNull(message = "Deliver time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime delivered_time;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getDelivery_status() {
        return delivery_status;
    }

    public void setDelivery_status(String delivery_status) {
        this.delivery_status = delivery_status;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalTime getEstimated_time() {
        return estimated_time;
    }

    public void setEstimated_time(LocalTime estimated_time) {
        this.estimated_time = estimated_time;
    }

    public LocalTime getDelivered_time() {
        return delivered_time;
    }

    public void setDelivered_time(LocalTime delivered_time) {
        this.delivered_time = delivered_time;
    }
}
