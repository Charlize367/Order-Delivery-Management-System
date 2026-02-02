package org.example.Deliveries;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.Orders.OrderResponse;
import org.example.Users.UserResponse;

import java.time.LocalTime;

public class DeliveryResponse {


    private Long deliveryId;
    private UserResponse deliveryMen;
    private OrderResponse order;
    private String delivery_status;
    private String address;
    private LocalTime estimated_time;
    private LocalTime delivered_time;


    public Long getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Long deliveryId) {
        this.deliveryId = deliveryId;
    }
    public UserResponse getDeliveryMen() {
        return deliveryMen;
    }

    public void setDeliveryMen(UserResponse deliveryMen) {
        this.deliveryMen = deliveryMen;
    }

    public OrderResponse getOrder() {
        return order;
    }

    public void setOrder(OrderResponse order) {
        this.order = order;
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
