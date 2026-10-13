package org.example.Basket;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.example.Catalog.Catalog;
import org.example.Combo.BasketComboItem;
import org.example.Combo.Combo;
import org.example.ModifierOption.ModifierOption;
import org.example.Users.Users;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
public class Basket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long basketId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_ID", nullable = false)
    @NotNull(message = "Customer is required")
    private Users customer;

    // A basket can contain either a catalog item OR a combo.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "catalog_ID", nullable = true)
    private Catalog catalog;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "combo_id", nullable = true)
    private Combo combo;

    @OneToMany(
            mappedBy = "basket",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<BasketComboItem> comboItems = new ArrayList<>();

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(
            value = "1000000.00",
            message = "Price must not exceed 1,000,000"
    )
    private BigDecimal subtotal;

    @NotNull
    @Column(nullable = false)
    private Long tenantId = 1L;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "basket_modifier_options",
            joinColumns = @JoinColumn(name = "basket_id"),
            inverseJoinColumns = @JoinColumn(name = "modifier_option_id")
    )
    private List<ModifierOption> modifierOptions = new ArrayList<>();

    @Size(
            max = 500,
            message = "Special instructions must not exceed 500 characters"
    )
    private String specialInstructions;


    public Basket(
            Long basketId,
            Users customer,
            Catalog catalog,
            Integer quantity,
            BigDecimal subtotal,
            Long tenantId
    ) {
        this.basketId = basketId;
        this.customer = customer;
        this.catalog = catalog;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.tenantId = tenantId;
    }

    public Basket() {
    }


    public Long getBasketId() {
        return basketId;
    }

    public void setBasketId(Long basketId) {
        this.basketId = basketId;
    }

    public Users getCustomer() {
        return customer;
    }

    public void setCustomer(Users customer) {
        this.customer = customer;
    }

    public Catalog getCatalog() {
        return catalog;
    }

    public void setCatalog(Catalog catalog) {
        this.catalog = catalog;
    }

    public Combo getCombo() {
        return combo;
    }

    public void setCombo(Combo combo) {
        this.combo = combo;
    }

    public List<BasketComboItem> getComboItems() {
        return comboItems;
    }

    public void setComboItems(List<BasketComboItem> comboItems) {
        this.comboItems = comboItems;
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

    public List<ModifierOption> getModifierOptions() {
        return modifierOptions;
    }

    public void setModifierOptions(List<ModifierOption> modifierOptions) {
        this.modifierOptions = modifierOptions;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Basket basket = (Basket) o;

        return Objects.equals(basketId, basket.basketId)
                && Objects.equals(customer, basket.customer)
                && Objects.equals(catalog, basket.catalog)
                && Objects.equals(quantity, basket.quantity)
                && Objects.equals(subtotal, basket.subtotal)
                && Objects.equals(tenantId, basket.tenantId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                basketId,
                customer,
                catalog,
                quantity,
                subtotal,
                tenantId
        );
    }
}