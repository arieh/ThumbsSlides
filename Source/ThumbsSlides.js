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
(function(window,$,undef){
window['ThumbsSlides'] = new Class({
    Implements : [Options, Events],
    options : {
        /*
         * onComplete : $empty
         * onNextComplete : $empty
         * omPrevComplete : $empty
         */
        parent : document.body //what is the list parent (default to body)
        , movement : false       //how many tiles to move (deafult is to list visible width)
        , itemClass : 'thumb'   //what is the class of the list items 
        , useItemClass : true     //whether or not to use the itemClass to calculate list-items dimentions (false is very resource-expensive),
        , anchorClasses : '' //class name to add for the anchors
        , rtl :false // is the list in rtl mode?
        , listClass : 'thumbs-list' //the class of the thumbs list
        , itemsPerRow : 4
    }
    , thumbsList :null //thumbs list element 
    , dir : 'right' //list direction
    , list_width : 0 //total list width
    , ongoing : false //whether an effect is currently playing
    , first : true //whether the viewport is at the beggining of the list
    , last : false //whether the viewport is at the end of the list
    , rowWidth : 0 //the width of the viewport
    , fx : $empty //the sliding effect object
    , itemsPerRow : 0 //how many items are viewed per viewport
    , itemCollection : [] //a list of all the items in the list
    , current : 0 //current item counter
    , viewport : 0 //first item in the viewport
    , itemWidth : 0 //width of a single item
    
    /* 
     * Widget elemnet pointers
     */
    , subContainer : $empty
    , rightButton : $empty
    , leftButton : $empty
    , buttonsSize : $empty
    , containerSize : $empty
    /**
     * @param {Object | Element} the list to create the widget from. Can be an JSON object or an item list
     * @param {Object} a set of options for the constrcutor
     */
    , initialize : function(list,options){
        this.setOptions(options);
        this.dir = this.options.rtl ? 'right' : 'left';
        
        this.generateControlls();
        
        if ($type( document.id(list))=== 'element'){
            this.generateFromElement(list);
        }
        else this.generateFromJSON(list);

        this.setDimentions();
        this.setEvents();
        
        if (this.options.rtl) this.thumbsList.addClass('rtl');
        
        this.setCurrent(this.current);
        
        this.options.parent.adopt(this.container);
        
        this.fireEvent('complete');
    }
    /**
     * generates the basic layout and controller for the widget
     */
    , generateControlls : function(){       
        this.subContainer = new Element('div',{'class':'subcontainer'});
        this.leftButton = new Element('button',{'class':'leftButton'});
        this.rightButton = new Element('button',{'class':'rightButton'});
        this.container = new Element('div',{'class':'list-container'});
        $$('body')[0].adopt(this.subContainer);
        
        this.container.adopt(this.leftButton,this.subContainer,this.rightButton).setStyle('visibility','hidden');

        this.thumbsList = new Element('ul',{'class':this.options.listClass}).setStyle(this.dir,0);
        this.buttonsSize = this.leftButton.getSize();
        this.containerSize = this.container.getSize();
        
        this.subContainer.adopt(this.thumbsList);
    }
    /**
     * generates the thumbs-list form an element
     * @param {Element} list
     */
    , generateFromElement : function(list){
        var $this = this, lis = list.getElements('li');
        
        if (this.options.parent === $empty)
            this.options.parent = list.getParent();
        
        lis.each(function(li){
            var a = li.getElements('a')[0];
            
            $this.thumbsList.adopt(li.adopt(a));
        });

        list.destroy();
        this.itemCollection = this.thumbsList.getChildren('li');
    }
    /**
     * generates the thumbs-list from a JSON object
     * @param {Object} json
     */
    , generateFromJSON : function(json){
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
        this.itemCollection = this.thumbsList.getChildren('li');
    }
    /**
     * sets the various events related to the object
     */
    , setEvents : function(){
        var $this=this,
            rightButton = this.rightButton,
            leftButton = this.leftButton;
        
        this.fx = new Fx.Tween(this.thumbsList);
        this.fx.addEvent('complete',function(){$this.ongoing=false;});
        
        rightButton.addEvent('click',function(){
            $this[$this.options.rtl ? 'prev' : 'next']($this.options.movement || $this.itemsPerRow);
        });
        
        leftButton.addEvent('click',function(){
            $this[$this.options.rtl ? 'next' : 'prev']($this.options.movement || $this.itemsPerRow);
        });
        
        $this.container.setStyle('visibility','visible');
        
        this.thumbsList.addEvent('click',function(e){
                e = e || $(window.event);
                var target = $(e.target);
                if (target.match('img')) $this.setCurrent($this.itemCollection.indexOf(target.getParent('.thumb')));
        });
    }
    /**
     * initializes the dimensions of all widget elements
     */
    , setDimentions : function(){
        var temp = false
            , clone, styles;
        
        
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
        
        itemSize= clone.getComputedSize({styles:['padding','border','margin']});
        
        this.itemWidth = itemSize.totalWidth;
        
        this.rowWidth = this.itemWidth * this.options.itemsPerRow;
        
        clone.destroy();
        
        if (temp) temp.destroy();
        
        styles = {
            'height':itemSize.totalHeight
            ,'line-height':itemSize.totalHeight         
        }
        
        this.list_width = this.itemCollection.length * this.itemWidth; 
        
        styles['width'] = this.list_width;
        this.thumbsList.setStyles(styles);
        
        styles['width'] = this.rowWidth;
        this.subContainer.setStyles(styles);
        this.container.setStyle('width',this.rowWidth);
        
        if ( this.itemCollection.length <= this.options.itemsPerRow ){ // if total item count is smaller than viewport width
            this[(this.options.rtl ? 'left':'right') +'Button'].addClass('disabled').set('disabled','disabled');
        } 
        
        this[(this.options.rtl ? 'right':'left') +'Button'].addClass('disabled').set('disabled','disabled');
        
        this.itemsPerRow = this.options.itemsPerRow;
       
    }
    /**
     * moves the vieport farwasrd
     * @param {int} thumb_number if supplied, will set how many items wil the viewport move
     * @return this  
     */
    , next : function(thumb_number){
        if (this.ongoing){
            return this;
        }
        
        thumb_number = thumb_number || (this.options.movement || this.itemsPerRow);
        
        var $this=this
            , dir = this.thumbsList.getStyle(this.dir).toInt()
            , prevButton = this.options.rtl ? this.rightButton : this.leftButton
            , nextButton = this.options.rtl ? this.leftButton : this.rightButton
            , completeFunc = function(){                
                    $this.fireEvent('nextComplete');
                    $this.fx.removeEvent('complete',completeFunc);
            }
            , list_len = this.itemCollection.length
            , stop = list_len - this.itemsPerRow
            , movement, diff;
            
        if (this.viewport + thumb_number > stop){
            diff = stop - this.viewport;
            thumb_number = (thumb_number<diff) ? thumb_number : diff;
        }    
        
        movement = (this.itemWidth * thumb_number);
        
        if (false === this.last){
            this.viewport += thumb_number;
            this.ongoing = true;
            this.fx.addEvent('complete',completeFunc);
            this.fx.start(this.dir,dir-movement);
                
            if (prevButton.get('disabled')) prevButton.removeClass('disabled').removeAttribute('disabled');
            if (this.first) this.first = false;
            
            if (this.viewport >= stop){
                this.last = true;
                nextButton.set('disabled','disabled').addClass('disabled');
            }
        }
        return this;
    }
    /**
     * moves the vieport backwards
     * @param {int} thumb_number if supplied, will set how many items wil the viewport move
     * @return this  
     */
    , prev : function(thumb_number){
        if (this.ongoing) return this;
        
        
        thumb_number = thumb_number || (this.options.movement || this.itemsPerRow);
        
        var $this=this
            , dir = this.thumbsList.getStyle(this.dir).toInt()
            , prevButton = this.options.rtl ? this.rightButton : this.leftButton
            , nextButton = this.options.rtl ? this.leftButton : this.rightButton
            , completeFunc = function(){                
                    $this.fireEvent('prevComplete');
                    $this.fx.removeEvent('complete',completeFunc);
            }
            , movement;
            
        if (this.viewport - thumb_number < 0){
            thumb_number = this.viewport;    
        }
        
        movement = ((this.itemWidth) * thumb_number);
        
        if (false === this.first){
            this.ongoing = true;
            this.viewport -= thumb_number;
            
            this.fx.addEvent('complete',completeFunc);
            this.fx.start(this.dir,dir+movement);
            
            if (nextButton.get('disabled')) nextButton.removeClass('disabled').removeAttribute('disabled');
            if (this.last) this.last = false;
            
            if (this.viewport ==0){
                prevButton.set('disabled','disabled').addClass('disabled');
                this.first = true;
            }
        }
        return this;
    }
    /**
     * sets the current selected thumb
     * @param {int} i the location of the item in the thumbs collection
     */
    , setCurrent : function(i){
        this.itemCollection[this.current].removeClass('current');
        this.itemCollection[i].addClass('current');
        this.current = i;
    }
    /**
     * moved the current selected item to the next item
     */
    , nextItem : function(){
        if (this.current == this.itemCollection.length-1) return;
        this.setCurrent(this.current +1);
        
        if (this.current >= this.viewport + this.itemsPerRow) this.next();
    }
    /**
     * moved the previous selected item to the next item
     */
    , prevItem : function(){
        if (this.current == 0) return;
        this.setCurrent(this.current -1);
        if (this.current < this.viewport)  this.prev();
    }
    /**
     * Mootools Accessor
     * @return Element the list container
     */
    , toElement : function(){return this.container;}
});
}(this,document.id));