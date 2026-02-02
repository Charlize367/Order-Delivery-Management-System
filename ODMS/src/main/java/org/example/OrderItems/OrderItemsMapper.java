package org.example.OrderItems;

import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogMapper;
import org.example.Catalog.CatalogResponse;
import org.example.Orders.OrderMapper;
import org.example.Orders.OrderRequest;
import org.example.Orders.OrderResponse;
import org.example.Orders.Orders;
import org.example.Users.UserMapper;
import org.example.Users.Users;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class OrderItemsMapper {

    private final CatalogMapper catalogMapper;
    private final OrderMapper orderMapper;

    public OrderItemsMapper(CatalogMapper catalogMapper, OrderMapper orderMapper) {
        this.catalogMapper = catalogMapper;
        this.orderMapper = orderMapper;
    }

    public OrderItems toEntity(OrderItemsRequest req, Catalog catalog, Orders order) {

        OrderItems orderItems = new OrderItems();
        orderItems.setOrder_catalog(catalog);
        orderItems.setQuantity(req.getQuantity());
        orderItems.setSubtotal(req.getSubtotal());
        orderItems.setOrders(order);
        return orderItems;
    }

    public OrderItemsResponse toResponse(OrderItems orderItems) {
        OrderItemsResponse orderItemsResponse = new OrderItemsResponse();
        orderItemsResponse.setOrderItemsId(orderItems.getOrderItemsId());
        orderItemsResponse.setCatalog(catalogMapper.toResponse(orderItems.getOrder_catalog()));
        orderItemsResponse.setQuantity(orderItems.getQuantity());
        orderItemsResponse.setSubtotal(orderItems.getSubtotal());
        orderItemsResponse.setOrder(orderMapper.toResponse(orderItems.getOrders()));

        return orderItemsResponse;
    }

    public List<OrderItemsResponse> toListResponse(List<OrderItems> orderItems) {
        return orderItems.stream()
                .map(orderItem -> {
                    OrderItemsResponse orderItemsResponse = new OrderItemsResponse();
                    orderItemsResponse.setOrderItemsId(orderItem.getOrderItemsId());
                    orderItemsResponse.setCatalog(catalogMapper.toResponse(orderItem.getOrder_catalog()));
                    orderItemsResponse.setQuantity(orderItem.getQuantity());
                    orderItemsResponse.setSubtotal(orderItem.getSubtotal());
                    orderItemsResponse.setOrder(orderMapper.toResponse(orderItem.getOrders()));
                    return orderItemsResponse;
                })
                .collect(Collectors.toList());
    }
}
