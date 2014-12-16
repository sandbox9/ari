package com.ari.controller.ari.cart;

import org.broadleafcommerce.core.web.controller.cart.BroadleafCartController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by poets11 on 14. 12. 15..
 */
@Controller
@RequestMapping(value = "/ari/cart")
public class CartController extends BroadleafCartController {
    @RequestMapping(value = "/list")
    public String test(HttpServletRequest request, HttpServletResponse response, Model model) {
        return "ari/cart/list";
    }
}
