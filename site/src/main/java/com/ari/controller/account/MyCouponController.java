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

package com.ari.controller.account;

import itwise.broadleafcommerce.coupon.controller.BroadleafCouponController;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/account/coupons")
public class MyCouponController extends BroadleafCouponController {

	private static String myCouponsView = "ari/account/myCoupon";

	@Override
	@RequestMapping(value = "", method = RequestMethod.GET)
	public String viewMyCoupon(HttpServletRequest request, Model model) {
		super.setMyCoupons(myCouponsView);
		return super.viewMyCoupon(request, model);
	}

	@Override
	@RequestMapping(value = "/apply")
	public String viewApplyCoupon(HttpServletRequest request, Model model) {
		return super.viewApplyCoupon(request, model);
	}

}
