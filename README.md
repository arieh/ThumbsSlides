ThumbsSlides
=============

This class creates a thumbnail carusel slider out of a list of images. 
![Screenshot](http://github.com/arieh/ThumbsSlides/raw/master/screenshot.png)
How to use
----------
The class is very strict about its class. To make sure you use it correctly, i sudjest you use the CSS files that come with the library.
In case you want to write up your own class, these are the must have classes:
  * thumbs-list : the thumb's UL element
  * thumbs : the thumb's LI element
  * list-container : the list container element (the one that will contain the entire widget)
  * subcontainer : the element that will parent the list itself - *This Element's width will be the carrusell's width - so set it!*
  * rightButton : the 'next' button
  * leftButton : the 'previous' button
  
The class can work in 2 different scenarios:
  * Generate the carusel from an image list
  * Generate the list from a json image li.
  
If you use the image list, it needs to be structured like this:

	ul
		li.thumb
			a
				img
				
The 'IMG' tag must have a width and a height applied.  

The JSON object should be structured like this:

	#JS
	{
		{ //a thumbnail:
			source : '', //a source for the anchor
			description : '', //a title for the anchor
			src : '', //thumbnail source
			width: 0, //thumbnail width
			height: 0, //thumbnail height
			alt: '' //an alt for the image
		}
	}

To generagte the carusell from a list call it like this:

	#JS
	var slides = new ThumbsSlides($('image-list'),{/* options */});
	
To generate from JSON use:
	
	#JS
	var slides = new ThumbsSlides({/* JSON object */},{/* options */});
	
Options
---------
  * thumbSize : the thumbnail size (default: 48)
  * parent : what element to append the list to (default to 'body')
  * movement : how many thumbs to slide with each movement (deafult is to list visible width)
  * itemClass : the class of the list item (default: 'thumb')
  * useItemClass : whether or not to use the itemClass to calculate list-items dimentions (false is very resource-expensive),
  * anchorClasses : what class to append to the anchr when generating from JSON (improtant if you want to incorparate with a smoothbox class)

Methods
---------
  * next(*int*) : move *int* tiles farward
  * prev(*int*) : move *int* tiles backwards