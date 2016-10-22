annotools.prototype.generateGeoTemplateTypePoint = function () {
  
  var case_id = this.iid
  var subject_id = case_id.substr(0,12);
  if(subject_id.substr(0,4) != "TCGA"){
    subject_id = "";
  }

  var geoJSONTemplateTypePoint = {
    'type': 'Feature',
    'parent_id': 'self',
    'randval': Math.random(),
    'geometry': {
      'type': 'Point',
      'coordinates': []
    },
    'normalized': true,
    'object_type': 'nucleus', // nucleus?
    'properties': {
      'scalar_features': [],
      'annotations': [],
	  'bbox': [],
      'radius': 3,
	  'fill_color': '#ffff00',
      'polygon_object_ids': []
    },
    'footprint': 10000,
    'provenance': {
      'analysis': {
        'execution_id': 'humantest',
        'study_id': "",
        'source': "human",
        'computation': 'detection'
      },
      'image': {
        'case_id': case_id,
        'subject_id': subject_id
      }
    },
    'date': Date.now()
  }
  
  console.log(geoJSONTemplateTypePoint);
  return geoJSONTemplateTypePoint;
}

// under development
annotools.prototype.convertCircleToGeo = function (annotation) {
 
    var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x), this.imagingHelper.physicalToDataY(annotation.y))
	var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x + annotation.w), this.imagingHelper.physicalToDataY(annotation.y + annotation.h))

    /* Compute footprint(area) Math.PI=3.14159 */
	var physicalW = this.imagingHelper.logicalToPhysicalX(annotation.w);
	var helper = this.imagingHelper;
	var dataW  = helper.physicalToDataX(physicalW);
	//var radius = dataW / 2;
	
	//var area = radius * radius * Math.PI;
	
   
	var coordinates = [];
	var x = annotation.x;
	var y = annotation.y;
	var w = annotation.w;
	var h = annotation.h;
	//var r = w / 2;
	//var cx = x + r;
	//var cy = y + r;
	var cx = annotation.cx;
	var cy = annotation.cy;
	
	var bbox = [];
	var geoAnnot = this.generateGeoTemplateTypePoint();
	coordinates.push([]);
	// coordinates[0].push([])
	coordinates[0].push([cx, cy]);
	
	bbox.push([]);
	bbox[0].push([x, y, x+w, y+h]);
	//geoAnnot.x = x;
	//geoAnnot.y = y;
    geoAnnot.x = cx;
    geoAnnot.y = cy;
    
	geoAnnot.properties.bbox = bbox;
	//geoAnnot.properties.radius = radius;
    
	//geoAnnot.footprint = area;
	geoAnnot.geometry.coordinates = coordinates;

  return geoAnnot;
}

