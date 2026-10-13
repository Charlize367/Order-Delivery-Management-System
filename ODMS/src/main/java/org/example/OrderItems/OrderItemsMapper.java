package org.example.OrderItems;

import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogMapper;
import org.example.Combo.ComboMapper;
import org.example.Orders.Orders;
import org.example.OrderItemModifier.OrderItemModifierMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class OrderItemsMapper {

    private final CatalogMapper catalogMapper;
    private final ComboMapper comboMapper;
    private final OrderItemModifierMapper orderItemModifierMapper;


    public OrderItemsMapper(
            CatalogMapper catalogMapper,
            ComboMapper comboMapper,
            OrderItemModifierMapper orderItemModifierMapper
    ) {
        this.catalogMapper = catalogMapper;
        this.comboMapper = comboMapper;
        this.orderItemModifierMapper = orderItemModifierMapper;
    }

    public OrderItems toEntity(
            OrderItemsRequest req,
            Catalog catalog,
            Orders order
    ) {

        OrderItems orderItems = new OrderItems();

        orderItems.setOrder_catalog(catalog);
        orderItems.setQuantity(req.getQuantity());
        orderItems.setSubtotal(req.getSubtotal());
        orderItems.setOrders(order);

        return orderItems;
    }

    public OrderItemsResponse toResponse(OrderItems orderItems) {

        OrderItemsResponse orderItemsResponse = new OrderItemsResponse();

        orderItemsResponse.setOrderItemsId(
                orderItems.getOrderItemsId()
        );

        if (orderItems.getOrder_catalog() != null) {
            orderItemsResponse.setCatalog(
                    catalogMapper.toResponse(
                            orderItems.getOrder_catalog()
                    )
            );
        }

        if (orderItems.getCombo() != null) {
            orderItemsResponse.setCombo(
                    comboMapper.toResponse(
                            orderItems.getCombo()
                    )
            );
        }

        orderItemsResponse.setQuantity(
                orderItems.getQuantity()
        );

        orderItemsResponse.setSubtotal(
                orderItems.getSubtotal()
        );

        orderItemsResponse.setSpecialInstructions(
                orderItems.getSpecialInstructions()
        );

        if (orderItems.getOrderItemModifiers() != null) {
            orderItemsResponse.setOrderItemModifiers(
                    orderItems.getOrderItemModifiers()
                            .stream()
                            .map(orderItemModifierMapper::toResponse)
                            .collect(Collectors.toList())
            );
        }

        return orderItemsResponse;
    }

    public List<OrderItemsResponse> toListResponse(
            List<OrderItems> orderItems
    ) {

        return orderItems.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}