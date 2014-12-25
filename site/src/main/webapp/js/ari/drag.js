var Swiper = function(selector, params) {
    "use strict";
    if (document.body.__defineGetter__) {
        if (HTMLElement) {
            var element = HTMLElement.prototype;
            if (element.__defineGetter__) {
                element.__defineGetter__("outerHTML", function() {
                    return (new XMLSerializer).serializeToString(this)
                })
            }
        }
    }
    if (!window.getComputedStyle) {
        window.getComputedStyle = function(el, pseudo) {
            this.el = el;
            this.getPropertyValue = function(prop) {
                var re = /(\-([a-z]){1})/g;
                if (prop === "float")
                    prop = "styleFloat";
                if (re.test(prop)) {
                    prop = prop.replace(re, function() {
                        return arguments[2].toUpperCase()
                    })
                }
                return el.currentStyle[prop] ? el.currentStyle[prop] : null
            };
            return this
        }
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = start || 0, j = this.length; i < j; i++) {
                if (this[i] === obj) {
                    return i
                }
            }
            return -1
        }
    }
    if (!document.querySelectorAll) {
        if (!window.jQuery)
            return
    }
    function $$(selector, context) {
        if (document.querySelectorAll)
            return (context || document).querySelectorAll(selector);
        else
            return jQuery(selector, context)
    }
    if (typeof selector === "undefined")
        return;
    if (!selector.nodeType) {
        if ($$(selector).length === 0)
            return
    }
    var _this = this;
    _this.touches = {start: 0,startX: 0,startY: 0,current: 0,currentX: 0,currentY: 0,diff: 0,abs: 0};
    _this.positions = {start: 0,abs: 0,diff: 0,current: 0};
    _this.times = {start: 0,end: 0};
    _this.id = (new Date).getTime();
    _this.container = selector.nodeType ? selector : $$(selector)[0];
    _this.isTouched = false;
    _this.isMoved = false;
    _this.activeIndex = 0;
    _this.centerIndex = 0;
    _this.activeLoaderIndex = 0;
    _this.activeLoopIndex = 0;
    _this.previousIndex = null;
    _this.velocity = 0;
    _this.snapGrid = [];
    _this.slidesGrid = [];
    _this.imagesToLoad = [];
    _this.imagesLoaded = 0;
    _this.wrapperLeft = 0;
    _this.wrapperRight = 0;
    _this.wrapperTop = 0;
    _this.wrapperBottom = 0;
    _this.isAndroid = navigator.userAgent.toLowerCase().indexOf("android") >= 0;
    var wrapper, slideSize, wrapperSize, direction, isScrolling, containerSize;
    var defaults = {eventTarget: "wrapper",mode: "horizontal",touchRatio: 1,speed: 300,freeMode: false,freeModeFluid: false,momentumRatio: 1,momentumBounce: true,momentumBounceRatio: 1,slidesPerView: 1,slidesPerGroup: 1,simulateTouch: true,followFinger: true,shortSwipes: true,longSwipesRatio: .5,moveStartThreshold: false,onlyExternal: false,createPagination: true,pagination: false,paginationElement: "span",paginationClickable: false,paginationAsRange: true,resistance: true,scrollContainer: false,preventLinks: true,preventLinksPropagation: false,noSwiping: false,noSwipingClass: "swiper-no-swiping",initialSlide: 0,keyboardControl: false,mousewheelControl: false,mousewheelControlForceToAxis: false,useCSS3Transforms: true,autoplay: false,autoplayDisableOnInteraction: true,autoplayStopOnLast: false,loop: false,loopAdditionalSlides: 0,calculateHeight: false,cssWidthAndHeight: false,updateOnImagesReady: true,releaseFormElements: true,watchActiveIndex: false,visibilityFullFit: false,offsetPxBefore: 0,offsetPxAfter: 0,offsetSlidesBefore: 0,offsetSlidesAfter: 0,centeredSlides: false,queueStartCallbacks: false,queueEndCallbacks: false,autoResize: true,resizeReInit: false,DOMAnimation: true,loader: {slides: [],slidesHTMLType: "inner",surroundGroups: 1,logic: "reload",loadAllSlides: false},slideElement: "div",slideClass: "swiper-slide",slideActiveClass: "swiper-slide-active",slideVisibleClass: "swiper-slide-visible",slideDuplicateClass: "swiper-slide-duplicate",wrapperClass: "swiper-wrapper",paginationElementClass: "swiper-pagination-switch",paginationActiveClass: "swiper-active-switch",paginationVisibleClass: "swiper-visible-switch"};
    params = params || {};
    for (var prop in defaults) {
        if (prop in params && typeof params[prop] === "object") {
            for (var subProp in defaults[prop]) {
                if (!(subProp in params[prop])) {
                    params[prop][subProp] = defaults[prop][subProp]
                }
            }
        } else if (!(prop in params)) {
            params[prop] = defaults[prop]
        }
    }
    _this.params = params;
    if (params.scrollContainer) {
        params.freeMode = true;
        params.freeModeFluid = true
    }
    if (params.loop) {
        params.resistance = "100%"
    }
    var isH = params.mode === "horizontal";
    var desktopEvents = ["mousedown", "mousemove", "mouseup"];
    if (_this.browser.ie10)
        desktopEvents = ["MSPointerDown", "MSPointerMove", "MSPointerUp"];
    if (_this.browser.ie11)
        desktopEvents = ["pointerdown", "pointermove", "pointerup"];
    _this.touchEvents = {touchStart: _this.support.touch || !params.simulateTouch ? "touchstart" : desktopEvents[0],touchMove: _this.support.touch || !params.simulateTouch ? "touchmove" : desktopEvents[1],touchEnd: _this.support.touch || !params.simulateTouch ? "touchend" : desktopEvents[2]};
    for (var i = _this.container.childNodes.length - 1; i >= 0; i--) {
        if (_this.container.childNodes[i].className) {
            var _wrapperClasses = _this.container.childNodes[i].className.split(/\s+/);
            for (var j = 0; j < _wrapperClasses.length; j++) {
                if (_wrapperClasses[j] === params.wrapperClass) {
                    wrapper = _this.container.childNodes[i]
                }
            }
        }
    }
    _this.wrapper = wrapper;
    _this._extendSwiperSlide = function(el) {
        el.append = function() {
            if (params.loop) {
                el.insertAfter(_this.slides.length - _this.loopedSlides)
            } else {
                _this.wrapper.appendChild(el);
                _this.reInit()
            }
            return el
        };
        el.prepend = function() {
            if (params.loop) {
                _this.wrapper.insertBefore(el, _this.slides[_this.loopedSlides]);
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop()
            } else {
                _this.wrapper.insertBefore(el, _this.wrapper.firstChild)
            }
            _this.reInit();
            return el
        };
        el.insertAfter = function(index) {
            if (typeof index === "undefined")
                return false;
            var beforeSlide;
            if (params.loop) {
                beforeSlide = _this.slides[index + 1 + _this.loopedSlides];
                if (beforeSlide) {
                    _this.wrapper.insertBefore(el, beforeSlide)
                } else {
                    _this.wrapper.appendChild(el)
                }
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop()
            } else {
                beforeSlide = _this.slides[index + 1];
                _this.wrapper.insertBefore(el, beforeSlide)
            }
            _this.reInit();
            return el
        };
        el.clone = function() {
            return _this._extendSwiperSlide(el.cloneNode(true))
        };
        el.remove = function() {
            _this.wrapper.removeChild(el);
            _this.reInit()
        };
        el.html = function(html) {
            if (typeof html === "undefined") {
                return el.innerHTML
            } else {
                el.innerHTML = html;
                return el
            }
        };
        el.index = function() {
            var index;
            for (var i = _this.slides.length - 1; i >= 0; i--) {
                if (el === _this.slides[i])
                    index = i
            }
            return index
        };
        el.isActive = function() {
            if (el.index() === _this.activeIndex)
                return true;
            else
                return false
        };
        if (!el.swiperSlideDataStorage)
            el.swiperSlideDataStorage = {};
        el.getData = function(name) {
            return el.swiperSlideDataStorage[name]
        };
        el.setData = function(name, value) {
            el.swiperSlideDataStorage[name] = value;
            return el
        };
        el.data = function(name, value) {
            if (!value) {
                return el.getAttribute("data-" + name)
            } else {
                el.setAttribute("data-" + name, value);
                return el
            }
        };
        el.getWidth = function(outer) {
            return _this.h.getWidth(el, outer)
        };
        el.getHeight = function(outer) {
            return _this.h.getHeight(el, outer)
        };
        el.getOffset = function() {
            return _this.h.getOffset(el)
        };
        return el
    };
    _this.calcSlides = function(forceCalcSlides) {
        var oldNumber = _this.slides ? _this.slides.length : false;
        _this.slides = [];
        _this.displaySlides = [];
        for (var i = 0; i < _this.wrapper.childNodes.length; i++) {
            if (_this.wrapper.childNodes[i].className) {
                var _className = _this.wrapper.childNodes[i].className;
                var _slideClasses = _className.split(/\s+/);
                for (var j = 0; j < _slideClasses.length; j++) {
                    if (_slideClasses[j] === params.slideClass) {
                        _this.slides.push(_this.wrapper.childNodes[i])
                    }
                }
            }
        }
        for (i = _this.slides.length - 1; i >= 0; i--) {
            _this._extendSwiperSlide(_this.slides[i])
        }
        if (oldNumber === false)
            return;
        if (oldNumber !== _this.slides.length || forceCalcSlides) {
            removeSlideEvents();
            addSlideEvents();
            _this.updateActiveSlide();
            if (_this.params.pagination)
                _this.createPagination();
            _this.callPlugins("numberOfSlidesChanged")
        }
    };
    _this.createSlide = function(html, slideClassList, el) {
        slideClassList = slideClassList || _this.params.slideClass;
        el = el || params.slideElement;
        var newSlide = document.createElement(el);
        newSlide.innerHTML = html || "";
        newSlide.className = slideClassList;
        return _this._extendSwiperSlide(newSlide)
    };
    _this.appendSlide = function(html, slideClassList, el) {
        if (!html)
            return;
        if (html.nodeType) {
            return _this._extendSwiperSlide(html).append()
        } else {
            return _this.createSlide(html, slideClassList, el).append()
        }
    };
    _this.prependSlide = function(html, slideClassList, el) {
        if (!html)
            return;
        if (html.nodeType) {
            return _this._extendSwiperSlide(html).prepend()
        } else {
            return _this.createSlide(html, slideClassList, el).prepend()
        }
    };
    _this.insertSlideAfter = function(index, html, slideClassList, el) {
        if (typeof index === "undefined")
            return false;
        if (html.nodeType) {
            return _this._extendSwiperSlide(html).insertAfter(index)
        } else {
            return _this.createSlide(html, slideClassList, el).insertAfter(index)
        }
    };
    _this.removeSlide = function(index) {
        if (_this.slides[index]) {
            if (params.loop) {
                if (!_this.slides[index + _this.loopedSlides])
                    return false;
                _this.slides[index + _this.loopedSlides].remove();
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop()
            } else
                _this.slides[index].remove();
            return true
        } else
            return false
    };
    _this.removeLastSlide = function() {
        if (_this.slides.length > 0) {
            if (params.loop) {
                _this.slides[_this.slides.length - 1 - _this.loopedSlides].remove();
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop()
            } else
                _this.slides[_this.slides.length - 1].remove();
            return true
        } else {
            return false
        }
    };
    _this.removeAllSlides = function() {
        for (var i = _this.slides.length - 1; i >= 0; i--) {
            _this.slides[i].remove()
        }
    };
    _this.getSlide = function(index) {
        return _this.slides[index]
    };
    _this.getLastSlide = function() {
        return _this.slides[_this.slides.length - 1]
    };
    _this.getFirstSlide = function() {
        return _this.slides[0]
    };
    _this.activeSlide = function() {
        return _this.slides[_this.activeIndex]
    };
    _this.fireCallback = function() {
        var callback = arguments[0];
        if (Object.prototype.toString.call(callback) === "[object Array]") {
            for (var i = 0; i < callback.length; i++) {
                if (typeof callback[i] === "function") {
                    callback[i](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5])
                }
            }
        } else if (Object.prototype.toString.call(callback) === "[object String]") {
            if (params["on" + callback])
                _this.fireCallback(params["on" + callback])
        } else {
            callback(arguments[1], arguments[2], arguments[3], arguments[4], arguments[5])
        }
    };
    function isArray(obj) {
        if (Object.prototype.toString.apply(obj) === "[object Array]")
            return true;
        return false
    }
    _this.addCallback = function(callback, func) {
        var _this = this, tempFunc;
        if (_this.params["on" + callback]) {
            if (isArray(this.params["on" + callback])) {
                return this.params["on" + callback].push(func)
            } else if (typeof this.params["on" + callback] === "function") {
                tempFunc = this.params["on" + callback];
                this.params["on" + callback] = [];
                this.params["on" + callback].push(tempFunc);
                return this.params["on" + callback].push(func)
            }
        } else {
            this.params["on" + callback] = [];
            return this.params["on" + callback].push(func)
        }
    };
    _this.removeCallbacks = function(callback) {
        if (_this.params["on" + callback]) {
            _this.params["on" + callback] = null
        }
    };
    var _plugins = [];
    for (var plugin in _this.plugins) {
        if (params[plugin]) {
            var p = _this.plugins[plugin](_this, params[plugin]);
            if (p)
                _plugins.push(p)
        }
    }
    _this.callPlugins = function(method, args) {
        if (!args)
            args = {};
        for (var i = 0; i < _plugins.length; i++) {
            if (method in _plugins[i]) {
                _plugins[i][method](args)
            }
        }
    };
    if ((_this.browser.ie10 || _this.browser.ie11) && !params.onlyExternal) {
        _this.wrapper.classList.add("swiper-wp8-" + (isH ? "horizontal" : "vertical"))
    }
    if (params.freeMode) {
        _this.container.className += " swiper-free-mode"
    }
    _this.initialized = false;
    _this.init = function(force, forceCalcSlides) {
        var _width = _this.h.getWidth(_this.container);
        var _height = _this.h.getHeight(_this.container);
        if (_width === _this.width && _height === _this.height && !force)
            return;
        _this.width = _width;
        _this.height = _height;
        var slideWidth, slideHeight, slideMaxHeight, wrapperWidth, wrapperHeight, slideLeft;
        var i;
        containerSize = isH ? _width : _height;
        var wrapper = _this.wrapper;
        if (force) {
            _this.calcSlides(forceCalcSlides)
        }
        if (params.slidesPerView === "auto") {
            var slidesWidth = 0;
            var slidesHeight = 0;
            if (params.slidesOffset > 0) {
                wrapper.style.paddingLeft = "";
                wrapper.style.paddingRight = "";
                wrapper.style.paddingTop = "";
                wrapper.style.paddingBottom = ""
            }
            wrapper.style.width = "";
            wrapper.style.height = "";
            if (params.offsetPxBefore > 0) {
                if (isH)
                    _this.wrapperLeft = params.offsetPxBefore;
                else
                    _this.wrapperTop = params.offsetPxBefore
            }
            if (params.offsetPxAfter > 0) {
                if (isH)
                    _this.wrapperRight = params.offsetPxAfter;
                else
                    _this.wrapperBottom = params.offsetPxAfter
            }
            if (params.centeredSlides) {
                if (isH) {
                    _this.wrapperLeft = (containerSize - this.slides[0].getWidth(true)) / 2;
                    _this.wrapperRight = (containerSize - _this.slides[_this.slides.length - 1].getWidth(true)) / 2
                } else {
                    _this.wrapperTop = (containerSize - _this.slides[0].getHeight(true)) / 2;
                    _this.wrapperBottom = (containerSize - _this.slides[_this.slides.length - 1].getHeight(true)) / 2
                }
            }
            if (isH) {
                if (_this.wrapperLeft >= 0)
                    wrapper.style.paddingLeft = _this.wrapperLeft + "px";
                if (_this.wrapperRight >= 0)
                    wrapper.style.paddingRight = _this.wrapperRight + "px"
            } else {
                if (_this.wrapperTop >= 0)
                    wrapper.style.paddingTop = _this.wrapperTop + "px";
                if (_this.wrapperBottom >= 0)
                    wrapper.style.paddingBottom = _this.wrapperBottom + "px"
            }
            slideLeft = 0;
            var centeredSlideLeft = 0;
            _this.snapGrid = [];
            _this.slidesGrid = [];
            slideMaxHeight = 0;
            for (i = 0; i < _this.slides.length; i++) {
                slideWidth = _this.slides[i].getWidth(true);
                slideHeight = _this.slides[i].getHeight(true);
                if (params.calculateHeight) {
                    slideMaxHeight = Math.max(slideMaxHeight, slideHeight)
                }
                var _slideSize = isH ? slideWidth : slideHeight;
                if (params.centeredSlides) {
                    var nextSlideWidth = i === _this.slides.length - 1 ? 0 : _this.slides[i + 1].getWidth(true);
                    var nextSlideHeight = i === _this.slides.length - 1 ? 0 : _this.slides[i + 1].getHeight(true);
                    var nextSlideSize = isH ? nextSlideWidth : nextSlideHeight;
                    if (_slideSize > containerSize) {
                        for (var j = 0; j <= Math.floor(_slideSize / (containerSize + _this.wrapperLeft)); j++) {
                            if (j === 0)
                                _this.snapGrid.push(slideLeft + _this.wrapperLeft);
                            else
                                _this.snapGrid.push(slideLeft + _this.wrapperLeft + containerSize * j)
                        }
                        _this.slidesGrid.push(slideLeft + _this.wrapperLeft)
                    } else {
                        _this.snapGrid.push(centeredSlideLeft);
                        _this.slidesGrid.push(centeredSlideLeft)
                    }
                    centeredSlideLeft += _slideSize / 2 + nextSlideSize / 2
                } else {
                    if (_slideSize > containerSize) {
                        for (var k = 0; k <= Math.floor(_slideSize / containerSize); k++) {
                            _this.snapGrid.push(slideLeft + containerSize * k)
                        }
                    } else {
                        _this.snapGrid.push(slideLeft)
                    }
                    _this.slidesGrid.push(slideLeft)
                }
                slideLeft += _slideSize;
                slidesWidth += slideWidth;
                slidesHeight += slideHeight
            }
            if (params.calculateHeight)
                _this.height = slideMaxHeight;
            if (isH) {
                wrapperSize = slidesWidth + _this.wrapperRight + _this.wrapperLeft;
                wrapper.style.width = slidesWidth + "px";
                wrapper.style.height = _this.height + "px"
            } else {
                wrapperSize = slidesHeight + _this.wrapperTop + _this.wrapperBottom;
                wrapper.style.width = _this.width + "px";
                wrapper.style.height = slidesHeight + "px"
            }
        } else if (params.scrollContainer) {
            wrapper.style.width = "";
            wrapper.style.height = "";
            wrapperWidth = _this.slides[0].getWidth(true);
            wrapperHeight = _this.slides[0].getHeight(true);
            wrapperSize = isH ? wrapperWidth : wrapperHeight;
            wrapper.style.width = wrapperWidth + "px";
            wrapper.style.height = wrapperHeight + "px";
            slideSize = isH ? wrapperWidth : wrapperHeight
        } else {
            if (params.calculateHeight) {
                slideMaxHeight = 0;
                wrapperHeight = 0;
                if (!isH)
                    _this.container.style.height = "";
                wrapper.style.height = "";
                for (i = 0; i < _this.slides.length; i++) {
                    _this.slides[i].style.height = "";
                    slideMaxHeight = Math.max(_this.slides[i].getHeight(true), slideMaxHeight);
                    if (!isH)
                        wrapperHeight += _this.slides[i].getHeight(true)
                }
                slideHeight = slideMaxHeight;
                _this.height = slideHeight;
                if (isH)
                    wrapperHeight = slideHeight;
                else {
                    containerSize = slideHeight;
                    _this.container.style.height = containerSize + "px"
                }
            } else {
                slideHeight = isH ? _this.height : _this.height / params.slidesPerView;
                wrapperHeight = isH ? _this.height : _this.slides.length * slideHeight
            }
            slideWidth = isH ? _this.width / params.slidesPerView : _this.width;
            wrapperWidth = isH ? _this.slides.length * slideWidth : _this.width;
            slideSize = isH ? slideWidth : slideHeight;
            if (params.offsetSlidesBefore > 0) {
                if (isH)
                    _this.wrapperLeft = slideSize * params.offsetSlidesBefore;
                else
                    _this.wrapperTop = slideSize * params.offsetSlidesBefore
            }
            if (params.offsetSlidesAfter > 0) {
                if (isH)
                    _this.wrapperRight = slideSize * params.offsetSlidesAfter;
                else
                    _this.wrapperBottom = slideSize * params.offsetSlidesAfter
            }
            if (params.offsetPxBefore > 0) {
                if (isH)
                    _this.wrapperLeft = params.offsetPxBefore;
                else
                    _this.wrapperTop = params.offsetPxBefore
            }
            if (params.offsetPxAfter > 0) {
                if (isH)
                    _this.wrapperRight = params.offsetPxAfter;
                else
                    _this.wrapperBottom = params.offsetPxAfter
            }
            if (params.centeredSlides) {
                if (isH) {
                    _this.wrapperLeft = (containerSize - slideSize) / 2;
                    _this.wrapperRight = (containerSize - slideSize) / 2
                } else {
                    _this.wrapperTop = (containerSize - slideSize) / 2;
                    _this.wrapperBottom = (containerSize - slideSize) / 2
                }
            }
            if (isH) {
                if (_this.wrapperLeft > 0)
                    wrapper.style.paddingLeft = _this.wrapperLeft + "px";
                if (_this.wrapperRight > 0)
                    wrapper.style.paddingRight = _this.wrapperRight + "px"
            } else {
                if (_this.wrapperTop > 0)
                    wrapper.style.paddingTop = _this.wrapperTop + "px";
                if (_this.wrapperBottom > 0)
                    wrapper.style.paddingBottom = _this.wrapperBottom + "px"
            }
            wrapperSize = isH ? wrapperWidth + _this.wrapperRight + _this.wrapperLeft : wrapperHeight + _this.wrapperTop + _this.wrapperBottom;
            if (!params.cssWidthAndHeight) {
                if (parseFloat(wrapperWidth) > 0) {
                    wrapper.style.width = wrapperWidth + "px"
                }
                if (parseFloat(wrapperHeight) > 0) {
                    wrapper.style.height = wrapperHeight + "px"
                }
            }
            slideLeft = 0;
            _this.snapGrid = [];
            _this.slidesGrid = [];
            for (i = 0; i < _this.slides.length; i++) {
                _this.snapGrid.push(slideLeft);
                _this.slidesGrid.push(slideLeft);
                slideLeft += slideSize;
                if (!params.cssWidthAndHeight) {
                    if (parseFloat(slideWidth) > 0) {
                        _this.slides[i].style.width = slideWidth + "px"
                    }
                    if (parseFloat(slideHeight) > 0) {
                        _this.slides[i].style.height = slideHeight + "px"
                    }
                }
            }
        }
        if (!_this.initialized) {
            _this.callPlugins("onFirstInit");
            if (params.onFirstInit)
                _this.fireCallback(params.onFirstInit, _this)
        } else {
            _this.callPlugins("onInit");
            if (params.onInit)
                _this.fireCallback(params.onInit, _this)
        }
        _this.initialized = true
    };
    _this.reInit = function(forceCalcSlides) {
        _this.init(true, forceCalcSlides)
    };
    _this.resizeFix = function(reInit) {
        _this.callPlugins("beforeResizeFix");
        _this.init(params.resizeReInit || reInit);
        if (!params.freeMode) {
            _this.swipeTo(params.loop ? _this.activeLoopIndex : _this.activeIndex, 0, false);
            if (params.autoplay) {
                if (_this.support.transitions && typeof autoplayTimeoutId !== "undefined") {
                    if (typeof autoplayTimeoutId !== "undefined") {
                        clearTimeout(autoplayTimeoutId);
                        autoplayTimeoutId = undefined;
                        _this.startAutoplay()
                    }
                } else {
                    if (typeof autoplayIntervalId !== "undefined") {
                        clearInterval(autoplayIntervalId);
                        autoplayIntervalId = undefined;
                        _this.startAutoplay()
                    }
                }
            }
        } else if (_this.getWrapperTranslate() < -maxWrapperPosition()) {
            _this.setWrapperTransition(0);
            _this.setWrapperTranslate(-maxWrapperPosition())
        }
        _this.callPlugins("afterResizeFix")
    };
    function maxWrapperPosition() {
        var a = wrapperSize - containerSize;
        if (params.freeMode) {
            a = wrapperSize - containerSize
        }
        if (params.slidesPerView > _this.slides.length)
            a = 0;
        if (a < 0)
            a = 0;
        return a
    }
    function minWrapperPosition() {
        var a = 0;
        return a
    }
    function initEvents() {
        var bind = _this.h.addEventListener;
        var eventTarget = params.eventTarget === "wrapper" ? _this.wrapper : _this.container;
        if (!(_this.browser.ie10 || _this.browser.ie11)) {
            if (_this.support.touch) {
                bind(eventTarget, "touchstart", onTouchStart);
                bind(eventTarget, "touchmove", onTouchMove);
                bind(eventTarget, "touchend", onTouchEnd)
            }
            if (params.simulateTouch) {
                bind(eventTarget, "mousedown", onTouchStart);
                bind(document, "mousemove", onTouchMove);
                bind(document, "mouseup", onTouchEnd)
            }
        } else {
            bind(eventTarget, _this.touchEvents.touchStart, onTouchStart);
            bind(document, _this.touchEvents.touchMove, onTouchMove);
            bind(document, _this.touchEvents.touchEnd, onTouchEnd)
        }
        if (params.autoResize) {
            bind(window, "resize", _this.resizeFix)
        }
        addSlideEvents();
        _this._wheelEvent = false;
        if (params.mousewheelControl) {
            if (document.onmousewheel !== undefined) {
                _this._wheelEvent = "mousewheel"
            }
            try {
                new WheelEvent("wheel");
                _this._wheelEvent = "wheel"
            } catch (e) {
            }
            if (!_this._wheelEvent) {
                _this._wheelEvent = "DOMMouseScroll"
            }
            if (_this._wheelEvent) {
                bind(_this.container, _this._wheelEvent, handleMousewheel)
            }
        }
        function _loadImage(src) {
            var image = new Image;
            image.onload = function() {
                _this.imagesLoaded++;
                if (_this.imagesLoaded === _this.imagesToLoad.length) {
                    _this.reInit();
                    if (params.onImagesReady)
                        _this.fireCallback(params.onImagesReady, _this)
                }
            };
            image.src = src
        }
        if (params.keyboardControl) {
            bind(document, "keydown", handleKeyboardKeys)
        }
        if (params.updateOnImagesReady) {
            _this.imagesToLoad = $$("img", _this.container);
            for (var i = 0; i < _this.imagesToLoad.length; i++) {
                _loadImage(_this.imagesToLoad[i].getAttribute("src"))
            }
        }
    }
    _this.destroy = function() {
        var unbind = _this.h.removeEventListener;
        var eventTarget = params.eventTarget === "wrapper" ? _this.wrapper : _this.container;
        if (!(_this.browser.ie10 || _this.browser.ie11)) {
            if (_this.support.touch) {
                unbind(eventTarget, "touchstart", onTouchStart);
                unbind(eventTarget, "touchmove", onTouchMove);
                unbind(eventTarget, "touchend", onTouchEnd)
            }
            if (params.simulateTouch) {
                unbind(eventTarget, "mousedown", onTouchStart);
                unbind(document, "mousemove", onTouchMove);
                unbind(document, "mouseup", onTouchEnd)
            }
        } else {
            unbind(eventTarget, _this.touchEvents.touchStart, onTouchStart);
            unbind(document, _this.touchEvents.touchMove, onTouchMove);
            unbind(document, _this.touchEvents.touchEnd, onTouchEnd)
        }
        if (params.autoResize) {
            unbind(window, "resize", _this.resizeFix)
        }
        removeSlideEvents();
        if (params.paginationClickable) {
            removePaginationEvents()
        }
        if (params.mousewheelControl && _this._wheelEvent) {
            unbind(_this.container, _this._wheelEvent, handleMousewheel)
        }
        if (params.keyboardControl) {
            unbind(document, "keydown", handleKeyboardKeys)
        }
        if (params.autoplay) {
            _this.stopAutoplay()
        }
        _this.callPlugins("onDestroy");
        _this = null
    };
    function addSlideEvents() {
        var bind = _this.h.addEventListener, i;
        if (params.preventLinks) {
            var links = $$("a", _this.container);
            for (i = 0; i < links.length; i++) {
                bind(links[i], "click", preventClick)
            }
        }
        if (params.releaseFormElements) {
            var formElements = $$("input, textarea, select", _this.container);
            for (i = 0; i < formElements.length; i++) {
                bind(formElements[i], _this.touchEvents.touchStart, releaseForms, true)
            }
        }
        if (params.onSlideClick) {
            for (i = 0; i < _this.slides.length; i++) {
                bind(_this.slides[i], "click", slideClick)
            }
        }
        if (params.onSlideTouch) {
            for (i = 0; i < _this.slides.length; i++) {
                bind(_this.slides[i], _this.touchEvents.touchStart, slideTouch)
            }
        }
    }
    function removeSlideEvents() {
        var unbind = _this.h.removeEventListener, i;
        if (params.onSlideClick) {
            for (i = 0; i < _this.slides.length; i++) {
                unbind(_this.slides[i], "click", slideClick)
            }
        }
        if (params.onSlideTouch) {
            for (i = 0; i < _this.slides.length; i++) {
                unbind(_this.slides[i], _this.touchEvents.touchStart, slideTouch)
            }
        }
        if (params.releaseFormElements) {
            var formElements = $$("input, textarea, select", _this.container);
            for (i = 0; i < formElements.length; i++) {
                unbind(formElements[i], _this.touchEvents.touchStart, releaseForms, true)
            }
        }
        if (params.preventLinks) {
            var links = $$("a", _this.container);
            for (i = 0; i < links.length; i++) {
                unbind(links[i], "click", preventClick)
            }
        }
    }
    function handleKeyboardKeys(e) {
        var kc = e.keyCode || e.charCode;
        if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
            var inView = false;
            var swiperOffset = _this.h.getOffset(_this.container);
            var scrollLeft = _this.h.windowScroll().left;
            var scrollTop = _this.h.windowScroll().top;
            var windowWidth = _this.h.windowWidth();
            var windowHeight = _this.h.windowHeight();
            var swiperCoord = [[swiperOffset.left, swiperOffset.top], [swiperOffset.left + _this.width, swiperOffset.top], [swiperOffset.left, swiperOffset.top + _this.height], [swiperOffset.left + _this.width, swiperOffset.top + _this.height]];
            for (var i = 0; i < swiperCoord.length; i++) {
                var point = swiperCoord[i];
                if (point[0] >= scrollLeft && point[0] <= scrollLeft + windowWidth && point[1] >= scrollTop && point[1] <= scrollTop + windowHeight) {
                    inView = true
                }
            }
            if (!inView)
                return
        }
        if (isH) {
            if (kc === 37 || kc === 39) {
                if (e.preventDefault)
                    e.preventDefault();
                else
                    e.returnValue = false
            }
            if (kc === 39)
                _this.swipeNext();
            if (kc === 37)
                _this.swipePrev()
        } else {
            if (kc === 38 || kc === 40) {
                if (e.preventDefault)
                    e.preventDefault();
                else
                    e.returnValue = false
            }
            if (kc === 40)
                _this.swipeNext();
            if (kc === 38)
                _this.swipePrev()
        }
    }
    var lastScrollTime = (new Date).getTime();
    function handleMousewheel(e) {
        var we = _this._wheelEvent;
        var delta = 0;
        if (e.detail)
            delta = -e.detail;
        else if (we === "mousewheel") {
            if (params.mousewheelControlForceToAxis) {
                if (isH) {
                    if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY))
                        delta = e.wheelDeltaX;
                    else
                        return
                } else {
                    if (Math.abs(e.wheelDeltaY) > Math.abs(e.wheelDeltaX))
                        delta = e.wheelDeltaY;
                    else
                        return
                }
            } else {
                delta = e.wheelDelta
            }
        } else if (we === "DOMMouseScroll")
            delta = -e.detail;
        else if (we === "wheel") {
            if (params.mousewheelControlForceToAxis) {
                if (isH) {
                    if (Math.abs(e.deltaX) > Math.abs(e.deltaY))
                        delta = -e.deltaX;
                    else
                        return
                } else {
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX))
                        delta = -e.deltaY;
                    else
                        return
                }
            } else {
                delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? -e.deltaX : -e.deltaY
            }
        }
        if (!params.freeMode) {
            if ((new Date).getTime() - lastScrollTime > 60) {
                if (delta < 0)
                    _this.swipeNext();
                else
                    _this.swipePrev()
            }
            lastScrollTime = (new Date).getTime()
        } else {
            var position = _this.getWrapperTranslate() + delta;
            if (position > 0)
                position = 0;
            if (position < -maxWrapperPosition())
                position = -maxWrapperPosition();
            _this.setWrapperTransition(0);
            _this.setWrapperTranslate(position);
            _this.updateActiveSlide(position);
            if (position === 0 || position === -maxWrapperPosition())
                return
        }
        if (params.autoplay)
            _this.stopAutoplay(true);
        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue = false;
        return false
    }
    if (params.grabCursor) {
        var containerStyle = _this.container.style;
        containerStyle.cursor = "move";
        containerStyle.cursor = "grab";
        containerStyle.cursor = "-moz-grab";
        containerStyle.cursor = "-webkit-grab"
    }
    _this.allowSlideClick = true;
    function slideClick(event) {
        if (_this.allowSlideClick) {
            setClickedSlide(event);
            _this.fireCallback(params.onSlideClick, _this, event)
        }
    }
    function slideTouch(event) {
        setClickedSlide(event);
        _this.fireCallback(params.onSlideTouch, _this, event)
    }
    function setClickedSlide(event) {
        if (!event.currentTarget) {
            var element = event.srcElement;
            do {
                if (element.className.indexOf(params.slideClass) > -1) {
                    break
                }
                element = element.parentNode
            } while (element);
            _this.clickedSlide = element
        } else {
            _this.clickedSlide = event.currentTarget
        }
        _this.clickedSlideIndex = _this.slides.indexOf(_this.clickedSlide);
        _this.clickedSlideLoopIndex = _this.clickedSlideIndex - (_this.loopedSlides || 0)
    }
    _this.allowLinks = true;
    function preventClick(e) {
        if (!_this.allowLinks) {
            if (e.preventDefault)
                e.preventDefault();
            else
                e.returnValue = false;
            if (params.preventLinksPropagation && "stopPropagation" in e) {
                e.stopPropagation()
            }
            return false
        }
    }
    function releaseForms(e) {
        if (e.stopPropagation)
            e.stopPropagation();
        else
            e.returnValue = false;
        return false
    }
    var isTouchEvent = false;
    var allowThresholdMove;
    var allowMomentumBounce = true;
    function onTouchStart(event) {
        if (params.preventLinks)
            _this.allowLinks = true;
        if (_this.isTouched || params.onlyExternal) {
            return false
        }
        if (params.noSwiping && (event.target || event.srcElement) && noSwipingSlide(event.target || event.srcElement))
            return false;
        allowMomentumBounce = false;
        _this.isTouched = true;
        isTouchEvent = event.type === "touchstart";
        if (!isTouchEvent || event.targetTouches.length === 1) {
            _this.callPlugins("onTouchStartBegin");
            if (!isTouchEvent && !_this.isAndroid) {
                if (event.preventDefault)
                    event.preventDefault();
                else
                    event.returnValue = false
            }
            var pageX = isTouchEvent ? event.targetTouches[0].pageX : event.pageX || event.clientX;
            var pageY = isTouchEvent ? event.targetTouches[0].pageY : event.pageY || event.clientY;
            _this.touches.startX = _this.touches.currentX = pageX;
            _this.touches.startY = _this.touches.currentY = pageY;
            _this.touches.start = _this.touches.current = isH ? pageX : pageY;
            _this.setWrapperTransition(0);
            _this.positions.start = _this.positions.current = _this.getWrapperTranslate();
            _this.setWrapperTranslate(_this.positions.start);
            _this.times.start = (new Date).getTime();
            isScrolling = undefined;
            if (params.moveStartThreshold > 0) {
                allowThresholdMove = false
            }
            if (params.onTouchStart)
                _this.fireCallback(params.onTouchStart, _this);
            _this.callPlugins("onTouchStartEnd")
        }
    }
    var velocityPrevPosition, velocityPrevTime;
    function onTouchMove(event) {
        if (!_this.isTouched || params.onlyExternal)
            return;
        if (isTouchEvent && event.type === "mousemove")
            return;
        var pageX = isTouchEvent ? event.targetTouches[0].pageX : event.pageX || event.clientX;
        var pageY = isTouchEvent ? event.targetTouches[0].pageY : event.pageY || event.clientY;
        if (typeof isScrolling === "undefined" && isH) {
            isScrolling = !!(isScrolling || Math.abs(pageY - _this.touches.startY) > Math.abs(pageX - _this.touches.startX))
        }
        if (typeof isScrolling === "undefined" && !isH) {
            isScrolling = !!(isScrolling || Math.abs(pageY - _this.touches.startY) < Math.abs(pageX - _this.touches.startX))
        }
        if (isScrolling) {
            _this.isTouched = false;
            return
        }
        if (event.assignedToSwiper) {
            _this.isTouched = false;
            return
        }
        event.assignedToSwiper = true;
        if (params.preventLinks) {
            _this.allowLinks = false
        }
        if (params.onSlideClick) {
            _this.allowSlideClick = false
        }
        if (params.autoplay) {
            _this.stopAutoplay(true)
        }
        if (!isTouchEvent || event.touches.length === 1) {
            if (!_this.isMoved) {
                _this.callPlugins("onTouchMoveStart");
                if (params.loop) {
                    _this.fixLoop();
                    _this.positions.start = _this.getWrapperTranslate()
                }
                if (params.onTouchMoveStart)
                    _this.fireCallback(params.onTouchMoveStart, _this)
            }
            _this.isMoved = true;
            if (event.preventDefault)
                event.preventDefault();
            else
                event.returnValue = false;
            _this.touches.current = isH ? pageX : pageY;
            _this.positions.current = (_this.touches.current - _this.touches.start) * params.touchRatio + _this.positions.start;
            if (_this.positions.current > 0 && params.onResistanceBefore) {
                _this.fireCallback(params.onResistanceBefore, _this, _this.positions.current)
            }
            if (_this.positions.current < -maxWrapperPosition() && params.onResistanceAfter) {
                _this.fireCallback(params.onResistanceAfter, _this, Math.abs(_this.positions.current + maxWrapperPosition()))
            }
            if (params.resistance && params.resistance !== "100%") {
                var resistance;
                if (_this.positions.current > 0) {
                    resistance = 1 - _this.positions.current / containerSize / 2;
                    if (resistance < .5)
                        _this.positions.current = containerSize / 2;
                    else
                        _this.positions.current = _this.positions.current * resistance
                }
                if (_this.positions.current < -maxWrapperPosition()) {
                    var diff = (_this.touches.current - _this.touches.start) * params.touchRatio + (maxWrapperPosition() + _this.positions.start);
                    resistance = (containerSize + diff) / containerSize;
                    var newPos = _this.positions.current - diff * (1 - resistance) / 2;
                    var stopPos = -maxWrapperPosition() - containerSize / 2;
                    if (newPos < stopPos || resistance <= 0)
                        _this.positions.current = stopPos;
                    else
                        _this.positions.current = newPos
                }
            }
            if (params.resistance && params.resistance === "100%") {
                if (_this.positions.current > 0 && !(params.freeMode && !params.freeModeFluid)) {
                    _this.positions.current = 0
                }
                if (_this.positions.current < -maxWrapperPosition() && !(params.freeMode && !params.freeModeFluid)) {
                    _this.positions.current = -maxWrapperPosition()
                }
            }
            if (!params.followFinger)
                return;
            if (!params.moveStartThreshold) {
                _this.setWrapperTranslate(_this.positions.current)
            } else {
                if (Math.abs(_this.touches.current - _this.touches.start) > params.moveStartThreshold || allowThresholdMove) {
                    if (!allowThresholdMove) {
                        allowThresholdMove = true;
                        _this.touches.start = _this.touches.current;
                        return
                    }
                    _this.setWrapperTranslate(_this.positions.current)
                } else {
                    _this.positions.current = _this.positions.start
                }
            }
            if (params.freeMode || params.watchActiveIndex) {
                _this.updateActiveSlide(_this.positions.current)
            }
            if (params.grabCursor) {
                _this.container.style.cursor = "move";
                _this.container.style.cursor = "grabbing";
                _this.container.style.cursor = "-moz-grabbin";
                _this.container.style.cursor = "-webkit-grabbing"
            }
            if (!velocityPrevPosition)
                velocityPrevPosition = _this.touches.current;
            if (!velocityPrevTime)
                velocityPrevTime = (new Date).getTime();
            _this.velocity = (_this.touches.current - velocityPrevPosition) / ((new Date).getTime() - velocityPrevTime) / 2;
            if (Math.abs(_this.touches.current - velocityPrevPosition) < 2)
                _this.velocity = 0;
            velocityPrevPosition = _this.touches.current;
            velocityPrevTime = (new Date).getTime();
            _this.callPlugins("onTouchMoveEnd");
            if (params.onTouchMove)
                _this.fireCallback(params.onTouchMove, _this);
            return false
        }
    }
    function onTouchEnd(event) {
        if (isScrolling) {
            _this.swipeReset()
        }
        if (params.onlyExternal || !_this.isTouched)
            return;
        _this.isTouched = false;
        if (params.grabCursor) {
            _this.container.style.cursor = "move";
            _this.container.style.cursor = "grab";
            _this.container.style.cursor = "-moz-grab";
            _this.container.style.cursor = "-webkit-grab"
        }
        if (!_this.positions.current && _this.positions.current !== 0) {
            _this.positions.current = _this.positions.start
        }
        if (params.followFinger) {
            _this.setWrapperTranslate(_this.positions.current)
        }
        _this.times.end = (new Date).getTime();
        _this.touches.diff = _this.touches.current - _this.touches.start;
        _this.touches.abs = Math.abs(_this.touches.diff);
        _this.positions.diff = _this.positions.current - _this.positions.start;
        _this.positions.abs = Math.abs(_this.positions.diff);
        var diff = _this.positions.diff;
        var diffAbs = _this.positions.abs;
        var timeDiff = _this.times.end - _this.times.start;
        if (diffAbs < 5 && timeDiff < 300 && _this.allowLinks === false) {
            if (!params.freeMode && diffAbs !== 0)
                _this.swipeReset();
            if (params.preventLinks) {
                _this.allowLinks = true
            }
            if (params.onSlideClick) {
                _this.allowSlideClick = true
            }
        }
        setTimeout(function() {
            if (params.preventLinks) {
                _this.allowLinks = true
            }
            if (params.onSlideClick) {
                _this.allowSlideClick = true
            }
        }, 100);
        var maxPosition = maxWrapperPosition();
        if (!_this.isMoved && params.freeMode) {
            _this.isMoved = false;
            if (params.onTouchEnd)
                _this.fireCallback(params.onTouchEnd, _this);
            _this.callPlugins("onTouchEnd");
            return
        }
        if (!_this.isMoved || _this.positions.current > 0 || _this.positions.current < -maxPosition) {
            _this.swipeReset();
            if (params.onTouchEnd)
                _this.fireCallback(params.onTouchEnd, _this);
            _this.callPlugins("onTouchEnd");
            return
        }
        _this.isMoved = false;
        if (params.freeMode) {
            if (params.freeModeFluid) {
                var momentumDuration = 1e3 * params.momentumRatio;
                var momentumDistance = _this.velocity * momentumDuration;
                var newPosition = _this.positions.current + momentumDistance;
                var doBounce = false;
                var afterBouncePosition;
                var bounceAmount = Math.abs(_this.velocity) * 20 * params.momentumBounceRatio;
                if (newPosition < -maxPosition) {
                    if (params.momentumBounce && _this.support.transitions) {
                        if (newPosition + maxPosition < -bounceAmount)
                            newPosition = -maxPosition - bounceAmount;
                        afterBouncePosition = -maxPosition;
                        doBounce = true;
                        allowMomentumBounce = true
                    } else
                        newPosition = -maxPosition
                }
                if (newPosition > 0) {
                    if (params.momentumBounce && _this.support.transitions) {
                        if (newPosition > bounceAmount)
                            newPosition = bounceAmount;
                        afterBouncePosition = 0;
                        doBounce = true;
                        allowMomentumBounce = true
                    } else
                        newPosition = 0
                }
                if (_this.velocity !== 0)
                    momentumDuration = Math.abs((newPosition - _this.positions.current) / _this.velocity);
                _this.setWrapperTranslate(newPosition);
                _this.setWrapperTransition(momentumDuration);
                if (params.momentumBounce && doBounce) {
                    _this.wrapperTransitionEnd(function() {
                        if (!allowMomentumBounce)
                            return;
                        if (params.onMomentumBounce)
                            _this.fireCallback(params.onMomentumBounce, _this);
                        _this.callPlugins("onMomentumBounce");
                        _this.setWrapperTranslate(afterBouncePosition);
                        _this.setWrapperTransition(300)
                    })
                }
                _this.updateActiveSlide(newPosition)
            }
            if (!params.freeModeFluid || timeDiff >= 300)
                _this.updateActiveSlide(_this.positions.current);
            if (params.onTouchEnd)
                _this.fireCallback(params.onTouchEnd, _this);
            _this.callPlugins("onTouchEnd");
            return
        }
        direction = diff < 0 ? "toNext" : "toPrev";
        if (direction === "toNext" && timeDiff <= 300) {
            if (diffAbs < 30 || !params.shortSwipes)
                _this.swipeReset();
            else
                _this.swipeNext(true)
        }
        if (direction === "toPrev" && timeDiff <= 300) {
            if (diffAbs < 30 || !params.shortSwipes)
                _this.swipeReset();
            else
                _this.swipePrev(true)
        }
        var targetSlideSize = 0;
        if (params.slidesPerView === "auto") {
            var currentPosition = Math.abs(_this.getWrapperTranslate());
            var slidesOffset = 0;
            var _slideSize;
            for (var i = 0; i < _this.slides.length; i++) {
                _slideSize = isH ? _this.slides[i].getWidth(true) : _this.slides[i].getHeight(true);
                slidesOffset += _slideSize;
                if (slidesOffset > currentPosition) {
                    targetSlideSize = _slideSize;
                    break
                }
            }
            if (targetSlideSize > containerSize)
                targetSlideSize = containerSize
        } else {
            targetSlideSize = slideSize * params.slidesPerView
        }
        if (direction === "toNext" && timeDiff > 300) {
            if (diffAbs >= targetSlideSize * params.longSwipesRatio) {
                _this.swipeNext(true)
            } else {
                _this.swipeReset()
            }
        }
        if (direction === "toPrev" && timeDiff > 300) {
            if (diffAbs >= targetSlideSize * params.longSwipesRatio) {
                _this.swipePrev(true)
            } else {
                _this.swipeReset()
            }
        }
        if (params.onTouchEnd)
            _this.fireCallback(params.onTouchEnd, _this);
        _this.callPlugins("onTouchEnd")
    }
    function noSwipingSlide(el) {
        var noSwiping = false;
        do {
            if (el.className.indexOf(params.noSwipingClass) > -1) {
                noSwiping = true
            }
            el = el.parentElement
        } while (!noSwiping && el.parentElement && el.className.indexOf(params.wrapperClass) === -1);
        if (!noSwiping && el.className.indexOf(params.wrapperClass) > -1 && el.className.indexOf(params.noSwipingClass) > -1)
            noSwiping = true;
        return noSwiping
    }
    function addClassToHtmlString(klass, outerHtml) {
        var par = document.createElement("div");
        var child;
        par.innerHTML = outerHtml;
        child = par.firstChild;
        child.className += " " + klass;
        return child.outerHTML
    }
    _this.swipeNext = function(internal) {
        if (!internal && params.loop)
            _this.fixLoop();
        if (!internal && params.autoplay)
            _this.stopAutoplay(true);
        _this.callPlugins("onSwipeNext");
        var currentPosition = _this.getWrapperTranslate();
        var newPosition = currentPosition;
        if (params.slidesPerView === "auto") {
            for (var i = 0; i < _this.snapGrid.length; i++) {
                if (-currentPosition >= _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
                    newPosition = -_this.snapGrid[i + 1];
                    break
                }
            }
        } else {
            var groupSize = slideSize * params.slidesPerGroup;
            newPosition = -(Math.floor(Math.abs(currentPosition) / Math.floor(groupSize)) * groupSize + groupSize)
        }
        if (newPosition < -maxWrapperPosition()) {
            newPosition = -maxWrapperPosition()
        }
        if (newPosition === currentPosition)
            return false;
        swipeToPosition(newPosition, "next");
        return true
    };
    _this.swipePrev = function(internal) {
        if (!internal && params.loop)
            _this.fixLoop();
        if (!internal && params.autoplay)
            _this.stopAutoplay(true);
        _this.callPlugins("onSwipePrev");
        var currentPosition = Math.ceil(_this.getWrapperTranslate());
        var newPosition;
        if (params.slidesPerView === "auto") {
            newPosition = 0;
            for (var i = 1; i < _this.snapGrid.length; i++) {
                if (-currentPosition === _this.snapGrid[i]) {
                    newPosition = -_this.snapGrid[i - 1];
                    break
                }
                if (-currentPosition > _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
                    newPosition = -_this.snapGrid[i];
                    break
                }
            }
        } else {
            var groupSize = slideSize * params.slidesPerGroup;
            newPosition = -(Math.ceil(-currentPosition / groupSize) - 1) * groupSize
        }
        if (newPosition > 0)
            newPosition = 0;
        if (newPosition === currentPosition)
            return false;
        swipeToPosition(newPosition, "prev");
        return true
    };
    _this.swipeReset = function() {
        _this.callPlugins("onSwipeReset");
        var currentPosition = _this.getWrapperTranslate();
        var groupSize = slideSize * params.slidesPerGroup;
        var newPosition;
        var maxPosition = -maxWrapperPosition();
        if (params.slidesPerView === "auto") {
            newPosition = 0;
            for (var i = 0; i < _this.snapGrid.length; i++) {
                if (-currentPosition === _this.snapGrid[i])
                    return;
                if (-currentPosition >= _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
                    if (_this.positions.diff > 0)
                        newPosition = -_this.snapGrid[i + 1];
                    else
                        newPosition = -_this.snapGrid[i];
                    break
                }
            }
            if (-currentPosition >= _this.snapGrid[_this.snapGrid.length - 1])
                newPosition = -_this.snapGrid[_this.snapGrid.length - 1];
            if (currentPosition <= -maxWrapperPosition())
                newPosition = -maxWrapperPosition()
        } else {
            newPosition = currentPosition < 0 ? Math.round(currentPosition / groupSize) * groupSize : 0
        }
        if (params.scrollContainer) {
            newPosition = currentPosition < 0 ? currentPosition : 0
        }
        if (newPosition < -maxWrapperPosition()) {
            newPosition = -maxWrapperPosition()
        }
        if (params.scrollContainer && containerSize > slideSize) {
            newPosition = 0
        }
        if (newPosition === currentPosition)
            return false;
        swipeToPosition(newPosition, "reset");
        return true
    };
    _this.swipeTo = function(index, speed, runCallbacks) {
        index = parseInt(index, 10);
        _this.callPlugins("onSwipeTo", {index: index,speed: speed});
        if (params.loop)
            index = index + _this.loopedSlides;
        var currentPosition = _this.getWrapperTranslate();
        if (index > _this.slides.length - 1 || index < 0)
            return;
        var newPosition;
        if (params.slidesPerView === "auto") {
            newPosition = -_this.slidesGrid[index]
        } else {
            newPosition = -index * slideSize
        }
        if (newPosition < -maxWrapperPosition()) {
            newPosition = -maxWrapperPosition()
        }
        if (newPosition === currentPosition)
            return false;
        runCallbacks = runCallbacks === false ? false : true;
        swipeToPosition(newPosition, "to", {index: index,speed: speed,runCallbacks: runCallbacks});
        return true
    };
    function swipeToPosition(newPosition, action, toOptions) {
        var speed = action === "to" && toOptions.speed >= 0 ? toOptions.speed : params.speed;
        var timeOld = +new Date;
        function anim() {
            var timeNew = +new Date;
            var time = timeNew - timeOld;
            currentPosition += animationStep * time / (1e3 / 60);
            condition = direction === "toNext" ? currentPosition > newPosition : currentPosition < newPosition;
            if (condition) {
                _this.setWrapperTranslate(Math.round(currentPosition));
                _this._DOMAnimating = true;
                window.setTimeout(function() {
                    anim()
                }, 1e3 / 60)
            } else {
                if (params.onSlideChangeEnd)
                    _this.fireCallback(params.onSlideChangeEnd, _this);
                _this.setWrapperTranslate(newPosition);
                _this._DOMAnimating = false
            }
        }
        if (_this.support.transitions || !params.DOMAnimation) {
            _this.setWrapperTranslate(newPosition);
            _this.setWrapperTransition(speed)
        } else {
            var currentPosition = _this.getWrapperTranslate();
            var animationStep = Math.ceil((newPosition - currentPosition) / speed * (1e3 / 60));
            var direction = currentPosition > newPosition ? "toNext" : "toPrev";
            var condition = direction === "toNext" ? currentPosition > newPosition : currentPosition < newPosition;
            if (_this._DOMAnimating)
                return;
            anim()
        }
        _this.updateActiveSlide(newPosition);
        if (params.onSlideNext && action === "next") {
            _this.fireCallback(params.onSlideNext, _this, newPosition)
        }
        if (params.onSlidePrev && action === "prev") {
            _this.fireCallback(params.onSlidePrev, _this, newPosition)
        }
        if (params.onSlideReset && action === "reset") {
            _this.fireCallback(params.onSlideReset, _this, newPosition)
        }
        if (action === "next" || action === "prev" || action === "to" && toOptions.runCallbacks === true)
            slideChangeCallbacks(action)
    }
    _this._queueStartCallbacks = false;
    _this._queueEndCallbacks = false;
    function slideChangeCallbacks(direction) {
        _this.callPlugins("onSlideChangeStart");
        if (params.onSlideChangeStart) {
            if (params.queueStartCallbacks && _this.support.transitions) {
                if (_this._queueStartCallbacks)
                    return;
                _this._queueStartCallbacks = true;
                _this.fireCallback(params.onSlideChangeStart, _this, direction);
                _this.wrapperTransitionEnd(function() {
                    _this._queueStartCallbacks = false
                })
            } else
                _this.fireCallback(params.onSlideChangeStart, _this, direction)
        }
        if (params.onSlideChangeEnd) {
            if (_this.support.transitions) {
                if (params.queueEndCallbacks) {
                    if (_this._queueEndCallbacks)
                        return;
                    _this._queueEndCallbacks = true;
                    _this.wrapperTransitionEnd(function(swiper) {
                        _this.fireCallback(params.onSlideChangeEnd, swiper, direction)
                    })
                } else {
                    _this.wrapperTransitionEnd(function(swiper) {
                        _this.fireCallback(params.onSlideChangeEnd, swiper, direction)
                    })
                }
            } else {
                if (!params.DOMAnimation) {
                    setTimeout(function() {
                        _this.fireCallback(params.onSlideChangeEnd, _this, direction)
                    }, 10)
                }
            }
        }
    }
    _this.updateActiveSlide = function(position) {
        if (!_this.initialized)
            return;
        if (_this.slides.length === 0)
            return;
        _this.previousIndex = _this.activeIndex;
        if (typeof position === "undefined")
            position = _this.getWrapperTranslate();
        if (position > 0)
            position = 0;
        if (params.slidesPerView === "auto") {
            var slidesOffset = 0;
            _this.activeIndex = _this.slidesGrid.indexOf(-position);
            if (_this.activeIndex < 0) {
                for (var i = 0; i < _this.slidesGrid.length - 1; i++) {
                    if (-position > _this.slidesGrid[i] && -position < _this.slidesGrid[i + 1]) {
                        break
                    }
                }
                var leftDistance = Math.abs(_this.slidesGrid[i] + position);
                var rightDistance = Math.abs(_this.slidesGrid[i + 1] + position);
                if (leftDistance <= rightDistance)
                    _this.activeIndex = i;
                else
                    _this.activeIndex = i + 1
            }
        } else {
            _this.activeIndex = Math[params.visibilityFullFit ? "ceil" : "round"](-position / slideSize)
        }
        if (_this.activeIndex === _this.slides.length)
            _this.activeIndex = _this.slides.length - 1;
        if (_this.activeIndex < 0)
            _this.activeIndex = 0;
        if (!_this.slides[_this.activeIndex])
            return;
        _this.calcVisibleSlides(position);
        var activeClassRegexp = new RegExp("\\s*" + params.slideActiveClass);
        var inViewClassRegexp = new RegExp("\\s*" + params.slideVisibleClass);
        for (var j = 0; j < _this.slides.length; j++) {
            _this.slides[j].className = _this.slides[j].className.replace(activeClassRegexp, "").replace(inViewClassRegexp, "");
            if (_this.visibleSlides.indexOf(_this.slides[j]) >= 0) {
                _this.slides[j].className += " " + params.slideVisibleClass
            }
        }
        _this.slides[_this.activeIndex].className += " " + params.slideActiveClass;
        if (params.loop) {
            var ls = _this.loopedSlides;
            _this.activeLoopIndex = _this.activeIndex - ls;
            if (_this.activeLoopIndex >= _this.slides.length - ls * 2) {
                _this.activeLoopIndex = _this.slides.length - ls * 2 - _this.activeLoopIndex
            }
            if (_this.activeLoopIndex < 0) {
                _this.activeLoopIndex = _this.slides.length - ls * 2 + _this.activeLoopIndex
            }
            if (_this.activeLoopIndex < 0)
                _this.activeLoopIndex = 0
        } else {
            _this.activeLoopIndex = _this.activeIndex
        }
        if (params.pagination) {
            _this.updatePagination(position)
        }
    };
    _this.createPagination = function(firstInit) {
        if (params.paginationClickable && _this.paginationButtons) {
            removePaginationEvents()
        }
        _this.paginationContainer = params.pagination.nodeType ? params.pagination : $$(params.pagination)[0];
        if (params.createPagination) {
            var paginationHTML = "";
            var numOfSlides = _this.slides.length;
            var numOfButtons = numOfSlides;
            if (params.loop)
                numOfButtons -= _this.loopedSlides * 2;
            for (var i = 0; i < numOfButtons; i++) {
                paginationHTML += "<" + params.paginationElement + ' class="' + params.paginationElementClass + '"></' + params.paginationElement + ">"
            }
            _this.paginationContainer.innerHTML = paginationHTML
        }
        _this.paginationButtons = $$("." + params.paginationElementClass, _this.paginationContainer);
        if (!firstInit)
            _this.updatePagination();
        _this.callPlugins("onCreatePagination");
        if (params.paginationClickable) {
            addPaginationEvents()
        }
    };
    function removePaginationEvents() {
        var pagers = _this.paginationButtons;
        for (var i = 0; i < pagers.length; i++) {
            _this.h.removeEventListener(pagers[i], "click", paginationClick)
        }
    }
    function addPaginationEvents() {
        var pagers = _this.paginationButtons;
        for (var i = 0; i < pagers.length; i++) {
            _this.h.addEventListener(pagers[i], "click", paginationClick)
        }
    }
    function paginationClick(e) {
        var index;
        var target = e.target || e.srcElement;
        var pagers = _this.paginationButtons;
        for (var i = 0; i < pagers.length; i++) {
            if (target === pagers[i])
                index = i
        }
        _this.swipeTo(index)
    }
    _this.updatePagination = function(position) {
        if (!params.pagination)
            return;
        if (_this.slides.length < 1)
            return;
        var activePagers = $$("." + params.paginationActiveClass, _this.paginationContainer);
        if (!activePagers)
            return;
        var pagers = _this.paginationButtons;
        if (pagers.length === 0)
            return;
        for (var i = 0; i < pagers.length; i++) {
            pagers[i].className = params.paginationElementClass
        }
        var indexOffset = params.loop ? _this.loopedSlides : 0;
        if (params.paginationAsRange) {
            if (!_this.visibleSlides)
                _this.calcVisibleSlides(position);
            var visibleIndexes = [];
            var j;
            for (j = 0; j < _this.visibleSlides.length; j++) {
                var visIndex = _this.slides.indexOf(_this.visibleSlides[j]) - indexOffset;
                if (params.loop && visIndex < 0) {
                    visIndex = _this.slides.length - _this.loopedSlides * 2 + visIndex
                }
                if (params.loop && visIndex >= _this.slides.length - _this.loopedSlides * 2) {
                    visIndex = _this.slides.length - _this.loopedSlides * 2 - visIndex;
                    visIndex = Math.abs(visIndex)
                }
                visibleIndexes.push(visIndex)
            }
            for (j = 0; j < visibleIndexes.length; j++) {
                if (pagers[visibleIndexes[j]])
                    pagers[visibleIndexes[j]].className += " " + params.paginationVisibleClass
            }
            if (params.loop && pagers[_this.activeLoopIndex] !== undefined) {
                pagers[_this.activeLoopIndex].className += " " + params.paginationActiveClass
            } else {
                pagers[_this.activeIndex].className += " " + params.paginationActiveClass
            }
        } else {
            if (params.loop) {
                if (pagers[_this.activeLoopIndex])
                    pagers[_this.activeLoopIndex].className += " " + params.paginationActiveClass + " " + params.paginationVisibleClass
            } else {
                pagers[_this.activeIndex].className += " " + params.paginationActiveClass + " " + params.paginationVisibleClass
            }
        }
    };
    _this.calcVisibleSlides = function(position) {
        var visibleSlides = [];
        var _slideLeft = 0, _slideSize = 0, _slideRight = 0;
        if (isH && _this.wrapperLeft > 0)
            position = position + _this.wrapperLeft;
        if (!isH && _this.wrapperTop > 0)
            position = position + _this.wrapperTop;
        for (var i = 0; i < _this.slides.length; i++) {
            _slideLeft += _slideSize;
            if (params.slidesPerView === "auto")
                _slideSize = isH ? _this.h.getWidth(_this.slides[i], true) : _this.h.getHeight(_this.slides[i], true);
            else
                _slideSize = slideSize;
            _slideRight = _slideLeft + _slideSize;
            var isVisibile = false;
            if (params.visibilityFullFit) {
                if (_slideLeft >= -position && _slideRight <= -position + containerSize)
                    isVisibile = true;
                if (_slideLeft <= -position && _slideRight >= -position + containerSize)
                    isVisibile = true
            } else {
                if (_slideRight > -position && _slideRight <= -position + containerSize)
                    isVisibile = true;
                if (_slideLeft >= -position && _slideLeft < -position + containerSize)
                    isVisibile = true;
                if (_slideLeft < -position && _slideRight > -position + containerSize)
                    isVisibile = true
            }
            if (isVisibile)
                visibleSlides.push(_this.slides[i])
        }
        if (visibleSlides.length === 0)
            visibleSlides = [_this.slides[_this.activeIndex]];
        _this.visibleSlides = visibleSlides
    };
    var autoplayTimeoutId, autoplayIntervalId;
    _this.startAutoplay = function() {
        if (_this.support.transitions) {
            if (typeof autoplayTimeoutId !== "undefined")
                return false;
            if (!params.autoplay)
                return;
            _this.callPlugins("onAutoplayStart");
            autoplay()
        } else {
            if (typeof autoplayIntervalId !== "undefined")
                return false;
            if (!params.autoplay)
                return;
            _this.callPlugins("onAutoplayStart");
            autoplayIntervalId = setInterval(function() {
                if (params.loop) {
                    _this.fixLoop();
                    _this.swipeNext(true)
                } else if (!_this.swipeNext(true)) {
                    if (!params.autoplayStopOnLast)
                        _this.swipeTo(0);
                    else {
                        clearInterval(autoplayIntervalId);
                        autoplayIntervalId = undefined
                    }
                }
            }, params.autoplay)
        }
    };
    _this.stopAutoplay = function(internal) {
        if (_this.support.transitions) {
            if (!autoplayTimeoutId)
                return;
            if (autoplayTimeoutId)
                clearTimeout(autoplayTimeoutId);
            autoplayTimeoutId = undefined;
            if (internal && !params.autoplayDisableOnInteraction) {
                _this.wrapperTransitionEnd(function() {
                    autoplay()
                })
            }
            _this.callPlugins("onAutoplayStop")
        } else {
            if (autoplayIntervalId)
                clearInterval(autoplayIntervalId);
            autoplayIntervalId = undefined;
            _this.callPlugins("onAutoplayStop")
        }
    };
    function autoplay() {
        autoplayTimeoutId = setTimeout(function() {
            if (params.loop) {
                _this.fixLoop();
                _this.swipeNext(true)
            } else if (!_this.swipeNext(true)) {
                if (!params.autoplayStopOnLast)
                    _this.swipeTo(0);
                else {
                    clearTimeout(autoplayTimeoutId);
                    autoplayTimeoutId = undefined
                }
            }
            _this.wrapperTransitionEnd(function() {
                if (typeof autoplayTimeoutId !== "undefined")
                    autoplay()
            })
        }, params.autoplay)
    }
    _this.loopCreated = false;
    _this.removeLoopedSlides = function() {
        if (_this.loopCreated) {
            for (var i = 0; i < _this.slides.length; i++) {
                if (_this.slides[i].getData("looped") === true)
                    _this.wrapper.removeChild(_this.slides[i])
            }
        }
    };
    _this.createLoop = function() {
        if (_this.slides.length === 0)
            return;
        if (params.slidesPerView === "auto") {
            _this.loopedSlides = params.loopedSlides || 1
        } else {
            _this.loopedSlides = params.slidesPerView + params.loopAdditionalSlides
        }
        if (_this.loopedSlides > _this.slides.length) {
            _this.loopedSlides = _this.slides.length
        }
        var slideFirstHTML = "", slideLastHTML = "", i;
        var slidesSetFullHTML = "";
        var numSlides = _this.slides.length;
        var fullSlideSets = Math.floor(_this.loopedSlides / numSlides);
        var remainderSlides = _this.loopedSlides % numSlides;
        for (i = 0; i < fullSlideSets * numSlides; i++) {
            var j = i;
            if (i >= numSlides) {
                var over = Math.floor(i / numSlides);
                j = i - numSlides * over
            }
            slidesSetFullHTML += _this.slides[j].outerHTML
        }
        for (i = 0; i < remainderSlides; i++) {
            slideLastHTML += addClassToHtmlString(params.slideDuplicateClass, _this.slides[i].outerHTML)
        }
        for (i = numSlides - remainderSlides; i < numSlides; i++) {
            slideFirstHTML += addClassToHtmlString(params.slideDuplicateClass, _this.slides[i].outerHTML)
        }
        var slides = slideFirstHTML + slidesSetFullHTML + wrapper.innerHTML + slidesSetFullHTML + slideLastHTML;
        wrapper.innerHTML = slides;
        _this.loopCreated = true;
        _this.calcSlides();
        for (i = 0; i < _this.slides.length; i++) {
            if (i < _this.loopedSlides || i >= _this.slides.length - _this.loopedSlides)
                _this.slides[i].setData("looped", true)
        }
        _this.callPlugins("onCreateLoop")
    };
    _this.fixLoop = function() {
        var newIndex;
        if (_this.activeIndex < _this.loopedSlides) {
            newIndex = _this.slides.length - _this.loopedSlides * 3 + _this.activeIndex;
            _this.swipeTo(newIndex, 0, false)
        } else if (params.slidesPerView === "auto" && _this.activeIndex >= _this.loopedSlides * 2 || _this.activeIndex > _this.slides.length - params.slidesPerView * 2) {
            newIndex = -_this.slides.length + _this.activeIndex + _this.loopedSlides;
            _this.swipeTo(newIndex, 0, false)
        }
    };
    _this.loadSlides = function() {
        var slidesHTML = "";
        _this.activeLoaderIndex = 0;
        var slides = params.loader.slides;
        var slidesToLoad = params.loader.loadAllSlides ? slides.length : params.slidesPerView * (1 + params.loader.surroundGroups);
        for (var i = 0; i < slidesToLoad; i++) {
            if (params.loader.slidesHTMLType === "outer")
                slidesHTML += slides[i];
            else {
                slidesHTML += "<" + params.slideElement + ' class="' + params.slideClass + '" data-swiperindex="' + i + '">' + slides[i] + "</" + params.slideElement + ">"
            }
        }
        _this.wrapper.innerHTML = slidesHTML;
        _this.calcSlides(true);
        if (!params.loader.loadAllSlides) {
            _this.wrapperTransitionEnd(_this.reloadSlides, true)
        }
    };
    _this.reloadSlides = function() {
        var slides = params.loader.slides;
        var newActiveIndex = parseInt(_this.activeSlide().data("swiperindex"), 10);
        if (newActiveIndex < 0 || newActiveIndex > slides.length - 1)
            return;
        _this.activeLoaderIndex = newActiveIndex;
        var firstIndex = Math.max(0, newActiveIndex - params.slidesPerView * params.loader.surroundGroups);
        var lastIndex = Math.min(newActiveIndex + params.slidesPerView * (1 + params.loader.surroundGroups) - 1, slides.length - 1);
        if (newActiveIndex > 0) {
            var newTransform = -slideSize * (newActiveIndex - firstIndex);
            _this.setWrapperTranslate(newTransform);
            _this.setWrapperTransition(0)
        }
        var i;
        if (params.loader.logic === "reload") {
            _this.wrapper.innerHTML = "";
            var slidesHTML = "";
            for (i = firstIndex; i <= lastIndex; i++) {
                slidesHTML += params.loader.slidesHTMLType === "outer" ? slides[i] : "<" + params.slideElement + ' class="' + params.slideClass + '" data-swiperindex="' + i + '">' + slides[i] + "</" + params.slideElement + ">"
            }
            _this.wrapper.innerHTML = slidesHTML
        } else {
            var minExistIndex = 1e3;
            var maxExistIndex = 0;
            for (i = 0; i < _this.slides.length; i++) {
                var index = _this.slides[i].data("swiperindex");
                if (index < firstIndex || index > lastIndex) {
                    _this.wrapper.removeChild(_this.slides[i])
                } else {
                    minExistIndex = Math.min(index, minExistIndex);
                    maxExistIndex = Math.max(index, maxExistIndex)
                }
            }
            for (i = firstIndex; i <= lastIndex; i++) {
                var newSlide;
                if (i < minExistIndex) {
                    newSlide = document.createElement(params.slideElement);
                    newSlide.className = params.slideClass;
                    newSlide.setAttribute("data-swiperindex", i);
                    newSlide.innerHTML = slides[i];
                    _this.wrapper.insertBefore(newSlide, _this.wrapper.firstChild)
                }
                if (i > maxExistIndex) {
                    newSlide = document.createElement(params.slideElement);
                    newSlide.className = params.slideClass;
                    newSlide.setAttribute("data-swiperindex", i);
                    newSlide.innerHTML = slides[i];
                    _this.wrapper.appendChild(newSlide)
                }
            }
        }
        _this.reInit(true)
    };
    function makeSwiper() {
        _this.calcSlides();
        if (params.loader.slides.length > 0 && _this.slides.length === 0) {
            _this.loadSlides()
        }
        if (params.loop) {
            _this.createLoop()
        }
        _this.init();
        initEvents();
        if (params.pagination) {
            _this.createPagination(true)
        }
        if (params.loop || params.initialSlide > 0) {
            _this.swipeTo(params.initialSlide, 0, false)
        } else {
            _this.updateActiveSlide(0)
        }
        if (params.autoplay) {
            _this.startAutoplay()
        }
        _this.centerIndex = _this.activeIndex;
        if (params.onSwiperCreated)
            _this.fireCallback(params.onSwiperCreated, _this);
        _this.callPlugins("onSwiperCreated")
    }
    makeSwiper()
};
Swiper.prototype = {plugins: {},wrapperTransitionEnd: function(callback, permanent) {
        "use strict";
        var a = this, el = a.wrapper, events = ["webkitTransitionEnd", "transitionend", "oTransitionEnd", "MSTransitionEnd", "msTransitionEnd"], i;
        function fireCallBack() {
            callback(a);
            if (a.params.queueEndCallbacks)
                a._queueEndCallbacks = false;
            if (!permanent) {
                for (i = 0; i < events.length; i++) {
                    a.h.removeEventListener(el, events[i], fireCallBack)
                }
            }
        }
        if (callback) {
            for (i = 0; i < events.length; i++) {
                a.h.addEventListener(el, events[i], fireCallBack)
            }
        }
    },getWrapperTranslate: function(axis) {
        "use strict";
        var el = this.wrapper, matrix, curTransform, curStyle, transformMatrix;
        if (typeof axis === "undefined") {
            axis = this.params.mode === "horizontal" ? "x" : "y"
        }
        if (this.support.transforms && this.params.useCSS3Transforms) {
            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform)
            } else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
                matrix = transformMatrix.toString().split(",")
            }
            if (axis === "x") {
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                else
                    curTransform = parseFloat(matrix[4])
            }
            if (axis === "y") {
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                else
                    curTransform = parseFloat(matrix[5])
            }
        } else {
            if (axis === "x")
                curTransform = parseFloat(el.style.left, 10) || 0;
            if (axis === "y")
                curTransform = parseFloat(el.style.top, 10) || 0
        }
        return curTransform || 0
    },setWrapperTranslate: function(x, y, z) {
        "use strict";
        var es = this.wrapper.style, coords = {x: 0,y: 0,z: 0}, translate;
        if (arguments.length === 3) {
            coords.x = x;
            coords.y = y;
            coords.z = z
        } else {
            if (typeof y === "undefined") {
                y = this.params.mode === "horizontal" ? "x" : "y"
            }
            coords[y] = x
        }
        if (this.support.transforms && this.params.useCSS3Transforms) {
            translate = this.support.transforms3d ? "translate3d(" + coords.x + "px, " + coords.y + "px, " + coords.z + "px)" : "translate(" + coords.x + "px, " + coords.y + "px)";
            es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = translate
        } else {
            es.left = coords.x + "px";
            es.top = coords.y + "px"
        }
        this.callPlugins("onSetWrapperTransform", coords);
        if (this.params.onSetWrapperTransform)
            this.fireCallback(this.params.onSetWrapperTransform, this, coords)
    },setWrapperTransition: function(duration) {
        "use strict";
        var es = this.wrapper.style;
        es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = duration / 1e3 + "s";
        this.callPlugins("onSetWrapperTransition", {duration: duration});
        if (this.params.onSetWrapperTransition)
            this.fireCallback(this.params.onSetWrapperTransition, this, duration)
    },h: {getWidth: function(el, outer) {
            "use strict";
            var width = window.getComputedStyle(el, null).getPropertyValue("width");
            var returnWidth = parseFloat(width);
            if (isNaN(returnWidth) || width.indexOf("%") > 0) {
                returnWidth = el.offsetWidth - parseFloat(window.getComputedStyle(el, null).getPropertyValue("padding-left")) - parseFloat(window.getComputedStyle(el, null).getPropertyValue("padding-right"))
            }
            if (outer)
                returnWidth += parseFloat(window.getComputedStyle(el, null).getPropertyValue("padding-left")) + parseFloat(window.getComputedStyle(el, null).getPropertyValue("padding-right"));
            return returnWidth
        },getHeight: function(el, outer) {
            "use strict";
            if (outer)
                return el.offsetHeight;
            var height = window.getComputedStyle(el, null).getPropertyValue("height");
            var returnHeight = parseFloat(height);
            if (isNaN(returnHeight) || height.indexOf("%") > 0) {
                returnHeight = el.offsetHeight - parseFloat(window.getComputedStyle(el, null).getPropertyValue("padding-top")) - parseFloat(window.getComputedStyle(el, null).getPropertyValue("padding-bottom"))
            }
            if (outer)
                returnHeight += parseFloat(window.getComputedStyle(el, null).getPropertyValue("padding-top")) + parseFloat(window.getComputedStyle(el, null).getPropertyValue("padding-bottom"));
            return returnHeight
        },getOffset: function(el) {
            "use strict";
            var box = el.getBoundingClientRect();
            var body = document.body;
            var clientTop = el.clientTop || body.clientTop || 0;
            var clientLeft = el.clientLeft || body.clientLeft || 0;
            var scrollTop = window.pageYOffset || el.scrollTop;
            var scrollLeft = window.pageXOffset || el.scrollLeft;
            if (document.documentElement && !window.pageYOffset) {
                scrollTop = document.documentElement.scrollTop;
                scrollLeft = document.documentElement.scrollLeft
            }
            return {top: box.top + scrollTop - clientTop,left: box.left + scrollLeft - clientLeft}
        },windowWidth: function() {
            "use strict";
            if (window.innerWidth)
                return window.innerWidth;
            else if (document.documentElement && document.documentElement.clientWidth)
                return document.documentElement.clientWidth
        },windowHeight: function() {
            "use strict";
            if (window.innerHeight)
                return window.innerHeight;
            else if (document.documentElement && document.documentElement.clientHeight)
                return document.documentElement.clientHeight
        },windowScroll: function() {
            "use strict";
            var left = 0, top = 0;
            if (typeof pageYOffset !== "undefined") {
                return {left: window.pageXOffset,top: window.pageYOffset}
            } else if (document.documentElement) {
                return {left: document.documentElement.scrollLeft,top: document.documentElement.scrollTop}
            }
        },addEventListener: function(el, event, listener, useCapture) {
            "use strict";
            if (typeof useCapture === "undefined") {
                useCapture = false
            }
            if (el.addEventListener) {
                el.addEventListener(event, listener, useCapture)
            } else if (el.attachEvent) {
                el.attachEvent("on" + event, listener)
            }
        },removeEventListener: function(el, event, listener, useCapture) {
            "use strict";
            if (typeof useCapture === "undefined") {
                useCapture = false
            }
            if (el.removeEventListener) {
                el.removeEventListener(event, listener, useCapture)
            } else if (el.detachEvent) {
                el.detachEvent("on" + event, listener)
            }
        }},setTransform: function(el, transform) {
        "use strict";
        var es = el.style;
        es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transform
    },setTranslate: function(el, translate) {
        "use strict";
        var es = el.style;
        var pos = {x: translate.x || 0,y: translate.y || 0,z: translate.z || 0};
        var transformString = this.support.transforms3d ? "translate3d(" + pos.x + "px," + pos.y + "px," + pos.z + "px)" : "translate(" + pos.x + "px," + pos.y + "px)";
        es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transformString;
        if (!this.support.transforms) {
            es.left = pos.x + "px";
            es.top = pos.y + "px"
        }
    },setTransition: function(el, duration) {
        "use strict";
        var es = el.style;
        es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = duration + "ms"
    },support: {touch: window.Modernizr && Modernizr.touch === true || function() {
            "use strict";
            return !!("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch)
        }(),transforms3d: window.Modernizr && Modernizr.csstransforms3d === true || function() {
            "use strict";
            var div = document.createElement("div").style;
            return "webkitPerspective" in div || "MozPerspective" in div || "OPerspective" in div || "MsPerspective" in div || "perspective" in div
        }(),transforms: window.Modernizr && Modernizr.csstransforms === true || function() {
            "use strict";
            var div = document.createElement("div").style;
            return "transform" in div || "WebkitTransform" in div || "MozTransform" in div || "msTransform" in div || "MsTransform" in div || "OTransform" in div
        }(),transitions: window.Modernizr && Modernizr.csstransitions === true || function() {
            "use strict";
            var div = document.createElement("div").style;
            return "transition" in div || "WebkitTransition" in div || "MozTransition" in div || "msTransition" in div || "MsTransition" in div || "OTransition" in div
        }()},browser: {ie8: function() {
            "use strict";
            var rv = -1;
            if (navigator.appName === "Microsoft Internet Explorer") {
                var ua = navigator.userAgent;
                var re = new RegExp(/MSIE ([0-9]{1,}[\.0-9]{0,})/);
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1)
            }
            return rv !== -1 && rv < 9
        }(),ie10: window.navigator.msPointerEnabled,ie11: window.navigator.pointerEnabled}};
