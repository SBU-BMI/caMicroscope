annotools.prototype.drawDots = function() {
	
    var self = this;
    var geoJSONs  = [];
    var circleRemoveIds = [];
    
    var circleParameters = {
        radius: 3,
        fillColorDefault: '#ff2626',
        opacityDefault: 1,
        opacityHover: .5,
        text: ''
    }
    
    var radiusHover = circleParameters.radius * 3;
    
    var regionInfo = {
        fillColorLymphocyte: 'lime',
        fillColorNonLymphocyte: '#ffff00',
        regionLymphocyte: 'Lymphocyte',
        regionNonLymphocyte: 'Non Lymphocyte'
    };
    
    var msgDeleteDot = '\nRight click to delete';
    
    var markup_svg = document.getElementById('markups');
    
    if (!markup_svg)
    {
        //console.log('not markup_svg');
        var container = document.getElementsByClassName(this.canvas)[0]; // get the Canvas Container
        // console.log(container);
    
        var width = parseInt(container.offsetWidth);
        var height = parseInt(container.offsetHeight);
    
        this.drawLayer.hide();
        this.magnifyGlass.hide();  // hide the Magnifying Tool
        
        if (markup_svg) {
        // console.log("destroying")
            markup_svg.destroy();
        }

        if (this.svg) {
            this.svg.html = '';
            this.svg.destroy();
        }
    
        /* svgHtml */
        var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" version="1.1" id="markups" style="border: 0px solid #ffff00">';
        svgHtml += '<g id="groupcenter"/>';
        svgHtml += '<g id="origin">';
        var origin = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5, .5));
        svgHtml += '<ellipse id="originpt" cx="' + origin.x + '" cy="' + origin.y + '" rx="' + 4 + '" ry="' + 4 + '" style="display: none"/>';
        svgHtml += '</g>';
        svgHtml += '<g id="viewport" transform="translate(0,0)">';
        //svgHtml += '</g>';

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
    }
	
    // prevent zoom when the SVG overlay is clicked
    jQuery('#markups').mousedown(function (event) {
        //console.log(event.which);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    });
    
    d3.selectAll('.annotationsvg').attr('r', circleParameters.radius).style('opacity', circleParameters.opacityHover).style('cursor', 'crosshair');
	
    d3.selectAll('.annotationsvg').on('mouseover', function() {	
        d3.selectAll(".annotationsvg").attr('r', circleParameters.radius).style('opacity', circleParameters.opacityHover).style('cursor', 'crosshair');
    });
    
    // show panel
    self.promptForAnnotations(geoJSONs, 'new', self, regionInfo);
    
    // d3.js
    var svgHtmlDot = d3.select('svg');
    var viewPort =  d3.select('#viewport');
	
    // group circle elements together
    var circleGroup = viewPort.append('g');
	
    //.on(action, fn) syntax for attaching an event listener to a DOM selection
    svgHtmlDot.on('click', function() {
        var creation = Date.now();    // the number of milliseconds since midnight January 1, 1970
        var pointCoords = d3.mouse(this);
        var xCenterPt = pointCoords[0];
        var yCenterPt = pointCoords[1];
        //console.log('xCenterPt, yCenterPt: ' + xCenterPt + ' ' + yCenterPt);
        var svgCircle = circleGroup.append('circle')
            .attr('cx', xCenterPt)
            .attr('cy', yCenterPt)
            .attr('r', circleParameters.radius)
            .style('fill', function(d) {
                    var region;
                    var radios = document.getElementsByTagName('input');
                
                    for (var i = 0; i < radios.length; i++) {
                        if (radios[i].type === 'radio' && radios[i].checked) {
                            // get value, set checked flag 
                            region = radios[i].value;
                            if (region === regionInfo.regionLymphocyte) {
                                fillColor = regionInfo.fillColorLymphocyte;
                                circleParameters.text = regionInfo.regionLymphocyte;
                            }
                            else {
                                fillColor = regionInfo.fillColorNonLymphocyte;
                                circleParameters.text = regionInfo.regionNonLymphocyte;
                            }       
                        }
                    }
                    d3.select(this).attr('fill', fillColor); 
                    d3.select(this).append('title').text(circleParameters.text + msgDeleteDot);
            })
            .style('cursor', 'pointer')
            .attr('id', 'circle_' + creation)
            .attr('class', 'dot')
            .on('mouseover', function(d) {
                d3.select(this).attr('r', radiusHover).style('opacity', circleParameters.opacityHover);
            })
            .on('mouseout', function(d) {
                d3.selectAll('.dot').style('opacity', circleParameters.opacityDefault);
                d3.select(this).attr('r', circleParameters.radius);
            })
            .on('contextmenu', function (d, i) {
                d3.event.preventDefault();
                // react on right-clicking;
                // removeCircle('circle_' + creation);
                var tmpId = 'circle_' + creation;
                //console.log('g #' + 'circle_' + creation);
                circleRemoveIds.push(tmpId);
                //console.log('circleRemoveIds in: ' + circleRemoveIds);
                d3.selectAll('g #' + 'circle_' + creation).remove();
                for (var k = 0; k < geoJSONs.length; k++) {
                    //console.log('properties.circle_id: ' + geoJSONs[k].properties.circle_id);
                    if (geoJSONs[k].properties.circle_id == tmpId) {
                        geoJSONs.splice(k,1);
                        break;
                    }
                }
                /*
                for (var l = 0; l < geoJSONs.length; l++) {
                    console.log('After break properties.circle_id: ' + geoJSONs[l].properties.circle_id);     
                }
                */       
            });
        
        
            d3.selectAll('.dot').each( function(d, i) {
			
                var geoNewAnnot = {};
                var xCenterPtTmp = d3.select(this).attr('cx');
                var yCenterPtTmp = d3.select(this).attr('cy');
                var circleId = d3.select(this).attr('id');
                var fillColor = d3.select(this).attr('fill');
			
                if ( xCenterPtTmp == xCenterPt && yCenterPtTmp == yCenterPt ) {
				
                    // coord start
                    var min_x, min_y, max_x, max_y, w, h;
                    min_x = xCenterPt - circleParameters.radius;
                    min_y = yCenterPt - circleParameters.radius;
                    max_x = xCenterPt + circleParameters.radius;
                    max_y = yCenterPt + circleParameters.radius;
                    w = Math.abs(max_x - min_x);
                    h = Math.abs(max_y - min_y);
                    console.log('min: ' + min_x + ', ' + min_y);
                    console.log('max: ' + max_x + ', ' + max_y);
                    console.log('w and h: ' + w + ', ' + h);
                    console.log('xCenterPt and yCenterPt: ' + xCenterPt + ' ' + yCenterPt);
		
                    var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y);
                    var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y);
                    var centerPtRelativeMousePosition = new OpenSeadragon.Point(xCenterPt, yCenterPt);
                    var newAnnot = {
                        x: startRelativeMousePosition.x,
                        y: startRelativeMousePosition.y,
                        w: w,
                        h: h,
                        cx: centerPtRelativeMousePosition.x,
                        cy: centerPtRelativeMousePosition.y,
                        type: 'circle',
                        circleId: circleId,
                        fillColor: fillColor,
                        loc: []
                     }
                    // console.log('New annot: ' + JSON.stringify(newAnnot, null, 4));
		
                    var globalNumbers = JSON.parse(self.convertFromNativeCoord(newAnnot, endRelativeMousePosition));
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
		
                    geoNewAnnot = self.convertCircleToGeo(newAnnot);
                    //console.log('Geo new annot:' + JSON.stringify(geoNewAnnot, null, 4));
                }   // end if
			
                if(Object.getOwnPropertyNames(geoNewAnnot).length !== 0) {
                    geoJSONs.push(geoNewAnnot);
                }
	   
                //console.log(geoJSONs);
                for (var j = 0; j < circleRemoveIds.length; j++) {
                    for (var i = 0; i < geoJSONs.length; i++) {
                        if (geoJSONs[i].properties.circle_id == circleRemoveIds[j]) {
                            geoJSONs.splice(i,1);
                            break;
                        }
                    }
                }
			
             }); //end for each
		
             //self.promptForAnnotations(geoJSONs, 'new', self, null);
		
             // jQuery("svg").css("cursor", "default");
             jQuery("#drawDotButton").removeClass("active");
		
    }); // end onclick
}
	

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

