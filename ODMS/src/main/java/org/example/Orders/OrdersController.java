package org.example.Orders;

import org.aspectj.weaver.ast.Or;
import org.example.Basket.Basket;
import org.example.Basket.BasketRepository;
import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryRepository;
import org.example.OrderItems.OrderItems;
import org.example.OrderItems.OrderItemsRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("orders")
public class OrdersController {

    @Autowired
    OrdersRepository ordersRepository;
    private final OrdersService ordersService;

    @Autowired
    UsersRepository usersRepository;

    @Autowired
    BasketRepository basketRepository;

    @Autowired
    OrderItemsRepository orderItemsRepository;

    @Autowired
    DeliveryRepository deliveryRepository;


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


    @GetMapping("/users/{user_ID}")
    public List<Orders> getOrderByUser(@PathVariable Integer user_ID){
        return ordersService.getOrderByUser(user_ID);
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

    @PostMapping("/users/{user_ID}")
    public Orders addUserToOrders(@PathVariable int user_ID, @RequestBody OrderRequest orderRequest) {


        Users users = usersRepository.findById(user_ID).get();
        List<Basket> userBasket = basketRepository.findByCustomer(users);
        LocalDate currentDate = LocalDate.now();

        Orders orders = new Orders();
        orders.setCustomer(users);
        orders.setOrder_status("Confirmed");
        orders.setOrder_date(currentDate);
        orders.setOrder_price(0.0);

        ordersRepository.save(orders);

        double total =  0;

        for (Basket basketItem : userBasket) {
            OrderItems orderItem = new OrderItems();
            orderItem.setOrder_catalog(basketItem.getCatalog());
            orderItem.setOrders(orders);
            orderItem.setQuantity(basketItem.getQuantity());
            orderItem.setSubtotal(basketItem.getSubtotal());
            orderItemsRepository.save(orderItem);

            total += orderItem.getSubtotal();
        }

        orders.setOrder_price(total);

        Deliveries deliveries = new Deliveries();
        deliveries.setOrders(orders);
        deliveries.setDelivery_status("Pending Assignment");
        deliveries.setAddress(orderRequest.getAddress());
        deliveryRepository.save(deliveries);

        return ordersRepository.save(orders);


    }




    @DeleteMapping("/{orders_ID}")
    public ResponseEntity<Orders> deleteOrders(@PathVariable Integer orders_ID, Orders orders) {
        ordersService.deleteOrders(orders, orders_ID);
        return null;
    }
}
