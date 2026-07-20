package org.example.Orders;

import org.example.Basket.Basket;
import org.example.Basket.BasketRequest;
import org.example.Basket.BasketResponse;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogMapper;
import org.example.Catalog.CatalogResponse;
import org.example.OrderItems.OrderItemsMapper;
import org.example.Users.UserMapper;
import org.example.Users.Users;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {


    private final UserMapper userMapper;
    private final OrderItemsMapper orderItemsMapper;

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
        orderResponse.setOrder_date(order.getOrder_date());
        orderResponse.setOrder_address(order.getOrder_address());
        orderResponse.setOrder_notes(order.getOrder_notes());
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
                    orderResponse.setOrder_date(order.getOrder_date());
                    orderResponse.setOrder_address(order.getOrder_address());
                    orderResponse.setOrder_notes(order.getOrder_notes());
                    orderResponse.setOrderItems(orderItemsMapper.toListResponse(order.getOrderItems()));
                    return orderResponse;
                })
                .collect(Collectors.toList());
    }

}
