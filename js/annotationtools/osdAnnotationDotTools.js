// Dot Annotation Tool (under development)
annotools.prototype.drawDots = function() {
	
    var annotools = this;
    var pointsArr = [];
    var geoJSONs  = [];
    var radius    = 4;
	var fillColor = '#ffff00';
    var fillColorOne = '#ffff00';  // yellow (Lymphocyte)
    var fillColorTwo = '#ff2626';  // red (Non Lymphocyte)
    //var hoverColor = '#ff2626';
    var backgroundColor = '#DAC99A';
    var hoverRadius = 10;
	
    var container = document.getElementsByClassName(this.canvas)[0]; // get the Canvas Container
    // console.log(container);
	
    var left = parseInt(container.offsetLeft),
        top = parseInt(container.offsetTop),
        width = parseInt(container.offsetWidth),
        height = parseInt(container.offsetHeight);
    console.log("left: " + left + " top: " + top + " width: " + width + " height: " + height);
    if ( left < 0 ) {
        left = 0;
        width = window.innerWidth;
    } // see if the container is outside the current viewport
    if ( top < 0 ) {
        top = 0;
        height = window.innerHeight;
    }
	
    this.drawLayer.hide();
    this.magnifyGlass.hide();  // hide the Magnifying Tool
        
        
    var markup_svg = document.getElementById('markups');
    if (markup_svg) {
        // console.log("destroying")
        markup_svg.destroy();
    }
	
    if (this.svg) {
        this.svg.html = '';
        this.svg.destroy();
    }
	
    /* svgHtml */
    var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" version="1.1" id="markups" style="border: 2px solid #ffff00">';
        svgHtml += '<g id="groupcenter"/>';
        svgHtml += '<g id="origin">';
    var origin = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5, .5));
        svgHtml += '<ellipse id="originpt" cx="' + origin.x + '" cy="' + origin.y + '" rx="' + 4 + '" ry="' + 4 + '" style="display: none"/>';
        svgHtml += '</g>';
        svgHtml += '<g id="viewport" transform="translate(0,0)">';
        svgHtml += '</g>';

    this.svg = new Element('div', {
        styles: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%'
        },
        html: svgHtml
    }).inject(container);
	
    // prevent zoom when the SVG overlay is clicked
    jQuery('#markups').mousedown(function (event) {
        //console.log(event.which);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    });
    
    // d3.js
    var svgHtmlDot = d3.select('svg');
    var viewPort =  d3.select('#viewport');
	
	// add buttons to svg start
    /*
    var w = 95;
    var h = 35;
    
    var bWidth = 40; //button width
    var bHeight = 25; //button height
    var bSpace = 5; //space between buttons
    var x0 = (width / 2) - (w / 2); //x offset
    var y0 = 55; //y offset
    var x1 = x0 + 45;
	
    //backdrop of colors
    var background= svgHtmlDot.append("rect")
        .attr('id', 'backgroundRect')
        .attr('width', w)
        .attr('height', h)
        .attr('x', (width / 2) - (w / 2) - 5)
        .attr('y', 50)
        .attr('fill', backgroundColor).style('opacity', .6);
    
    var allButtons= svgHtmlDot.append('g').attr('id','allButtons');

	d3.selectAll('rect').each(function(){
        //when an item is clicked, svgClickEvents must not be fired   
        d3.select('#backgroundRect').on('click', null);  //this should remove the event listener

        d3.select(this).on('click', function() {
            d3.event.stopPropagation(); 
            console.log('click rect 1');
        });
    });
	
    //container for all buttons
    var allButtons= svgHtmlDot.append('g').attr('id', 'allButtons');
    
    var buttonOne = allButtons.append('rect')
        .attr('class', 'buttonRect')
        .attr('width', bWidth)
        .attr('height', bHeight)
        .attr('x', x0)
        .attr('y', y0)
        .attr('rx', 5) //rx and ry give the buttons rounded corners
        .attr('ry', 5)
        .attr('fill', fillColorOne)
        .attr('id', 'buttonOne')
        .attr('class','button')
        .attr('title', 'Lymphocyte')
        .style('cursor','pointer')
        .on('contextmenu', function (d, i) {
            d3.event.preventDefault();
            // react on right-clicking;
            fillColor = fillColorOne;
        });
    
     d3.selectAll('rect').each(function() {
        
        d3.select('#buttonOne').on('click', null);  //this should remove the event listener
       
        d3.select(this).on('click', function() {
            d3.event.stopPropagation(); 
            console.log('click rect 2');
        });
    });
    
            
    var buttonTwo = allButtons.append('rect')
        .attr('class', 'buttonRect')
        .attr('width', bWidth)
        .attr('height', bHeight)
        .attr('x', x1)
        .attr('y', y0)
        .attr('rx', 5) //rx and ry give the buttons rounded corners
        .attr('ry', 5)
        .attr('fill', fillColorTwo)
        .attr('id', 'buttonTwo')
        .attr('class', 'button')
        .attr('title', 'Non Lymphocyte')
        .style('cursor','pointer')
            .on('contextmenu', function (d, i) {
            d3.event.preventDefault();
            // react on right-clicking;
            fillColor = fillColorTwo;
        });
    
    d3.selectAll('rect').each(function() {
        
        d3.select('#buttonTwo').on('click', null);  //this should remove the event listener

        d3.select(this).on('click', function() {
            d3.event.stopPropagation(); 
            console.log('click rect');
        });
    });
    */
    // end buttons
	
    // group circle elements together
    var circleGroup = viewPort.append('g');
    
    //.on(action, fn) syntax for attaching an event listener to a DOM selection
    svgHtmlDot.on('click', function() {
        var creation = Date.now();    // the number of milliseconds since midnight January 1, 1970
        var pointCoords = d3.mouse(this);
        //var xCenterPt = Math.round(pointCoords[0]);
        //var yCenterPt = Math.round(pointCoords[1]);
		var xCenterPt = pointCoords[0];
        var yCenterPt = pointCoords[1];
		
        //console.log(xCenterPt + ' ' + yCenterPt);
        
        var svgCircle = circleGroup.append('circle')
            .attr('cx', xCenterPt)
            .attr('cy', yCenterPt)
            .attr('r', radius)
            .style('fill', fillColor)
		    .style('cursor', 'pointer')
            .attr('id', 'circle_' + creation)
		    .on("mouseover", function(d) {
  	            d3.select(this).attr('r', hoverRadius).style('opacity', .5);
	        })
            .on("mouseout", function(d) {
				d3.selectAll('circle').style('opacity', 1);
  	            d3.select(this).attr('r', radius).style('fill', fillColor);
	        })
            .on('contextmenu', function (d, i) {
                d3.event.preventDefault();
                // react on right-clicking;
                // removeCircle('circle_' + creation);
                d3.selectAll('g #' + 'circle_' + creation).remove();
            });
        
        var svgTooltip = svgCircle.append('title')    // tooltip - circle x, y
            .text(function() {
                return xCenterPt + ', ' + yCenterPt;	  
            });
		
		/*
		geoJSONs.length = 0;  //empty the geoJSONs array
		
		d3.selectAll("circle").each( function(d, i){
		
            xCenterPt = d3.select(this).attr("cx");
		    yCenterPt = d3.select(this).attr("cy");
		*/
	        // coord start
	        var min_x, min_y, max_x, max_y, w, h;
	        min_x = xCenterPt - radius;
            min_y = yCenterPt - radius;
            max_x = xCenterPt + radius;
            max_y = yCenterPt + radius;
            w = Math.abs(max_x - min_x);
            h = Math.abs(max_y - min_y);
	        console.log('min: ' + min_x + ', ' + min_y);
	        console.log('max: ' + max_x + ', ' + max_y);
	        console.log('w and h: ' + w + ', ' + h);
		    console.log('xCenterPt and yCenterPt: ' + xCenterPt + ' ' + yCenterPt);
		
            var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
            var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
		    var centerPtRelativeMousePosition = new OpenSeadragon.Point(xCenterPt, yCenterPt).minus(OpenSeadragon.getElementOffset(viewer.canvas));
            var newAnnot = {
                x: startRelativeMousePosition.x,
                y: startRelativeMousePosition.y,
                w: w,
	            h: h,
			    cx: centerPtRelativeMousePosition.x,
			    cy: centerPtRelativeMousePosition.y,
	            type: 'circle',
	            color: this.color,
                loc: []
	        }
		
	        console.log('New annot: ' + JSON.stringify(newAnnot, null, 4));
	        //console.log(annotools.convertFromNativeCoord(newAnnot, endRelativeMousePosition));
		
            var globalNumbers = JSON.parse(annotools.convertFromNativeCoord(newAnnot, endRelativeMousePosition));
            newAnnot.x = globalNumbers.nativeX;
            newAnnot.y = globalNumbers.nativeY;
            newAnnot.w = globalNumbers.nativeW;
            newAnnot.h = globalNumbers.nativeH;
		    newAnnot.cx = globalNumbers.nativeCx;
		    newAnnot.cy = globalNumbers.nativeCy;
            var loc = [];
            loc[0] = parseFloat(newAnnot.cx);
            loc[1] = parseFloat(newAnnot.cy);
            newAnnot.loc = loc;
	        console.log('New annot final: ' + JSON.stringify(newAnnot, null, 4));
		
	        // line - 1231
	        // convertFromNative = function (annot, end)
	        // convert to geojson 
            var geoNewAnnot = annotools.convertCircleToGeo(newAnnot);
            //console.log('Geo new annot:' + JSON.stringify(geoNewAnnot, null, 4));
		
	        geoJSONs.push(geoNewAnnot);
	        //console.log("geoJSONs length: " + geoJSONs.length);
	        //console.log(geoJSONs);
		
            //this.promptForAnnotation(geoNewAnnot, 'new', this, ctx);
	        //annotools.promptForAnnotation(geoNewAnnot, 'new', annotools, null);
		
		// }); // end for each
		
	    annotools.promptForAnnotations(geoJSONs, 'new', annotools, null);
		
        //jQuery("svg").css("cursor", "default");
        //jQuery("#drawDotButton").removeClass("active");
		
    });
		
}
	
// this.imagingHelper.logicalToPhysicalY(nativepoints[k][1])
annotools.prototype.convertToNativeCoord = function (annot) {
}

//function convertFromNative (line)
annotools.prototype.convertFromNativeCoord = function (annot, end) {
    
    var x = annot.x;
    var y = annot.y;
    var w = annot.w;
    var h = annot.h;
	var cx = annot.cx;
	var cy = annot.cy;
    var x_end = end.x;
    var y_end = end.y;

    var nativeX_end = this.imagingHelper.physicalToLogicalX(x_end);
    var nativeY_end = this.imagingHelper.physicalToLogicalY(y_end);
    var nativeX = this.imagingHelper.physicalToLogicalX(x);
    var nativeY = this.imagingHelper.physicalToLogicalY(y);
    var nativeW = nativeX_end - nativeX;
    //var nativeH = nativeY_end - nativeY;
    var nativeH = nativeW;
	var nativeCx = this.imagingHelper.physicalToLogicalX(cx);
	var nativeCy = this.imagingHelper.physicalToLogicalY(cy);

    var globalNumber = JSON.encode({nativeW: nativeW, nativeH: nativeH, nativeX: nativeX, nativeY: nativeY, nativeCx: nativeCx, nativeCy: nativeCy});

    return globalNumber;
}

// test getMultiPointAnnot()
annotools.prototype.showDotTools = function() {

    var annotools = this;
	
    annotools.getMultiPointAnnot();
   
    console.log('Test getMultiPointAnnot');
  
}

annotools.prototype.promptForAnnotations = function (newAnnots, mode, annotools, ctx) {
    jQuery('#panel').show('slide')
    //console.log(newAnnots);
    jQuery('panel').html('');
    jQuery('#panel').html('' +
    "<div id = 'panelHeader'> <h4>Enter a new annotation </h4></div>"
    + "<div id='panelBody'>"
    + "<form id ='annotationsForm' action='#'>"
    + '</form>'

    + '</div>'
    )
    jQuery.get('api/Data/retrieveTemplate.php', function (data) {
    console.log(data);
    var schema = JSON.parse(data)
    schema = JSON.parse(schema)[0]
    console.log(schema)
    // console.log("retrieved template")
    var formSchema = {
        'schema': schema,
        'form': [
        '*',
        {
          'type': 'submit',
          'title': 'Submit'

        },
        {
          'type': 'button',
          'title': 'Cancel',
          'onClick': function (e) {
            console.log(e)
            e.preventDefault()
            // console.log("cancel")
            cancelAnnotation()
          }
        }
      ]
    }

    formSchema.onSubmit = function (err, val) {
        // Add form data to annotation
        var count = 1;
	    for( var i = 0; i < newAnnots.length; i++ ) 
	    { //for loop start
	        var annotation = newAnnots[i];
            annotation.properties.annotations = val

            // Post annotation
            // annotools.addnewAnnot(annotation)
	        // POST start
	        var self = this;
            console.log('Save annotation function')
            console.log(annotation)
            jQuery.ajax({
                'type': 'POST',
                url: 'api/Data/getAnnotSpatial.php',
                data: annotation,
                success: function (res, err) {
                    console.log("response: ")
                    console.log(res)
		            if ( count === newAnnots.length ){
                        if(res == "unauthorized"){
                            alert("Error saving markup! Wrong secret");
                    } else {   
                            alert("Successfully saved markup!");
                    }
		         }
                 console.log(err)
                 //self.getMultiAnnot();
                 console.log('succesfully posted ' + count + 'newAnnots length: ' + newAnnots.length);
		         count ++;
              }
          })
		  
	  // POST end
		  
	  /*
	  jQuery('#panel').hide('slide')
          annotools.drawLayer.hide()
          annotools.svg.hide()
          annotools.addMouseEvents()
          return false
	  */
       }
      // Hide Panel
      jQuery('#panel').hide('slide')
      annotools.drawLayer.hide()
      annotools.svg.hide()
      annotools.addMouseEvents()

      return false
    }

    var cancelAnnotation = function () {
      console.log('cancel handler')
      jQuery('#panel').hide('slide')
      annotools.drawLayer.hide()
      annotools.svg.hide()
      annotools.addMouseEvents()
    }

    jQuery('#annotationsForm').jsonForm(formSchema)
  })
}

// under development
annotools.prototype.getMultiPointAnnot = function (viewer) {

    var algorithms = ['humantest'];

	//console.log(algorithms);
    var self = this;
	this.x1 = this.imagingHelper._viewportOrigin['x'];
	this.y1 = this.imagingHelper._viewportOrigin['y'];
	this.x2 = this.x1 + this.imagingHelper._viewportWidth;
    this.y2 = this.y1 + this.imagingHelper._viewportHeight;

	boundX1 = this.imagingHelper.physicalToLogicalX(200);
    boundY1 = this.imagingHelper.physicalToLogicalY(20);
    boundX2 = this.imagingHelper.physicalToLogicalX(20);
    boundY2 = this.imagingHelper.physicalToLogicalY(20);
	
	var boundX = boundX1 - this.x1;
	var boundY = boundX;

    var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(9), this.imagingHelper.physicalToDataY(9));
    var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(0), this.imagingHelper.physicalToDataY(0));
    var area = (max.x - origin.x) * (max.y - origin.y);

	if (algorithms.length) {
    
        this.annotations = this.AnnotationStore.fetchAnnotations(this.x1, this.y1, this.x2, this.y2, area, algorithms, function (data) {
            console.log(data);
            self.annotations = data;
			//self.displayGeoAnnots();
			//self.setupHandlers();
		})
	} else {
        self.setupHandlers();
        //self.destroyMarkups()
		// destroy canvas
	}
}