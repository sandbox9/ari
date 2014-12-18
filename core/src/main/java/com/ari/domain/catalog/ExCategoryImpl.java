package com.ari.domain.catalog;


import com.google.common.collect.Lists;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Predicate;
import org.broadleafcommerce.common.extensibility.jpa.clone.ClonePolicyMap;
import org.broadleafcommerce.common.media.domain.Media;
import org.broadleafcommerce.common.media.domain.MediaImpl;
import org.broadleafcommerce.common.presentation.AdminPresentation;
import org.broadleafcommerce.common.presentation.AdminPresentationMap;
import org.broadleafcommerce.common.presentation.AdminPresentationMapKey;
import org.broadleafcommerce.common.presentation.AdminPresentationToOneLookup;
import org.broadleafcommerce.core.catalog.domain.Category;
import org.broadleafcommerce.core.catalog.domain.CategoryImpl;
import org.broadleafcommerce.core.search.domain.CategorySearchFacet;
import org.hibernate.annotations.*;

import javax.persistence.*;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.OrderBy;
import javax.persistence.Table;
import java.util.*;

/**
 * 기존의 카테고리를 확장
 * 정렬방식을 신규 구현
 */
@Entity
@Table(name = "EX_CATEGORY")
public class ExCategoryImpl extends CategoryImpl {

    @OneToMany(mappedBy = "category", targetEntity = ExCategorySortOptionImpl.class, cascade = {CascadeType.ALL})
    @Cascade(value = {org.hibernate.annotations.CascadeType.ALL, org.hibernate.annotations.CascadeType.DELETE_ORPHAN})
    //@Cache(usage = CacheConcurrencyStrategy.READ_WRITE, region="blCategories")
    @OrderBy(value = "displayOrder")
    protected List<ExCategorySortOption> exCategorySortOptions = new ArrayList<ExCategorySortOption>();

    @ManyToMany(targetEntity = SortOptionImpl.class)
    @JoinTable(name = "EX_CAT_EXCL_SORT_OPTION_XREF", joinColumns = @JoinColumn(name = "CATEGORY_ID"),
            inverseJoinColumns = @JoinColumn(name = "SORT_OPTION_ID", nullable = true))
    @Cascade(value = {org.hibernate.annotations.CascadeType.MERGE, org.hibernate.annotations.CascadeType.PERSIST})
    //@Cache(usage = CacheConcurrencyStrategy.READ_WRITE, region="blStandardElements")
    protected List<SortOption> excludedSortOption = new ArrayList<SortOption>();

    public List<ExCategorySortOption> getExCategorySortOptions() {
        return exCategorySortOptions;
    }

    public void setExCategorySortOptions(List<ExCategorySortOption> exCategorySortOptions) {
        this.exCategorySortOptions = exCategorySortOptions;
    }

    public List<SortOption> getExcludedSortOption() {
        return excludedSortOption;
    }

    public void setExcludedSortOption(List<SortOption> excludedSortOption) {
        this.excludedSortOption = excludedSortOption;
    }

    //정렬된 순서로 내보낼 것.
    public List<SortOption> getSortOptions(){
        List<SortOption> sortOptions = Lists.newArrayList();

        for(ExCategorySortOption exCategorySortOption : this.getCumulativeCategorySortOptions()){
            sortOptions.add(exCategorySortOption.getSortOption());
        }

        return sortOptions;
    }

    protected List<ExCategorySortOption> getCumulativeCategorySortOptions() {
        final List<ExCategorySortOption> returnCategorySortOptions = new ArrayList<ExCategorySortOption>();

        returnCategorySortOptions.addAll(getExCategorySortOptions());

        Collections.sort(returnCategorySortOptions, searchOptionPositionComparator);

        List<ExCategorySortOption> parentSortOptions = null;
        if (defaultParentCategory != null) {
            ExCategoryImpl category = (ExCategoryImpl) defaultParentCategory;
            parentSortOptions = category.getCumulativeCategorySortOptions();


            CollectionUtils.filter(parentSortOptions, new Predicate() {
                @Override
                public boolean evaluate(Object arg) {
                    ExCategorySortOption cso = (ExCategorySortOption) arg;
                    //return true;
                    //TODO 예외처리 작업할 것.
                    return !getExcludedSortOption().contains(cso.getSortOption()) && !returnCategorySortOptions.contains(cso.getSortOption());
                }
            });
        }


        if (parentSortOptions != null) {
            returnCategorySortOptions.addAll(parentSortOptions);
        }

        return returnCategorySortOptions;
    }


    protected static Comparator<ExCategorySortOption> getSearchOptionPositionComparator() {
        return searchOptionPositionComparator;
    }

    protected static Comparator<ExCategorySortOption> searchOptionPositionComparator = new Comparator<ExCategorySortOption>() {
        @Override
        public int compare(ExCategorySortOption o1, ExCategorySortOption o2) {
            return o1.getDisplayOrder().compareTo(o2.getDisplayOrder());
        }
    };

}
