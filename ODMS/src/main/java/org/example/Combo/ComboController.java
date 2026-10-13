package org.example.Combo;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/combos")
public class ComboController {

    @Autowired
    private ComboService comboService;

    @GetMapping
    public ResponseEntity<List<ComboResponse>> getAllCombos() {
        return ResponseEntity.ok(
                comboService.getAllCombos()
        );
    }

    @GetMapping("/{comboId}")
    public ResponseEntity<ComboResponse> getComboById(
            @PathVariable Long comboId
    ) {
        return ResponseEntity.ok(
                comboService.getComboById(comboId)
        );
    }

    @PostMapping
    public ResponseEntity<ComboResponse> addCombo(
            @Valid @RequestBody ComboRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(comboService.addCombo(request));
    }

    @PutMapping("/{comboId}")
    public ResponseEntity<ComboResponse> updateCombo(
            @PathVariable Long comboId,
            @Valid @RequestBody ComboRequest request
    ) {
        return ResponseEntity.ok(
                comboService.updateCombo(comboId, request)
        );
    }

    @PatchMapping("/{comboId}/deactivate")
    public ResponseEntity<Void> deactivateCombo(
            @PathVariable Long comboId
    ) {
        comboService.deactivateCombo(comboId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{comboId}/activate")
    public ResponseEntity<Void> activateCombo(
            @PathVariable Long comboId
    ) {
        comboService.activateCombo(comboId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{comboId}")
    public void deleteCombo(
            @PathVariable Long comboId
    ) {
       comboService.deleteCombo(comboId);
    }
}