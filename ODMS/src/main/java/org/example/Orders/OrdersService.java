package org.example.Orders;


import jakarta.persistence.EntityNotFoundException;
import org.example.Basket.Basket;
import org.example.Basket.BasketRepository;
import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryRepository;
import org.example.OrderItems.OrderItems;
import org.example.OrderItems.OrderItemsRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class OrdersService {

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BasketRepository basketRepository;

    @Autowired
    private OrderItemsRepository orderItemsRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;


    public List<Orders> getAllOrders() {
        return ordersRepository.findAll();
    }

    public List<Orders> getOrderByUser(Long user_ID) {
        Users users = usersRepository.findById(user_ID)
                .orElseThrow(() -> new EntityNotFoundException("User basket not found"));
        return ordersRepository.findByCustomer(users);
    }

    public Orders addOrders(Long userId, OrderRequest orderRequest) {
        Users users = usersRepository.findById(userId).get();
        List<Basket> userBasket = basketRepository.findByCustomer(users);
        LocalDate currentDate = LocalDate.now();

        Orders orders = new Orders();
        orders.setCustomer(users);
        orders.setOrder_status("Order Placed");
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

        ordersRepository.save(orders);
        basketRepository.deleteAll(userBasket);

        return orders;

    }


    public Orders updateOrderStatus(Long orderId, OrderStatus orderStatus) {
        Orders orders = ordersRepository.findById(orderId).get();
        orders.setOrder_status(orderStatus.getOrder_status());
        return ordersRepository.save(orders);
    }

    public void deleteOrders(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        orderItemsRepository.deleteByOrders(order);
        deliveryRepository.deleteByOrders(order);
        ordersRepository.deleteById(orderId);
    }

    public Orders getOrdersById(Long id) {
        return ordersRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
