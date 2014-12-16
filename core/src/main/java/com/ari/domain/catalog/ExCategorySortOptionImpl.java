package com.ari.domain.catalog;


import org.broadleafcommerce.core.catalog.domain.Category;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "EX_CAT_SORT_OPTION_XREF")
@Inheritance(strategy = InheritanceType.JOINED)
public class ExCategorySortOptionImpl implements ExCategorySortOption {

    @Id
    @GeneratedValue(generator = "CategorySortOptionId")
    @GenericGenerator(
            name = "CategorySortOptionId",
            strategy = "org.broadleafcommerce.common.persistence.IdOverrideTableGenerator",
            parameters = {
                    @org.hibernate.annotations.Parameter(name = "segment_value", value = "CategorySortOptionImpl"),
                    @org.hibernate.annotations.Parameter(name = "entity_name", value = "com.sandboxnine.sample.domain.catalog.ExCategorySortOptionImpl")
            }
    )
    @Column(name = "CATEGORY_SORT_OPTION_ID")
    protected Long id;

    @ManyToOne(targetEntity = ExCategoryImpl.class)
    @JoinColumn(name = "CATEGORY_ID")
    protected Category category;

    @ManyToOne(targetEntity = SortOptionImpl.class)
    @JoinColumn(name = "SORT_OTPION_ID")
    protected SortOption sortOption;

    @Column(name = "DISPLAY_ORDER")
    protected BigDecimal displayOrder;

    //TODO 카테고리 기본 정렬 필드, 기능 구현 필요.

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public Category getCategory() {
        return category;
    }

    @Override
    public void setCategory(Category category) {
        this.category = category;
    }

    @Override
    public SortOption getSortOption() {
        return sortOption;
    }

    @Override
    public void setSortOption(SortOption sortOption) {
        this.sortOption = sortOption;
    }

    @Override
    public BigDecimal getDisplayOrder() {
        return displayOrder;
    }

    @Override
    public void setDisplayOrder(BigDecimal displayOrder) {
        this.displayOrder = displayOrder;
    }

}