if (window.jQuery || window.Zepto) {
    (function($) {
        "use strict";
        $.fn.swiper = function(params) {
            var s = new Swiper($(this)[0], params);
            $(this).data("swiper", s);
            return s
        }
    })(window.jQuery || window.Zepto)
}
if (typeof module !== "undefined") {
    module.exports = Swiper
}







/*! 
 * jquery.event.drag - v 2.2
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
// Created: 2008-06-04 
// Updated: 2012-05-21
// REQUIRES: jquery 1.7.x

;(function( $ ){
 
// add the jquery instance method
$.fn.drag = function( str, arg, opts ){
	// figure out the event type
	var type = typeof str == "string" ? str : "",
	// figure out the event handler...
	fn = $.isFunction( str ) ? str : $.isFunction( arg ) ? arg : null;
	// fix the event type
	if ( type.indexOf("drag") !== 0 ) 
		type = "drag"+ type;
	// were options passed
	opts = ( str == fn ? arg : opts ) || {};
	// trigger or bind event handler
	return fn ? this.bind( type, opts, fn ) : this.trigger( type );
};

// local refs (increase compression)
var $event = $.event, 
$special = $event.special,
// configure the drag special event 
drag = $special.drag = {
	
	// these are the default settings
	defaults: {
		which: 1, // mouse button pressed to start drag sequence
		distance: 0, // distance dragged before dragstart
		not: ':input', // selector to suppress dragging on target elements
		handle: null, // selector to match handle target elements
		relative: false, // true to use "position", false to use "offset"
		drop: true, // false to suppress drop events, true or selector to allow
		click: false // false to suppress click events after dragend (no proxy)
	},
	
	// the key name for stored drag data
	datakey: "dragdata",
	
	// prevent bubbling for better performance
	noBubble: true,
	
	// count bound related events
	add: function( obj ){ 
		// read the interaction data
		var data = $.data( this, drag.datakey ),
		// read any passed options 
		opts = obj.data || {};
		// count another realted event
		data.related += 1;
		// extend data options bound with this event
		// don't iterate "opts" in case it is a node 
		$.each( drag.defaults, function( key, def ){
			if ( opts[ key ] !== undefined )
				data[ key ] = opts[ key ];
		});
	},
	
	// forget unbound related events
	remove: function(){
		$.data( this, drag.datakey ).related -= 1;
	},
	
	// configure interaction, capture settings
	setup: function(){
		// check for related events
		if ( $.data( this, drag.datakey ) ) 
			return;
		// initialize the drag data with copied defaults
		var data = $.extend({ related:0 }, drag.defaults );
		// store the interaction data
		$.data( this, drag.datakey, data );
		// bind the mousedown event, which starts drag interactions
		$event.add( this, "touchstart mousedown", drag.init, data );
		// prevent image dragging in IE...
		if ( this.attachEvent ) 
			this.attachEvent("ondragstart", drag.dontstart ); 
	},
	
	// destroy configured interaction
	teardown: function(){
		var data = $.data( this, drag.datakey ) || {};
		// check for related events
		if ( data.related ) 
			return;
		// remove the stored data
		$.removeData( this, drag.datakey );
		// remove the mousedown event
		$event.remove( this, "touchstart mousedown", drag.init );
		// enable text selection
		drag.textselect( true ); 
		// un-prevent image dragging in IE...
		if ( this.detachEvent ) 
			this.detachEvent("ondragstart", drag.dontstart ); 
	},
		
	// initialize the interaction
	init: function( event ){ 
		// sorry, only one touch at a time
		if ( drag.touched ) 
			return;
		// the drag/drop interaction data
		var dd = event.data, results;
		// check the which directive
		if ( event.which != 0 && dd.which > 0 && event.which != dd.which ) 
			return; 
		// check for suppressed selector
		if ( $( event.target ).is( dd.not ) ) 
			return;
		// check for handle selector
		if ( dd.handle && !$( event.target ).closest( dd.handle, event.currentTarget ).length ) 
			return;

		drag.touched = event.type == 'touchstart' ? this : null;
		dd.propagates = 1;
		dd.mousedown = this;
		dd.interactions = [ drag.interaction( this, dd ) ];
		dd.target = event.target;
		dd.pageX = event.pageX;
		dd.pageY = event.pageY;
		dd.dragging = null;
		// handle draginit event... 
		results = drag.hijack( event, "draginit", dd );
		// early cancel
		if ( !dd.propagates )
			return;
		// flatten the result set
		results = drag.flatten( results );
		// insert new interaction elements
		if ( results && results.length ){
			dd.interactions = [];
			$.each( results, function(){
				dd.interactions.push( drag.interaction( this, dd ) );
			});
		}
		// remember how many interactions are propagating
		dd.propagates = dd.interactions.length;
		// locate and init the drop targets
		if ( dd.drop !== false && $special.drop ) 
			$special.drop.handler( event, dd );
		// disable text selection
		drag.textselect( false ); 
		// bind additional events...
		if ( drag.touched )
			$event.add( drag.touched, "touchmove touchend", drag.handler, dd );
		else 
			$event.add( document, "mousemove mouseup", drag.handler, dd );
		// helps prevent text selection or scrolling
		if ( !drag.touched || dd.live )
			return false;
	},	
	
	// returns an interaction object
	interaction: function( elem, dd ){
		var offset = $( elem )[ dd.relative ? "position" : "offset" ]() || { top:0, left:0 };
		return {
			drag: elem, 
			callback: new drag.callback(), 
			droppable: [],
			offset: offset
		};
	},
	
	// handle drag-releatd DOM events
	handler: function( event ){ 
		// read the data before hijacking anything
		var dd = event.data;	
		// handle various events
		switch ( event.type ){
			// mousemove, check distance, start dragging
			case !dd.dragging && 'touchmove': 
				event.preventDefault();
			case !dd.dragging && 'mousemove':
				//  drag tolerance, xï¿½ + yï¿½ = distanceï¿½
				if ( Math.pow(  event.pageX-dd.pageX, 2 ) + Math.pow(  event.pageY-dd.pageY, 2 ) < Math.pow( dd.distance, 2 ) ) 
					break; // distance tolerance not reached
				event.target = dd.target; // force target from "mousedown" event (fix distance issue)
				drag.hijack( event, "dragstart", dd ); // trigger "dragstart"
				if ( dd.propagates ) // "dragstart" not rejected
					dd.dragging = true; // activate interaction
			// mousemove, dragging
			case 'touchmove':
				event.preventDefault();
			case 'mousemove':
				if ( dd.dragging ){
					// trigger "drag"		
					drag.hijack( event, "drag", dd );
					if ( dd.propagates ){
						// manage drop events
						if ( dd.drop !== false && $special.drop )
							$special.drop.handler( event, dd ); // "dropstart", "dropend"							
						break; // "drag" not rejected, stop		
					}
					event.type = "mouseup"; // helps "drop" handler behave
				}
			// mouseup, stop dragging
			case 'touchend': 
			case 'mouseup': 
			default:
				if ( drag.touched )
					$event.remove( drag.touched, "touchmove touchend", drag.handler ); // remove touch events
				else 
					$event.remove( document, "mousemove mouseup", drag.handler ); // remove page events	
				if ( dd.dragging ){
					if ( dd.drop !== false && $special.drop )
						$special.drop.handler( event, dd ); // "drop"
					drag.hijack( event, "dragend", dd ); // trigger "dragend"	
				}
				drag.textselect( true ); // enable text selection
				// if suppressing click events...
				if ( dd.click === false && dd.dragging )
					$.data( dd.mousedown, "suppress.click", new Date().getTime() + 5 );
				dd.dragging = drag.touched = false; // deactivate element	
				break;
		}
	},
		
	// re-use event object for custom events
	hijack: function( event, type, dd, x, elem ){
		// not configured
		if ( !dd ) 
			return;
		// remember the original event and type
		var orig = { event:event.originalEvent, type:event.type },
		// is the event drag related or drog related?
		mode = type.indexOf("drop") ? "drag" : "drop",
		// iteration vars
		result, i = x || 0, ia, $elems, callback,
		len = !isNaN( x ) ? x : dd.interactions.length;
		// modify the event type
		event.type = type;
		// remove the original event
		event.originalEvent = null;
		// initialize the results
		dd.results = [];
		// handle each interacted element
		do if ( ia = dd.interactions[ i ] ){
			// validate the interaction
			if ( type !== "dragend" && ia.cancelled )
				continue;
			// set the dragdrop properties on the event object
			callback = drag.properties( event, dd, ia );
			// prepare for more results
			ia.results = [];
			// handle each element
			$( elem || ia[ mode ] || dd.droppable ).each(function( p, subject ){
				// identify drag or drop targets individually
				callback.target = subject;
				// force propagtion of the custom event
				event.isPropagationStopped = function(){ return false; };
				// handle the event	
				result = subject ? $event.dispatch.call( subject, event, callback ) : null;
				// stop the drag interaction for this element
				if ( result === false ){
					if ( mode == "drag" ){
						ia.cancelled = true;
						dd.propagates -= 1;
					}
					if ( type == "drop" ){
						ia[ mode ][p] = null;
					}
				}
				// assign any dropinit elements
				else if ( type == "dropinit" )
					ia.droppable.push( drag.element( result ) || subject );
				// accept a returned proxy element 
				if ( type == "dragstart" )
					ia.proxy = $( drag.element( result ) || ia.drag )[0];
				// remember this result	
				ia.results.push( result );
				// forget the event result, for recycling
				delete event.result;
				// break on cancelled handler
				if ( type !== "dropinit" )
					return result;
			});	
			// flatten the results	
			dd.results[ i ] = drag.flatten( ia.results );	
			// accept a set of valid drop targets
			if ( type == "dropinit" )
				ia.droppable = drag.flatten( ia.droppable );
			// locate drop targets
			if ( type == "dragstart" && !ia.cancelled )
				callback.update(); 
		}
		while ( ++i < len )
		// restore the original event & type
		event.type = orig.type;
		event.originalEvent = orig.event;
		// return all handler results
		return drag.flatten( dd.results );
	},
		
	// extend the callback object with drag/drop properties...
	properties: function( event, dd, ia ){		
		var obj = ia.callback;
		// elements
		obj.drag = ia.drag;
		obj.proxy = ia.proxy || ia.drag;
		// starting mouse position
		obj.startX = dd.pageX;
		obj.startY = dd.pageY;
		// current distance dragged
		obj.deltaX = event.pageX - dd.pageX;
		obj.deltaY = event.pageY - dd.pageY;
		// original element position
		obj.originalX = ia.offset.left;
		obj.originalY = ia.offset.top;
		// adjusted element position
		obj.offsetX = obj.originalX + obj.deltaX; 
		obj.offsetY = obj.originalY + obj.deltaY;
		// assign the drop targets information
		obj.drop = drag.flatten( ( ia.drop || [] ).slice() );
		obj.available = drag.flatten( ( ia.droppable || [] ).slice() );
		return obj;	
	},
	
	// determine is the argument is an element or jquery instance
	element: function( arg ){
		if ( arg && ( arg.jquery || arg.nodeType == 1 ) )
			return arg;
	},
	
	// flatten nested jquery objects and arrays into a single dimension array
	flatten: function( arr ){
		return $.map( arr, function( member ){
			return member && member.jquery ? $.makeArray( member ) : 
				member && member.length ? drag.flatten( member ) : member;
		});
	},
	
	// toggles text selection attributes ON (true) or OFF (false)
	textselect: function( bool ){ 
		$( document )[ bool ? "unbind" : "bind" ]("selectstart", drag.dontstart )
			.css("MozUserSelect", bool ? "" : "none" );
		// .attr("unselectable", bool ? "off" : "on" )
		document.unselectable = bool ? "off" : "on"; 
	},
	
	// suppress "selectstart" and "ondragstart" events
	dontstart: function(){ 
		return false; 
	},
	
	// a callback instance contructor
	callback: function(){}
	
};

// callback methods
drag.callback.prototype = {
	update: function(){
		if ( $special.drop && this.available.length )
			$.each( this.available, function( i ){
				$special.drop.locate( this, i );
			});
	}
};

// patch $.event.$dispatch to allow suppressing clicks
var $dispatch = $event.dispatch;
$event.dispatch = function( event ){
	if ( $.data( this, "suppress."+ event.type ) - new Date().getTime() > 0 ){
		$.removeData( this, "suppress."+ event.type );
		return;
	}
	return $dispatch.apply( this, arguments );
};

// event fix hooks for touch events...
var touchHooks = 
$event.fixHooks.touchstart = 
$event.fixHooks.touchmove = 
$event.fixHooks.touchend =
$event.fixHooks.touchcancel = {
	props: "clientX clientY pageX pageY screenX screenY".split( " " ),
	filter: function( event, orig ) {
		if ( orig ){
			var touched = ( orig.touches && orig.touches[0] )
				|| ( orig.changedTouches && orig.changedTouches[0] )
				|| null; 
			// iOS webkit: touchstart, touchmove, touchend
			if ( touched ) 
				$.each( touchHooks.props, function( i, prop ){
					event[ prop ] = touched[ prop ];
				});
		}
		return event;
	}
};

// share the same special event configuration with related events...
$special.draginit = $special.dragstart = $special.dragend = drag;

})( jQuery );
/*! iScroll v5.1.1 ~ (c) 2008-2014 Matteo Spinelli ~ http://cubiq.org/license */  
(function (window, document, Math) {
var rAF = window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	function (callback) { window.setTimeout(callback, 1000 / 60); };
 
var utils = (function () {
	var me = {};

	var _elementStyle = document.createElement('div').style;
	var _vendor = (function () {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			transform = vendors[i] + 'ransform';
			if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
		}

		return false;
	})();

	function _prefixStyle (style) {
		if ( _vendor === false ) return false;
		if ( _vendor === '' ) return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}

	me.getTime = Date.now || function getTime () { return new Date().getTime(); };

	me.extend = function (target, obj) {
		for ( var i in obj ) {
			target[i] = obj[i];
		}
	};

	me.addEvent = function (el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture);
	};

	me.removeEvent = function (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	};

	me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
		var distance = current - start,
			speed = Math.abs(distance) / time,
			destination,
			duration;

		deceleration = deceleration === undefined ? 0.0006 : deceleration;

		destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		duration = speed / deceleration;

		if ( destination < lowerMargin ) {
			destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if ( destination > 0 ) {
			destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
			distance = Math.abs(current) + destination;
			duration = distance / speed;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
	};

	var _transform = _prefixStyle('transform');

	me.extend(me, {
		hasTransform: _transform !== false,
		hasPerspective: _prefixStyle('perspective') in _elementStyle,
		hasTouch: 'ontouchstart' in window,
		hasPointer: navigator.msPointerEnabled,
		hasTransition: _prefixStyle('transition') in _elementStyle
	});

	// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
	me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));

	me.extend(me.style = {}, {
		transform: _transform,
		transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		transitionDuration: _prefixStyle('transitionDuration'),
		transitionDelay: _prefixStyle('transitionDelay'),
		transformOrigin: _prefixStyle('transformOrigin')
	});

	me.hasClass = function (e, c) {
		var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
		return re.test(e.className);
	};

	me.addClass = function (e, c) {
		if ( me.hasClass(e, c) ) {
			return;
		}

		var newclass = e.className.split(' ');
		newclass.push(c);
		e.className = newclass.join(' ');
	};

	me.removeClass = function (e, c) {
		if ( !me.hasClass(e, c) ) {
			return;
		}

		var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
		e.className = e.className.replace(re, ' ');
	};

	me.offset = function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;

		// jshint -W084
		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}
		// jshint +W084

		return {
			left: left,
			top: top
		};
	};

	me.preventDefaultException = function (el, exceptions) {
		for ( var i in exceptions ) {
			if ( exceptions[i].test(el[i]) ) {
				return true;
			}
		}

		return false;
	};

	me.extend(me.eventType = {}, {
		touchstart: 1,
		touchmove: 1,
		touchend: 1,

		mousedown: 2,
		mousemove: 2,
		mouseup: 2,

		MSPointerDown: 3,
		MSPointerMove: 3,
		MSPointerUp: 3
	});

	me.extend(me.ease = {}, {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) );
			}
		},
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4;
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k;
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		},
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4;

				if ( k === 0 ) { return 0; }
				if ( k == 1 ) { return 1; }

				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
			}
		}
	});

	me.tap = function (e, eventName) {
		var ev = document.createEvent('Event');
		ev.initEvent(eventName, true, true);
		ev.pageX = e.pageX;
		ev.pageY = e.pageY;
		e.target.dispatchEvent(ev);
	};

	me.click = function (e) {
		var target = e.target,
			ev;
		
		/* 
		 iscroll ???? ?Ï¹? ?Â±??Ï°??? click ?Ìº?Æ®?? ?????? ?Ï¿? ?????Ñ´?.
		 ?Ï¹? ???????? ?????Ã¿? click true ???Â¿??? ?Ï¹??Â±×¿? click ?Ìº?Æ®?? ?Ö´Â°???
		 ?Î¹? ?????È´?.
		 */
		if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
			ev = document.createEvent('MouseEvents');
			ev.initMouseEvent('click', true, true, e.view, 1,
				target.screenX, target.screenY, target.clientX, target.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				0, null);

			ev._constructed = true;
			target.dispatchEvent(ev);
		}
	};

	return me;
})();

