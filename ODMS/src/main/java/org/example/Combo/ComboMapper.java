package org.example.Combo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ComboMapper {

    @Autowired
    private ComboItemMapper comboItemMapper;

    public ComboResponse toResponse(Combo combo) {
        return new ComboResponse(
                combo.getComboId(),
                combo.getName(),
                combo.getDescription(),
                combo.getBundlePrice(),
                combo.isActive(),
                combo.getComboItems()
                        .stream()
                        .map(comboItemMapper::toResponse)
                        .toList()
        );
    }

    public List<ComboResponse> toListResponse(List<Combo> combos) {
        return combos.stream()
                .map(this::toResponse)
                .toList();
    }
}