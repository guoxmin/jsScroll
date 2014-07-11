(function(){var a=function(){var b={addEventListener:!!window.addEventListener,touch:("ontouchstart" in window)||window.DocumentTouch&&document instanceof DocumentTouch,transitions:(function(d){var f=["transformProperty","WebkitTransform","MozTransform","OTransform","msTransform"];for(var e in f){if(d.style[f[e]]!==undefined){return true;}}return false;})(document.createElement("jsMove"))};var c=function(){};return function(d,e){if(!d){return;}var f;this.container=d;this.element=f=d.children[0];this.options=e||{};this.toTopCallback=e.toTopCallback||c;this.toBottomCallback=e.toBottomCallback||c;this.scrollPos=0;this.setup();if(b.addEventListener){if(b.touch){f.addEventListener("touchstart",this,false);}if(b.transitions){f.addEventListener("webkitTransitionEnd",this,false);f.addEventListener("msTransitionEnd",this,false);f.addEventListener("oTransitionEnd",this,false);f.addEventListener("otransitionend",this,false);f.addEventListener("transitionend",this,false);}window.addEventListener("resize",this,false);}return this;};}(window);a.prototype={handleEvent:function(b){switch(b.type){case"touchstart":this.touchstart(b);break;case"touchmove":this.touchmove(b);break;case"touchend":this.touchend(b);break;case"webkitTransitionEnd":case"msTransitionEnd":case"oTransitionEnd":case"otransitionend":case"transitionend":break;case"resize":this.setup.call(this);break;}if(this.options.stopPropagation){b.stopPropagation();}},setup:function(){var b=this.container,c=this.element;this.containerHeight=b.clientHeight||b.offsetHeight;this.slideHeight=c.clientHeight||c.offsetHeight;b.style.overflow="hidden";},touchstart:function(c){var b=this.element;var d=c.touches[0];this.startPos={x:d.pageX,y:d.pageY};this.isScrolling=undefined;this.slidePos=0;b.addEventListener("touchmove",this,false);b.addEventListener("touchend",this,false);},touchmove:function(b){if(b.touches.length>1||b.scale&&b.scale!==1){return;}if(this.options.disableScroll){b.preventDefault();}var h=b.touches[0];var j=this.delta={x:h.pageX-this.startPos.x,y:h.pageY-this.startPos.y};var e=this.isScrolling;if(typeof e=="undefined"){e=!!(e||Math.abs(j.y)<Math.abs(j.x));}if(!e){b.preventDefault();var c=this.container,g=this.element,f=this.delta.y||0;var i=this.scrollPos+f;var d=this.isPastBounds=i>0||Math.abs(i)>(this.slideHeight-this.containerHeight);if(!d){c.scrollTop=Math.abs(i);this.slidePos=f;}else{this.translate((f-this.slidePos)/((Math.abs(j.y)/300*2+1)),0);}}},touchend:function(e){if(!this.isScrolling){var c=this.container,d=this.element,g=this.containerHeight,f=this.slideHeight;var b=this.delta.y;if(!this.isPastBounds){(this.scrollPos+=b);}else{this.translate(0,300);var h=b<0;if(h){this.scrollTo(this.slideHeight-this.containerHeight);this.toBottomCallback&&this.toBottomCallback.call(d,d);}else{this.scrollTo(0);this.toTopCallback&&this.toTopCallback.call(d,d);}}}this.setup();d.removeEventListener("touchmove",this,false);d.removeEventListener("touchend",this,false);},translate:function(d,c){var b=this.element&&this.element.style;if(!b){return;}b.webkitTransitionDuration=b.MozTransitionDuration=b.msTransitionDuration=b.OTransitionDuration=b.transitionDuration=c+"ms";b.webkitTransform="translate(0,"+d+"px)translateZ(0)";b.msTransform=b.MozTransform=b.OTransform="translateY("+d+"px)";},scrollTo:function(b){this.container.scrollTop=b;this.scrollPos=-b;}};window.jsMove=function(b,c){return new a(b,c);};})(window);