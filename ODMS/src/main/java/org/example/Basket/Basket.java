package org.example.Basket;


import jakarta.persistence.*;
import org.example.Catalog.Catalog;
import org.example.Users.Users;

import java.util.Objects;

@Entity
public class Basket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer basket_ID;

    @ManyToOne(cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    @JoinColumn(name = "user_ID")
    private Users customer;


    @ManyToOne(cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    @JoinColumn(name = "catalog_ID")
    private Catalog catalog;

    private Integer quantity;

    private Integer subtotal;


    public Basket(){}


    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getBasket_ID() {
        return basket_ID;
    }

    public void setBasket_ID(Integer basket_ID) {
        this.basket_ID = basket_ID;
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
    public Integer getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Integer subtotal) {
        this.subtotal = subtotal;
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Basket basket = (Basket) o;
        return Objects.equals(basket_ID, basket.basket_ID) && Objects.equals(customer, basket.customer) && Objects.equals(catalog, basket.catalog) && Objects.equals(quantity, basket.quantity) && Objects.equals(subtotal, basket.subtotal);
    }

    @Override
    public int hashCode() {
        return Objects.hash(basket_ID, customer, catalog, quantity, subtotal);
    }


}
