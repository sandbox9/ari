package com.ari.domain.catalog;

import org.broadleafcommerce.core.catalog.domain.Category;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Created by SejongPark on 14. 12. 4..
 */
public interface ExCategorySortOption extends Serializable {
    Long getId();

    void setId(Long id);

    Category getCategory();

    void setCategory(Category category);

    SortOption getSortOption();

    void setSortOption(SortOption sortOption);

    BigDecimal getDisplayOrder();

    void setDisplayOrder(BigDecimal displayOrder);
}