function IScroll (el, options) {
	this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
	this.scroller = this.wrapper.children[0];
	this.scrollerStyle = this.scroller.style;		// cache style for better performance

	this.options = {

		resizeScrollbars: true,

		mouseWheelSpeed: 20,

		snapThreshold: 0.334,

// INSERT POINT: OPTIONS 

		startX: 0,
		startY: 0,
		scrollY: true,
		directionLockThreshold: 5,
		momentum: true,

		bounce: true,
		bounceTime: 600,
		bounceEasing: '',

		preventDefault: true,
		preventDefaultException: { tagName: /^(INPUT|TEXTAREA|SELECT)$/ },

		HWCompositing: true,
		useTransition: true,
		useTransform: true
	};

	for ( var i in options ) {
		this.options[i] = options[i];
	}

	// Normalize options
	this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

	this.options.useTransition = utils.hasTransition && this.options.useTransition;
	this.options.useTransform = utils.hasTransform && this.options.useTransform;

	this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
	this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

	// If you want eventPassthrough I have to lock one of the axes
	this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
	this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

	// With eventPassthrough we also need lockDirection mechanism
	this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
	this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

	this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

	this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

	if ( this.options.tap === true ) {
		this.options.tap = 'tap';
	}

	if ( this.options.shrinkScrollbars == 'scale' ) {
		this.options.useTransition = false;
	}

	this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

// INSERT POINT: NORMALIZATION

	// Some defaults	
	this.x = 0;
	this.y = 0;
	this.directionX = 0;
	this.directionY = 0;
	this._events = {};

// INSERT POINT: DEFAULTS

	this._init();
	this.refresh();

	this.scrollTo(this.options.startX, this.options.startY);
	this.enable();
}