annotools.prototype.generatePointSVG = function (annotations) {
	
    // console.log(annotation)
    // var annotation = annotations[ii]
    var self =this;
    var annotations = this.annotations
    if (annotations) {
        var markup_svg = document.getElementById('markups')
        if (markup_svg) {
        // console.log("destroying")
            markup_svg.destroy()
        }

    // console.log(annotations.length)
	var container = document.getElementsByClassName(this.canvas)[0] // Get The Canvas Container
    // console.log(nativepoints)
    // var container = document.getElementsByClassName(this.cavas)[0]
    // console.log(container)
    var width = parseInt(container.offsetWidth)
    var height = parseInt(container.offsetHeight)
    /* Why is there an ellipse in the center? */
    var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" version="1.1" id="markups">'
    svgHtml += '<g id="groupcenter"/>'
    svgHtml += '<g id="origin">'
    var origin = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5, .5))
    svgHtml += '<ellipse id="originpt" cx="' + origin.x + '" cy="' + origin.y + '" rx="' + 4 + '" ry="' + 4 + '" style="display: none"/>'
    svgHtml += '</g>'
    svgHtml += '<g id="viewport" transform="translate(0,0)">'

	// polygon
    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i]

      var id = '';
      
      if (annotation['_id'])
        id = annotation['_id']['$oid']
      // console.log(annotation)
      var nativepoints = annotation.geometry.coordinates[0]

      // var offset = OpenSeadragon.getElementOffset(viewer.canvas)
      var algorithm_id = annotation.provenance.analysis.execution_id
      var color = algorithm_color[algorithm_id]

      // var svg = 
      svgHtml += '<polygon  class="annotationsvg" id="' + id + '" points="'

      // svgHtml += '<polygon onclick="clickSVG(event)" class="annotationsvg" id="'+"poly"+i+'" points="'
      var polySVG = ''
      for (var k = 0; k < nativepoints.length; k++) {

        var polyPixelX = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0])
        var polyPixelY = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1])
        // svgHtml += nativepoints[k][0] + ',' + nativepoints[k][1] + ' '
        // polySVG += nativepoints[k][0] + ',' + nativepoints[k][1] + ' '
        svgHtml += polyPixelX + ',' + polyPixelY + ' '
      }

      //svgHtml += '" style="fill: transparent; stroke: lime; stroke-width:2.5"/>'
      if(color === undefined)
        color = 'lime'
      svgHtml += '" style="fill:transparent; stroke:'+color+ '; stroke-width:2.5"/>'
    }
	  
	
	for (var i = 0; i < annotations.length; i++) {
     
        var annotation = annotations[i];
        
		// circles
        if (annotation.geometry.type === 'Point') {

            var id = '';
      
            if (annotation['_id']) {
				id = annotation['_id']['$oid'];
			}
            console.log(annotation)
            var nativepoints = annotation.geometry.coordinates[0];
			var radius = 3;
			var fillColor = '#ffff00';
			
            // var offset = OpenSeadragon.getElementOffset(viewer.canvas)
            var algorithm_id = annotation.provenance.analysis.execution_id;
            var color = algorithm_color[algorithm_id];

            for (var k = 0; k < nativepoints.length; k++) {

				var cx = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0]);
				var cy = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1]);
				
				svgHtml += '<circle  class="annotationsvg" id="' + id + '" '
				//svgHtml += 'cx="' + cx + '" cy="' + cy + '" r="3" fill="yellow" />'
				svgHtml += 'cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="' + fillColor + '" />'
             }
         }
     }
	// end
	  
	  
    this.svg = new Element('div', {
      styles: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      },
      html: svgHtml
    }).inject(container)
  }



  var ctrl = false;
  jQuery(document).keydown(function(event) {
      //console.log("control");
	  //console.log(event);
      if(event.which == 17 || event.which == 91)
      ctrl = true;
  });
  jQuery(document).keyup(function() {
      ctrl = false;
  });
  jQuery('.annotationsvg').mousedown(function (event) {
      //console.log(event.which);
      if(ctrl){
          //console.log("double clicked");
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          //return false;
       } else {
          return;
       }
        var panel = jQuery('#panel').show('slide')
        panel.html('');
        jQuery(".annotationsvg").css("opacity", 0.5);
        jQuery("#"+event.target.id).css("opacity", 1);
        var id = event.target.id
        var url = "api/Data/getProperties.php?id="+id;
        var content = "<div id = 'panelHeader'> <h4>Annotation Details </h4></div>"
        + "<div id='panelBody'>";

        jQuery.get(url, function(d){
          var data = {}
          
          try{
            data = JSON.parse(d)[0];
          } catch(e){
            console.log(e);
          }
          //console.log(data);
          var features = [];
          var properties = {};
          try {
            if(data.properties.scalar_features)
              features=  data.properties.scalar_features[0].nv;
            properties = data.properties.annotations;
          } catch(e){
            console.log(e);
          }
          for(var i in properties){
            
            if(i == "secret"){

            } else {
              var line = "<div class='markupProperty'><strong>"+i+"</strong>: " + properties[i]+"</div>";
              content+=line;
            }
          
          }

          for(var i =0; i< features.length; i++){
            var feature = features[i];
            var line = "<div class='markupFeature'><div class='markupFeatureName'>"+feature.name +"</div> <div class='markupFeatureValue'>"+feature.value+"</div></div>";
            content+=line;
          }

          content += "<button class='btn-danger btn' id='deleteAnnot'><a href='#confirmDelete' rel='modal:open'>Delete</a></button>";
          content += "<button class='btn' id='cancelPanel'>Cancel</button>";
          content +="</div>";
          var cancel = function () {
           
            jQuery('#panel').hide('slide')

          }

          panel.html(content);


          jQuery("#cancelPanel").click(function(){cancel();});

          jQuery("#deleteAnnot").click(function(e) {
            
            //$("#confirmDelete").css(
            //console.log(data.provenance.analysis.source);
            if(data.provenance.analysis.source == "human"){
              jQuery("#confirmDeleteButton").click(function(){
                var secret = jQuery("#deleteSecret").val();
                var payload = {
                  "id": id,
                  "secret": secret
                }
              
                jQuery.ajax({
                  url: 'api/Data/getProperties.php?id='+id,
                  type: 'DELETE',
                  data:(payload),
                  success: function(data){
                    console.log(data);
                    jQuery("#panel").hide("slide");
                    //self.getMultiAnnot();
					self.getMultiPointAnnot();
                  }
                });
              });
            } else {
              alert("Can't delete computer generated segments");
            }
          });

        });
    
  })



  /*
  jQuery('.annotationsvg').mousedown(function (event) {
   
    switch (event.which) {
      case 3:


        var panel = jQuery('#panel').show('slide')
        panel.html('');

        var id = event.target.id
        var url = "api/Data/getProperties.php?id="+id;
        var content = "<div id = 'panelHeader'> <h4>Annotation Details </h4></div>"
    + "<div id='panelBody'>";

        jQuery.get(url, function(data){
          
          var data = JSON.parse(data)[0];
          var properties = data.properties.annotations;
          for(var i in properties){
            
            if(i == "secret"){

            } else {
              var line = "<div class='markupProperty'><strong>"+i+"</strong>: " + properties[i]+"</div>";
              content+=line;
            }
          
          }
          content += "<button class='btn' id='cancelPanel'>Cancel</button>";
          content +="</div>";
          var cancel = function () {
           
            jQuery('#panel').hide('slide')

          }

          panel.html(content);


          jQuery("#cancelPanel").click(function(){cancel();});



        });
        // jQuery("#panel").hide("slide")
        break
    }
  })
  */
	
}

annotools.prototype.displayGeoPointAnnots = function () {
	
	var geoJSONs = this.annotations;
	
    //if (this.annotVisible) {
    
    this.generatePointSVG(geoJSONs);
    
    var renderStartTime = 9;
    var renderEndTime = 23;
	
  //}	
}

