package org.example.Deliveries;

import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogMapper;
import org.example.Catalog.CatalogResponse;
import org.example.OrderItems.OrderItems;
import org.example.OrderItems.OrderItemsRequest;
import org.example.OrderItems.OrderItemsResponse;
import org.example.Orders.OrderMapper;
import org.example.Orders.Orders;
import org.example.Users.UserMapper;
import org.example.Users.Users;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class DeliveryMapper {

    private final OrderMapper orderMapper;
    private final UserMapper userMapper;

    public DeliveryMapper(OrderMapper orderMapper, UserMapper userMapper) {
        this.userMapper = userMapper;
        this.orderMapper = orderMapper;
    }

    public Deliveries toEntity(DeliveryRequest req, Orders order, Users deliveryMen) {

        Deliveries delivery = new Deliveries();
        delivery.setDeliveryMen(deliveryMen);
        delivery.setDelivery_status(req.getDelivery_status());
        delivery.setOrders(order);
        delivery.setAddress(req.getAddress());
        delivery.setEstimated_time(req.getEstimated_time());
        delivery.setDelivered_time(req.getDelivered_time());
        return delivery;
    }

    public DeliveryResponse toResponse(Deliveries delivery) {
        DeliveryResponse deliveryResponse = new DeliveryResponse();

        if(delivery.getDeliveryMen() != null) {
            deliveryResponse.setDeliveryMen(userMapper.toResponse(delivery.getDeliveryMen()));
        }
        deliveryResponse.setDeliveryId(delivery.getDeliveryId());
        deliveryResponse.setDelivery_status(delivery.getDelivery_status());
        deliveryResponse.setOrder(orderMapper.toResponse(delivery.getOrders()));
        deliveryResponse.setAddress(delivery.getAddress());
        deliveryResponse.setEstimated_time(delivery.getEstimated_time());
        deliveryResponse.setDelivered_time(delivery.getDelivered_time());
        return deliveryResponse;
    }

    public List<DeliveryResponse> toListResponse(List<Deliveries> deliveries) {
        return deliveries.stream()
                .map(delivery -> {
                    DeliveryResponse deliveryResponse = new DeliveryResponse();

                    if(delivery.getDeliveryMen() != null) {
                        deliveryResponse.setDeliveryMen(userMapper.toResponse(delivery.getDeliveryMen()));
                    }
                    deliveryResponse.setDeliveryId(delivery.getDeliveryId());
                    deliveryResponse.setDelivery_status(delivery.getDelivery_status());
                    deliveryResponse.setOrder(orderMapper.toResponse(delivery.getOrders()));
                    deliveryResponse.setAddress(delivery.getAddress());
                    deliveryResponse.setEstimated_time(delivery.getEstimated_time());
                    deliveryResponse.setDelivered_time(delivery.getDelivered_time());
                    return deliveryResponse;
                })
                .collect(Collectors.toList());
    }
}