IScroll.prototype = {
	version: '5.1.1',

	_init: function () {
		this._initEvents();

		if ( this.options.scrollbars || this.options.indicators ) {
			this._initIndicators();
		}

		if ( this.options.mouseWheel ) {
			this._initWheel();
		}

		if ( this.options.snap ) {
			this._initSnap();
		}

		if ( this.options.keyBindings ) {
			this._initKeys();
		}

// INSERT POINT: _init

	},

	destroy: function () {
		this._initEvents(true);

		this._execEvent('destroy');
	},

	_transitionEnd: function (e) {
		if ( e.target != this.scroller || !this.isInTransition ) {
			return;
		}

		this._transitionTime();
		if ( !this.resetPosition(this.options.bounceTime) ) {
			this.isInTransition = false;
			this._execEvent('scrollEnd');
		}
	},

	_start: function (e) {
		// React to left mouse button only
		if ( utils.eventType[e.type] != 1 ) {
			if ( e.button !== 0 ) {
				return;
			}
		}

		if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
			return;
		}

		if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.touches ? e.touches[0] : e,
			pos;

		this.initiated	= utils.eventType[e.type];
		this.moved		= false;
		this.distX		= 0;
		this.distY		= 0;
		this.directionX = 0;
		this.directionY = 0;
		this.directionLocked = 0;

		this._transitionTime();

		this.startTime = utils.getTime();

		if ( this.options.useTransition && this.isInTransition ) {
			this.isInTransition = false;
			pos = this.getComputedPosition();
			this._translate(Math.round(pos.x), Math.round(pos.y));
			this._execEvent('scrollEnd');
		} else if ( !this.options.useTransition && this.isAnimating ) {
			this.isAnimating = false;
			this._execEvent('scrollEnd');
		}

		this.startX    = this.x;
		this.startY    = this.y;
		this.absStartX = this.x;
		this.absStartY = this.y;
		this.pointX    = point.pageX;
		this.pointY    = point.pageY;

		this._execEvent('beforeScrollStart');
	},

	_move: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault ) {	// increases performance on Android? TODO: check!
			e.preventDefault();
		}

		var point		= e.touches ? e.touches[0] : e,
			deltaX		= point.pageX - this.pointX,
			deltaY		= point.pageY - this.pointY,
			timestamp	= utils.getTime(),
			newX, newY,
			absDistX, absDistY;

		this.pointX		= point.pageX;
		this.pointY		= point.pageY;

		this.distX		+= deltaX;
		this.distY		+= deltaY;
		absDistX		= Math.abs(this.distX);
		absDistY		= Math.abs(this.distY);

		// We need to move at least 10 pixels for the scrolling to initiate
		if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
			return;
		}

		// If you are scrolling in one direction lock the other
		if ( !this.directionLocked && !this.options.freeScroll ) {
			if ( absDistX > absDistY + this.options.directionLockThreshold ) {
				this.directionLocked = 'h';		// lock horizontally
			} else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
				this.directionLocked = 'v';		// lock vertically
			} else {
				this.directionLocked = 'n';		// no lock
			}
		}

		if ( this.directionLocked == 'h' ) {
			if ( this.options.eventPassthrough == 'vertical' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'horizontal' ) {
				this.initiated = false;
				return;
			}

			deltaY = 0;
		} else if ( this.directionLocked == 'v' ) {
			if ( this.options.eventPassthrough == 'horizontal' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'vertical' ) {
				this.initiated = false;
				return;
			}

			deltaX = 0;
		}

		deltaX = this.hasHorizontalScroll ? deltaX : 0;
		deltaY = this.hasVerticalScroll ? deltaY : 0;

		newX = this.x + deltaX;
		newY = this.y + deltaY;

		// Slow down if outside of the boundaries
		if ( newX > 0 || newX < this.maxScrollX ) {
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		}
		if ( newY > 0 || newY < this.maxScrollY ) {
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		}

		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if ( !this.moved ) {
			this._execEvent('scrollStart');
		}

		this.moved = true;

		this._translate(newX, newY);

