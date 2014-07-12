;(function() {
    var JsMove = function() {
        //检查浏览器是否支持js变换事件
        var browser = {
            addEventListener: !!window.addEventListener,
            touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
            transitions: (function(temp) {
                var props = ['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
                for (var i in props)
                    if (temp.style[props[i]] !== undefined) return true;
                return false;
            })(document.createElement('jsMove'))
        };
        var noop = function() {};

        return function(container, options) {
            if (!container) return;
            var element;
            this.container = container;
            this.element = element = container.children[0];
            this.options = options || {};
            this.toTopCallback = options.toTopCallback || noop;
            this.toBottomCallback = options.toBottomCallback || noop;

            //已滚动距离
            this.scrollPos = 0;

            this.setup();
            if (browser.addEventListener) {
                if (browser.touch) element.addEventListener('touchstart', this, false);
                if (browser.transitions) {
                    element.addEventListener('webkitTransitionEnd', this, false);
                    element.addEventListener('msTransitionEnd', this, false);
                    element.addEventListener('oTransitionEnd', this, false);
                    element.addEventListener('otransitionend', this, false);
                    element.addEventListener('transitionend', this, false);
                }
                window.addEventListener('resize', this, false);
            }

            return this;
        }
    }(window);

    JsMove.prototype = {
        handleEvent: function(event) {
            switch (event.type) {
                case 'touchstart':
                    this.touchstart(event);
                    break;
                case 'touchmove':
                    this.touchmove(event);
                    break;
                case 'touchend':
                    this.touchend(event);
                    break;
                case 'webkitTransitionEnd':
                case 'msTransitionEnd':
                case 'oTransitionEnd':
                case 'otransitionend':
                case 'transitionend':
                    break;
                case 'resize':
                    this.setup.call(this);
                    break;
            }
            if (this.options.stopPropagation) event.stopPropagation();

        },
        setup: function() {
        	var container = this.container, 
        		element = this.element;
        	this.containerHeight = container.clientHeight || container.offsetHeight;
            this.slideHeight = element.clientHeight || element.offsetHeight;
            container.style.overflow = "hidden";
        },
        touchstart: function(event) {

            var element = this.element;
            var touches = event.touches[0];

            this.startPos = {
                // 获取初始touches坐标
                x: touches.pageX,
                y: touches.pageY,

                 // store time to determine touch duration
                time: +new Date

            };

            // used for testing first move event
            this.isScrolling = undefined;

            //超出顶部或者尾部后的滑动距离
            this.slidePos = 0;

            element.addEventListener('touchmove', this, false);
            element.addEventListener('touchend', this, false);

        },
        touchmove: function(event) {
            //确保是一个手指滑动
            if (event.touches.length > 1 || event.scale && event.scale !== 1) return

            if (this.options.disableScroll) event.preventDefault();
            var touches = event.touches[0];

            //计算X轴和Y轴的滑动距离
            var delta = this.delta = {
                x: touches.pageX - this.startPos.x,
                y: touches.pageY - this.startPos.y
            }

            //Y轴距离小于X轴距离则不滑动（如果用户没有试图垂直滚动）
            var isScrolling = this.isScrolling;
            if (typeof isScrolling == 'undefined') {
                isScrolling = !!(isScrolling || Math.abs(delta.y) < Math.abs(delta.x));
            }
            if (!isScrolling) {
                //禁止页面滚动
                event.preventDefault();

                var container = this.container,
                    element = this.element,
                    deltaY = this.delta.y||0;

                var slide = this.scrollPos + deltaY;

                //判断滑动是否超过顶部或底部
                var isPastBounds = this.isPastBounds = slide > 0 || Math.abs(slide) > (this.slideHeight - this.containerHeight);
                
                if (!isPastBounds) {
                    container.scrollTop = Math.abs(slide);
                    this.slidePos = deltaY;
                } else {

                    //超过顶部或底部增加阻力
                    this.translate((deltaY-this.slidePos)/((Math.abs(delta.y) / 300 * 2 + 1)), 0)
                }
            }
        },
        touchend: function(event) {
            // measure duration
            var duration = +new Date - this.startPos.time;
            var deltaY = this.delta.y;
            if (!this.isScrolling) {
                var container = this.container,
                	element = this.element,
                    containerHeight = this.containerHeight,
                    slideHeight = this.slideHeight;
               

                if (!this.isPastBounds) {
                    (this.scrollPos += deltaY);
                } else {
                    this.translate(0, 300);

                    //确定滑动方向(true:top, false:bottom)
                    var direction = deltaY < 0;

                    if (direction) {
                        this.scrollTo(this.slideHeight - this.containerHeight);
                        this.toBottomCallback && this.toBottomCallback.call(element,element);
                    } else {
                        this.scrollTo(0);
                        this.toTopCallback && this.toTopCallback.call(element,element);
                    }
                }
            }

            this.setup();
            element.removeEventListener('touchmove', this, false)
            element.removeEventListener('touchend', this, false)

        },
        translate: function(dist, speed) {
            var style = this.element && this.element.style;
            if (!style) return;
            style.webkitTransitionDuration =
                style.MozTransitionDuration =
                style.msTransitionDuration =
                style.OTransitionDuration =
                style.transitionDuration = speed + 'ms';

            style.webkitTransform = 'translate(0,' + dist + 'px)' + 'translateZ(0)';
            style.msTransform =
                style.MozTransform =
                style.OTransform = 'translateY(' + dist + 'px)';

        },
        scrollTo:function(dist){
            this.container.scrollTop = dist;
            this.scrollPos = -dist;
        }
    }
    window.jsMove = function(container, options) {
        return new JsMove(container, options);
    }
})(window);
