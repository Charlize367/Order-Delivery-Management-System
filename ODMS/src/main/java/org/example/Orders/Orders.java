package org.example.Orders;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.validation.constraints.*;
import org.example.Basket.Basket;
import org.example.Deliveries.Deliveries;
import org.example.OrderItems.OrderItems;
import org.example.Users.Users;
import org.springframework.cglib.core.Local;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
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

    @NotBlank(message = "Order status cannot be blank")
    @Size(min = 1, max = 50, message = "Order status must have at least 1-50 characters")
    private String order_status;

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
        return Objects.equals(orderId, orders.orderId) && Objects.equals(customer, orders.customer) && Objects.equals(order_date, orders.order_date) && Objects.equals(order_price, orders.order_price) && Objects.equals(order_status, orders.order_status);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderId, customer, order_date, order_price, order_status);
    }


}
