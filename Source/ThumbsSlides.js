/*
---
description: A Class that provides a thumbnails carusell 

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

provides: ThumbsSlides

...
*/
/*!
Copyright (c) 2009 Arieh Glazer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE 
*/
var ThumbsSlides = new Class({
	Implements : Options,
	list : $empty,
	listClass : ['thumbs-list'],
	options : {
		thumbSize : 48,         //what is the thumbnail size
		parent : document.body, //what is the list parent (default to body)
		movement : false,       //how many tiles to move (deafult is to list visible width)
		itemClass : 'thumb',    //what is the class of the list items 
		useItemClass : true,     //whether or not to use the itemClass to calculate list-items dimentions (false is very resource-expensive),
		anchorClasses : '' //class name to add for the anchors
	},
	thumbsList :$empty,
	liMargins : 4,
	list_width : 0,
	subContainer : $empty,
	rightButton : $empty,
	leftButton : $empty,
	buttonsSize : $empty,
	containerSize : $empty,
	ongoing : false,
	last : false,
	rowWidht : 0,
	moving:false,
	fx : $empty,
	initialize : function(list,options){
		this.setOptions(options);
		this.setBox();
		
		if ($type($(list))=== 'element'){
			this.list=list;
			this.generateBox();
		}
		else this.generateFromJSON(list);

		this.setDimentions();
		this.setEvents();
		this.options.parent.adopt(this.container);
	},
	setBox : function(){		
		this.subContainer = new Element('div',{'class':'subcontainer'}),
		this.leftButton = new Element('button',{'class':'leftButton','disabled':'disabled'}),
		this.rightButton = new Element('button',{'class':'rightButton'}),
		this.container = new Element('div',{'class':'list-container'});
		$$('body')[0].adopt(this.subContainer);
		var old_margin = this.subContainer.getStyle('margin-left');
		
		this.subContainer.setStyles({
			'margin-left':-9999
		})
		
		this.rowWidth = this.subContainer.getSize().x.toInt();
		this.subContainer.setStyles({
			'margin-left':old_margin
		});

		this.container.adopt(this.leftButton,this.subContainer,this.rightButton).setStyle('visibility','hidden');
		this.thumbsList = new Element('ul',{'class':this.listClass});
		this.buttonsSize = this.leftButton.getSize();
		this.containerSize = this.container.getSize();
		
		this.subContainer.adopt(this.thumbsList);
	},
	generateBox : function(){
		var self = this,
			lis = this.list.getElements('li'),
			subContainer = this.subContainer;
		
		if (this.options.parent === $empty)
			this.options.parent = this.list.getParent()
		
		lis.each(function(li){
			var a = li.getElements('a')[0], 
				img = a.getElements('img')[0],
				targetImage = a.get('href'),
				desc = img.get('alt');
			self.thumbsList.adopt(li.adopt(a));
		});

		this.list.destroy();
	},
	setEvents : function(){
		var self=this,
			rightButton = this.rightButton,
			leftButton = this.leftButton,
			subContainer = this.subContrainer;
			
		this.fx = new Fx.Tween(this.thumbsList);
		this.fx.addEvent('complete',function(){self.ongoing=false;});
		
		rightButton.addEvent('click',function(){
			self.next(self.options.movement);
		});
		
		leftButton.addEvent('click',function(){
			self.prev(self.options.movement);
		});
		
		self.container.setStyle('visibility','visible');
	},
	setDimentions : function(){
		var self = this,
			lis = this.container.getElements(this.options.usetItemClass ? '.'+this.options.itemClass : 'li'),
			temp = false,
			clone;
		if (this.options.useItemClass){
			 clone = new Element('li',{'class':this.options.itemClass})
			 clone.setStyle('left',-9999);
			 $$('body')[0].adopt(clone);
		}else{
			clone = this.container.clone();
			clone.setStyle('left',-9999);
			$$('body')[0].adopt(clone);
			temp = clone;
			clone = clone.getElement('li');
		}
		
		self.liMargins = clone.getStyle('margin-right').toInt()+clone.getStyle('margin-left').toInt();
		
		clone.destroy();
		if (temp) temp.destroy();
		
		this.list_width = lis.length * (self.options.thumbSize + self.liMargins ); 
		//width_dif = this.list_width % self.rowWidth + (self.options.thumbSize + self.liMargins) ;//if the list width dosent exactly fit the container
		
		self.thumbsList.setStyle('width',this.list_width);
	},
	generateFromJSON : function(json){
		var self = this;
		json.each(function(jsn){
			var li = new Element('li', {'class': 'thumb'}),
				a  = new Element('a',{href:jsn.source,'class':self.options.anchorClasses,title:jsn.description}),
				img = new Element('img',{
					src    : jsn.url,
					width  : jsn.width,
					height : jsn.height,
					alt    : jsn.description
				});
			li.adopt(a.adopt(img));
			self.thumbsList.adopt(li);
		});
	},
	next : function(thumb_number){
		if (this.ongoing){
			return;
		}
		
		var self=this, 
			width_dif = this.list_width % self.rowWidth + (self.options.thumbSize + self.liMargins),
			left = self.thumbsList.getStyle('left').toInt(), 
			size = self.thumbsList.getSize(),
			movement = (left-this.rowWidth-width_dif<=-1*(size.x)) ? self.rowWidth - width_dif : self.rowWidth;
		
		if (thumb_number){
			movement = ((this.options.thumbSize + this.liMargins) * thumb_number);
			if (left-movement<-1*size.x+this.rowWidth){
				movement = size.x-this.rowWidth+left;
			};
		}
		
		if (left>-1*(size.x-self.rowWidth)){
			this.ongoing = true;
			this.fx.start('left',left-movement);
				
			if (this.leftButton.get('disabled')) this.leftButton.removeClass('disabled').removeAttribute('disabled');
			if (movement<self.rowWidth && !(thumb_number)){
				self.last = true;
				this.rightButton.set('disabled','disabled');
			}
		}
	},
	prev : function(thumb_number){
		if (this.ongoing) return;
		var self=this, 
			width_dif = this.list_width % self.rowWidth + (self.options.thumbSize + self.liMargins)
			left = self.thumbsList.getStyle('left').toInt(), 
			size = self.thumbsList.getSize(),
			movement = (self.last) ? self.rowWidth-width_dif : self.rowWidth;
		
		if (thumb_number){
			movement = ((this.options.thumbSize + this.liMargins) * thumb_number);
			if (left+movement>0){
				movement = movement-(left+movement);
			};
		}

		if (left<0){
			this.ongoing = true;
			this.fx.start('left',left+movement);
			
			if (this.rightButton.get('disabled')) this.rightButton.removeClass('disabled').removeAttribute('disabled');
			if (this.last) this.last = false;
			if (left==this.buttonsSize.x){
				this.set('disabled','disabled');
			}
		}
	}
})