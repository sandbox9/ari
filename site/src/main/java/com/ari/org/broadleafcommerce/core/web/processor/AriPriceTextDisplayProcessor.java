package com.ari.org.broadleafcommerce.core.web.processor;

import java.text.NumberFormat;
import java.util.Currency;
import java.util.Locale;

import org.broadleafcommerce.common.currency.util.BroadleafCurrencyUtils;
import org.broadleafcommerce.common.money.Money;
import org.broadleafcommerce.common.web.BroadleafRequestContext;
import org.thymeleaf.Arguments;
import org.thymeleaf.dom.Element;
import org.thymeleaf.processor.attr.AbstractTextChildModifierAttrProcessor;
import org.thymeleaf.standard.expression.Expression;
import org.thymeleaf.standard.expression.StandardExpressions;

public class AriPriceTextDisplayProcessor extends AbstractTextChildModifierAttrProcessor {
    public AriPriceTextDisplayProcessor() {
        super("price");
    }
    
    @Override
    public int getPrecedence() {
        return 1500;
    }

    @Override
    protected String getText(Arguments arguments, Element element, String attributeName) {
        Money price = null;

        Expression expression = (Expression) StandardExpressions.getExpressionParser(arguments.getConfiguration())
                .parseExpression(arguments.getConfiguration(), arguments, element.getAttributeValue(attributeName));
        Object result = expression.execute(arguments.getConfiguration(), arguments);
        if (result instanceof Money) {
            price = (Money) result;
        } else if (result instanceof Number) {
            price = new Money(((Number)result).doubleValue());
        }


        if (price == null) {
            return "Not Available";
        }
        
        BroadleafRequestContext brc = BroadleafRequestContext.getBroadleafRequestContext();
        Locale javaLocale = brc.getJavaLocale();
		if (javaLocale != null) {
			// 원화로 출력되도록 수정
			// 소수점 무시를 위해 * 1000
            NumberFormat numberFormatFromCache = NumberFormat.getInstance(Locale.KOREA);
			return numberFormatFromCache.format(price.getAmount().doubleValue() * 1000);
        } else {
            return price.getAmount().toString();
        }
    }
}
