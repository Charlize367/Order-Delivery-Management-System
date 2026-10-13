package org.example.ModifierGroup;

import org.example.Catalog.Catalog;
import org.example.Notifications.Notifications;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ModifierGroupRepository extends JpaRepository<ModifierGroup, Long> {

    List<ModifierGroup> getByCatalogCatalogId(Long catalogId);
}
