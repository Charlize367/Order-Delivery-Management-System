package org.example.OrderItems;

import org.example.Catalog.CatalogResponse;
import org.example.Combo.ComboResponse;
import org.example.OrderItemModifier.OrderItemModifierResponse;
import org.example.Orders.OrderResponse;

import java.math.BigDecimal;
import java.util.List;

public class OrderItemsResponse {

    private Long orderItemsId;
    private OrderResponse order;
    private CatalogResponse catalog;
    private ComboResponse combo;
    private Integer quantity;
    private BigDecimal subtotal;
    private String specialInstructions;

    private List<OrderItemModifierResponse> orderItemModifiers;


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

    public ComboResponse getCombo() {
        return combo;
    }

    public void setCombo(ComboResponse combo) {
        this.combo = combo;
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

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public List<OrderItemModifierResponse> getOrderItemModifiers() {
        return orderItemModifiers;
    }

    public void setOrderItemModifiers(List<OrderItemModifierResponse> orderItemModifiers) {
        this.orderItemModifiers = orderItemModifiers;
    }
}