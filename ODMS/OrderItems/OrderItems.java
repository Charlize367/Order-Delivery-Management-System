package org.example.OrderItems;

import jakarta.persistence.*;
import org.example.Catalog.Catalog;
import org.example.Orders.Orders;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
public class OrderItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderItems_ID;

    @ManyToOne( fetch=FetchType.EAGER)
    @JoinColumn(name = "order_ID")
    private Orders orders;

    @ManyToOne
    private Catalog order_catalog;
    private Integer quantity;
    private Integer subtotal;


    public OrderItems(){}


    public Integer getOrderItems_ID() {
        return orderItems_ID;
    }

    public void setOrderItems_ID(Integer orderItems_ID) {
        this.orderItems_ID = orderItems_ID;
    }

    public Orders getOrders() {
        return orders;
    }

    public void setOrders(Orders orders) {
        this.orders = orders;
    }

    public Catalog getOrder_catalog() {
        return order_catalog;
    }

    public void setOrder_catalog(Catalog order_catalog) {
        this.order_catalog = order_catalog;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Integer subtotal) {
        this.subtotal = subtotal;
    }



    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        OrderItems that = (OrderItems) o;
        return Objects.equals(orderItems_ID, that.orderItems_ID) && Objects.equals(orders, that.orders) && Objects.equals(order_catalog, that.order_catalog) && Objects.equals(quantity, that.quantity) && Objects.equals(subtotal, that.subtotal);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderItems_ID, orders, order_catalog, quantity, subtotal);
    }
}
