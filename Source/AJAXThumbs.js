/*
---
description: A Class that provides a thumbnails carusell Using AJAX 

license: MIT-style

authors:
- Arieh Glazer

requires:
- core: 1.2.4/Class
- core: 1.2.4/Class.Extras
- core: 1.2.4/Element
- core: 1.2.4/Element.Event
- core: 1.2.4/Element.Style
- core: 1.2.4/Element.Dimensions
- core: 1.2.4/Selectors
- core: 1.2.4/Fx.Tween
- core: 1.2.4/Request.JSON
- ThumbsSlides: 0.7.1/ThumbsSlides

provides: AJAXThumbs

...
*/
var AJAXThumbs = new Class({
	Extends : ThumbsSlides,
	options : {
		url : '', //url for ajax calls
		start : 0, //a start thumb number to send to the server-side script
		paramName : 'start', //a param name to use for sending start point
		requestEvents : $empty,		//a list of events to set for the request
		method : 'post' //a method to use for the request
	},
	done:false,
	initialize: function(list,options){
		var self = this;
		this.parent(list,options);
	},
	setEvents : function(){
		var self=this,
			rightButton = this.rightButton,
			leftButton = this.leftButton,
			subContainer = this.subContrainer,
			getMoreThumbs = function(){
				var params = {};
				self.options.start += self.options.movement;
				params[self.options.paramName] = self.options.start;

				if (self.done){
					self.next(self.options.movement);
					return;
				}
				
				var req = new Request.JSON({
					url : self.options.url,
					data : params,
					method : self.options.method,
					onComplete : function(json){
						if (json.length <1 || json.length == undefined){
							self.done = true;							
						}else {
							self.list_width += json.length * (self.options.thumbSize + self.liMargins ); 

							self.thumbsList.setStyle('width',self.list_width);
							
							self.generateFromJSON(json);							
						}
						self.next(self.options.movement);
					}
				});
				req.addEvents(self.options.requestEvents);
				req.send();
			}
			
		
		this.fx = new Fx.Tween(this.thumbsList);
		this.fx.addEvent('complete',function(){self.ongoing=false;});
		
		this.rightButton.addEvent('click',getMoreThumbs);
		
		leftButton.addEvent('click',function(){
			self.prev(self.options.movement);
		});
		
		self.container.setStyle('visibility','visible');
	}
});