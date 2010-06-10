ThumbsSlides
=============

This Library supplies 2 Class:

  * ThumbsSlides : creates a thumbnail carousel slider out of a list of images. 
  * AJAXSlides : create the carousel using AJAX - currently not working properly
 
*NOTE* the demo page can't show the AJAX because of the static nature og GH-Pages. but you can see it using the downloadable demo

![Screenshot](http://img130.imageshack.us/img130/2718/screenshottw.png)
How to use
----------
The class is very strict about its class. To make sure you use it correctly, i sudjest you use the CSS files that come with the library.
In case you want to write up your own class, these are the must have classes:

  * 'thumbs-list' : the thumb's UL element
  * 'thumbs' : the thumb's LI element
  * 'list-container' : the list container element (the one that will contain the entire widget)
  * 'subcontainer' : the element that will parent the list itself - *This Element's width will be the carrusell's width - so set it!*
  * 'rightButton' : the 'next' button
  * 'leftButton' : the 'previous' button
  
The class can work in 2 different scenarios:

  * Generate the carusel from an image list
  * Generate the list from a json image li.
  
If you use the image list, it needs to be structured like this:

*HTML* 
	
	#HTML
	<ul>
		<li class='thumb'>
			<a href='#'>
				<img src='some-image.png' height:'10px' width:'10px' /></a>
		</li>
	</ul>
	
_The 'IMG' tag must have a width and a height applied._  

The JSON object should be an Array and structured like this:

	#JS
	{
		{ //a thumbnail:
			source : '', //a source for the anchor
			description : '', //a title for the anchor
			src : '', //thumbnail source
			width: 0, //thumbnail width - optional
			height: 0, //thumbnail height - optional
			alt: '' //an alt for the image
		}
	}

To generagte the carousel from a list call it like this:

	#JS
	var slides = new ThumbsSlides($('image-list'),{/* options */});
	
To generate from JSON use:
	
	#JS
	var slides = new ThumbsSlides({/* JSON object */},{/* options */});

There is also now an option to use an AJAX loader for this class like this:

    #JS
	var slides = new AJAXThumbs({/* JSON object */},{
		thumbSize:64,
		useItemClass:true,
		movement : 7,
		url:'get_thumbs.php',
		start:14, //how many thumbs are already loaded
		loadNumber : 7,
		requestEvents : {
			'request' : function(){console.log('started fetching');},
			'success' : function(){console.log('images fetched');}
		}
	});

The class will stop loading when recieving an empty object/array from the response. 	

Methods
---------
  * next(*int*) : move *int* tiles farward
  * prev(*int*) : move *int* tiles backwards

Options 
---------
*_ThumbsSlides_*:

  * thumbSize : the thumbnail size (default: 48)
  * parent : what element to append the list to (default to 'body')
  * movement : how many thumbs to slide with each movement (deafult is to list visible width)
  * itemClass : the class of the list item (default: 'thumb')
  * useItemClass : whether or not to use the itemClass to calculate list-items dimentions (false is very resource-expensive),
  * anchorClasses : what class to append to the anchr when generating from JSON (improtant if you want to incorparate with a lightbox class)
  * retl : whether to use a right-to-left version or not (defualt to false).

*_AJAXThumbs_* cuurently not working properly :-(:
 
  * url : a url for the request - Required
  * loadNumber : how many thumbs to lad on each request - Required
  * paramName : a paramater name to send with the request containing the current loaded thumbs number (default : 'start')
  * start : how many thumbs to skip on the first request (will be added to loadNumber on first call. default: 0)
  * mehod : method for the request. (default:'post')
  * requestEvents : events to send to the request