/* REPLACE START: _move */

		if ( timestamp - this.startTime > 300 ) {
			this.startTime = timestamp;
			this.startX = this.x;
			this.startY = this.y;
		}

/* REPLACE END: _move */

	},

	_end: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.changedTouches ? e.changedTouches[0] : e,
			momentumX,
			momentumY,
			duration = utils.getTime() - this.startTime,
			newX = Math.round(this.x),
			newY = Math.round(this.y),
			distanceX = Math.abs(newX - this.startX),
			distanceY = Math.abs(newY - this.startY),
			time = 0,
			easing = '';

		this.isInTransition = 0;
		this.initiated = 0;
		this.endTime = utils.getTime();

		// reset if we are outside of the boundaries
		if ( this.resetPosition(this.options.bounceTime) ) {
			return;
		}

		this.scrollTo(newX, newY);	// ensures that the last position is rounded

		// we scrolled less than 10 pixels
		if ( !this.moved ) {
			if ( this.options.tap ) {
				utils.tap(e, this.options.tap);
			}

			if ( this.options.click ) {
				utils.click(e);
			}

			this._execEvent('scrollCancel');
			return;
		}

		if ( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ) {
			this._execEvent('flick');
			return;
		}

		// start momentum animation if needed
		if ( this.options.momentum && duration < 300 ) {
			momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
			momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
			newX = momentumX.destination;
			newY = momentumY.destination;
			time = Math.max(momentumX.duration, momentumY.duration);
			this.isInTransition = 1;
		}


		if ( this.options.snap ) {
			var snap = this._nearestSnap(newX, newY);
			this.currentPage = snap;
			time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(newX - snap.x), 1000),
						Math.min(Math.abs(newY - snap.y), 1000)
					), 300);
			newX = snap.x;
			newY = snap.y;

			this.directionX = 0;
			this.directionY = 0;
			easing = this.options.bounceEasing;
		}

