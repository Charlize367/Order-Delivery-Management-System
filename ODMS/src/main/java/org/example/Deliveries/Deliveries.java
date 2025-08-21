package org.example.Deliveries;


import jakarta.persistence.*;
import org.example.Orders.Orders;
import org.example.Users.Users;

import java.sql.Time;
import java.util.Objects;

@Entity
public class Deliveries {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer delivery_ID;


    @ManyToOne(cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    @JoinColumn(name = "user_ID")
    private Users delivery_men;


    @ManyToOne(cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    @JoinColumn(name = "order_ID")
    private Orders orders;

    private String delivery_status;
    private String address;
    private Time estimated_time;
    private Time delivered_time;

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

    public Users getDelivery_men() {
        return delivery_men;
    }

    public void setDelivery_men(Users delivery_men) {
        this.delivery_men = delivery_men;
    }

    public String getDelivery_status() {
        return delivery_status;
    }

    public void setDelivery_status(String delivery_status) {
        this.delivery_status = delivery_status;
    }

    public Time getEstimated_time() {
        return estimated_time;
    }

    public void setEstimated_time(Time estimated_time) {
        this.estimated_time = estimated_time;
    }

    public Time getDelivered_time() {
        return delivered_time;
    }

    public void setDelivered_time(Time delivered_time) {
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
        return Objects.equals(delivery_ID, that.delivery_ID) && Objects.equals(orders, that.orders) && Objects.equals(delivery_men, that.delivery_men) && Objects.equals(delivery_status, that.delivery_status) && Objects.equals(estimated_time, that.estimated_time) && Objects.equals(delivered_time, that.delivered_time)  && Objects.equals(address, that.address);
    }

    @Override
    public int hashCode() {
        return Objects.hash(delivery_ID, orders, delivery_men, delivery_status, estimated_time, delivered_time, address);
    }


}
