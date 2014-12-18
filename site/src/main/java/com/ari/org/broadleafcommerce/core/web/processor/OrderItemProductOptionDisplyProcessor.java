package com.ari.org.broadleafcommerce.core.web.processor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.broadleafcommerce.core.catalog.domain.Product;
import org.broadleafcommerce.core.catalog.domain.ProductOptionValue;
import org.broadleafcommerce.core.catalog.domain.Sku;
import org.broadleafcommerce.core.order.domain.DiscreteOrderItem;
import org.thymeleaf.Arguments;
import org.thymeleaf.dom.Element;
import org.thymeleaf.processor.element.AbstractLocalVariableDefinitionElementProcessor;
import org.thymeleaf.standard.expression.Expression;
import org.thymeleaf.standard.expression.StandardExpressions;

public class OrderItemProductOptionDisplyProcessor extends AbstractLocalVariableDefinitionElementProcessor {
    public OrderItemProductOptionDisplyProcessor() {
        super("order_item_product_option_display");
    }

    @Override
    public int getPrecedence() {
        return 100;
    }

    @Override
    protected Map<String, Object> getNewLocalVariables(Arguments arguments, Element element) {
        HashMap<String, List<String>> productOptionDisplayValues = new HashMap<String, List<String>>();
        Map<String, Object> newVars = new HashMap<String, Object>();
        Expression expression = (Expression) StandardExpressions.getExpressionParser(arguments.getConfiguration())
                .parseExpression(arguments.getConfiguration(), arguments, element.getAttributeValue("orderItem"));
        Object item = expression.execute(arguments.getConfiguration(), arguments);
        if (item instanceof DiscreteOrderItem) {
            DiscreteOrderItem orderItem = (DiscreteOrderItem) item;
            Product product = orderItem.getProduct();
            
            List<Sku> additionalSkus = product.getAdditionalSkus();
            if(additionalSkus == null || additionalSkus.size() == 0) return newVars;
            
            for (Sku sku : additionalSkus) {
				Iterator<ProductOptionValue> iterator = sku.getProductOptionValuesCollection().iterator();
				
				while(iterator.hasNext()) {
					ProductOptionValue optionValue = iterator.next();
					
					String value = optionValue.getAttributeValue();
					String label = optionValue.getProductOption().getLabel();
					
					List<String> values = productOptionDisplayValues.get(label);
					if(values == null) {
						values = new ArrayList<String>();
						productOptionDisplayValues.put(label, values);
					}
					
					if(values.contains(value) == false)	values.add(value);
				}
			}
        }
        
        newVars.put("orderItemproductOptionDisplayValues", productOptionDisplayValues);

        return newVars;
    }

    @Override
    protected boolean removeHostElement(Arguments arguments, Element element) {
        return false;
    }

}
