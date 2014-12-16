package com.ari.domain.catalog;

import java.io.Serializable;

/**
 * Created by SejongPark on 14. 12. 4..
 */
public interface SortOption extends Serializable {

    Long getId();

    void setId(Long id);

    String getDescription();

    void setDescription(String description);

    String getDisplayText();

    void setDisplayText(String displayText);

    String getSortCondition();

    void setSortCondition(String sortCondition);

    String getDefaultSortDirection();

    void setDefaultSortDirection(String defaultSortDirection);

    Boolean getSortDirectionTogglable();

    void setSortDirectionTogglable(Boolean sortDirectionTogglable);

    String getLink();

    void setLink(String link);
}
