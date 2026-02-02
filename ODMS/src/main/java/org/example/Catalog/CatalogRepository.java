package org.example.Catalog;

import org.example.Category.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatalogRepository extends JpaRepository<Catalog, Long> {
   List<Catalog> getCatalogByCategory(Category category);
   Page<Catalog> findCatalogByCategoryCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);
   List<Catalog> findByCatalogNameContainingIgnoreCaseAndActiveTrue(String catalogName);
}
