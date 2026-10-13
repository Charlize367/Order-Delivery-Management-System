package org.example.ModifierGroup;


import org.example.Catalog.CatalogMapper;
import org.example.ModifierOption.ModifierOption;
import org.example.ModifierOption.ModifierOptionMapper;
import org.example.ModifierOption.ModifierOptionResponse;
import org.example.OrderItems.OrderItems;
import org.example.OrderItems.OrderItemsResponse;
import org.example.Payment.Payment;
import org.example.Payment.PaymentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ModifierGroupMapper {

    @Autowired
    private CatalogMapper catalogMapper;

    @Autowired
    private ModifierOptionMapper modifierOptionMapper;

    public ModifierGroupResponse toResponse(ModifierGroup modifierGroup) {
        return new ModifierGroupResponse(modifierGroup.getModifierGroupId(), modifierGroup.getName(),
                modifierGroup.isRequired(), modifierGroup.getMinSelections(), modifierGroup.getMaxSelections(),
                catalogMapper.toResponse(modifierGroup.getCatalog()), modifierGroup.isActive(), modifierOptionMapper.toListResponse(modifierGroup.getModifierOptions()));
    }

    public List<ModifierGroupResponse> toListResponse(List<ModifierGroup> modifierGroups) {
        return modifierGroups.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());   // was: .toList()
    }
}
