package org.example.Orders;

import org.example.OrderItems.OrderItemsResponse;
import org.example.Users.UserResponse;

import java.time.LocalDate;
import java.util.List;

public class OrderResponse {

    private Long orderId;
    private UserResponse customer;
    private LocalDate order_date;
    private Double order_price;
    private String order_status;
    private String order_address;
    private String order_notes;
    private List<OrderItemsResponse> orderItems;


    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrder_address() {
        return order_address;
    }

    public void setOrder_address(String order_address) {
        this.order_address = this.order_address;
    }

    public String getOrder_notes() {
        return order_notes;
    }

    public void setOrder_notes(String order_notes) {
        this.order_notes = order_notes;
    }

    public List<OrderItemsResponse> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItemsResponse> orderItems) {
        this.orderItems = orderItems;
    }


    public UserResponse getCustomer() {
        return customer;
    }

    public void setCustomer(UserResponse customer) {
        this.customer = customer;
    }

    public LocalDate getOrder_date() {
        return order_date;
    }

    public void setOrder_date(LocalDate order_date) {
        this.order_date = order_date;
    }

    public Double getOrder_price() {
        return order_price;
    }

    public void setOrder_price(Double order_price) {
        this.order_price = order_price;
    }

    public String getOrder_status() {
        return order_status;
    }

    public void setOrder_status(String order_status) {
        this.order_status = order_status;
    }
}
