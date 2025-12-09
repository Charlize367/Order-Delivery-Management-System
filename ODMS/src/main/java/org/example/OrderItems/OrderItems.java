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
    private Long orderItemsId;

    @ManyToOne( fetch=FetchType.EAGER)
    @JoinColumn(name = "order_ID")
    private Orders orders;

    @ManyToOne
    private Catalog order_catalog;
    private Integer quantity;
    private Double subtotal;


    public OrderItems(){}


    public Long getOrderItemsId() {
        return orderItemsId;
    }

    public void setOrderItemsId(Long orderItemsId) {
        this.orderItemsId = orderItemsId;
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

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }



    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        OrderItems that = (OrderItems) o;
        return Objects.equals(orderItemsId, that.orderItemsId) && Objects.equals(orders, that.orders) && Objects.equals(order_catalog, that.order_catalog) && Objects.equals(quantity, that.quantity) && Objects.equals(subtotal, that.subtotal);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderItemsId, orders, order_catalog, quantity, subtotal);
    }
}
