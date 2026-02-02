package org.example.Orders;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.Basket.Basket;
import org.example.Basket.BasketRepository;
import org.example.Catalog.Catalog;
import org.example.Category.CategoryResponse;
import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryRepository;
import org.example.Exception.ResourceNotFoundException;
import org.example.OrderItems.OrderItems;
import org.example.OrderItems.OrderItemsRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Autowired
    private OrderMapper orderMapper;

    private static final Logger logger = LoggerFactory.getLogger(Orders.class);

    public List<OrderResponse> getAllOrders() {
        logger.info("Displaying all orders");
        return ordersRepository.findAll().stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    public Page<OrderResponse> getOrders(Pageable pageable) {
        logger.info("Displaying all orders by page");
        return ordersRepository.findAll(pageable)
                .map(orderMapper::toResponse);
    }

    public List<OrderResponse> getOrderByUser(Long user_ID) {
        logger.info("Displaying orders by user ID: {}", user_ID);
        Users users = usersRepository.findById(user_ID)
                .orElseThrow(() -> new ResourceNotFoundException("User basket not found"));
        List<Orders> orders = ordersRepository.findByCustomer(users);
        return orderMapper.toListResponse(orders);
    }

    @Transactional
    public OrderResponse addOrders(Long userId, OrderRequest orderRequest) {
        logger.info("Attempting to add new order for user ID: {}", userId);
        Users users = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Basket> userBasket = basketRepository.findByCustomer(users);
        LocalDate currentDate = LocalDate.now();


        double total =  userBasket.stream()
                .mapToDouble(Basket::getSubtotal)
                .sum();

        Orders orders = new Orders();
        orders.setCustomer(users);
        orders.setOrder_status("Order Placed");
        orders.setOrder_date(currentDate);
        orders.setOrder_price(total);


        ordersRepository.save(orders);



        for (Basket basketItem : userBasket) {
            OrderItems orderItem = new OrderItems();
            orderItem.setOrder_catalog(basketItem.getCatalog());
            orderItem.setOrders(orders);
            orderItem.setQuantity(basketItem.getQuantity());
            orderItem.setSubtotal(basketItem.getSubtotal());
            orderItemsRepository.save(orderItem);


        }

        orders.setOrder_price(total);

        Deliveries deliveries = new Deliveries();
        deliveries.setOrders(orders);
        deliveries.setDelivery_status("Pending Assignment");
        deliveries.setAddress(orderRequest.getAddress());

        deliveryRepository.save(deliveries);

        for (Basket basketItem : userBasket) {
            System.out.println(
                    "Basket ID: " + basketItem.getBasketId() +
                            " Catalog Name: " + basketItem.getCatalog().getCatalogName() +
                            " Qty: " + basketItem.getQuantity() +
                            " Subtotal: " + basketItem.getSubtotal()
            );
        }

        Orders savedOrder = ordersRepository.save(orders);
        basketRepository.deleteAll(userBasket);


        logger.info("Successfully added new order for user ID: {}", userId);
        return orderMapper.toResponse(savedOrder);

    }



    public OrderResponse updateOrderStatus(Long orderId, OrderStatus orderStatus) {
        logger.info("Updating order ID: {}", orderId);
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setOrder_status(orderStatus.getOrder_status());

        Orders savedOrder = ordersRepository.save(order);
        logger.info("Successfully updated order ID: {}", orderId);
        return orderMapper.toResponse(savedOrder);
    }

    public void deleteOrders(Long orderId) {
        logger.info("Deleting order ID: {}", orderId);
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        orderItemsRepository.deleteByOrders(order);
        deliveryRepository.deleteByOrders(order);
        ordersRepository.deleteById(orderId);
        logger.info("Successfully deleted order ID: {}", orderId);
    }



    @Cacheable("orders")
    public OrderResponse getOrdersById(Long id) {
        logger.info("Getting order ID: {}", id);
        Orders order = ordersRepository.findById(id)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Order not found.");
                });
        logger.info("Successfully fetched order ID: {}", id);
        return orderMapper.toResponse(order);
    }
}
