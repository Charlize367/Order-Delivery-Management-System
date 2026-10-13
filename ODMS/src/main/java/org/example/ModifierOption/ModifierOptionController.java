package org.example.ModifierOption;

import jakarta.validation.Valid;
import org.example.ModifierGroup.ModifierGroupResponse;
import org.example.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/v1/modifierOption")
public class ModifierOptionController {

    @Autowired
    private ModifierOptionService modifierOptionService;

    @GetMapping("/all")
    public ResponseEntity<List<ModifierOptionResponse>> getAllModifierOptions() {
        return ResponseEntity.ok(modifierOptionService.getAllModifierOptions());
    }

    @GetMapping("/modifier-groups/{modifierGroupId}/modifier-options")
    public ResponseEntity<PageResponse<ModifierOptionResponse>> getModifierOptions(
            @PathVariable Long modifierGroupId,
            Pageable pageable) {
        return ResponseEntity.ok(modifierOptionService.getModifierOptions(modifierGroupId, pageable));
    }

    @GetMapping("/modifier-options/{modifierOptionId}")
    public ResponseEntity<ModifierOptionResponse> getModifierOptionById(@PathVariable Long modifierOptionId) {
        return ResponseEntity.ok(modifierOptionService.getModifierOptionById(modifierOptionId));
    }

    @PostMapping("/modifier-groups/{modifierGroupId}/modifier-options")
    public ResponseEntity<ModifierOptionResponse> addModifierOption(
            @PathVariable Long modifierGroupId,
            @Valid @RequestBody ModifierOptionRequest request) {
        ModifierOptionResponse response = modifierOptionService.addModifierOption(modifierGroupId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/modifier-groups/{modifierGroupId}/modifier-options/{modifierOptionId}")
    public ResponseEntity<ModifierOptionResponse> updateModifierOption(
            @PathVariable Long modifierOptionId,
            @PathVariable Long modifierGroupId,
            @Valid @RequestBody ModifierOptionRequest request) {
        return ResponseEntity.ok(modifierOptionService.updateModifierOption(modifierOptionId, modifierGroupId, request));
    }

    @DeleteMapping("/modifier-options/{modifierOptionId}")
    public ResponseEntity<Void> deleteModifierOption(@PathVariable Long modifierOptionId) {
        modifierOptionService.deleteModifierOptionById(modifierOptionId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{modifierOptionId}/deactivate")
    public ResponseEntity<ModifierOptionResponse> deactivatePromoCode(@Validated @PathVariable long modifierOptionId) throws IOException {
        ModifierOptionResponse modifierOption = modifierOptionService.deactivateModifierOption(modifierOptionId);
        return new ResponseEntity<>(modifierOption, HttpStatus.CREATED);
    }

    @PatchMapping("/{modifierOptionId}/activate")
    public ResponseEntity<ModifierOptionResponse> activatePromoCode(@Validated @PathVariable long modifierOptionId) throws IOException {
        ModifierOptionResponse modifierOption = modifierOptionService.activateModifierOption(modifierOptionId);
        return new ResponseEntity<>(modifierOption, HttpStatus.CREATED);
    }
}