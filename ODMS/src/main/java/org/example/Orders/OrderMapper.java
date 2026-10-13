package org.example.Orders;

import org.example.Basket.Basket;
import org.example.Basket.BasketRequest;
import org.example.Basket.BasketResponse;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogMapper;
import org.example.Catalog.CatalogResponse;
import org.example.OrderItems.OrderItemsMapper;
import org.example.Payment.Payment;
import org.example.Payment.PaymentRepository;
import org.example.Payment.PaymentStatus;
import org.example.Users.UserMapper;
import org.example.Users.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class OrderMapper {


    private final UserMapper userMapper;
    private final OrderItemsMapper orderItemsMapper;


    @Autowired
    private PaymentRepository paymentRepository;

    public OrderMapper(UserMapper userMapper, OrderItemsMapper orderItemsMapper) {
        this.userMapper = userMapper;
        this.orderItemsMapper = orderItemsMapper;
    }


    public OrderResponse toResponse(Orders order) {


        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setOrderId(order.getOrderId());
        orderResponse.setCustomer(userMapper.toResponse(order.getCustomer()));
        orderResponse.setOrder_status(order.getOrder_status().toString());
        orderResponse.setOrder_price(order.getOrder_price());
        orderResponse.setTaxAmount(order.getTaxAmount());
        orderResponse.setDeliveryAmount(order.getDeliveryAmount());
        orderResponse.setDiscountAmount(order.getDiscountAmount());
        orderResponse.setTip(order.getTip());
        orderResponse.setOrder_date(order.getOrder_date());
        orderResponse.setOrder_address(order.getOrder_address());
        orderResponse.setOrder_notes(order.getOrder_notes());
        orderResponse.setDestination_lat(order.getDestination_lat());
        orderResponse.setDestination_lang(order.getDestination_lng());

        paymentRepository.findByOrderOrderId(order.getOrderId())
                .ifPresentOrElse(
                        payment -> orderResponse.setPayment_status(payment.getStatus().toString()),
                        () -> orderResponse.setPayment_status(null)
                );
        orderResponse.setOrderItems(orderItemsMapper.toListResponse(order.getOrderItems()));
        return orderResponse;
    }

    public List<OrderResponse> toListResponse(List<Orders> orders) {
        return orders.stream()
                .map(order -> {
                    OrderResponse orderResponse = new OrderResponse();
                    orderResponse.setOrderId(order.getOrderId());
                    orderResponse.setCustomer(userMapper.toResponse(order.getCustomer()));
                    orderResponse.setOrder_status(order.getOrder_status().toString());
                    orderResponse.setOrder_price(order.getOrder_price());
                    orderResponse.setTaxAmount(order.getTaxAmount());
                    orderResponse.setDeliveryAmount(order.getDeliveryAmount());
                    orderResponse.setDiscountAmount(order.getDiscountAmount());
                    orderResponse.setTip(order.getTip());
                    orderResponse.setOrder_date(order.getOrder_date());
                    orderResponse.setOrder_address(order.getOrder_address());
                    orderResponse.setOrder_notes(order.getOrder_notes());
                    orderResponse.setOrderItems(orderItemsMapper.toListResponse(order.getOrderItems()));
                    orderResponse.setDestination_lat(order.getDestination_lat());
                    orderResponse.setDestination_lang(order.getDestination_lng());
                    return orderResponse;
                })
                .collect(Collectors.toList());
    }

}
