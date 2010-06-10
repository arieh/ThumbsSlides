/*
---
description: A Class that provides a thumbnails carusell 

license: MIT-style

authors:
- Arieh Glazer

requires:
- core/1.2.4: [Class, Class.Extras, Element, Element.Event, Element.Style, Element.Dimensions, Selectors, Fx.Tween]

provides: [ThumbsSlides]

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
		,rtl :false
	},
	thumbsList :$empty,
	dir : 'right',
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
		
		if ($type( document.id(list))=== 'element'){
			this.list=list;
			this.generateBox();
		}
		else this.generateFromJSON(list);

		this.setDimentions();
		this.setEvents();
		this.options.parent.adopt(this.container);
		this.dir = this.options.rtl ? 'right' : 'left';
	},
	setBox : function(){		
		this.subContainer = new Element('div',{'class':'subcontainer'});
		this.leftButton = new Element('button',{'class':'leftButton'});
		this.rightButton = new Element('button',{'class':'rightButton'});
		this.container = new Element('div',{'class':'list-container'});
		$$('body')[0].adopt(this.subContainer);
		var old_margin = this.subContainer.getStyle('margin-left');
		
		this.subContainer.setStyles({
			'margin-left':-9999
		});
		
		this.rowWidth = this.subContainer.getSize().x.toInt();
		
		this.subContainer.setStyles({
			'margin-left':old_margin
		});

		this.container.adopt(this.leftButton,this.subContainer,this.rightButton).setStyle('visibility','hidden');
		this.thumbsList = new Element('ul',{'class':this.listClass}).setStyle(this.dir,0);
		this.buttonsSize = this.leftButton.getSize();
		this.containerSize = this.container.getSize();
		
		this.subContainer.adopt(this.thumbsList);
	},
	generateBox : function(){
		var $this = this,
			lis = this.list.getElements('li'),
			subContainer = this.subContainer;
		
		if (this.options.parent === $empty)
			this.options.parent = this.list.getParent();
		
		lis.each(function(li){
			var a = li.getElements('a')[0], 
				img = a.getElements('img')[0],
				targetImage = a.get('href'),
				desc = img.get('alt');
			$this.thumbsList.adopt(li.adopt(a));
		});

		this.list.destroy();
	},
	setEvents : function(){
		var $this=this,
			rightButton = this.rightButton,
			leftButton = this.leftButton,
			subContainer = this.subContrainer;
			
		this.fx = new Fx.Tween(this.thumbsList);
		this.fx.addEvent('complete',function(){$this.ongoing=false;});
		
		rightButton.addEvent('click',function(){
			$this[$this.options.rtl ? 'prev' : 'next']($this.options.movement);
		});
		
		leftButton.addEvent('click',function(){
			$this[$this.options.rtl ? 'next' : 'prev']($this.options.movement);
		});
		
		$this.container.setStyle('visibility','visible');
	},
	setDimentions : function(){
		var $this = this,
			lis = this.container.getElements(this.options.usetItemClass ? '.'+this.options.itemClass : 'li'),
			temp = false,
			clone;
		if (this.options.useItemClass){
			 clone = new Element('li',{'class':this.options.itemClass});
			 clone.setStyle('left',-9999);
			 $$('body')[0].adopt(clone);
		}else{
			clone = this.container.clone();
			clone.setStyle('left',-9999);
			$$('body')[0].adopt(clone);
			temp = clone;
			clone = clone.getElement('li');
		}
		
		$this.liMargins = clone.getStyle('margin-right').toInt()+clone.getStyle('margin-left').toInt();
		
		clone.destroy();
		if (temp) temp.destroy();
		
		this.list_width = lis.length * ($this.options.thumbSize + $this.liMargins ); 
		
		$this.thumbsList.setStyle('width',this.list_width);
		if ( this.list_width <= this.subContainer.getStyle('width').toInt() ) this[(this.options.rtl ? 'left':'right') +'Button'].addClass('disabled').set('disabled','disabled');
		
		this[(this.options.rtl ? 'right':'left') +'Button'].addClass('disabled').set('disabled','disabled');
	},
	generateFromJSON : function(json){
		var $this = this;
		json.each(function(jsn){
			var li = new Element('li', {'class': 'thumb'}),
				a  = new Element('a',{href:jsn.source,'class':$this.options.anchorClasses,title:jsn.description}),
				attrs = {src : jsn.url, alt:jsn.description},
				img;
				
				if (jsn.width) attrs.width = jsn.width;
				if (jsn.height) attrs.height = jsn.height;
				
				img = new Element('img',attrs);
			li.adopt(a.adopt(img));
			$this.thumbsList.adopt(li);
		});
	},
	next : function(thumb_number){
		if (this.ongoing){
			return;
		}
		
		var $this=this, 
			width_dif = this.list_width % $this.rowWidth + ($this.options.thumbSize + $this.liMargins),
			dir = $this.thumbsList.getStyle(this.dir).toInt(), 
			size = $this.thumbsList.getSize(),
			movement = (dir-this.rowWidth-width_dif<=-1*(size.x)) ? $this.rowWidth - width_dif : $this.rowWidth
			, prevButton = this.options.rtl ? this.rightButton : this.leftButton
			, nextButton = this.options.rtl ? this.leftButton : this.rightButton;
		
		if (thumb_number){
			movement = ((this.options.thumbSize + this.liMargins) * thumb_number);
			if (dir-movement<-1*size.x+this.rowWidth){
				movement = size.x-this.rowWidth+dir;
			}
		}
		
		if (dir>-1*(size.x-$this.rowWidth)){
			this.ongoing = true;
			this.fx.start(this.dir,dir-movement);
				
			if (prevButton.get('disabled')) prevButton.removeClass('disabled').removeAttribute('disabled');
			
			if (movement<$this.rowWidth && !(thumb_number)){
				$this.last = true;
				nextButton.set('disabled','disabled').addClass('disabled');
			}
		}
	},
	prev : function(thumb_number){
		if (this.ongoing) return;
		var $this=this, 
			width_dif = this.list_width % $this.rowWidth + ($this.options.thumbSize + $this.liMargins),
			dir = $this.thumbsList.getStyle(this.dir).toInt(), 
			size = $this.thumbsList.getSize(),
			movement = ($this.last) ? $this.rowWidth-width_dif : $this.rowWidth
			, prevButton = this.options.rtl ? this.rightButton : this.leftButton
			, nextButton = this.options.rtl ? this.leftButton : this.rightButton;
		
		if (thumb_number){
			movement = ((this.options.thumbSize + this.liMargins) * thumb_number);
			
			if (dir+movement>0){
				movement = movement-(dir+movement);
			}
		}else if(dir+movement>0){
			$this.last = true;
			movement = movement-(dir+movement);
		}

		if (dir<0){
			this.ongoing = true;
			this.fx.start(this.dir,dir+movement);
			
			if (nextButton.get('disabled')) nextButton.removeClass('disabled').removeAttribute('disabled');
			if (this.last) this.last = false;
			
			if (dir+movement==this.buttonsSize.x){
				prevButton.set('disabled','disabled').addClass('disabled');
			}
		}
	},
	toElement : function(){return this.container;}
});