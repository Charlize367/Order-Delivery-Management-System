package org.example.ModifierGroup;

import jakarta.validation.Valid;
import org.example.PageResponse;
import org.example.PromoCode.PromoCodeRequest;
import org.example.PromoCode.PromoCodeResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/v1/modifierGroup")
public class ModifierGroupController {

    @Autowired
    private ModifierGroupService modifierGroupService;

    @GetMapping("/all")
    public ResponseEntity<List<ModifierGroupResponse>> getAllModifierGroups() {
        return ResponseEntity.ok(modifierGroupService.getAllModifierGroups());
    }

    @GetMapping
    public ResponseEntity<PageResponse<ModifierGroupResponse>> getModifierGroups(

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "modifierGroupId") String sortBy,
            @RequestParam(defaultValue = "true") boolean descending) {
        Sort sort = descending ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(modifierGroupService.getModifierGroups(pageable));
    }

    @GetMapping("/modifier-groups/{modifierGroupId}")
    public ResponseEntity<ModifierGroupResponse> getModifierGroupById(@PathVariable Long modifierGroupId) {
        return ResponseEntity.ok(modifierGroupService.getModifierGroupById(modifierGroupId));
    }

    @GetMapping("/modifier-groups/catalog/{catalogId}")
    public ResponseEntity<List<ModifierGroupResponse>> getModifierGroupsByCatalog(@PathVariable Long catalogId) {
        return ResponseEntity.ok(modifierGroupService.getModifierGroupsByCatalog(catalogId));
    }

    @PostMapping("/catalogs/{catalogId}/modifier-groups")
    public ResponseEntity<ModifierGroupResponse> addModifierGroup(
            @PathVariable Long catalogId,
            @Valid @RequestBody ModifierGroupRequest request) {
        ModifierGroupResponse response = modifierGroupService.addModifierGroup(catalogId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/catalogs/{catalogId}/modifier-groups/{modifierGroupId}")
    public ResponseEntity<ModifierGroupResponse> updateModifierGroup(
            @PathVariable Long modifierGroupId,
            @PathVariable Long catalogId,
            @Valid @RequestBody ModifierGroupRequest request) {
        return ResponseEntity.ok(modifierGroupService.updateModifierGroup(modifierGroupId, catalogId, request));
    }

    @DeleteMapping("/modifier-groups/{modifierGroupId}")
    public ResponseEntity<Void> deleteModifierGroup(@PathVariable Long modifierGroupId) {
        modifierGroupService.deleteModifierGroupById(modifierGroupId);
        return ResponseEntity.noContent().build();
    }



    @PatchMapping("/{modifierGroupId}/deactivate")
    public ResponseEntity<ModifierGroupResponse> deactivatePromoCode(@Validated @PathVariable long modifierGroupId) throws IOException {
        ModifierGroupResponse modifierGroup = modifierGroupService.deactivateModifierGroup(modifierGroupId);
        return new ResponseEntity<>(modifierGroup, HttpStatus.CREATED);
    }

    @PatchMapping("/{modifierGroupId}/activate")
    public ResponseEntity<ModifierGroupResponse> activatePromoCode(@Validated @PathVariable long modifierGroupId) throws IOException {
        ModifierGroupResponse modifierGroup = modifierGroupService.activateModifierGroup(modifierGroupId);
        return new ResponseEntity<>(modifierGroup, HttpStatus.CREATED);
    }
}