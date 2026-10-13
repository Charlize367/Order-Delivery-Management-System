package org.example.Combo;

import org.example.Catalog.CatalogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ComboItemMapper {

    @Autowired
    private CatalogMapper catalogMapper;

    public ComboItemResponse toResponse(ComboItem comboItem) {
        return new ComboItemResponse(
                comboItem.getComboItemId(),
                catalogMapper.toResponse(comboItem.getCatalog()),
                comboItem.getQuantity()
        );
    }
}