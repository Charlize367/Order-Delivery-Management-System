package org.example.OrderItems;

import jakarta.persistence.*;
import org.example.Catalog.Catalog;
import org.example.Orders.Orders;
import org.example.Users.Users;

import java.io.File;
import java.util.Objects;

@Entity
public class OrderItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderItems_ID;

    @ManyToOne(cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    @JoinColumn(name = "order_ID")
    private Orders orders;

    private String order_item;
    private String order_price;
    private File order_image;
    private Integer quantity;
    private Integer total_price;

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

    public String getOrder_item() {
        return order_item;
    }

    public void setOrder_item(String order_item) {
        this.order_item = order_item;
    }

    public String getOrder_price() {
        return order_price;
    }

    public void setOrder_price(String order_price) {
        this.order_price = order_price;
    }

    public File getOrder_image() {
        return order_image;
    }

    public void setOrder_image(File order_image) {
        this.order_image = order_image;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getTotal_price() {
        return total_price;
    }

    public void setTotal_price(Integer total_price) {
        this.total_price = total_price;
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        OrderItems that = (OrderItems) o;
        return Objects.equals(orderItems_ID, that.orderItems_ID) && Objects.equals(orders, that.orders) && Objects.equals(order_item, that.order_item) && Objects.equals(order_price, that.order_price) && Objects.equals(order_image, that.order_image) && Objects.equals(quantity, that.quantity) && Objects.equals(total_price, that.total_price);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderItems_ID, orders, order_item, order_price, order_image, quantity, total_price);
    }
}
