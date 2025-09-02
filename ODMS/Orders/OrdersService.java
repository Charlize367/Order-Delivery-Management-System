package org.example.Orders;


import jakarta.persistence.EntityNotFoundException;
import org.example.Basket.Basket;
import org.example.OrderItems.OrderItems;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrdersService {
    private final OrdersRepository ordersRepository;

    private final UsersRepository usersRepository;

    public OrdersService(OrdersRepository ordersRepository, UsersRepository usersRepository) {
        this.ordersRepository = ordersRepository;
        this.usersRepository = usersRepository;
    }

    public List<Orders> getAllOrders() {
        return ordersRepository.findAll();
    }

    public List<Orders> getOrderByUser(Integer user_ID) {
        Users users = usersRepository.findById(user_ID)
                .orElseThrow(() -> new EntityNotFoundException("User basket not found"));
        return ordersRepository.findByCustomer(users);
    }



    public void addOrders(Orders orders) {
        ordersRepository.save(orders);
    }


    public Orders updateOrders(Orders orders, Integer id) {
        Optional<Orders> order = ordersRepository.findById(id);
        if (order.isPresent()) {
            ordersRepository.save(orders);
        }
        else {
            return null;
        }
        return orders;
    }

    public void deleteOrders(Orders orders, Integer id) {
        Optional<Orders> order = ordersRepository.findById(id);
        if (order.isPresent()) {
            ordersRepository.delete(orders);
        }
        else {
            return;
        }
    }

    public Orders getOrdersById(Integer id) {
        return ordersRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
