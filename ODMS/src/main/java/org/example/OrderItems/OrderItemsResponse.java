package org.example.OrderItems;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.example.Catalog.CatalogResponse;
import org.example.Orders.OrderResponse;

public class OrderItemsResponse {

    private Long orderItemsId;
    private OrderResponse order;
    private CatalogResponse catalog;
    private Integer quantity;
    private Double subtotal;


    public Long getOrderItemsId() {
        return orderItemsId;
    }

    public void setOrderItemsId(Long orderItemsId) {
        this.orderItemsId = orderItemsId;
    }

    public OrderResponse getOrder() {
        return order;
    }

    public void setOrder(OrderResponse order) {
        this.order = order;
    }

    public CatalogResponse getCatalog() {
        return catalog;
    }

    public void setCatalog(CatalogResponse catalog) {
        this.catalog = catalog;
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
