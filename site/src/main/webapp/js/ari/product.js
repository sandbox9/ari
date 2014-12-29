window.gs = window.gs || {};
var myScroll;
(function ($) {
    floating = {};

    var mobilecheck = function () {

        if ((navigator.userAgent.match(/Android/i) && navigator.userAgent.match(/Chrome/i)) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i) || navigator.userAgent.match(/SHV-E300/i)) {
            return true;
        } else {
            return false;
        }

    };
    var fullSize = 250,
        priceIndicator = 50,
        opDisplay = false;
    nowBottom = parseInt($(".dropBoxArea").css("bottom")),
        iscrolls = new Array();

    $(".dropBoxArea").css("visibility", "visible");
    $("#orderConArea").css("overflow", "hidden");

    $(".orderScrollArea").append('<div class="emptyBox" style="height:53px"></div>');
    $(".dropBoxArea").css("bottom", "-=" + fullSize);


    $('select').each(function (i) {


        var $this = $(this),
            $prdOtiongs = $(".prdStyle:has(select)"),
            OptionIndex = i,
            numberOfOptions = $(this).children('option').length;


        $this.addClass('s-hidden');
        $this.on("change", function () {
            // selectedOrderOptionList
            $("#selectedOrderOptionList").append(
                "<li class=\"hidden\" data-ecAttrPrdCd=\"3232332332\" style=\"display: list-item;\">" +
                "<div class=\"listWrap\">" +
                "<span class=\"selectedPrd\">상품명</span>" +
                "<span class=\"numEdit\">" +
                "<fieldset>" +
                "<legend>수량선택 및 변경</legend>" +
                "<button class=\"btn btnMinus\">" +
                "<span>-</span>" +
                "</button>" +
                "<input type=\"number\" pattern=\"[0-9]*\" name=\"orderQuantity\" value=\"1\">" +
                "<button class=\"btn btnPlus\">" +
                "<span>+</span>" +
                "</button>" +
                "</fieldset>" +
                "</span>" +
                "<div class=\"selBtn\">" +
                "<p class=\"selOptPriceWrap\">" +
                "<b class=\"selOptPrice salePrc\">가격 (10000)</b><span class=\"won\"></span>" +
                "</p>" +
                "<button class=\"reset\">" +
                "<span class=\"delete prodImgN\" title=\"초기\"></span>" +
                "</button>" +
                "</div>" +
                "</div>" +
                "</li>"
            )

            $(".selectedOption").show();
            $("#selectedOrderOptionList").show();
            $("#selectedOrderOptionList").find("li").first().show();

            $("#selectedOrderOptionList").off("click", "li .reset");
            $("#selectedOrderOptionList").on("click", "li .reset", function (e) {
                e.preventDefault();
                $(this).parent().parent().parent().remove();

                if ($("#selectedOrderOptionList").find("li").length == 0) {
                    $(".selectedOption").hide();
                    $("#selectedOrderOptionList").hide();
                }

            });


        });


        //$this.wrap('<div class="select_box type1"></div>');		    
        if ((i == 0 && $this.hasClass("orderOptionSelect")) || $this.hasClass("addCompositionProduct")) {
            $this.wrap('<div class="select_box type1"></div>');
        } else {
            $this.wrap('<div class="select_box"></div>');
        }


        $this.after('<h2 class="styledSelect"></h2>');


        var $styledSelect = $this.next('h2.styledSelect');
        $styledSelect.text($this.children('option').eq(0).text());


        var $list = $('<ul />', {
            'class': 'select_list_con'
        }).insertAfter($styledSelect);

        $list.wrap('<div id="emptyContainer_' + i + '" class="emptyContainer"><div></div></div>');
        for (var i = 0; i < numberOfOptions; i++) {

            if ($this.children('option').eq(i).attr('data-soldout') || $this.children('option').eq(i).val() == 'none') {
                $('<li />', {
                    'text': $this.children('option').eq(i).text(),
                    'rel': $this.children('option').eq(i).val(),
                    'data-attrtypval': $this.children('option').eq(i).attr('data-attrtypval'),
                    'data-attrprdcd': $this.children('option').eq(i).attr('data-attrprdcd'),
                    'data-soldout': 'Y',
                    'class': 'soldout'
                }).appendTo($list);
            } else {
                $('<li />', {
                    'text': $this.children('option').eq(i).text(),
                    'rel': $this.children('option').eq(i).val(),
                    'data-attrtypval': $this.children('option').eq(i).attr('data-attrtypval'),
                    'data-attrprdcd': $this.children('option').eq(i).attr('data-attrprdcd'),
                    'data-soldout': $this.children('option').eq(i).attr('data-soldout')
                }).appendTo($list);
            }
        }
        var $listItems = $list.children('li');

        var optTarget = "#emptyContainer_" + OptionIndex;
        iscrolls[OptionIndex] = new IScroll(optTarget, {
            click: (mobilecheck() == true ? true : false),
            mouseWheel: true,
            scrollbars: false,
            fadeScrollbars: false
        });

        // slecte ë°•ìŠ¤  ìˆ¨ê¸°ê¸° 
        $(".s-hidden").hide();


        //ì…€ë ‰íŠ¸ë°•ìŠ¤ í—¤ë” : ë™ìž‘ì‹œ trigger ë¡œ ìˆ¨ê²¨ì§„ ê¸°ì¡´ select ë°•ìŠ¤ ë™ìž‘
        $styledSelect.on("click", function (e) {

            // 2014.10.14 ì˜µì…˜ ìˆ˜ì • : ìƒìœ„ ì½¤ë³´ê°€ ì„ íƒë˜ì—ˆì„ë•Œë§Œ í•˜ìœ„ ì½¤ë³´ í´ë¦­í• ìˆ˜ ìžˆë‹¤!
            // ì¶”ê°€êµ¬ì„±ìƒí’ˆì€ ëŒ€ìƒì—ì„œ ì œì™¸!
            var clickTest = true;
            if (($this).hasClass("orderOptionSelect")) {
                if (OptionIndex > 0) {

                    var selBoxTitle = $(".select_box").eq(OptionIndex - 1).find("option:first").text();
                    var selText = $("h2.styledSelect").eq(OptionIndex - 1).text();


                    if (selBoxTitle == selText) {
                        clickTest = false;
                    }
                }
            }

            if (clickTest) {

                e.stopPropagation();
                //close
                if ($prdOtiongs.eq(OptionIndex).hasClass("type1")) {
                    $prdOtiongs.eq(OptionIndex).removeClass("type1");
                    $(this).parent().removeClass("type2");
                    $(this).next().find("ul").hide();
                    $(".totalPriceInfo").show();
                    $("#emptyContainer_" + OptionIndex).height("0");
                    $("#orderConArea").removeAttr("style");
                    $("#orderScrollArea").removeAttr("style");
                    if ($("#orderConArea").height() > 189) {

                        $("#orderConArea").height(gs.floating.reSizeFloating());
                        $("#orderScrollArea").height("198");
                    } else {
                        $("#orderConArea").removeAttr("style");
                        $("#orderScrollArea").removeAttr("style");
                    }
                    $(".dropBoxArea").css("bottom", "0px");
                    iscrolls[OptionIndex].disable();
                    opDisplay = false;
                } else { //open

                    //order_con_position
                    $prdOtiongs.eq(OptionIndex).addClass("type1");
                    $(this).parent().addClass("type2");
                    $(this).next().find("ul").show();
                    $(".totalPriceInfo").hide();
                    $(".dropBoxArea").css("bottom", "0px");
                    $("#orderConArea").height(fullSize);
                    $("#orderScrollArea").height(fullSize);
                    $("#emptyContainer_" + OptionIndex).height("208");
                    iscrolls[OptionIndex].enable();
                    iscrolls[OptionIndex].refresh();

                    opDisplay = true;
                }
            }

        });


        //ì…€ë ‰íŠ¸ ì˜µì…˜
        $listItems.on("click", function (e) {
            e.stopPropagation();

            if ($(this).attr("data-soldout") === "Y" && !gs.orderOption.isFakeSelectBoxInit) {
                return false;
            }

            //2014.10.14 ì˜µì…˜ ìˆ˜ì • : ì„ íƒëœ ìƒí’ˆì´ ì—†ì–´ì„œ ì½¤ë³´ ì´ˆê¸°í™” ë˜ì—ˆì„ ê²½ìš° : ì²«ë²ˆì§¸ ì½¤ë³´ë§Œ í™œì„±í™”
            if ($(this).attr("data-soldout") === "Y" && gs.orderOption.isFakeSelectBoxInit) {
                $(".orderOptionSelect").parent().removeClass("type1"); //ê¸°ë³¸ì˜µì…˜
                $(".addCompositionProduct").parent().addClass("type1"); //ì¶”ê°€êµ¬ì„±
                $(".select_box").eq(0).addClass("type1");
            } else {

                if ($(this).attr('rel') == "none" && !($(this).siblings().hasClass("on"))) {
                    $(".select_box").eq(OptionIndex).addClass("type1");

                } else {
                    $(".select_box").eq(OptionIndex).removeClass("type1");
                    if ($(this).attr('data-attrprdcd')) $(this).addClass("on"); //ì½¤ë³´ 1ê°œì§œë¦¬ ì²´í¬ í‘œì‹œê°€ "on"

                    //2014.10.14 í•´ë‹¹ ì½¤ë³´ ë‹¤ìŒ ì½¤ë³´ë“¤ ì„ íƒê°’ ë””í´íŠ¸ê°’ìœ¼ë¡œ ë³€ê²½
                    $(".orderOptionSelect").each(function (j) {

                        if (j > OptionIndex) {

                            $(this).find("option:first").attr("selected", "selected");
                            $(this).next('h2.styledSelect').text($(this).children('option').eq(0).text());

                            //$(".select_box").removeClass("type1");
                            $(this).parent().removeClass("type1");
                            $(".select_box").eq(OptionIndex + 1).addClass("type1");
                        }
                    });
                }
            }

            $(".prdStyle:has(select)").removeClass("type1");
            $(".select_box").removeClass("type2");

            $styledSelect.text($(this).text()).removeClass('active');
            $this.val($(this).attr('rel'));

            order_con_position_size = (fullSize < $(".order_con_position").height() + 50) ? fullSize : $(".order_con_position").height() + 50;
            $(".select_list_con").hide();
            $("#emptyContainer_" + OptionIndex).height("0px");
            $("#orderConArea").removeAttr("style");
            $("#orderScrollArea").removeAttr("style");
            $(".totalPriceInfo").show();

            if ($("#orderConArea").height() > 189) {
                $("#orderConArea").height(fullSize);
                $("#orderScrollArea").height("198");
            } else {
                $("#orderConArea").removeAttr("style");
                $("#orderScrollArea").removeAttr("style");
            }
            /**
             * animation íš¨ê³¼ë¥¼ ì œê±°ì‹œì—ëŠ” settime ì œê±° ê°€ëŠ¥
             * animation íš¨ê³¼ì‚¬ìš©ì‹œì—ì„œ easing íƒ€ìž„ì„ ê³ ë ¤í•´ ì œì„¤ì • í•„ìš” (ëª¨ë°”ì¼ ì„±ëŠ¥ì„ ê³ ë ¤í•  í•„ìš” ìžˆìŒ)
             */

            opDisplay = false;
            $this.trigger("change");

        });

    });

    var focusOffSet = fullSize - $(".order_con_position").height();
    floating.reScrolling = function () {
        var offsetIscroll = $("#selectedOrderOptionList").height() / 2 - ($(window).height() - $("#selectedOrderOptionList").offset().top) / 2;
        var dls = 0;
        $(".optionWrap dl").each(function (index) {
            dls = dls + $(this).height() + 5;
        });
        var reScrTo = 198 - dls - $("#selectedOrderOptionList").height() - $("#selectedAddCompositionProductList li").first().height();

        return focusOffSet;
    };
    /**
     * ì…€ë ‰íŠ¸ ë°•ìŠ¤ 3ê°œ ì´ìƒì¼ ê²½ìš° 135 ê²½ìš° ë³¸í’ˆ í¬ì»¤ì‹±ì„ ì‹¤í–‰ 4ê°œì¼ê²½ìš°
     */
    floating.reScrollingOption = function () {
        var dls = 0;
        $(".optionWrap dl").each(function (index) {
            dls = dls + $(this).height() + 5;
        });
        var reScrTo = 198 - dls - $("#selectedOrderOptionList").height();

        return focusOffSet;
    };


    floating.reSizeFloating = function () {
        order_con_position_size = (fullSize < $(".order_con_position").height() + 50) ? fullSize : $(".order_con_position").height() + 50;
        return order_con_position_size;
    };
    if ($(".order_con_position").height() > 200) {
        $("#orderScrollArea").height("198");
        $("#orderConArea").height(fullSize);
    }
    var order_con_position_size = (fullSize < $(".order_con_position").height() + 50) ? fullSize : $(".order_con_position").height() + 50;


    /**
     * ë“œë¡œê·¸ì•¤ë“œëž
     *
     */

    $(".dropBoxArea").hide(); // í”Œë¡œíŒ… ì˜ì—­ ì•ˆì˜ ë ˆì´ì–´ ì¼ë¶€í° s2  ios5 ë”°ë¡œì˜¤ëŠ” ìž”ìƒíš¨ê³¼ ë°œìƒ ë°©ì–´ì½”ë“œ 
    jQuery(".orderBottomBuy input, .orderBottomBuy02 input , .orderBottomBuy03 input").on("click", function (e) {
        e.stopPropagation();

        $(".dropBoxArea").show();
        $(".totalPriceInfo .total").show();
        if (!$(".select_box ").hasClass("type2")) {
            $(".totalPriceInfo").show();
        }
        order_con_position = $(".order_con_position").height();
        if (order_con_position >= 200) {
            order_con_position = 210;
        }
        dropBoxCompare = (fullSize - order_con_position - priceIndicator - 10) * -1 < -27 ? (fullSize - order_con_position - priceIndicator - 10) * -1 : "-27";
        before_Bottom = dropBoxCompare;
        if (opDisplay) {
            $("#orderConArea").height(fullSize);
        }
        $(".orderBottomArea").hide();
        $(".dropBoxArea").animate({
            bottom: 0
        }, {
            done: function () {
                jQuery(".orderBottomArea").hide();


                before_oder_Bottom = fullSize - (parseInt($(".dropBoxArea").css("bottom")) * -1) - priceIndicator;

            }
        });


    });


    $(".dropBoxArea .dropBtnCon").on("dragstart", function (ev, dd) {
        $(".selectedOption input[name^='orderQuantity']").blur(); // í”Œë¡œíŒ… ë©”ë‰´ off : í¬ì»¤ìŠ¤ ì‚­ì œ
        checkDrag = true;
        dragOffY = dd.offsetY;
        nowBottom = parseInt($(".dropBoxArea").css("bottom"));
        startY = nowBottom;
    });


    $(".dropBoxArea .dropBtnCon").on("dragend", function (ev, dd) {
        $(".selectedOption input[name^='orderQuantity']").blur(); // í”Œë¡œíŒ… ë©”ë‰´ off : í¬ì»¤ìŠ¤ ì‚­ì œ
        endY = parseInt($(".dropBoxArea").css("bottom"));
        var b_height = $(".dropBoxArea").height(),
            movingsensY = b_height / 3,
            moveY = dragOffY - dd.offsetY;

        $(".dropBoxArea").animate({
            bottom: fullSize * -1
        }, {
            done: function () {
                $(".orderBottomArea").show();
                $(".dropBoxArea").hide();
            }
        });


        setTimeout(function () {
            checkDrag = false;

        }, 250);
        ev.stopPropagation();
    });

    $(".dropBoxArea .dropBtnCon").on("click", function (ev, dd) {
        $(".selectedOption input[name^='orderQuantity']").blur();
        endY = parseInt($(".dropBoxArea").css("bottom"));
        var b_height = $(".dropBoxArea").height(),
            movingsensY = b_height / 3;

        $(".dropBoxArea").animate({
            bottom: fullSize * -1
        }, {
            done: function () {
                $(".orderBottomArea").show();
                $(".dropBoxArea").hide();
            }
        });


        setTimeout(function () {
            checkDrag = false;

        }, 250);
        ev.stopPropagation();
    });


    $(".dropBoxArea .dropBtnCon").drag(function (ev, dd) {

        var posCB = (dragOffY - dd.offsetY) + nowBottom;
        var minCB = $(".dropBoxArea .orderContainer").height() * -1;
        if (posCB < minCB) {

            $(".dropBoxArea").css({
                bottom: minCB
            });
        } else if (posCB <= 30) {
            $(".dropBoxArea").css({
                bottom: posCB
            });
        }
    }, {
        click: false
    });


    // í•˜ë‹¨íƒ­ í”Œë¡œíŒ… íƒ­(ì¼ë°˜ì •ë³´,êµ¬ë§¤ì •ë³´,ìƒí’ˆí’ˆí‰,Q&A)	

    var nowScr = 0;
    var tabOffsets = $(".tabWrap").offset();
    $(window).scroll(function () {
        if ($(window).scrollTop() > parseInt(tabOffsets.top) - 44) {
            nowScr = $(window).scrollTop();
            $(".tabWrap nav").first().addClass("tapUp");
        } else if ($(window).scrollTop() < parseInt(tabOffsets.top) - 44) {
            nowScr = $(window).scrollTop();
            $(".tabWrap nav").first().removeClass("tapUp");
        }
    });

    gs.floating = floating;
})(jQuery);


