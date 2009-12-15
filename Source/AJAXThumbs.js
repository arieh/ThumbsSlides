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
	Implements : [Events],
	options : {
		url : '', //url for ajax calls
		start : 0 //a start thumb number to send to the server-side script
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
				self.options.start += self.options.movement;
				if (self.done){
					self.next(self.options.movement);
					return;
				}
				self.fireEvent('fetch');
				var req = new Request.JSON({
					url : self.options.url,
					data : {start : self.options.start},
					onComplete : function(json){
						if (json.length <1 || json.length == undefined){
							self.done = true;
							self.fireEvent('done');
							self.next(self.options.movement);							
						}else self.insertNewThumbs(json);
					}
				});
				req.send();
			}
			
		
		this.fx = new Fx.Tween(this.thumbsList);
		this.fx.addEvent('complete',function(){self.ongoing=false;});
		
		this.rightButton.addEvent('click',getMoreThumbs);
		
		leftButton.addEvent('click',function(){
			self.prev(self.options.movement);
		});
		
		self.container.setStyle('visibility','visible');
	},
	insertNewThumbs : function(json){
		var self=this;
		

		this.list_width += json.length * (this.options.thumbSize + this.liMargins ); 

		this.thumbsList.setStyle('width',this.list_width);
		
		this.generateFromJSON(json);
		this.fireEvent('done');
		this.next(this.options.movement);
	}
});