// INSERT POINT: _end

		if ( newX != this.x || newY != this.y ) {
			// change easing function when scroller goes out of the boundaries
			if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
				easing = utils.ease.quadratic;
			}

			this.scrollTo(newX, newY, time, easing);
			return;
		}

		this._execEvent('scrollEnd');
	},

	_resize: function () {
		var that = this;

		clearTimeout(this.resizeTimeout);

		this.resizeTimeout = setTimeout(function () {
			that.refresh();
		}, this.options.resizePolling);
	},

	resetPosition: function (time) {
		var x = this.x,
			y = this.y;

		time = time || 0;

		if ( !this.hasHorizontalScroll || this.x > 0 ) {
			x = 0;
		} else if ( this.x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( !this.hasVerticalScroll || this.y > 0 ) {
			y = 0;
		} else if ( this.y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		if ( x == this.x && y == this.y ) {
			return false;
		}

		this.scrollTo(x, y, time, this.options.bounceEasing);

		return true;
	},

	disable: function () {
		this.enabled = false;
	},

	enable: function () {
		this.enabled = true;
	},

	refresh: function () {
		var rf = this.wrapper.offsetHeight;		// Force reflow

		this.wrapperWidth	= this.wrapper.clientWidth;
		this.wrapperHeight	= this.wrapper.clientHeight;

/* REPLACE START: refresh */

		this.scrollerWidth	= this.scroller.offsetWidth;
		this.scrollerHeight	= this.scroller.offsetHeight;

		this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
		this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;

/* REPLACE END: refresh */

		this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
		this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;

		if ( !this.hasHorizontalScroll ) {
			this.maxScrollX = 0;
			this.scrollerWidth = this.wrapperWidth;
		}

		if ( !this.hasVerticalScroll ) {
			this.maxScrollY = 0;
			this.scrollerHeight = this.wrapperHeight;
		}

		this.endTime = 0;
		this.directionX = 0;
		this.directionY = 0;

		this.wrapperOffset = utils.offset(this.wrapper);

		this._execEvent('refresh');

		this.resetPosition();

// INSERT POINT: _refresh

	},

	on: function (type, fn) {
		if ( !this._events[type] ) {
			this._events[type] = [];
		}

		this._events[type].push(fn);
	},

	off: function (type, fn) {
		if ( !this._events[type] ) {
			return;
		}

		var index = this._events[type].indexOf(fn);

		if ( index > -1 ) {
			this._events[type].splice(index, 1);
		}
	},

	_execEvent: function (type) {
		if ( !this._events[type] ) {
			return;
		}

		var i = 0,
			l = this._events[type].length;

		if ( !l ) {
			return;
		}

		for ( ; i < l; i++ ) {
			this._events[type][i].apply(this, [].slice.call(arguments, 1));
		}
	},

	scrollBy: function (x, y, time, easing) {
		x = this.x + x;
		y = this.y + y;
		time = time || 0;

		this.scrollTo(x, y, time, easing);
	},

	scrollTo: function (x, y, time, easing) {
		easing = easing || utils.ease.circular;

		this.isInTransition = this.options.useTransition && time > 0;

		if ( !time || (this.options.useTransition && easing.style) ) {
			this._transitionTimingFunction(easing.style);
			this._transitionTime(time);
			this._translate(x, y);
		} else {
			this._animate(x, y, time, easing.fn);
		}
	},

	scrollToElement: function (el, time, offsetX, offsetY, easing) {
		el = el.nodeType ? el : this.scroller.querySelector(el);

		if ( !el ) {
			return;
		}

		var pos = utils.offset(el);

		pos.left -= this.wrapperOffset.left;
		pos.top  -= this.wrapperOffset.top;

		// if offsetX/Y are true we center the element to the screen
		if ( offsetX === true ) {
			offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
		}
		if ( offsetY === true ) {
			offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
		}

		pos.left -= offsetX || 0;
		pos.top  -= offsetY || 0;

		pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
		pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

		time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

		this.scrollTo(pos.left, pos.top, time, easing);
	},

	_transitionTime: function (time) {
		time = time || 0;

		this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
		}


		if ( this.indicators ) {
			for ( var i = this.indicators.length; i--; ) {
				this.indicators[i].transitionTime(time);
			}
		}


// INSERT POINT: _transitionTime

	},

	_transitionTimingFunction: function (easing) {
		this.scrollerStyle[utils.style.transitionTimingFunction] = easing;


		if ( this.indicators ) {
			for ( var i = this.indicators.length; i--; ) {
				this.indicators[i].transitionTimingFunction(easing);
			}
		}


// INSERT POINT: _transitionTimingFunction

	},

	_translate: function (x, y) {
		if ( this.options.useTransform ) {

/* REPLACE START: _translate */

			this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

/* REPLACE END: _translate */

		} else {
			x = Math.round(x);
			y = Math.round(y);
			this.scrollerStyle.left = x + 'px';
			this.scrollerStyle.top = y + 'px';
		}

		this.x = x;
		this.y = y;


	if ( this.indicators ) {
		for ( var i = this.indicators.length; i--; ) {
			this.indicators[i].updatePosition();
		}
	}


// INSERT POINT: _translate

	},

	_initEvents: function (remove) {
		var eventType = remove ? utils.removeEvent : utils.addEvent,
			target = this.options.bindToWrapper ? this.wrapper : window;

		eventType(window, 'orientationchange', this);
		eventType(window, 'resize', this);

		if ( this.options.click ) {
			eventType(this.wrapper, 'click', this, true);
		}

		if ( !this.options.disableMouse ) {
			eventType(this.wrapper, 'mousedown', this);
			eventType(target, 'mousemove', this);
			eventType(target, 'mousecancel', this);
			eventType(target, 'mouseup', this);
		}

		if ( utils.hasPointer && !this.options.disablePointer ) {
			eventType(this.wrapper, 'MSPointerDown', this);
			eventType(target, 'MSPointerMove', this);
			eventType(target, 'MSPointerCancel', this);
			eventType(target, 'MSPointerUp', this);
		}

		if ( utils.hasTouch && !this.options.disableTouch ) {
			eventType(this.wrapper, 'touchstart', this);
			eventType(target, 'touchmove', this);
			eventType(target, 'touchcancel', this);
			eventType(target, 'touchend', this);
		}

		eventType(this.scroller, 'transitionend', this);
		eventType(this.scroller, 'webkitTransitionEnd', this);
		eventType(this.scroller, 'oTransitionEnd', this);
		eventType(this.scroller, 'MSTransitionEnd', this);
	},

	getComputedPosition: function () {
		var matrix = window.getComputedStyle(this.scroller, null),
			x, y;

		if ( this.options.useTransform ) {
			matrix = matrix[utils.style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d.]/g, '');
			y = +matrix.top.replace(/[^-\d.]/g, '');
		}

		return { x: x, y: y };
	},

	_initIndicators: function () {
		var interactive = this.options.interactiveScrollbars,
			customStyle = typeof this.options.scrollbars != 'string',
			indicators = [],
			indicator;

		var that = this;

		this.indicators = [];

		if ( this.options.scrollbars ) {
			// Vertical scrollbar
			if ( this.options.scrollY ) {
				indicator = {
					el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeScrollbars,
					shrink: this.options.shrinkScrollbars,
					fade: this.options.fadeScrollbars,
					listenX: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}

			// Horizontal scrollbar
			if ( this.options.scrollX ) {
				indicator = {
					el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeScrollbars,
					shrink: this.options.shrinkScrollbars,
					fade: this.options.fadeScrollbars,
					listenY: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}
		}

		if ( this.options.indicators ) {
			// TODO: check concat compatibility
			indicators = indicators.concat(this.options.indicators);
		}

		for ( var i = indicators.length; i--; ) {
			this.indicators.push( new Indicator(this, indicators[i]) );
		}

		// TODO: check if we can use array.map (wide compatibility and performance issues)
		function _indicatorsMap (fn) {
			for ( var i = that.indicators.length; i--; ) {
				fn.call(that.indicators[i]);
			}
		}

		if ( this.options.fadeScrollbars ) {
			this.on('scrollEnd', function () {
				_indicatorsMap(function () {
					this.fade();
				});
			});

			this.on('scrollCancel', function () {
				_indicatorsMap(function () {
					this.fade();
				});
			});

			this.on('scrollStart', function () {
				_indicatorsMap(function () {
					this.fade(1);
				});
			});

			this.on('beforeScrollStart', function () {
				_indicatorsMap(function () {
					this.fade(1, true);
				});
			});
		}


		this.on('refresh', function () {
			_indicatorsMap(function () {
				this.refresh();
			});
		});

		this.on('destroy', function () {
			_indicatorsMap(function () {
				this.destroy();
			});

			delete this.indicators;
		});
	},

	_initWheel: function () {
		utils.addEvent(this.wrapper, 'wheel', this);
		utils.addEvent(this.wrapper, 'mousewheel', this);
		utils.addEvent(this.wrapper, 'DOMMouseScroll', this);

		this.on('destroy', function () {
			utils.removeEvent(this.wrapper, 'wheel', this);
			utils.removeEvent(this.wrapper, 'mousewheel', this);
			utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
		});
	},

	_wheel: function (e) {
		if ( !this.enabled ) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		var wheelDeltaX, wheelDeltaY,
			newX, newY,
			that = this;

		if ( this.wheelTimeout === undefined ) {
			that._execEvent('scrollStart');
		}

		// Execute the scrollEnd event after 400ms the wheel stopped scrolling
		clearTimeout(this.wheelTimeout);
		this.wheelTimeout = setTimeout(function () {
			that._execEvent('scrollEnd');
			that.wheelTimeout = undefined;
		}, 400);

		if ( 'deltaX' in e ) {
			wheelDeltaX = -e.deltaX;
			wheelDeltaY = -e.deltaY;
		} else if ( 'wheelDeltaX' in e ) {
			wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
			wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
		} else if ( 'wheelDelta' in e ) {
			wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
		} else if ( 'detail' in e ) {
			wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
		} else {
			return;
		}

		wheelDeltaX *= this.options.invertWheelDirection;
		wheelDeltaY *= this.options.invertWheelDirection;

		if ( !this.hasVerticalScroll ) {
			wheelDeltaX = wheelDeltaY;
			wheelDeltaY = 0;
		}

		if ( this.options.snap ) {
			newX = this.currentPage.pageX;
			newY = this.currentPage.pageY;

			if ( wheelDeltaX > 0 ) {
				newX--;
			} else if ( wheelDeltaX < 0 ) {
				newX++;
			}

			if ( wheelDeltaY > 0 ) {
				newY--;
			} else if ( wheelDeltaY < 0 ) {
				newY++;
			}

			this.goToPage(newX, newY);

			return;
		}

		newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
		newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);

		if ( newX > 0 ) {
			newX = 0;
		} else if ( newX < this.maxScrollX ) {
			newX = this.maxScrollX;
		}

		if ( newY > 0 ) {
			newY = 0;
		} else if ( newY < this.maxScrollY ) {
			newY = this.maxScrollY;
		}

		this.scrollTo(newX, newY, 0);

// INSERT POINT: _wheel
	},

	_initSnap: function () {
		this.currentPage = {};

		if ( typeof this.options.snap == 'string' ) {
			this.options.snap = this.scroller.querySelectorAll(this.options.snap);
		}

		this.on('refresh', function () {
			var i = 0, l,
				m = 0, n,
				cx, cy,
				x = 0, y,
				stepX = this.options.snapStepX || this.wrapperWidth,
				stepY = this.options.snapStepY || this.wrapperHeight,
				el;

			this.pages = [];

			if ( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) {
				return;
			}

			if ( this.options.snap === true ) {
				cx = Math.round( stepX / 2 );
				cy = Math.round( stepY / 2 );

				while ( x > -this.scrollerWidth ) {
					this.pages[i] = [];
					l = 0;
					y = 0;

					while ( y > -this.scrollerHeight ) {
						this.pages[i][l] = {
							x: Math.max(x, this.maxScrollX),
							y: Math.max(y, this.maxScrollY),
							width: stepX,
							height: stepY,
							cx: x - cx,
							cy: y - cy
						};

						y -= stepY;
						l++;
					}

					x -= stepX;
					i++;
				}
			} else {
				el = this.options.snap;
				l = el.length;
				n = -1;

				for ( ; i < l; i++ ) {
					if ( i === 0 || el[i].offsetLeft <= el[i-1].offsetLeft ) {
						m = 0;
						n++;
					}

					if ( !this.pages[m] ) {
						this.pages[m] = [];
					}

					x = Math.max(-el[i].offsetLeft, this.maxScrollX);
					y = Math.max(-el[i].offsetTop, this.maxScrollY);
					cx = x - Math.round(el[i].offsetWidth / 2);
					cy = y - Math.round(el[i].offsetHeight / 2);

					this.pages[m][n] = {
						x: x,
						y: y,
						width: el[i].offsetWidth,
						height: el[i].offsetHeight,
						cx: cx,
						cy: cy
					};

					if ( x > this.maxScrollX ) {
						m++;
					}
				}
			}

			this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

			// Update snap threshold if needed
			if ( this.options.snapThreshold % 1 === 0 ) {
				this.snapThresholdX = this.options.snapThreshold;
				this.snapThresholdY = this.options.snapThreshold;
			} else {
				this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
				this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
			}
		});

		this.on('flick', function () {
			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.x - this.startX), 1000),
						Math.min(Math.abs(this.y - this.startY), 1000)
					), 300);

			this.goToPage(
				this.currentPage.pageX + this.directionX,
				this.currentPage.pageY + this.directionY,
				time
			);
		});
	},

	_nearestSnap: function (x, y) {
		if ( !this.pages.length ) {
			return { x: 0, y: 0, pageX: 0, pageY: 0 };
		}

		var i = 0,
			l = this.pages.length,
			m = 0;

		// Check if we exceeded the snap threshold
		if ( Math.abs(x - this.absStartX) < this.snapThresholdX &&
			Math.abs(y - this.absStartY) < this.snapThresholdY ) {
			return this.currentPage;
		}

		if ( x > 0 ) {
			x = 0;
		} else if ( x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( y > 0 ) {
			y = 0;
		} else if ( y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		for ( ; i < l; i++ ) {
			if ( x >= this.pages[i][0].cx ) {
				x = this.pages[i][0].x;
				break;
			}
		}

		l = this.pages[i].length;

		for ( ; m < l; m++ ) {
			if ( y >= this.pages[0][m].cy ) {
				y = this.pages[0][m].y;
				break;
			}
		}

		if ( i == this.currentPage.pageX ) {
			i += this.directionX;

			if ( i < 0 ) {
				i = 0;
			} else if ( i >= this.pages.length ) {
				i = this.pages.length - 1;
			}

			x = this.pages[i][0].x;
		}

		if ( m == this.currentPage.pageY ) {
			m += this.directionY;

			if ( m < 0 ) {
				m = 0;
			} else if ( m >= this.pages[0].length ) {
				m = this.pages[0].length - 1;
			}

			y = this.pages[0][m].y;
		}

		return {
			x: x,
			y: y,
			pageX: i,
			pageY: m
		};
	},

	goToPage: function (x, y, time, easing) {
		easing = easing || this.options.bounceEasing;

		if ( x >= this.pages.length ) {
			x = this.pages.length - 1;
		} else if ( x < 0 ) {
			x = 0;
		}

		if ( y >= this.pages[x].length ) {
			y = this.pages[x].length - 1;
		} else if ( y < 0 ) {
			y = 0;
		}

		var posX = this.pages[x][y].x,
			posY = this.pages[x][y].y;

		time = time === undefined ? this.options.snapSpeed || Math.max(
			Math.max(
				Math.min(Math.abs(posX - this.x), 1000),
				Math.min(Math.abs(posY - this.y), 1000)
			), 300) : time;

		this.currentPage = {
			x: posX,
			y: posY,
			pageX: x,
			pageY: y
		};

		this.scrollTo(posX, posY, time, easing);
	},

	next: function (time, easing) {
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x++;

		if ( x >= this.pages.length && this.hasVerticalScroll ) {
			x = 0;
			y++;
		}

		this.goToPage(x, y, time, easing);
	},

	prev: function (time, easing) {
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x--;

		if ( x < 0 && this.hasVerticalScroll ) {
			x = 0;
			y--;
		}

		this.goToPage(x, y, time, easing);
	},

	_initKeys: function (e) {
		// default key bindings
		var keys = {
			pageUp: 33,
			pageDown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		};
		var i;

		// if you give me characters I give you keycode
		if ( typeof this.options.keyBindings == 'object' ) {
			for ( i in this.options.keyBindings ) {
				if ( typeof this.options.keyBindings[i] == 'string' ) {
					this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
				}
			}
		} else {
			this.options.keyBindings = {};
		}

		for ( i in keys ) {
			this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
		}

		utils.addEvent(window, 'keydown', this);

		this.on('destroy', function () {
			utils.removeEvent(window, 'keydown', this);
		});
	},

	_key: function (e) {
		if ( !this.enabled ) {
			return;
		}

		var snap = this.options.snap,	// we are using this alot, better to cache it
			newX = snap ? this.currentPage.pageX : this.x,
			newY = snap ? this.currentPage.pageY : this.y,
			now = utils.getTime(),
			prevTime = this.keyTime || 0,
			acceleration = 0.250,
			pos;

		if ( this.options.useTransition && this.isInTransition ) {
			pos = this.getComputedPosition();

			this._translate(Math.round(pos.x), Math.round(pos.y));
			this.isInTransition = false;
		}

		this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;

		switch ( e.keyCode ) {
			case this.options.keyBindings.pageUp:
				if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
					newX += snap ? 1 : this.wrapperWidth;
				} else {
					newY += snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.pageDown:
				if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
					newX -= snap ? 1 : this.wrapperWidth;
				} else {
					newY -= snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.end:
				newX = snap ? this.pages.length-1 : this.maxScrollX;
				newY = snap ? this.pages[0].length-1 : this.maxScrollY;
				break;
			case this.options.keyBindings.home:
				newX = 0;
				newY = 0;
				break;
			case this.options.keyBindings.left:
				newX += snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.up:
				newY += snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.right:
				newX -= snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.down:
				newY -= snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			default:
				return;
		}

		if ( snap ) {
			this.goToPage(newX, newY);
			return;
		}

		if ( newX > 0 ) {
			newX = 0;
			this.keyAcceleration = 0;
		} else if ( newX < this.maxScrollX ) {
			newX = this.maxScrollX;
			this.keyAcceleration = 0;
		}

		if ( newY > 0 ) {
			newY = 0;
			this.keyAcceleration = 0;
		} else if ( newY < this.maxScrollY ) {
			newY = this.maxScrollY;
			this.keyAcceleration = 0;
		}

		this.scrollTo(newX, newY, 0);

		this.keyTime = now;
	},

	_animate: function (destX, destY, duration, easingFn) {
		var that = this,
			startX = this.x,
			startY = this.y,
			startTime = utils.getTime(),
			destTime = startTime + duration;

		function step () {
			var now = utils.getTime(),
				newX, newY,
				easing;

			if ( now >= destTime ) {
				that.isAnimating = false;
				that._translate(destX, destY);

				if ( !that.resetPosition(that.options.bounceTime) ) {
					that._execEvent('scrollEnd');
				}

				return;
			}

			now = ( now - startTime ) / duration;
			easing = easingFn(now);
			newX = ( destX - startX ) * easing + startX;
			newY = ( destY - startY ) * easing + startY;
			that._translate(newX, newY);

			if ( that.isAnimating ) {
				rAF(step);
			}
		}

		this.isAnimating = true;
		step();
	},
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
			case 'orientationchange':
			case 'resize':
				this._resize();
				break;
			case 'transitionend':
			case 'webkitTransitionEnd':
			case 'oTransitionEnd':
			case 'MSTransitionEnd':
				this._transitionEnd(e);
				break;
			case 'wheel':
			case 'DOMMouseScroll':
			case 'mousewheel':
				this._wheel(e);
				break;
			case 'keydown':
				this._key(e);
				break;
/*
 			// disable ?? Å¬?? ?Ìº?Æ® ?ÈµÇ´? ?? ?Ø°? ?Ï±????? ????.
  			case 'click':
				if ( !e._constructed ) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
	*/		
			}
	}
};
function createDefaultScrollbar (direction, interactive, type) {
	var scrollbar = document.createElement('div'),
		indicator = document.createElement('div');

	if ( type === true ) {
		scrollbar.style.cssText = 'position:absolute;z-index:9999';
		indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
	}

	indicator.className = 'iScrollIndicator';

	if ( direction == 'h' ) {
		if ( type === true ) {
			scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
			indicator.style.height = '100%';
		}
		scrollbar.className = 'iScrollHorizontalScrollbar';
	} else {
		if ( type === true ) {
			scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
			indicator.style.width = '100%';
		}
		scrollbar.className = 'iScrollVerticalScrollbar';
	}

	scrollbar.style.cssText += ';overflow:hidden';

	if ( !interactive ) {
		scrollbar.style.pointerEvents = 'none';
	}

	scrollbar.appendChild(indicator);

	return scrollbar;
}