annotools.prototype.promptForAnnotations = function (newAnnots, mode, annotools, regionInfo) {
    jQuery('#panel').show('slide');
    //console.log(newAnnots);
    jQuery('panel').html('');
    jQuery('#panel').html('' +
    "<div id = 'panelHeader' style='background: #0073e6; border-radius: 5px;'><h4>Save Spatial Annotations</h4></div>"
    + "<div id='panelBody' style='background: #003366;'>"
    + "<form id ='annotationsForm' action='#'>"
    + '</form>'

    + '</div>'
    )
    jQuery.get('api/Data/retrieveTemplate.php', function (data) {
    //console.log(data);
    var schema = JSON.parse(data);
    schema = JSON.parse(schema)[0];
    //console.log(schema);
    // console.log("retrieved template")
    var formSchema = {
        'schema': schema,
        'form': [
            {
                'key': 'region',
                'type': 'radios'
            },
            {
                'type': 'fieldset',
                'title': 'Additional Options',
                'expandable': true,
                'items': [
                    'additional_annotation',
                    'additional_notes'
                 ]
             },
             {
                 'type': 'submit',
                 'title': 'Submit'
             },
             {
                 'type': 'button',
                 'title': 'Cancel',
                 'onClick': function (e) {
                 //console.log(e);
                     e.preventDefault();
                     // console.log("cancel")
                     cancelAnnotation();
                  }
              }
        ],
        "params": {
            "fieldHtmlClass": "input-small"
        },
		"value": {"region": "Lymphocyte"}	
    }
    
    formSchema.onSubmit = function (err, val) {
        // Add form data to annotation
        var secretDot = 'dot1';
		/*
        var errorSecretMsg = 'Error saving markup! Wrong secret';
        if ( val.secret !== secretDot ) {
            alert(errorSecretMsg);
            return;
        }
		*/
        var count = 1;
        for( var i = 0; i < newAnnots.length; i++ ) 
        { //for loop start
            var annotation = newAnnots[i];
            annotation.properties.annotations = val;
			annotation.properties.annotations.secret = secretDot;
			annotation.properties.annotations.username = this.username;
            
            if (annotation.properties.fill_color === regionInfo.fillColorLymphocyte) {
                annotation.properties.annotations.region = regionInfo.regionLymphocyte;
            }
            
            if (annotation.properties.fill_color === regionInfo.fillColorNonLymphocyte) {
                annotation.properties.annotations.region = regionInfo.regionNonLymphocyte;
            }
            
            // Post annotation
            // annotools.addnewAnnot(annotation)
            // POST start
            var self = this;
            //console.log('Save annotation function');
            //console.log(annotation);
            jQuery.ajax({
                'type': 'POST',
                url: 'api/Data/getAnnotSpatial.php',
                data: annotation,
                success: function (res, err) {
                    //console.log("response: ");
                    //console.log(res);
                    if ( count === newAnnots.length ){
                        if(res == "unauthorized"){
                            alert(errorSecretMsg);
                        } else {   
                            alert("Successfully saved markup!");
                        }
                    }
                    console.log(err);
                    annotools.getMultiAnnot();
                    console.log('succesfully posted ' + count + ' annot');
                    count ++;
                 }
              });
			
           annotools.getMultiAnnot();

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
        jQuery('#panel').hide('slide');
        annotools.drawLayer.hide();
        annotools.svg.hide();
        annotools.addMouseEvents();

        return false;
    }

    var cancelAnnotation = function () {
        console.log('cancel handler');
        jQuery('#panel').hide('slide');
        annotools.drawLayer.hide();
        annotools.svg.hide();
        annotools.addMouseEvents();
        jQuery("#drawDotButton").removeClass("active");
        annotools.getMultiAnnot();
    }

    jQuery('#annotationsForm').jsonForm(formSchema);
        
    jQuery('legend').css({'color':'white', 'font-size': '10pt', 'cursor': 'pointer'});
    jQuery( "#annotationsForm span:not(:contains('Non'))" ).css('color', regionInfo.fillColorLymphocyte);
    jQuery( "#annotationsForm span:contains('Non')" ).css('color', regionInfo.fillColorNonLymphocyte);
    //jQuery('#annotationsForm button').css('background', 'red');
  })
}


annotools.prototype.drawRectDotMarkup = function (ctx) {
  console.log('drawing rectangle - dot markups')

  /*Highlight drawRectangle button and change cursor*/

  this.removeMouseEvents()
  var started = false
  var min_x,min_y,max_x,max_y,w,h
  var startPosition
  this.drawCanvas.addEvent('mousedown', function (e) {
    started = true
    startPosition = OpenSeadragon.getMousePosition(e.event)
    x = startPosition.x
    y = startPosition.y
  })

  this.drawCanvas.addEvent('mousemove', function (e) {
    if (started) {
      ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height)
      var currentMousePosition = OpenSeadragon.getMousePosition(e.event)

      min_x = Math.min(currentMousePosition.x, startPosition.x)
      min_y = Math.min(currentMousePosition.y, startPosition.y)
      max_x = Math.max(currentMousePosition.x, startPosition.x)
      max_y = Math.max(currentMousePosition.y, startPosition.y)
      w = Math.abs(max_x - min_x)
      h = Math.abs(max_y - min_y)
      ctx.strokeStyle = this.color
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fillRect(min_x, min_y, w, h)
      ctx.strokeRect(min_x, min_y, w, h)
    }
  }.bind(this))

  this.drawCanvas.addEvent('mouseup', function (e) {
    started = false
    var finalMousePosition = new OpenSeadragon.getMousePosition(e.event)

    min_x = Math.min(finalMousePosition.x, startPosition.x)
    min_y = Math.min(finalMousePosition.y, startPosition.y)
    max_x = Math.max(finalMousePosition.x, startPosition.x)
    max_y = Math.max(finalMousePosition.y, startPosition.y)

    var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
    var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
    var newAnnot = {
      x: startRelativeMousePosition.x,
      y: startRelativeMousePosition.y,
      w: w,
      h: h,
      type: 'rect',
      color: this.color,
      loc: []
    }

    var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition))

    newAnnot.x = globalNumbers.nativeX
    newAnnot.y = globalNumbers.nativeY
    newAnnot.w = globalNumbers.nativeW
    newAnnot.h = globalNumbers.nativeH
    var loc = []
    loc[0] = parseFloat(newAnnot.x)
    loc[1] = parseFloat(newAnnot.y)
    newAnnot.loc = loc;

    console.log(newAnnot);

    // convert to geojson 
    var geoNewAnnot = this.convertRectToGeo(newAnnot)
    // geoNewAnnot = newAnnot
    this.promptForRectDotAnnotation(geoNewAnnot, 'new', this, ctx);
    jQuery("canvas").css("cursor", "default");
    jQuery("#markupRectDotButton").removeClass("active");


  }.bind(this))
}

annotools.prototype.promptForRectDotAnnotation = function (newAnnot, mode, annotools, ctx) {
  jQuery('#panel').show('slide')
  console.log(newAnnot);
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
      newAnnot.properties.annotations = val

      // Post annotation
      annotools.addnewAnnot(newAnnot)
	  
      // Hide Panel
      jQuery('#panel').hide('slide')
      annotools.drawLayer.hide()
      annotools.addMouseEvents()

      return false
    }

    var cancelAnnotation = function () {
      console.log('cancel handler')
      jQuery('#panel').hide('slide')
      annotools.drawLayer.hide()
      annotools.addMouseEvents()
    }

    jQuery('#annotationsForm').jsonForm(formSchema)
  })
}
