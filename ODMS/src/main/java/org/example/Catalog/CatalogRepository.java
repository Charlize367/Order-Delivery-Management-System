package org.example.Catalog;

import org.example.Catalog.Catalog;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CatalogRepository extends JpaRepository<Catalog, Integer> {
}
