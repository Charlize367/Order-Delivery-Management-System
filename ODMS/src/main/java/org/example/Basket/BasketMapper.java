package org.example.Basket;

import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogMapper;
import org.example.Catalog.CatalogRequest;
import org.example.Catalog.CatalogResponse;
import org.example.Category.Category;
import org.example.Users.UserMapper;
import org.example.Users.Users;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class BasketMapper {

    private final CatalogMapper catalogMapper;
    private final UserMapper userMapper;

    public BasketMapper(CatalogMapper catalogMapper, UserMapper userMapper) {
        this.catalogMapper = catalogMapper;
        this.userMapper = userMapper;
    }

    public Basket toEntity(BasketRequest req, Catalog catalog, Users user) {

        Basket basket = new Basket();
        basket.setCatalog(catalog);
        basket.setCustomer(user);
        basket.setQuantity(req.getQuantity());
        basket.setSubtotal(req.getSubtotal());
        return basket;
    }

    public BasketResponse toResponse(Basket basket) {
        BasketResponse basketResponse = new BasketResponse();
        basketResponse.setBasketId(basket.getBasketId());
        basketResponse.setCatalog(catalogMapper.toResponse(basket.getCatalog()));
        basketResponse.setCustomer(userMapper.toResponse(basket.getCustomer()));
        basketResponse.setQuantity(basket.getQuantity());
        basketResponse.setSubtotal(basket.getSubtotal());
        return basketResponse;
    }

    public List<BasketResponse> toListResponse(List<Basket> baskets) {
        return baskets.stream()
                .map(basket -> {
                    BasketResponse basketResponse = new BasketResponse();
                    basketResponse.setBasketId(basket.getBasketId());
                    basketResponse.setCatalog(catalogMapper.toResponse(basket.getCatalog()));
                    basketResponse.setCustomer(userMapper.toResponse(basket.getCustomer()));
                    basketResponse.setQuantity(basket.getQuantity());
                    basketResponse.setSubtotal(basket.getSubtotal());
                    return basketResponse;
                })
                .collect(Collectors.toList());
    }
}
