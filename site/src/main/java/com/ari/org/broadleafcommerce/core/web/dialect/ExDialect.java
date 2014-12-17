package com.ari.org.broadleafcommerce.core.web.dialect;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;

import org.thymeleaf.dialect.AbstractDialect;
import org.thymeleaf.processor.IProcessor;
import org.thymeleaf.standard.expression.IStandardVariableExpressionEvaluator;
import org.thymeleaf.standard.expression.StandardExpressions;

public class ExDialect extends AbstractDialect {
	private Set<IProcessor> processors = new HashSet<IProcessor>();

	@Override
	public String getPrefix() {
		return "ex";
	}
    
    @Resource(name = "blVariableExpressionEvaluator")
    private IStandardVariableExpressionEvaluator expressionEvaluator;

    @Override
    public boolean isLenient() {
        return true;
    }
    
    @Override 
    public Set<IProcessor> getProcessors() {        
        return processors; 
    } 
    
    public void setProcessors(Set<IProcessor> processors) {
        this.processors = processors;
    }
    
    @Override
    public Map<String, Object> getExecutionAttributes() {
        final Map<String,Object> executionAttributes = new LinkedHashMap<String, Object>();
        executionAttributes.put(StandardExpressions.STANDARD_VARIABLE_EXPRESSION_EVALUATOR_ATTRIBUTE_NAME, expressionEvaluator);
        return executionAttributes;
    }
}
