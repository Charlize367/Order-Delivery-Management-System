package org.example.Combo;

import org.example.Catalog.CatalogResponse;

public record ComboItemResponse(
        Long comboItemId,
        CatalogResponse catalog,
        Integer quantity
) {
}