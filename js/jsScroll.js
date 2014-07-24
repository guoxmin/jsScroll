/*
*
*模拟触屏滚动
*
*example:
*html:
<div id="Jscroll">
    <div>content</div>
</div>
*js:
jsMove(document.getElementById("Jscroll"), {
    stopPropagation: true,
    disableScroll:true,
    toTopCallback: function(elem) {
       
    },
    toBottomCallback: function(elem) {
        
    }
})

*config:
* @param stopPropagation{Boolean}:是否阻止冒泡事件，默认为false
* @param disableScroll{Boolean}:停止任何触及此容器滚动页面，默认值flase
* @param toTopCallback{fn}:滑动到顶部时触发
* @param toBottomCallback{fn}:滑动到底部时触发
*/

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
            this._container = container;
            this._element = element = container.children[0];
            this._options = options || {};

            //已滚动距离
            this._scrollPos = 0;

            this.init();
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
                    this._touchstart(event);
                    break;
                case 'touchmove':
                    this._touchmove(event);
                    break;
                case 'touchend':
                    this._touchend(event);
                    break;
                case 'webkitTransitionEnd':
                case 'msTransitionEnd':
                case 'oTransitionEnd':
                case 'otransitionend':
                case 'transitionend':
                    break;
                case 'resize':
                    this.init.call(this);
                    break;
            }
            if (this._options.stopPropagation) event.stopPropagation();

        },
        init: function() {
            var container = this._container, 
                element = this._element;
            this._containerHeight = container.clientHeight || container.offsetHeight;
            this.slideHeight = element.clientHeight || element.offsetHeight;
            container.style.overflow = "hidden";
        },
        _touchstart: function(event) {

            var element = this._element;
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
        _touchmove: function(event) {
            //确保是一个手指滑动
            if (event.touches.length > 1 || event.scale && event.scale !== 1) return

            if (this._options.disableScroll) event.preventDefault();
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

                var container = this._container,
                    element = this._element,
                    deltaY = this.delta.y||0;

                var slide = this._scrollPos + deltaY;

                //判断滑动是否超过顶部或底部
                var isPastBounds = this.isPastBounds = slide > 0 || Math.abs(slide) > (this.slideHeight - this._containerHeight);
                
                if (!isPastBounds) {
                    container.scrollTop = Math.abs(slide);
                    this.slidePos = deltaY;
                } else {

                    //超过顶部或底部增加阻力
                    this._translate((deltaY-this.slidePos)/((Math.abs(delta.y) / 300 * 2 + 1)), 0)
                }
            }
        },
        _touchend: function(event) {
            // measure duration
            var duration = +new Date - this.startPos.time;
            var deltaY = this.delta.y;
            if (!this.isScrolling) {
                var container = this._container,
                    element = this._element,
                    containerHeight = this._containerHeight,
                    slideHeight = this.slideHeight;
               

                if (!this.isPastBounds) {
                    (this._scrollPos += deltaY);
                } else {
                    this._translate(0, 300);

                    //确定滑动方向(true:top, false:bottom)
                    var direction = deltaY < 0;

                    if (direction) {
                        this.scrollTo(this.slideHeight - this._containerHeight);
                        this._options.toBottomCallback && this._options.toBottomCallback.call(element,element);
                    } else {
                        this.scrollTo(0);
                        this._options.toTopCallback && this._options.toTopCallback.call(element,element);
                    }
                }
            }

            this.init();
            element.removeEventListener('touchmove', this, false)
            element.removeEventListener('touchend', this, false)

        },
        _translate: function(dist, speed) {
            var style = this._element && this._element.style;
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
            this._container.scrollTop = dist;
            this._scrollPos = -dist;
        }
    }
    window.jsMove = function(container, options) {
        return new JsMove(container, options);
    }
})(window);

