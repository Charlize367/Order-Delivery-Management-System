package org.example.Orders;


import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.example.Basket.Basket;
import org.example.Deliveries.Deliveries;
import org.example.OrderItems.OrderItems;
import org.example.Users.Users;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Entity
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer order_ID;

    @ManyToOne(cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    @JoinColumn(name = "user_ID")
    private Users customer;

    private Date order_date;
    private double order_price;
    private String order_status;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    private List<OrderItems> orderItems;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    private List<Deliveries> deliveries;

    public Orders(){}



    public Integer getOrder_ID() {
        return order_ID;
    }

    public void setOrder_ID(Integer order_ID) {
        this.order_ID = order_ID;
    }

    public Users getCustomer() {
        return customer;
    }

    public void setCustomer(Users customer) {
        this.customer = customer;
    }

    public Date getOrder_date() {
        return order_date;
    }

    public void setOrder_date(Date order_date) {
        this.order_date = order_date;
    }

    public double getOrder_price() {
        return order_price;
    }

    public void setOrder_price(double order_price) {
        this.order_price = order_price;
    }

    public String getOrder_status() {
        return order_status;
    }

    public void setOrder_status(String order_status) {
        this.order_status = order_status;
    }



    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Orders orders = (Orders) o;
        return Objects.equals(order_ID, orders.order_ID) && Objects.equals(customer, orders.customer) && Objects.equals(order_date, orders.order_date) && Objects.equals(order_price, orders.order_price) && Objects.equals(order_status, orders.order_status);
    }

    @Override
    public int hashCode() {
        return Objects.hash(order_ID, customer, order_date, order_price, order_status);
    }


}
