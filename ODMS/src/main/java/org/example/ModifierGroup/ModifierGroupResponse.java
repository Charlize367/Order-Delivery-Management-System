package org.example.ModifierGroup;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.*;
import org.example.Catalog.CatalogResponse;
import org.example.ModifierOption.ModifierOptionResponse;

import java.util.List;

public record ModifierGroupResponse (

        Long modifierGroupId,


        String name,

        boolean required,


        Integer minSelections,


        Integer maxSelections,


        CatalogResponse catalog,

        boolean active,

        List<ModifierOptionResponse> modifierOptions
){}

