package org.example.ModifierOption;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModifierOptionRepository extends JpaRepository<ModifierOption, Long> {
    Page<ModifierOption> findByModifierGroupModifierGroupId(Long modifierGroupId, Pageable pageable);
}