function Indicator (scroller, options) {
	this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
	this.wrapperStyle = this.wrapper.style;
	this.indicator = this.wrapper.children[0];
	this.indicatorStyle = this.indicator.style;
	this.scroller = scroller;

	this.options = {
		listenX: true,
		listenY: true,
		interactive: false,
		resize: true,
		defaultScrollbars: false,
		shrink: false,
		fade: false,
		speedRatioX: 0,
		speedRatioY: 0
	};

	for ( var i in options ) {
		this.options[i] = options[i];
	}

	this.sizeRatioX = 1;
	this.sizeRatioY = 1;
	this.maxPosX = 0;
	this.maxPosY = 0;

	if ( this.options.interactive ) {
		if ( !this.options.disableTouch ) {
			utils.addEvent(this.indicator, 'touchstart', this);
			utils.addEvent(window, 'touchend', this);
		}
		if ( !this.options.disablePointer ) {
			utils.addEvent(this.indicator, 'MSPointerDown', this);
			utils.addEvent(window, 'MSPointerUp', this);
		}
		if ( !this.options.disableMouse ) {
			utils.addEvent(this.indicator, 'mousedown', this);
			utils.addEvent(window, 'mouseup', this);
		}
	}

	if ( this.options.fade ) {
		this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
		this.wrapperStyle[utils.style.transitionDuration] = utils.isBadAndroid ? '0.001s' : '0ms';
		this.wrapperStyle.opacity = '0';
	}
}

