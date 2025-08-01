package org.example.Users;

import jakarta.persistence.*;
import org.example.Basket.Basket;
import org.example.Deliveries.Deliveries;
import org.example.Orders.Orders;

import java.util.List;
import java.util.Objects;

@Entity
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer user_ID;
    private String username;
    private String password;
    private String role;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    private List<Orders> orders;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    private List<Basket> basket;

    @OneToMany(mappedBy = "delivery_men", cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    private List<Deliveries> deliveries;

    public Users(Integer user_ID, String username, String password, String role) {
        this.user_ID = user_ID;
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public Users(){

    }

    public Integer getUser_ID() {
        return user_ID;
    }

    public void setUser_ID(Integer user_ID) {
        this.user_ID = user_ID;
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
        return Objects.equals(user_ID, users.user_ID) && Objects.equals(username, users.username) && Objects.equals(password, users.password) && Objects.equals(role, users.role);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user_ID, username, password, role);
    }

}
