package org.example.OrderItemModifier;

import jakarta.persistence.*;
import org.example.ModifierOption.ModifierOption;

import org.example.OrderItems.OrderItems;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
public class OrderItemModifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_modifier_id")
    private Long orderItemModifierId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItems orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modifier_option_id", nullable = false)
    private ModifierOption modifierOption;

    // Snapshot of the option's price adjustment at the time it was added to the order,
    // so later edits to ModifierOption.priceAdjustment don't retroactively change past orders.
    @Column(name = "price_adjustment", nullable = false)
    private BigDecimal priceAdjustment;

    public OrderItemModifier() {
    }

    public OrderItemModifier(Long orderItemModifierId, OrderItems orderItem, ModifierOption modifierOption, BigDecimal priceAdjustment) {
        this.orderItemModifierId = orderItemModifierId;
        this.orderItem = orderItem;
        this.modifierOption = modifierOption;
        this.priceAdjustment = priceAdjustment;
    }

    public Long getOrderItemModifierId() {
        return orderItemModifierId;
    }

    public void setOrderItemModifierId(Long orderItemModifierId) {
        this.orderItemModifierId = orderItemModifierId;
    }

    public OrderItems getOrderItem() {
        return orderItem;
    }

    public void setOrderItem(OrderItems orderItem) {
        this.orderItem = orderItem;
    }

    public ModifierOption getModifierOption() {
        return modifierOption;
    }

    public void setModifierOption(ModifierOption modifierOption) {
        this.modifierOption = modifierOption;
    }

    public BigDecimal getPriceAdjustment() {
        return priceAdjustment;
    }

    public void setPriceAdjustment(BigDecimal priceAdjustment) {
        this.priceAdjustment = priceAdjustment;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderItemModifier)) return false;
        OrderItemModifier that = (OrderItemModifier) o;
        return Objects.equals(orderItemModifierId, that.orderItemModifierId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderItemModifierId);
    }
}