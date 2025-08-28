package org.example.Deliveries;


import jakarta.persistence.*;
import org.example.Orders.Orders;
import org.example.Users.Users;

import java.sql.Time;
import java.time.LocalTime;
import java.util.Objects;

@Entity
public class Deliveries {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer delivery_ID;


    @ManyToOne( fetch=FetchType.EAGER)
    @JoinColumn(name = "user_ID")
    private Users deliveryMen;


    @ManyToOne( fetch=FetchType.EAGER)
    @JoinColumn(name = "order_ID")
    private Orders orders;
    private String delivery_status;
    private String address;
    private LocalTime estimated_time;
    private LocalTime delivered_time;

    public Integer getDelivery_ID() {
        return delivery_ID;
    }

    public void setDelivery_ID(Integer delivery_ID) {
        this.delivery_ID = delivery_ID;
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
        return Objects.equals(delivery_ID, that.delivery_ID) && Objects.equals(orders, that.orders) && Objects.equals(deliveryMen, that.deliveryMen) && Objects.equals(delivery_status, that.delivery_status) && Objects.equals(estimated_time, that.estimated_time) && Objects.equals(delivered_time, that.delivered_time) && Objects.equals(address, that.address);
    }

    @Override
    public int hashCode() {
        return Objects.hash(delivery_ID, orders, deliveryMen, delivery_status, estimated_time, delivered_time, address);
    }


}
