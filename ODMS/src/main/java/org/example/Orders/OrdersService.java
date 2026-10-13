package org.example.Orders;


import com.stripe.exception.StripeException;
import jakarta.transaction.Transactional;
import org.example.Basket.Basket;
import org.example.Basket.BasketRepository;
import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryRepository;
import org.example.Events.OrderCancelledEvent;
import org.example.Events.OrderCreatedEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.ModifierOption.ModifierOption;
import org.example.OrderItemModifier.OrderItemModifier;
import org.example.OrderItemModifier.OrderItemModifierRepository;
import org.example.OrderItems.OrderItems;
import org.example.OrderItems.OrderItemsRepository;
import org.example.PageResponse;
import org.example.Payment.PaymentMethod;
import org.example.Payment.PaymentService;
import org.example.Pricing.PricingCalculator;
import org.example.PromoCode.PromoCodeService;
import org.example.PromoCode.PromoValidationResponse;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.example.Validator.OrderStatusTransitionValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


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
    private OrderItemModifierRepository orderItemModifierRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PromoCodeService promoCodeService;

    @Autowired
    private OrderMapper orderMapper;


    private static final Logger logger = LoggerFactory.getLogger(OrdersService.class);


    private final ApplicationEventPublisher publisher;

    private final OrderStatusTransitionValidator validator;

    private final PricingCalculator calculator;

    public OrdersService(ApplicationEventPublisher publisher, OrderStatusTransitionValidator validator, PricingCalculator calculator) {
        this.publisher = publisher;
        this.validator = validator;
        this.calculator = calculator;
    }

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"orders", "order"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }


    public List<OrderResponse> getAllOrders() {
        logger.info("Displaying all orders");
        return ordersRepository.findAll().stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Cacheable(value = "orders", key = "'page_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
    public PageResponse<OrderResponse> getOrders(Pageable pageable) {
        logger.info("Displaying all orders by page");


        Page<Orders> page = ordersRepository.findAll(pageable);

        Page<OrderResponse> mapped = page.map(orderMapper::toResponse);

        return new PageResponse<>(mapped);
    }

//    @Cacheable(value = "orders", key = "#userId")
    public List<OrderResponse> getOrderByUser(Long user_ID) {
        logger.info("Displaying order by user ID: {}", user_ID);
        Users users = usersRepository.findById(user_ID)
                .orElseThrow(() -> new ResourceNotFoundException("User  not found"));
        List<Orders> orders = ordersRepository.findByCustomer(users);
        return orderMapper.toListResponse(orders);
    }





    @Caching(
            put = {
                    @CachePut(value = "order", key = "#result.orderId")
            },
            evict = {
                    @CacheEvict(value = "orders", allEntries = true)
            }
    )
    @Transactional
    public OrderResponse addOrders(Long userId, OrderRequest orderRequest) throws StripeException {
        logger.info("Attempting to add new order for user ID: {}", userId);
        Users users = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Basket> userBasket = basketRepository.findByCustomer(users);
        LocalDate currentDate = LocalDate.now();


        BigDecimal total = userBasket.stream()
                .map(Basket::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = calculator.calculateTax(total);
        BigDecimal deliveryFee = calculator.calculateDeliveryFee();

        BigDecimal finalTotal = total
                .add(tax)
                .add(deliveryFee)
                .add(orderRequest.getTip());



        Orders orders = new Orders();
        orders.setCustomer(users);
        orders.setOrder_status(OrderStatuses.PENDING);
        orders.setOrder_date(currentDate);
        orders.setTaxAmount(tax);
        orders.setDeliveryAmount(deliveryFee);
        orders.setTip(orderRequest.getTip());
        orders.setOrder_price(finalTotal);
        orders.setOrder_address(orderRequest.getOrder_address());
        orders.setOrder_notes(orderRequest.getOrder_notes());
        orders.setDestination_lat(orders.getDestination_lat());
        orders.setDestination_lng(orders.getDestination_lng());




        ordersRepository.save(orders);





        List<OrderItems> orderItemsList = new ArrayList<>();



        for (Basket basketItem : userBasket) {

            OrderItems orderItem = new OrderItems();

            if(basketItem.getCatalog() != null) {
                orderItem.setOrder_catalog(basketItem.getCatalog());
            } else if (basketItem.getCombo() != null) {
                orderItem.setCombo(basketItem.getCombo());
            }
            orderItem.setOrders(orders);
            orderItem.setQuantity(basketItem.getQuantity());
            orderItem.setSubtotal(basketItem.getSubtotal());
            orderItem.setSpecialInstructions(basketItem.getSpecialInstructions());

            OrderItems savedOrderItem = orderItemsRepository.save(orderItem);

            List<OrderItemModifier> orderItemModifiers = new ArrayList<>();

            for (ModifierOption modifierOption : basketItem.getModifierOptions()) {

                OrderItemModifier orderItemModifier = new OrderItemModifier();

                orderItemModifier.setOrderItem(savedOrderItem);
                orderItemModifier.setModifierOption(modifierOption);
                orderItemModifier.setPriceAdjustment(modifierOption.getPriceAdjustment());

                orderItemModifiers.add(orderItemModifier);
            }

            savedOrderItem.setOrderItemModifiers(orderItemModifiers);

            orderItemsList.add(savedOrderItem);
        }




        orders.setOrderItems(orderItemsList);

        Deliveries deliveries = new Deliveries();
        deliveries.setOrders(orders);
        deliveries.setAddress(orderRequest.getOrder_address());
        if(orderRequest.getScheduledDeliveredTime() != null) {
            deliveries.setScheduledDeliveredTime(orderRequest.getScheduledDeliveredTime());
            orders.setOrder_status(OrderStatuses.SCHEDULED);
        }
        deliveryRepository.save(deliveries);



        BigDecimal modifierSum = orderItemsList.stream()
                .flatMap(orderItem -> orderItem.getOrderItemModifiers().stream())
                .map(OrderItemModifier::getPriceAdjustment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);


        Orders savedOrder = ordersRepository.save(orders);

        PromoValidationResponse discount;

        BigDecimal discountAmount = BigDecimal.valueOf(0.0);
        savedOrder.setDiscountAmount(BigDecimal.valueOf(0.0));

        if(orderRequest.getPromoCodeId() != null) {
            discount = promoCodeService.validatePromoCode(orderRequest.getPromoCodeId(), savedOrder.getOrderId());
            if(discount.valid()) {
                discountAmount = discount.discountAmount();
                savedOrder.setOrder_price(
                        savedOrder.getOrder_price()
                                .subtract(discountAmount)
                );
                savedOrder.setDiscountAmount(discountAmount);
            }
        }

        for (Basket basketItem : userBasket) {
            
            String name = "";
            
            if(basketItem.getCatalog() != null) {
                name = basketItem.getCatalog().getCatalogName();
            } else if(basketItem.getCombo() != null){
                name = basketItem.getCombo().getName();
            }
            System.out.println(
                    "Basket ID: " + basketItem.getBasketId() +
                            " Name: " + name +
                            " Qty: " + basketItem.getQuantity() +
                            " Subtotal: " + basketItem.getSubtotal() +
                            " Discount: " + "-" + discountAmount +
                            " Modifiers:  +" + modifierSum


            );
        }

        basketRepository.deleteAll(userBasket);

        String checkoutUrl = null;

        ordersRepository.save(savedOrder);

        if (orderRequest.getPayment_method() == PaymentMethod.CREDIT_CARD) {
            checkoutUrl = paymentService.createCheckoutSession(savedOrder.getOrderId());
        } else {
            publisher.publishEvent(new OrderCreatedEvent(savedOrder.getOrderId(), orderRequest.getPayment_method()));
        }

        logger.info("Successfully added new order for user ID: {}", userId);

        logger.info("Successfully added new order for user ID: {}", userId);
        OrderResponse response = orderMapper.toResponse(savedOrder);
        response.setCheckoutUrl(checkoutUrl); // add this field to OrderResponse
        return response;


    }



    @Caching(
            put = {
                    @CachePut(value = "order", key = "#result.orderId")
            },
            evict = {
                    @CacheEvict(value = "orders", allEntries = true)
            }
    )
    public OrderResponse cancelOrder(Long orderId, OrderCancellationReason reason) {
        logger.info("Updating order ID: {}", orderId);
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        validator.validate(order.getOrder_status(), OrderStatuses.CANCELLED);
        order.setOrder_status(OrderStatuses.CANCELLED);

        Orders savedOrder = ordersRepository.save(order);
        publisher.publishEvent(new OrderCancelledEvent(orderId, reason));
        logger.info("Successfully updated order ID: {}", orderId);
        return orderMapper.toResponse(savedOrder);
    }

    @Caching(evict = {
            @CacheEvict(value = "order", key = "#orderId"),
            @CacheEvict(value = "orders", allEntries = true)
    })
    public void deleteOrders(Long orderId) {
        logger.info("Deleting order ID: {}", orderId);
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        orderItemsRepository.deleteByOrders(order);
        deliveryRepository.deleteByOrders(order);
        ordersRepository.deleteById(orderId);
        logger.info("Successfully deleted order ID: {}", orderId);
    }



    @Cacheable(value = "order", key = "#orderId")
    public OrderResponse getOrdersById(Long orderId) {
        logger.info("Getting order ID: {}", orderId);
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Order not found.");
                });
        logger.info("Successfully fetched order ID: {}", orderId);
        return orderMapper.toResponse(order);
    }
}
