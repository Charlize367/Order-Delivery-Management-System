package org.example.Combo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.example.Catalog.Catalog;
import org.example.ModifierOption.ModifierOption;
import org.example.OrderItems.OrderItems;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_item_combo_detail")
public class OrderItemComboDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderItemComboDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItems orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = false)
    private Integer quantity;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "order_item_combo_detail_modifier_options",
            joinColumns = @JoinColumn(name = "order_item_combo_detail_id"),
            inverseJoinColumns = @JoinColumn(name = "modifier_option_id")
    )
    private List<ModifierOption> modifierOptions = new ArrayList<>();

    public OrderItemComboDetail() {
    }

    public Long getOrderItemComboDetailId() {
        return orderItemComboDetailId;
    }

    public void setOrderItemComboDetailId(Long orderItemComboDetailId) {
        this.orderItemComboDetailId = orderItemComboDetailId;
    }

    public OrderItems getOrderItems() {
        return orderItem;
    }

    public void setOrderItem(OrderItems orderItem) {
        this.orderItem = orderItem;
    }

    public Catalog getCatalog() {
        return catalog;
    }

    public void setCatalog(Catalog catalog) {
        this.catalog = catalog;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public List<ModifierOption> getModifierOptions() {
        return modifierOptions;
    }

    public void setModifierOptions(List<ModifierOption> modifierOptions) {
        this.modifierOptions = modifierOptions;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderItemComboDetail)) return false;
        OrderItemComboDetail that = (OrderItemComboDetail) o;
        return orderItemComboDetailId != null &&
                orderItemComboDetailId.equals(that.orderItemComboDetailId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
