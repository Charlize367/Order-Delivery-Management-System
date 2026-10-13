package org.example.OrderItems;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.example.Catalog.Catalog;
import org.example.Combo.Combo;
import org.example.OrderItemModifier.OrderItemModifier;
import org.example.Orders.Orders;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
public class OrderItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderItemsId;

    @ManyToOne( fetch=FetchType.EAGER)
    @JoinColumn(name = "order_ID")
    @NotNull(message = "Order is required")
    private Orders orders;

    @ManyToOne
    private Catalog order_catalog;

    @ManyToOne
    private Combo combo;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock must be at least 0")
    private Integer quantity;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.01", message = "Subtotal must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Subtotal must not exceed 1,000,000")
    private BigDecimal subtotal;

    @NotNull
    @Column(nullable = false)
    private Long tenantId = 1L;


    @OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemModifier> orderItemModifiers = new ArrayList<>();


    @Size(max = 500, message = "Special instructions must not exceed 500 characters")
    private String specialInstructions;


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

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public List<OrderItemModifier> getOrderItemModifiers() {
        return orderItemModifiers;
    }

    public void setOrderItemModifiers(List<OrderItemModifier> orderItemModifiers) {
        this.orderItemModifiers = orderItemModifiers;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }


    public Combo getCombo() {
        return combo;
    }

    public void setCombo(Combo combo) {
        this.combo = combo;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        OrderItems that = (OrderItems) o;
        return Objects.equals(orderItemsId, that.orderItemsId) && Objects.equals(orders, that.orders) && Objects.equals(order_catalog, that.order_catalog) && Objects.equals(quantity, that.quantity) && Objects.equals(subtotal, that.subtotal) && Objects.equals(tenantId, that.tenantId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderItemsId, orders, order_catalog, quantity, subtotal, tenantId);
    }
}