Indicator.prototype = {
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
		}
	},

	destroy: function () {
		if ( this.options.interactive ) {
			utils.removeEvent(this.indicator, 'touchstart', this);
			utils.removeEvent(this.indicator, 'MSPointerDown', this);
			utils.removeEvent(this.indicator, 'mousedown', this);

			utils.removeEvent(window, 'touchmove', this);
			utils.removeEvent(window, 'MSPointerMove', this);
			utils.removeEvent(window, 'mousemove', this);

			utils.removeEvent(window, 'touchend', this);
			utils.removeEvent(window, 'MSPointerUp', this);
			utils.removeEvent(window, 'mouseup', this);
		}

		if ( this.options.defaultScrollbars ) {
			this.wrapper.parentNode.removeChild(this.wrapper);
		}
	},

	_start: function (e) {
		var point = e.touches ? e.touches[0] : e;

		e.preventDefault();
		e.stopPropagation();

		this.transitionTime();

		this.initiated = true;
		this.moved = false;
		this.lastPointX	= point.pageX;
		this.lastPointY	= point.pageY;

		this.startTime	= utils.getTime();

		if ( !this.options.disableTouch ) {
			utils.addEvent(window, 'touchmove', this);
		}
		if ( !this.options.disablePointer ) {
			utils.addEvent(window, 'MSPointerMove', this);
		}
		if ( !this.options.disableMouse ) {
			utils.addEvent(window, 'mousemove', this);
		}

		this.scroller._execEvent('beforeScrollStart');
	},

	_move: function (e) {
		var point = e.touches ? e.touches[0] : e,
			deltaX, deltaY,
			newX, newY,
			timestamp = utils.getTime();

		if ( !this.moved ) {
			this.scroller._execEvent('scrollStart');
		}

		this.moved = true;

		deltaX = point.pageX - this.lastPointX;
		this.lastPointX = point.pageX;

		deltaY = point.pageY - this.lastPointY;
		this.lastPointY = point.pageY;

		newX = this.x + deltaX;
		newY = this.y + deltaY;

		this._pos(newX, newY);

// INSERT POINT: indicator._move

		e.preventDefault();
		e.stopPropagation();
	},

	_end: function (e) {
		if ( !this.initiated ) {
			return;
		}

		this.initiated = false;

		e.preventDefault();
		e.stopPropagation();

		utils.removeEvent(window, 'touchmove', this);
		utils.removeEvent(window, 'MSPointerMove', this);
		utils.removeEvent(window, 'mousemove', this);

		if ( this.scroller.options.snap ) {
			var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.scroller.x - snap.x), 1000),
						Math.min(Math.abs(this.scroller.y - snap.y), 1000)
					), 300);

			if ( this.scroller.x != snap.x || this.scroller.y != snap.y ) {
				this.scroller.directionX = 0;
				this.scroller.directionY = 0;
				this.scroller.currentPage = snap;
				this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
			}
		}

		if ( this.moved ) {
			this.scroller._execEvent('scrollEnd');
		}
	},

	transitionTime: function (time) {
		time = time || 0;
		this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.indicatorStyle[utils.style.transitionDuration] = '0.001s';
		}
	},

	transitionTimingFunction: function (easing) {
		this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
	},

	refresh: function () {
		this.transitionTime();

		if ( this.options.listenX && !this.options.listenY ) {
			this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
		} else if ( this.options.listenY && !this.options.listenX ) {
			this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
		} else {
			this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
		}

		if ( this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ) {
			utils.addClass(this.wrapper, 'iScrollBothScrollbars');
			utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

			if ( this.options.defaultScrollbars && this.options.customStyle ) {
				if ( this.options.listenX ) {
					this.wrapper.style.right = '8px';
				} else {
					this.wrapper.style.bottom = '8px';
				}
			}
		} else {
			utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
			utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

			if ( this.options.defaultScrollbars && this.options.customStyle ) {
				if ( this.options.listenX ) {
					this.wrapper.style.right = '2px';
				} else {
					this.wrapper.style.bottom = '2px';
				}
			}
		}

		var r = this.wrapper.offsetHeight;	// force refresh

		if ( this.options.listenX ) {
			this.wrapperWidth = this.wrapper.clientWidth;
			if ( this.options.resize ) {
				this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
				this.indicatorStyle.width = this.indicatorWidth + 'px';
			} else {
				this.indicatorWidth = this.indicator.clientWidth;
			}

			this.maxPosX = this.wrapperWidth - this.indicatorWidth;

			if ( this.options.shrink == 'clip' ) {
				this.minBoundaryX = -this.indicatorWidth + 8;
				this.maxBoundaryX = this.wrapperWidth - 8;
			} else {
				this.minBoundaryX = 0;
				this.maxBoundaryX = this.maxPosX;
			}

			this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));	
		}

		if ( this.options.listenY ) {
			this.wrapperHeight = this.wrapper.clientHeight;
			if ( this.options.resize ) {
				this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
				this.indicatorStyle.height = this.indicatorHeight + 'px';
			} else {
				this.indicatorHeight = this.indicator.clientHeight;
			}

			this.maxPosY = this.wrapperHeight - this.indicatorHeight;

			if ( this.options.shrink == 'clip' ) {
				this.minBoundaryY = -this.indicatorHeight + 8;
				this.maxBoundaryY = this.wrapperHeight - 8;
			} else {
				this.minBoundaryY = 0;
				this.maxBoundaryY = this.maxPosY;
			}

			this.maxPosY = this.wrapperHeight - this.indicatorHeight;
			this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
		}

		this.updatePosition();
	},

	updatePosition: function () {
		var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
			y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

		if ( !this.options.ignoreBoundaries ) {
			if ( x < this.minBoundaryX ) {
				if ( this.options.shrink == 'scale' ) {
					this.width = Math.max(this.indicatorWidth + x, 8);
					this.indicatorStyle.width = this.width + 'px';
				}
				x = this.minBoundaryX;
			} else if ( x > this.maxBoundaryX ) {
				if ( this.options.shrink == 'scale' ) {
					this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
					this.indicatorStyle.width = this.width + 'px';
					x = this.maxPosX + this.indicatorWidth - this.width;
				} else {
					x = this.maxBoundaryX;
				}
			} else if ( this.options.shrink == 'scale' && this.width != this.indicatorWidth ) {
				this.width = this.indicatorWidth;
				this.indicatorStyle.width = this.width + 'px';
			}

			if ( y < this.minBoundaryY ) {
				if ( this.options.shrink == 'scale' ) {
					this.height = Math.max(this.indicatorHeight + y * 3, 8);
					this.indicatorStyle.height = this.height + 'px';
				}
				y = this.minBoundaryY;
			} else if ( y > this.maxBoundaryY ) {
				if ( this.options.shrink == 'scale' ) {
					this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
					this.indicatorStyle.height = this.height + 'px';
					y = this.maxPosY + this.indicatorHeight - this.height;
				} else {
					y = this.maxBoundaryY;
				}
			} else if ( this.options.shrink == 'scale' && this.height != this.indicatorHeight ) {
				this.height = this.indicatorHeight;
				this.indicatorStyle.height = this.height + 'px';
			}
		}

		this.x = x;
		this.y = y;

		if ( this.scroller.options.useTransform ) {
			this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
		} else {
			this.indicatorStyle.left = x + 'px';
			this.indicatorStyle.top = y + 'px';
		}
	},

	_pos: function (x, y) {
		if ( x < 0 ) {
			x = 0;
		} else if ( x > this.maxPosX ) {
			x = this.maxPosX;
		}

		if ( y < 0 ) {
			y = 0;
		} else if ( y > this.maxPosY ) {
			y = this.maxPosY;
		}

		x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
		y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

		this.scroller.scrollTo(x, y);
	},

	fade: function (val, hold) {
		if ( hold && !this.visible ) {
			return;
		}

		clearTimeout(this.fadeTimeout);
		this.fadeTimeout = null;

		var time = val ? 250 : 500,
			delay = val ? 0 : 300;

		val = val ? '1' : '0';

		this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

		this.fadeTimeout = setTimeout((function (val) {
			this.wrapperStyle.opacity = val;
			this.visible = +val;
		}).bind(this, val), delay);
	}
};

IScroll.utils = utils;

if ( typeof module != 'undefined' && module.exports ) {
	module.exports = IScroll;
} else {
	window.IScroll = IScroll;
}

})(window, document, Math);