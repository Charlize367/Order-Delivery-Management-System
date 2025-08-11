package org.example.Orders;

import org.aspectj.weaver.ast.Or;
import org.example.Deliveries.Deliveries;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("orders")
public class OrdersController {

    @Autowired
    OrdersRepository ordersRepository;
    private final OrdersService ordersService;

    @Autowired
    UsersRepository usersRepository;



    public OrdersController(OrdersService ordersService) {
        this.ordersService = ordersService;
    }

    @GetMapping
    public List<Orders> getOrders() {
        return ordersService.getAllOrders();
    }

    @GetMapping("{id}")
    public Orders getOrdersById(@PathVariable int id) {
        return ordersService.getOrdersById(id);
    }

    @PostMapping
    public ResponseEntity<Orders> createOrders(@RequestBody Orders orders) {
        ordersService.addOrders(orders);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{orders_ID}")
    public ResponseEntity<Orders> updateOrders(@PathVariable int orders_ID, @RequestBody Orders orders) {
        Orders updateOrders = ordersService.updateOrders(orders, orders_ID);
        return new ResponseEntity<>(updateOrders, HttpStatus.OK);
    }

    @PutMapping("/users/{user_ID}")
    public Orders addUserToOrders(@PathVariable int user_ID, @RequestBody Orders orders) {
        Users users = usersRepository.findById(user_ID).get();
        orders.setCustomer(users);
        return ordersRepository.save(orders);
    }


    @DeleteMapping("/{orders_ID}")
    public ResponseEntity<Orders> deleteOrders(@PathVariable Integer orders_ID, Orders orders) {
        ordersService.deleteOrders(orders, orders_ID);
        return null;
    }
}
