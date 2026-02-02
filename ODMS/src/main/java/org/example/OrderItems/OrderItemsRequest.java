package org.example.OrderItems;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.example.Catalog.Catalog;
import org.example.Orders.Orders;

public class OrderItemsRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Catalog ID is required")
    private Long catalogId;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock must be at least 0")
    private Integer quantity;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.01", message = "Subtotal must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Subtotal must not exceed 1,000,000")
    private Double subtotal;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
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
}
