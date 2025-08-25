package org.example.Users;

import jakarta.persistence.*;
import org.example.Basket.Basket;
import org.example.Deliveries.Deliveries;
import org.example.Orders.Orders;


import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Entity

public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String username;
    private String password;
    private boolean enabled;
    private String role;

    @OneToMany(mappedBy = "customer", fetch=FetchType.EAGER)
    private List<Orders> orders;

    @OneToMany(mappedBy = "customer", fetch=FetchType.EAGER)
    private List<Basket> basket;

    @OneToMany(mappedBy = "deliveryMen", cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    private List<Deliveries> deliveries;



    public Users(Integer userId, String username, String password, Boolean enabled, String role) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.enabled = enabled;
        this.role = role;
    }

    public Users(){

    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }



    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Users users = (Users) o;
        return Objects.equals(userId, users.userId) && Objects.equals(username, users.username) && Objects.equals(password, users.password) && Objects.equals(enabled, users.enabled) && Objects.equals(role, users.role);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, username, password, enabled, role);
    }

}
