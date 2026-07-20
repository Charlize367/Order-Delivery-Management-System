package org.example.Orders;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.example.Deliveries.Deliveries;
import org.example.OrderItems.OrderItems;
import org.example.Users.Users;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Entity
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne(cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    @JoinColumn(name = "user_ID")
    @NotNull(message = "Customer is required")
    private Users customer;

    @NotNull(message = "Order date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate order_date;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Price must not exceed 1,000,000")
    private Double order_price;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Order status cannot be blank")
    @Size(min = 1, max = 50, message = "Order status must have at least 1-50 characters")
    private OrderStatuses order_status;

    private String order_notes;

    private OrderCancellationReason order_cancel_reason;


    @NotBlank(message = "Address cannot be blank")
    @Size(min = 1, max = 50, message = "Address must have at least 1-50 characters")
    private String order_address;

    @OneToMany(mappedBy = "orders", fetch=FetchType.EAGER)
    private List<OrderItems> orderItems;

    @OneToMany(mappedBy = "orders", fetch=FetchType.EAGER)
    private List<Deliveries> deliveries;

    public Orders(){}




    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Users getCustomer() {
        return customer;
    }

    public void setCustomer(Users customer) {
        this.customer = customer;
    }

    public LocalDate getOrder_date() {
        return order_date;
    }

    public void setOrder_date(LocalDate order_date) {
        this.order_date = order_date;
    }

    public double getOrder_price() {
        return order_price;
    }

    public void setOrder_price(double order_price) {
        this.order_price = order_price;
    }

    public OrderStatuses getOrder_status() {
        return order_status;
    }

    public void setOrder_status(OrderStatuses order_status) {
        this.order_status = order_status;
    }

    public String getOrder_notes() {
        return order_notes;
    }

    public void setOrder_notes(String order_notes) {
        this.order_notes = order_notes;
    }

    public String getOrder_address() {
        return order_address;
    }

    public void setOrder_address(String order_address) {
        this.order_address = order_address;
    }

    public void setOrder_price(Double order_price) {
        this.order_price = order_price;
    }

    public List<OrderItems> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItems> orderItems) {
        this.orderItems = orderItems;
    }

    public List<Deliveries> getDeliveries() {
        return deliveries;
    }

    public void setDeliveries(List<Deliveries> deliveries) {
        this.deliveries = deliveries;
    }


    public OrderCancellationReason getOrder_cancel_reason() {
        return order_cancel_reason;
    }

    public void setOrder_cancel_reason(OrderCancellationReason order_cancel_reason) {
        this.order_cancel_reason = order_cancel_reason;
    }





    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Orders orders = (Orders) o;
        return Objects.equals(orderId, orders.orderId) && Objects.equals(customer, orders.customer) && Objects.equals(order_date, orders.order_date) && Objects.equals(order_price, orders.order_price) && Objects.equals(order_status, orders.order_status) && Objects.equals(order_notes, orders.order_notes) && Objects.equals(order_address, orders.order_address);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderId, customer, order_date, order_price, order_status, order_notes, order_address);
    }


}
