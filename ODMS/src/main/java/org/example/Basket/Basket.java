package org.example.Basket;


import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.example.Catalog.Catalog;
import org.example.Users.Users;

import java.util.Objects;

@Entity
public class Basket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long basketId;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name = "user_ID", nullable = false)
    @NotNull(message = "Customer is required")
    private Users customer;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name = "catalog_ID", nullable = false)
    @NotNull(message = "Catalog is required")
    private Catalog catalog;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Stock must be at least 0")
    private Integer quantity;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Price must not exceed 1,000,000")
    private Double subtotal;


    public Basket(Long basketId, Users customer, Catalog catalog, Integer quantity, Double subtotal) {
        this.basketId = basketId;
        this.customer = customer;
        this.catalog = catalog;
        this.quantity = quantity;
        this.subtotal = subtotal;
    }


    public Basket(){}


    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Long getBasketId() {
        return basketId;
    }

    public void setBasketId(Long basketId) {
        this.basketId = basketId;
    }

    public Catalog getCatalog() {
        return catalog;
    }

    public void setCatalog(Catalog catalog) {
        this.catalog = catalog;
    }

    public Users getCustomer() {
        return customer;
    }

    public void setCustomer(Users customer) {
        this.customer = customer;
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
        Basket basket = (Basket) o;
        return Objects.equals(basketId, basket.basketId) && Objects.equals(customer, basket.customer) && Objects.equals(catalog, basket.catalog) && Objects.equals(quantity, basket.quantity) && Objects.equals(subtotal, basket.subtotal);
    }

    @Override
    public int hashCode() {
        return Objects.hash(basketId, customer, catalog, quantity, subtotal);
    }


}
