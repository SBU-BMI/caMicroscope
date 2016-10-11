// Dot Annotation Tool (under development)
annotools.prototype.drawDots = function() {
	
    // alert('comming soon...');

    var annotools = this;
    var pointsArr = [];
	
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
   
    // group circle elements together
    var circleGroup = viewPort.append('g');
    
    //.on(action, fn) syntax for attaching an event listener to a DOM selection
    svgHtmlDot.on('click', function() {
        var creation = Date.now();    // the number of milliseconds since midnight January 1, 1970
        var coords = d3.mouse(this);
        var xPosition = Math.round(coords[0]);
        var yPosition = Math.round(coords[1]);
        console.log(xPosition + ' ' + yPosition);
        
        var svgCircle = circleGroup.append('circle')
            .attr('cx', xPosition)
            .attr('cy', yPosition)
            .attr('r', 4)
            .style('fill', '#ffff00')
		    .style('cursor', 'pointer')
            .attr('id', 'circle_' + creation)
            .on('contextmenu', function (d, i) {
                d3.event.preventDefault();
                // react on right-clicking;
                // removeCircle('circle_' + creation);
                d3.selectAll('g #' + 'circle_' + creation).remove();
            });
        
        var svgTooltip = svgCircle.append('title')    // tooltip - circle x, y
            .text(function() {
                return xPosition + ', ' + yPosition;	  
            });
    });
	

    // panel
    var panel = jQuery('#panel').show();
        panel.html(function () {
            return "<div id='panelHeader'><h4> Dot Annotation Tool </h4></div><div id='panelBody'> <ul><li>&nbsp;</li><li>&nbsp;</li><li>&nbsp;</li><li>&nbsp;</li></ul><br /><button class='btn' id='cancelDots'>Cancel</button></div>";
        });

    jQuery('#cancelDots').click(function () {
        jQuery('#panel').hide();
        annotools.drawLayer.hide();
	    annotools.svg.hide();
        annotools.addMouseEvents();
        jQuery("#drawDotButton").removeClass("active");
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
    var x_end = end.x;
    var y_end = end.y;

    var nativeX_end = this.imagingHelper.physicalToLogicalX(x_end);
    var nativeY_end = this.imagingHelper.physicalToLogicalY(y_end);
    var nativeX = this.imagingHelper.physicalToLogicalX(x);
    var nativeY = this.imagingHelper.physicalToLogicalY(y);
    var nativeW = nativeX_end - nativeX;
    //var nativeH = nativeY_end - nativeY;
	var nativeH = nativeW;

    var globalNumber = JSON.encode({nativeW: nativeW, nativeH: nativeH, nativeX: nativeX, nativeY: nativeY});

    return globalNumber;
}

annotools.prototype.convertAllToNativeCoord = function () {

}


// this function contains bbox can I reuse it? (lien: 919)
annotools.prototype.relativeToGlobalCoord = function () {
	
    for (var i = 0; i < $('viewport').getChildren().length; i++) {
        var object = $('viewport').getChildren()[i];
        var bbox = object.getBBox();
		var objectCenterPt = new OpenSeadragon.Point(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
        console.log('bbox: ' + bbox);
        var objectCenterRelPt = this.viewer.viewport.pointFromPixel(objectCenterPt);
        this.annotationHandler.objectCenterPts[i] = objectCenterRelPt;
        var originalCoord = {};
		originalCoord.cx = objectCenterPt.x;
        originalCoord.cy = objectCenterPt.y;
        var points = String.split(object.getAttribute('points').trim(), ' ');

        var distances = [];
		for (var j = 0; j < points.length; j++) {
            var pointPair = String.split(points[j], ',');
            var point = new OpenSeadragon.Point(parseFloat(pointPair[0]), parseFloat(pointPair[1]));
        var relPt = this.viewer.viewport.pointFromPixel(point);
        var dist = relPt.minus(objectCenterRelPt);
        distances.push(dist);
      }

      this.annotationHandler.originalCoords[object.id] = {center: objectCenterRelPt,distances: distances};
    }
	
}


// @deprecated 
// testing
annotools.prototype.showDotTools = function() {
    
    // redirect
    //window.location = 'http://129.49.249.191/camicroscope_alina/testaj/test.html';
	//annotools.generateGeoTemplateTypePoint();
	var annotools = this;
    var pointsArr = [];
	var geoJSONs  = [];
	var radius    = 4;
	
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
		
        console.log(xCenterPt + ' ' + yCenterPt);
        
        var svgCircle = circleGroup.append('circle')
            .attr('cx', xCenterPt)
            .attr('cy', yCenterPt)
            .attr('r', radius)
            .style('fill', '#ffff00')
		    .style('cursor', 'pointer')
            .attr('id', 'circle_' + creation)
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
		
        var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
        var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
        var newAnnot = {
            x: startRelativeMousePosition.x,
            y: startRelativeMousePosition.y,
            w: w,
			h: h,
			type: 'circle',
			color: this.color,
            loc: []
		}
		
		console.log('New annot: ' + JSON.stringify(newAnnot, null, 4));
		console.log(annotools.convertFromNativeCoord(newAnnot, endRelativeMousePosition));
        var globalNumbers = JSON.parse(annotools.convertFromNativeCoord(newAnnot, endRelativeMousePosition));
        newAnnot.x = globalNumbers.nativeX;
        newAnnot.y = globalNumbers.nativeY;
        newAnnot.w = globalNumbers.nativeW;
        newAnnot.h = globalNumbers.nativeH;
        var loc = [];
        loc[0] = parseFloat(newAnnot.x);
        loc[1] = parseFloat(newAnnot.y);
        newAnnot.loc = loc;
		//console.log('New annot final: ' + JSON.stringify(newAnnot, null, 4));
		
		// line - 1231
		// convertFromNative = function (annot, end)
		// convert to geojson 
        var geoNewAnnot = annotools.convertCircleToGeo(newAnnot);
        //console.log('Geo new annot:' + JSON.stringify(geoNewAnnot, null, 4));
		
		geoJSONs.push(geoNewAnnot);
		//console.log("geoJSONs length: " + geoJSONs.length);
		//console.log(geoJSONs);
		
		//annotools.test();
        
        //this.promptForAnnotation(geoNewAnnot, 'new', this, ctx);
		//annotools.promptForAnnotation(geoNewAnnot, 'new', annotools, null);
		annotools.promptForAnnotations(geoJSONs, 'new', annotools, null);
		
        jQuery("svg").css("cursor", "default");
        jQuery("#drawDotButton").removeClass("active");
		
    });
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
	  for(i = 0; i < newAnnots.length; i++) 
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
				  if (count === newAnnots.length){
                      if(res == "unauthorized"){
                          alert("Error saving markup! Wrong secret");
                      } else {   
                          alert("Successfully saved markup!");
                      }
				  }
                  console.log(err)
                  //self.getMultiAnnot();
                  console.log('succesfully posted' + count + 'newAnnots length: ' + newAnnots.length);
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