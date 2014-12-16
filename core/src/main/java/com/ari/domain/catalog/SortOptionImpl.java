package com.ari.domain.catalog;

import org.hibernate.annotations.*;

import javax.persistence.*;
import javax.persistence.Entity;
import javax.persistence.Table;


@Entity
@Table(name = "EX_SORT_OPTION")
@Inheritance(strategy = InheritanceType.JOINED)
public class SortOptionImpl implements SortOption {

    @Id
    @GeneratedValue(generator = "SortOptionId")
    @GenericGenerator(
            name = "SortOptionId",
            strategy = "org.broadleafcommerce.common.persistence.IdOverrideTableGenerator",
            parameters = {
                    @org.hibernate.annotations.Parameter(name = "segment_value", value = "SortOptionImpl"),
                    @org.hibernate.annotations.Parameter(name = "entity_name", value = "org.broadleafcommerce.core.catalog.domain.SortOptionImpl")
            }
    )
    @Column(name = "SORT_OPTION_ID")
    private Long id;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "DISPLAY_TEXT")
    private String displayText;

    @Column(name = "SORT_CONDITION")
    private String sortCondition;

    @Column(name = "DEFAULT_SORT_DIRECTION")
    private String defaultSortDirection;

    @Column(name = "SORT_DIRECTION_TOGGLABLE")
    private Boolean sortDirectionTogglable;

    @Transient
    private String link;

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public String getDescription() {
        return description;
    }

    @Override
    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String getDisplayText() {
        return displayText;
    }

    @Override
    public void setDisplayText(String displayText) {
        this.displayText = displayText;
    }

    @Override
    public String getSortCondition() {
        return sortCondition;
    }

    @Override
    public void setSortCondition(String sortCondition) {
        this.sortCondition = sortCondition;
    }

    @Override
    public String getDefaultSortDirection() {
        return defaultSortDirection;
    }

    @Override
    public void setDefaultSortDirection(String defaultSortDirection) {
        this.defaultSortDirection = defaultSortDirection;
    }

    @Override
    public Boolean getSortDirectionTogglable() {
        return sortDirectionTogglable;
    }

    @Override
    public void setSortDirectionTogglable(Boolean sortDirectionTogglable) {
        this.sortDirectionTogglable = sortDirectionTogglable;
    }

    @Override
    public String getLink() {
        return link;
    }

    @Override
    public void setLink(String link) {
        this.link = link;
    }
}
