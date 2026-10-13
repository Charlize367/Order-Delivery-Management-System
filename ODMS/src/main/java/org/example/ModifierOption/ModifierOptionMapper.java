package org.example.ModifierOption;

import org.example.ModifierGroup.ModifierGroupMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ModifierOptionMapper {



    public ModifierOptionResponse toResponse(ModifierOption modifierOption) {
        return new ModifierOptionResponse(modifierOption.getModifierOptionId(), modifierOption.getName(),
                modifierOption.getPriceAdjustment(), modifierOption.getModifierGroup().getModifierGroupId(),
                modifierOption.isActive());
    }

    public ModifierOptionResponse toListResponse(ModifierOption modifierOption) {
        return new ModifierOptionResponse(
                modifierOption.getModifierOptionId(),
                modifierOption.getName(),
                modifierOption.getPriceAdjustment(),
                modifierOption.getModifierGroup().getModifierGroupId(),
                modifierOption.isActive()
        );
    }

    public List<ModifierOptionResponse> toListResponse(List<ModifierOption> modifierOptions) {
        return modifierOptions.stream()
                .map(this::toListResponse)
                .toList();
    }
}