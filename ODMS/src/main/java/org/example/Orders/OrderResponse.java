package org.example.Orders;

import org.example.OrderItems.OrderItemsResponse;
import org.example.Users.UserResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class OrderResponse {

    private Long orderId;
    private UserResponse customer;
    private LocalDate order_date;
    private BigDecimal order_price;
    private String order_status;

    private String payment_status;
    private String order_address;
    private String order_notes;

    private BigDecimal taxAmount;

    private BigDecimal deliveryAmount;

    private BigDecimal discountAmount;
    private BigDecimal tip;
    private String checkoutUrl;
    private List<OrderItemsResponse> orderItems;

    private Double destination_lat;
    private Double destination_lang;



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
        this.order_address = order_address;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public void setCheckoutUrl(String checkoutUrl) {
        this.checkoutUrl = checkoutUrl;
    }

    public String getPayment_status() {
        return payment_status;
    }

    public void setPayment_status(String payment_status) {
        this.payment_status = payment_status;
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

    public BigDecimal getOrder_price() {
        return order_price;
    }

    public void setOrder_price(BigDecimal order_price) {
        this.order_price = order_price;
    }

    public String getOrder_status() {
        return order_status;
    }

    public void setOrder_status(String order_status) {
        this.order_status = order_status;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getDeliveryAmount() {
        return deliveryAmount;
    }

    public void setDeliveryAmount(BigDecimal deliveryAmount) {
        this.deliveryAmount = deliveryAmount;
    }

    public BigDecimal getTip() {
        return tip;
    }

    public void setTip(BigDecimal tip) {
        this.tip = tip;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public Double getDestination_lat() {
        return destination_lat;
    }

    public void setDestination_lat(Double destination_lat) {
        this.destination_lat = destination_lat;
    }

    public Double getDestination_lang() {
        return destination_lang;
    }

    public void setDestination_lang(Double destination_lang) {
        this.destination_lang = destination_lang;
    }
}
