package com.ari.controller.ari.cart;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.broadleafcommerce.core.inventory.service.InventoryUnavailableException;
import org.broadleafcommerce.core.order.service.exception.AddToCartException;
import org.broadleafcommerce.core.order.service.exception.ProductOptionValidationException;
import org.broadleafcommerce.core.order.service.exception.RequiredAttributeNotProvidedException;
import org.broadleafcommerce.core.pricing.service.exception.PricingException;
import org.broadleafcommerce.core.web.controller.cart.BroadleafCartController;
import org.broadleafcommerce.core.web.order.CartState;
import org.broadleafcommerce.core.web.order.model.AddToCartItem;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by poets11 on 14. 12. 15..
 */
@Controller
@RequestMapping(value = "/ari/cart")
public class CartController extends BroadleafCartController {
    @RequestMapping(value = "/list")
    public String list(HttpServletRequest request, HttpServletResponse response, Model model) throws Exception {
    	super.cart(request, response, model);
        return "ari/cart/list";
    }
    
    @RequestMapping(value = "/add", produces = "application/json")
    public @ResponseBody Map<String, Object> addJson(HttpServletRequest request, HttpServletResponse response, Model model,
        @ModelAttribute("addToCartItem") AddToCartItem addToCartItem) throws IOException, PricingException, AddToCartException {
	      Map<String, Object> responseMap = new HashMap<String, Object>();
	      try {
	          super.add(request, response, model, addToCartItem);
	
	          if (addToCartItem.getItemAttributes() == null || addToCartItem.getItemAttributes().size() == 0) {
	              responseMap.put("productId", addToCartItem.getProductId());
	          }
	          responseMap.put("productName", catalogService.findProductById(addToCartItem.getProductId()).getName());
	          responseMap.put("quantityAdded", addToCartItem.getQuantity());
	          responseMap.put("cartItemCount", String.valueOf(CartState.getCart().getItemCount()));
	          if (addToCartItem.getItemAttributes() == null || addToCartItem.getItemAttributes().size() == 0) {
	              // We don't want to return a productId to hide actions for when it is a product that has multiple
	              // product options. The user may want the product in another version of the options as well.
	              responseMap.put("productId", addToCartItem.getProductId());
	          }
	      } catch (AddToCartException e) {
	          if (e.getCause() instanceof RequiredAttributeNotProvidedException) {
	              responseMap.put("error", "allOptionsRequired");
	          } else if (e.getCause() instanceof ProductOptionValidationException) {
	              ProductOptionValidationException exception = (ProductOptionValidationException) e.getCause();
	              responseMap.put("error", "productOptionValidationError");
	              responseMap.put("errorCode", exception.getErrorCode());
	              responseMap.put("errorMessage", exception.getMessage());
	              //blMessages.getMessage(exception.get, lfocale))
	          } else if (e.getCause() instanceof InventoryUnavailableException) {
	              responseMap.put("error", "inventoryUnavailable");
	          } else {
	              throw e;
	          }
	      }
	
	      return responseMap;
    }
}
