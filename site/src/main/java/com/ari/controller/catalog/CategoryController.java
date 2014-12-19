/*
 * Copyright 2008-2012 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.ari.controller.catalog;

//import com.ari.sample.domain.catalog.ExCategoryImpl;
//import com.ari.sample.domain.catalog.SortOption;
import com.ari.domain.catalog.SortOption;
import org.apache.commons.lang3.StringUtils;
import org.broadleafcommerce.common.web.BroadleafRequestContext;
import org.broadleafcommerce.core.catalog.domain.Category;
import org.broadleafcommerce.core.search.domain.ProductSearchCriteria;
import org.broadleafcommerce.core.web.controller.catalog.BroadleafCategoryController;
import org.broadleafcommerce.core.web.util.ProcessorUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.thymeleaf.Arguments;
import org.thymeleaf.dom.Element;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This class works in combination with the CategoryHandlerMapping which finds a category based upon
 * the passed in URL.
 */
@Controller("blCategoryController")
public class CategoryController extends BroadleafCategoryController {
    
    @Override
    public ModelAndView handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ModelAndView model = super.handleRequest(request, response);

        if(request.getRequestURI().equals("/")){
            Category category = (Category) model.getModelMap().get("category");
            String url = category.getChildCategories().get(0).getUrl();
            //어케 하는지 몰겠어.
            RedirectView rv = new RedirectView( url );
            rv.setExposeModelAttributes(true);

            return new ModelAndView(rv);
        }

        //기존의 컨트롤러 로직중 category를 변경.
        //TODO 코드리뷰 받기.
        if (false == request.getParameterMap().containsKey("facetField")) {
//            List<SortOption> sortOptions = ((ExCategoryImpl) model.getModelMap().get(CATEGORY_ATTRIBUTE_NAME)).getSortOptions();
//            for(SortOption sortOption : sortOptions){
//                String sortCondition = sortOption.getSortCondition();
//                sortOption.setLink(addSortLink(sortOption));
//            }
        }

        return model;
    }


    //리팩토링 할 것.
    //request라는 컨텍스트에 의존하는 메서드
    //아래 메서드는 컨트롤러 영역이 아니라 서비스 영역으로 이동필요
    //나아가서 link를 만들어 주는걸 도메인 영역에서 처리할수는 없을까???
    private String getLinkUrl(String sort) {

        HttpServletRequest request = BroadleafRequestContext.getBroadleafRequestContext().getRequest();
        String baseUrl = request.getRequestURL().toString();
        Map<String, String[]> params = new HashMap<String, String[]>(request.getParameterMap());

        if (StringUtils.isNotBlank(sort)) {
            params.put(ProductSearchCriteria.SORT_STRING, new String[]{sort});
        } else {
            params.remove(ProductSearchCriteria.SORT_STRING);
        }

        params.remove(ProductSearchCriteria.PAGE_NUMBER);

        String url = ProcessorUtils.getUrl(baseUrl, params);

        return url;
    }

    private String addSortLink(SortOption sortOption){


        Map<String, String> attrs = new HashMap<String, String>();

        BroadleafRequestContext blcContext = BroadleafRequestContext.getBroadleafRequestContext();
        HttpServletRequest request = blcContext.getRequest();

        String baseUrl = request.getRequestURL().toString();
        Map<String, String[]> params = new HashMap<String, String[]>(request.getParameterMap());

        String key = ProductSearchCriteria.SORT_STRING;
        String sortField = sortOption.getSortCondition();

        List<String[]> sortedFields = new ArrayList<String[]>();

        String[] paramValues = params.get(key);
        if (paramValues != null && paramValues.length > 0) {
            String sortQueries = paramValues[0];
            for (String sortQuery : sortQueries.split(",")) {
                String[] sort = sortQuery.split(" ");
                if (sort.length == 2) {
                    sortedFields.add(new String[] { sort[0], sort[1] });
                }
            }
        }

        boolean currentlySortingOnThisField = false;
        boolean currentlyAscendingOnThisField = false;

        for (String[] sortedField : sortedFields) {
            if (sortField.equals(sortedField[0])) {
                currentlySortingOnThisField = true;
                currentlyAscendingOnThisField = sortedField[1].equals("asc");
                sortedField[1] = currentlyAscendingOnThisField ? "desc" : "asc";
            }
        }

        String sortString = sortField;
        String classString = "";

        if (currentlySortingOnThisField) {
            classString += "active ";
            if (currentlyAscendingOnThisField) {
                sortString += " desc";
                classString += "asc ";
            } else {
                sortString += " asc";
                classString += "desc ";
            }
        } else {
            sortString += " asc";
            classString += "asc ";
            params.remove(ProductSearchCriteria.PAGE_NUMBER);
        }

        boolean allowMultipleSorts = false;

        if (allowMultipleSorts) {
            StringBuilder sortSb = new StringBuilder();
            for (String[] sortedField : sortedFields) {
                sortSb.append(sortedField[0]).append(" ").append(sortedField[1]).append(",");
            }

            sortString = sortSb.toString();
            if (sortString.charAt(sortString.length() - 1) == ',') {
                sortString = sortString.substring(0, sortString.length() - 1);
            }
        }

        params.put(key, new String[] { sortString } );

        String url = ProcessorUtils.getUrl(baseUrl, params);

        //TODO
        attrs.put("class", classString);
        attrs.put("href", url);

        return url;
    }

}
