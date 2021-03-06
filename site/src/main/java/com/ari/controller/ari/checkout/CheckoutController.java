package com.ari.controller.ari.checkout;

import itwise.broadleafcommerce.coupon.domain.OfferCoupon;
import itwise.broadleafcommerce.coupon.service.CouponService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.broadleafcommerce.common.exception.ServiceException;
import org.broadleafcommerce.common.payment.PaymentType;
import org.broadleafcommerce.common.vendor.service.exception.PaymentException;
import org.broadleafcommerce.core.order.domain.Order;
import org.broadleafcommerce.core.order.domain.OrderItem;
import org.broadleafcommerce.core.pricing.service.exception.PricingException;
import org.broadleafcommerce.core.web.checkout.model.BillingInfoForm;
import org.broadleafcommerce.core.web.checkout.model.CustomerCreditInfoForm;
import org.broadleafcommerce.core.web.checkout.model.GiftCardInfoForm;
import org.broadleafcommerce.core.web.checkout.model.OrderInfoForm;
import org.broadleafcommerce.core.web.checkout.model.ShippingInfoForm;
import org.broadleafcommerce.core.web.controller.checkout.BroadleafCheckoutController;
import org.broadleafcommerce.core.web.order.CartState;
import org.broadleafcommerce.profile.core.domain.Customer;
import org.broadleafcommerce.profile.web.core.CustomerState;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.ServletRequestDataBinder;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class CheckoutController extends BroadleafCheckoutController {

	@Resource(name = "blCouponService")
	protected CouponService couponService;

	@RequestMapping("/checkout")
	public String checkout(HttpServletRequest request, HttpServletResponse response, Model model, @ModelAttribute("orderInfoForm") OrderInfoForm orderInfoForm,
			@ModelAttribute("shippingInfoForm") ShippingInfoForm shippingForm, @ModelAttribute("billingInfoForm") BillingInfoForm billingForm,
			@ModelAttribute("giftCardInfoForm") GiftCardInfoForm giftCardInfoForm,
			@ModelAttribute("customerCreditInfoForm") CustomerCreditInfoForm customerCreditInfoForm, RedirectAttributes redirectAttributes) {

		super.checkout(request, response, model, redirectAttributes);

		Customer customer = CustomerState.getCustomer();
		model.addAttribute("customer", customer);

		List<String> phonePrefixList = new ArrayList<String>();
		phonePrefixList.add("010");
		phonePrefixList.add("011");
		phonePrefixList.add("016");
		phonePrefixList.add("017");
		phonePrefixList.add("018");
		phonePrefixList.add("019");

		model.addAttribute("phonePrefixList", phonePrefixList);

//    	상품-쿠폰
		Order order = CartState.getCart();
		Map<OrderItem, OfferCoupon> itemCoupons = couponService.buildCouponListForOrderItem(order);
		model.addAttribute("coupons", itemCoupons);

		return "ari/order/checkout";
	}

	@RequestMapping(value = "/checkout/savedetails", method = RequestMethod.POST)
	public String saveGlobalOrderDetails(HttpServletRequest request, Model model, @ModelAttribute("shippingInfoForm") ShippingInfoForm shippingForm,
			@ModelAttribute("billingInfoForm") BillingInfoForm billingForm, @ModelAttribute("giftCardInfoForm") GiftCardInfoForm giftCardInfoForm,
			@ModelAttribute("orderInfoForm") OrderInfoForm orderInfoForm, BindingResult result) throws ServiceException {
		return super.saveGlobalOrderDetails(request, model, orderInfoForm, result);
	}

	@Override
	@RequestMapping(value = "/checkout/complete", method = RequestMethod.POST)
	public String processCompleteCheckoutOrderFinalized(RedirectAttributes redirectAttributes) throws PaymentException {
		return super.processCompleteCheckoutOrderFinalized(redirectAttributes);
	}

	@RequestMapping(value = "/checkout/cod/complete", method = RequestMethod.POST)
	public String processPassthroughCheckout(RedirectAttributes redirectAttributes) throws PaymentException, PricingException {
		return super.processPassthroughCheckout(redirectAttributes, PaymentType.COD);
	}

	@Override
	@InitBinder
	protected void initBinder(HttpServletRequest request, ServletRequestDataBinder binder) throws Exception {
		super.initBinder(request, binder);
	}

}
