package org.example.Basket;

import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogMapper;
import org.example.Catalog.CatalogResponse;
import org.example.Combo.BasketComboItem;
import org.example.Combo.ComboMapper;
import org.example.ModifierOption.ModifierOptionMapper;
import org.example.Users.UserMapper;
import org.example.Users.Users;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BasketMapper {

    private final CatalogMapper catalogMapper;
    private final UserMapper userMapper;
    private final ModifierOptionMapper modifierOptionMapper;
    private final ComboMapper comboMapper;

    public BasketMapper(
            CatalogMapper catalogMapper,
            UserMapper userMapper,
            ModifierOptionMapper modifierOptionMapper,
            ComboMapper comboMapper
    ) {
        this.catalogMapper = catalogMapper;
        this.userMapper = userMapper;
        this.modifierOptionMapper = modifierOptionMapper;
        this.comboMapper = comboMapper;
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
        basketResponse.setCustomer(
                userMapper.toResponse(basket.getCustomer())
        );
        basketResponse.setQuantity(basket.getQuantity());
        basketResponse.setSubtotal(basket.getSubtotal());
        basketResponse.setSpecialInstructions(
                basket.getSpecialInstructions()
        );

        // Normal catalog basket item
        if (basket.getCatalog() != null) {

            basketResponse.setCatalog(
                    catalogMapper.toResponse(basket.getCatalog())
            );

            basketResponse.setModifierOptions(
                    modifierOptionMapper.toListResponse(
                            basket.getModifierOptions()
                    )
            );
        }

        // Combo basket item
        if (basket.getCombo() != null) {

            basketResponse.setCombo(
                    comboMapper.toResponse(basket.getCombo())
            );

            List<BasketComboItemResponse> comboItems =
                    basket.getComboItems()
                            .stream()
                            .map(this::toComboItemResponse)
                            .collect(Collectors.toList());

            basketResponse.setComboItems(comboItems);
        }

        return basketResponse;
    }

    private BasketComboItemResponse toComboItemResponse(
            BasketComboItem comboItem
    ) {

        BasketComboItemResponse response =
                new BasketComboItemResponse();

        response.setComboItemId(
                comboItem.getBasketComboItemId()
        );

        response.setCatalog(
                catalogMapper.toResponse(
                        comboItem.getCatalog()
                )
        );

        response.setQuantity(
                comboItem.getQuantity()
        );

        response.setModifierOptions(
                modifierOptionMapper.toListResponse(
                        comboItem.getModifierOptions()
                )
        );

        return response;
    }

    public List<BasketResponse> toListResponse(List<Basket> baskets) {

        return baskets.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}