(function ($) {

    var TopAndBottomTab = function (params) {
        var that = this;
        var DEFAULT_CONTENT_ELEMENT_KEY = "data-contentElement";
        var DEFAULT_SELECTED_TAB_CLASS = "on";
        this.$topTabList = params.$topTabList;
        this.$bottomTabList = params.$bottomTabList;
        this.firstShowingTabIndex = params.firstShowingTabIndex || 0;

        this.select = function (tabIndex) {
            that.$topTabList.removeClass(DEFAULT_SELECTED_TAB_CLASS);
            that.$bottomTabList.removeClass(DEFAULT_SELECTED_TAB_CLASS);

            var $selectedTopTab = $(that.$topTabList.get(tabIndex));
            var $selectedBottomTab = $(that.$bottomTabList.get(tabIndex));
            $selectedTopTab.addClass(DEFAULT_SELECTED_TAB_CLASS);
            $selectedBottomTab.addClass(DEFAULT_SELECTED_TAB_CLASS);

            // tabContent hide ì²˜ë¦¬
            that.$topTabList.each(function () {
                $($(this).attr(DEFAULT_CONTENT_ELEMENT_KEY)).hide();
            });

            var selectedContentElement = $selectedTopTab.attr(DEFAULT_CONTENT_ELEMENT_KEY);
            if (!selectedContentElement) {
                selectedContentElement = $selectedBottomTab.attr(DEFAULT_CONTENT_ELEMENT_KEY);
            }
            $(selectedContentElement).show();
        };

        var clickCallback = function () {
            var tabIndex = $(this).index();
            that.select(tabIndex);
        };

        this.$topTabList.on("click", clickCallback);
        this.$bottomTabList.on("click", clickCallback);

        // ë§¨ ì²˜ìŒ Tab ë³´ì—¬ì§„ ì±„ë¡œ í•˜ê¸°
        this.select(this.firstShowingTabIndex);
    };

    gs.TopAndBottomTab = TopAndBottomTab;


    topMenu = new gs.TopAndBottomTab({
        $topTabList: $(".prdTab li"),
        $bottomTabList: $(".prdTabBtm li")
    });


    gs.swiper = new Swiper(".swiper-container", {
        resizeEvent: true,
        loop: true,
        onSlideChangeEnd: function (swiper) {
            $(".prdPhotoPaging .nowDisplayImageNumber").text(gs.swiper.activeLoopIndex + 1);

        },
        onFirstInit: function () {
            // ì•±ì—ì„œ ë³´ê¸°ê°€ ë°‘ìœ¼ë¡œ ê¹”ë¦¬ëŠ” ë¬¸ì œê°€ ìžˆì–´ì„œ z-index ê°•ì œ ë³´ì •
            $(".swiper-container .prdPhoto img").each(function () {
                $(this).css("z-index", "-1");
            })
        }
    });
    $(".prdPhotoPaging .prev").on("click", function () {
        gs.swiper.swipePrev();
    });
    $(".prdPhotoPaging .next").on("click", function () {
        gs.swiper.swipeNext();
    });
})(jQuery);

