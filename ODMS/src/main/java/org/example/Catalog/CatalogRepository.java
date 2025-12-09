package org.example.Catalog;

import org.example.Catalog.Catalog;
import org.example.Category.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatalogRepository extends JpaRepository<Catalog, Long> {
   List<Catalog> getCatalogByCategory(Category category);
   List<Catalog> findByCatalogNameContainingIgnoreCase(String catalogName);
}
