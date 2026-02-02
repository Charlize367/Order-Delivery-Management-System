package org.example.Deliveries;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.Orders.Orders;
import org.example.Users.Users;

import java.sql.Time;
import java.time.LocalTime;
import java.util.Objects;

@Entity
public class Deliveries {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deliveryId;


    @ManyToOne( fetch=FetchType.EAGER)
    @JoinColumn(name = "user_ID")
    private Users deliveryMen;

    @ManyToOne( fetch=FetchType.EAGER)
    @JoinColumn(name = "order_ID")
    @NotNull(message = "Order is required")
    private Orders orders;

    @NotBlank(message = "Order status cannot be blank")
    @Size(min = 1, max = 50, message = "Order status must have at least 1-50 characters")
    private String delivery_status;

    @NotBlank(message = "Order status cannot be blank")
    @Size(min = 1, max = 50, message = "Order status must have at least 1-50 characters")
    private String address;


    private LocalTime estimated_time;


    private LocalTime delivered_time;

    public Deliveries(Long deliveryId, Users deliveryMen, Orders orders, String delivery_status, String address, LocalTime estimated_time, LocalTime delivered_time) {
        this.deliveryId = deliveryId;
        this.deliveryMen = deliveryMen;
        this.orders = orders;
        this.delivery_status = delivery_status;
        this.address = address;
        this.estimated_time = estimated_time;
        this.delivered_time = delivered_time;
    }

    public Deliveries() {

    }


    public Long getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Long deliveryId) {
        this.deliveryId = deliveryId;
    }

    public Orders getOrders() {
        return orders;
    }

    public void setOrders(Orders orders) {
        this.orders = orders;
    }

    public Users getDeliveryMen() {
        return deliveryMen;
    }

    public void setDeliveryMen(Users delivery_men) {
        this.deliveryMen = delivery_men;
    }

    public String getDelivery_status() {
        return delivery_status;
    }

    public void setDelivery_status(String delivery_status) {
        this.delivery_status = delivery_status;
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
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Deliveries that = (Deliveries) o;
        return Objects.equals(deliveryId, that.deliveryId) && Objects.equals(orders, that.orders) && Objects.equals(deliveryMen, that.deliveryMen) && Objects.equals(delivery_status, that.delivery_status) && Objects.equals(estimated_time, that.estimated_time) && Objects.equals(delivered_time, that.delivered_time) && Objects.equals(address, that.address);
    }

    @Override
    public int hashCode() {
        return Objects.hash(deliveryId, orders, deliveryMen, delivery_status, estimated_time, delivered_time, address);
    }


}