function snsSharePopup() {
    //var stop = ($(window).height() - 115) / 2;
    var stop = ( $(window).height() / 2 - ( 260 / 2 ) );

    $('html').css({'overflow': 'hidden'});
    $('.layerAlert').css('height', $(document).height());
    $('.layerAlertFrame').css("top", stop + "px");
    $(".layerAlert").hide();
    $("#divAlertShare").show();
}

function zzimPopup() {

    var popup_top = ( $(window).height() / 2 - ( 150 / 2 ) );
    var popup_left = ( $(window).width() - 280 ) / 2;

    $('html').css({overflow: "hidden", position: "fixed", width: "100%"});
    $('.back_back').css('height', $(document).height());
    $('.zzinm_info_con').css({"top": popup_top + "px", "left": popup_left + "px"});
    $(".back_back").hide();
    $("#divAlertWishFail").show();
}

//세종 신규 구현

// Intercept add to cart operations and perform them via AJAX instead
// This will trigger on any input with class "addToCart" or "addToWishlist"
$('body').on('click', '.addToCart', function () {

    var itemRequest = BLC.serializeObject($("#cartAddForm"));
    var $options = $('.product-option-group > .option-value');

    $options.each(function (index, element) {
        var optionType = $(element).data('optiontype');
        console.log("optionType : " + optionType);

        var value;

        if ("TEXT" == optionType) {
            value = $(element).next().find('input').val();
        } else if ("TEXTAREA" == optionType) {
            value = $(element).next().find('textarea').val();
        } else if ("DECIMAL" == optionType) {
            value = $(element).next().find('input').val();
        } else {
            value = $(element).next().find('select').val();
            if (value == null)
                value = $(element).next().find('select').text();

        }

        itemRequest['itemAttributes[' + $(element).attr('id') + ']'] = value;
    });

    console.log(itemRequest);

    BLC.ajax({
            url: '/cart/add',
            type: "POST",
            dataType: "json",
            data: itemRequest
        }, function (data, extraData) {
            if (data.error) {
                if (data.error == 'allOptionsRequired') {
                    alert("옵션이 없어서 에러 발생!")
                } else if (data.error == 'productOptionValidationError') {
                    // find the product option that failed validation with jquery
                    // put a message next to that text box with value = data.message
                    //$productOptionsSpan.text('Product Validation Failed: '+ data.errorCode+' '+data.errorMessage);
                    //$productOptionsSpan.css('display', 'block');
                    //$productOptionsSpan.effect('highlight', {}, 1000);
                    alert('Product Validation Failed: ' + data.errorCode + ' ' + data.errorMessage);
                } else if (data.error == 'illegalCartOperation') {
                    alert(data.exception);
                } else if (data.error = 'inventoryUnavailable') {
                    HC.showNotification("This item is no longer in stock. We apologize for the inconvenience.", 7000);
                } else {
                    HC.showNotification("Error adding to cart");
                }
            } else {
                //카트에 정상적으로 추가되었으면 카트페이지로 이동
                location.href = "/cart/list";
                //$productOptionsSpan.css('display', 'none');
                //updateHeaderCartItemsCount(data.cartItemCount);
                //
                //if (modalClick) {
                //    $.modal.close();
                //} else if (wishlistAdd) {
                //    showInCartButton(data.productId, 'wishlist');
                //} else {
                //    showInCartButton(data.productId, 'cart');
                //}
                //
                //if (wishlistAdd) {
                //    HC.showNotification(data.productName + "  has been added to your wishlist!");
                //} else {
                //    HC.showNotification(data.productName + "  has been added to the cart!", 2000);
                //}
            }
        }
    );


    return false;
});