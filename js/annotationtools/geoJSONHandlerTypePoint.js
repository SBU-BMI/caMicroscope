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
        'object_type': 'nucleus',
        'properties': {
            'scalar_features': [],
            'annotations': [],
            'bbox': [],
            'radius': 3,
            'fill_color': '#ffff00',
            'circle_id': "",
            'polygon_object_ids': []
        },
        'footprint': 10000,
        'provenance': {
            'analysis': {
                'execution_id': 'dotnuclei',
                'study_id': "",
                'source': 'human',
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
    geoAnnot.properties.circle_id = annotation.circleId;
    geoAnnot.properties.fill_color = annotation.fillColor;
    
    //geoAnnot.footprint = area;
    geoAnnot.geometry.coordinates = coordinates;

    return geoAnnot;
}


annotools.prototype.generateCircleSVGByAnnotation = function(annotation, annotationId, annotools) {

    var svgHtml;
    var id = annotationId;
    var nativepoints = annotation.geometry.coordinates[0];
	
    //var response = annotools.getProperties(annotationId);
    //var result = JSON.parse(response.responseText);
	//osprey start
	/*
	var response = annotools.getProperties(annotationId);
    var result = JSON.parse(response.responseText);
    var currentRadius = result[0].properties.radius;
    var hoverRadius = currentRadius * 3;
    var fillColor = result[0].properties.fill_color;
    var hoverColor = result[0].properties.fill_color;
    var region = result[0].properties.annotations.region;
    var additionalAnnotation = result[0].properties.annotations.additional_annotation;
    var additionalNotes = result[0].properties.annotations.additional_notes;
    //var lymphocyteRegion = 'Lymphocyte';
	
    var text = region;
    var opacityOver = '0.5';
    var opacityOut = '1';
    */
    /*
    console.log(JSON.stringify(result, null, 4));
	console.log(result[0].properties.annotations.region);
	console.log(result[0].properties.annotations.additional_annotation);
	console.log(result[0].properties.annotations.additional_notes);
	console.log(result[0].properties.radius);
	console.log(result[0].properties.fill_color);
    */
	//osprey end
	
	
    var currentRadius = annotation.properties.radius;
    var hoverRadius = currentRadius * 3;
    var fillColor = annotation.properties.fill_color;
    var hoverColor = annotation.properties.fill_color;
    var region = annotation.properties.annotations.region;
    var additionalAnnotation = annotation.properties.annotations.additional_annotation;
    var additionalNotes = annotation.properties.annotations.additional_notes;
   
    var text = region;
    var opacityOver = '0.5';
    var opacityOut = '1';
	

    if (currentRadius === undefined) {
        currentRadius = 3;
    }
	
    if (fillColor === undefined) {
        fillColor = '#ffff00';
        hoverColor = '#ffff00';
    }
	
    if (text) {
	
        if (additionalAnnotation) {
            text += '\n';
            text += additionalAnnotation;
        }
		
        if (additionalNotes) {
            text += '\n';
            text += additionalNotes;
        }	
    }
    
    for (var k = 0; k < nativepoints.length; k++) {

        var cx = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0]);
        var cy = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1]);
				
        svgHtml += '<circle  class="annotationsvg" id="' + id + '" ';
        svgHtml += 'cx="' + cx + '" cy="' + cy + '" r="' + currentRadius + '" fill="' + fillColor + '" ';
        svgHtml += 'onmouseover = "evt.target.setAttribute(\'r\',' + hoverRadius + ');';
        svgHtml += 'evt.target.setAttribute(\'fill\',\'' + hoverColor + '\');'; 
        svgHtml += 'evt.target.setAttribute(\'opacity\',\'' + opacityOver + '\'); "';
        svgHtml += 'onmouseout = "evt.target.setAttribute(\'r\',' + currentRadius + ');';
        svgHtml += 'evt.target.setAttribute(\'fill\',\'' + fillColor + '\');'; 
        svgHtml += 'evt.target.setAttribute(\'opacity\',\'' + opacityOut + '\'); "';
        svgHtml += '><title>' + text + '</title></circle>';
	}
	
    return svgHtml;
}


annotools.prototype.generateCircleSVG = function(annotationId, nativepoints, annotools) {

    var svgHtml;
    var id = annotationId;
    var nativepoints = nativepoints;
	
    var response = annotools.getProperties(annotationId);
    var result = JSON.parse(response.responseText);
    var currentRadius = result[0].properties.radius;
    var hoverRadius = currentRadius * 3;
    var fillColor = result[0].properties.fill_color;
    var hoverColor = result[0].properties.fill_color;
    var region = result[0].properties.annotations.region;
    var additionalAnnotation = result[0].properties.annotations.additional_annotation;
    var additionalNotes = result[0].properties.annotations.additional_notes;
    var lymphocyteRegion = 'Lymphocyte';
	
    var text = region;
    var opacityOver = '0.5';
    var opacityOut = '1';

    /*
    console.log(JSON.stringify(result, null, 4));
	console.log(result[0].properties.annotations.region);
	console.log(result[0].properties.annotations.additional_annotation);
	console.log(result[0].properties.annotations.additional_notes);
	console.log(result[0].properties.radius);
	console.log(result[0].properties.fill_color);
    */
	
    if (region === lymphocyteRegion) {
        fillColor = 'lime';
        hoverColor = 'lime';
    }
	
    if (currentRadius === undefined) {
        currentRadius = 3;
    }
	
    if (fillColor === undefined) {
        fillColor = '#ffff00';
        hoverColor = '#ffff00';
    }
	
    if (text) {
	
        if (additionalAnnotation) {
            text += '\n';
            text += additionalAnnotation;
        }
		
        if (additionalNotes) {
            text += '\n';
            text += additionalNotes;
        }	
    }
    //onmouseover="evt.target.setAttribute('opacity', '0.5');"
    //onmouseout="evt.target.setAttribute('opacity','1)');"/>
    for (var k = 0; k < nativepoints.length; k++) {

        var cx = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0]);
        var cy = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1]);
				
        svgHtml += '<circle  class="annotationsvg" id="' + id + '" ';
        svgHtml += 'cx="' + cx + '" cy="' + cy + '" r="' + currentRadius + '" fill="' + fillColor + '" ';
        svgHtml += 'onmouseover = "evt.target.setAttribute(\'r\',' + hoverRadius + ');';
        svgHtml += 'evt.target.setAttribute(\'fill\',\'' + hoverColor + '\');'; 
        svgHtml += 'evt.target.setAttribute(\'opacity\',\'' + opacityOver + '\'); "';
        svgHtml += 'onmouseout = "evt.target.setAttribute(\'r\',' + currentRadius + ');';
        svgHtml += 'evt.target.setAttribute(\'fill\',\'' + fillColor + '\');'; 
        svgHtml += 'evt.target.setAttribute(\'opacity\',\'' + opacityOut + '\'); "';
        svgHtml += '><title>' + text + '</title></circle>';
	}
	
    return svgHtml;
}

annotools.prototype.getProperties = function (annotId) {
    
    return jQuery.ajax({
        type: "GET",
        url: "api/Data/getProperties.php?id=" + annotId,
        dataType: "json",
        async: false,
        success: function (result) {
            /* if result is a JSON object */
            if (result.valid)
                return true;
            else
                return false;
        }
    });
}

annotools.prototype.deleteRectDotAnnot = function(annotation, annotId, annotools) {
    
    var isUsernameExist = annotation.properties.annotations.hasOwnProperty('username');
    var dataUsername = [];
    var isSuperuserExist = annotation.properties.annotations.hasOwnProperty('superuser');
    var dataSuperuser = '';
	var currentUsername = annotools.username;
	
	
    if (isUsernameExist) {
        dataUsername = annotation.properties.annotations.username[0];
    }
    if (isSuperuserExist) {
        dataSuperuser = annotation.properties.annotations.superuser;
    }
	
				
    if ((dataUsername == currentUsername) || (dataSuperuser == currentUsername || (!isUsernameExist) || (!isSuperuserExist))) {
       //alert('Authorized');
       //confirm
       var isConfirm = confirm("Are you sure you want to delete this dashed rectangle?\nOK or Cancel.");
          if (isConfirm) {
             var payload = {
                 "id": annotId,
                 "secret": ''
              }
              jQuery.ajax({
                  url: 'api/Data/getProperties.php?id='+annotId,
                  type: 'DELETE',
                  data:(payload),
                  success: function(data) {
                      console.log(data);
                      //jQuery("#panel").hide("slide");
                      annotools.getMultiAnnot();
                   }
               });
            }
            else {
               //jQuery("#panel").hide("slide");
               annotools.getMultiAnnot();
            }
       }
       else {
           alert('Error deleting markup! You are not authorized to perform this operation');
           jQuery("#panel").hide("slide");
           annotools.getMultiAnnot();
       }               
}

annotools.prototype.menageCircleAnnot = function(annotations, annotools) {
    
     var panel = jQuery('#panel').show('slide')
        panel.html('');
        jQuery(".annotationsvg").css("opacity", 0.5);
        jQuery("#"+event.target.id).css("opacity", 1);
        var id = event.target.id
        var url = "api/Data/getProperties.php?id="+id;
        var content = "<div id = 'panelHeader'> <h4>Annotation Details</h4></div>"
        + "<div id='panelBody'>";
    
        console.log('length before function: ' + annotations.length);
        
        var annotations = this.annotations;
        //var data = {};
	    var annotation = {};
    
        if (annotations) {
            for (var i = 0; i < annotations.length; i++) {
                var annotOld = annotations[i];
                var idOld = '';
                var properties = {};
                if (annotOld['_id']) {
                    idOld = annotOld['_id']['$oid'];
                }
                if (idOld == id) {
                    console.log('Equel: ' + id);
                    annotation = annotOld;
                    console.log(annotation);
                    properties = annotation.properties.annotations;
                    for (var i in properties) {
                        if(i == "secret") {
                        } else {
                        var line = "<div class='markupProperty'><strong>"+i+"</strong>: " + properties[i]+"</div>";
                        content+=line;
                        }
                     }
                
                 }       
             }
         }
          
         content += "<button class='btn' id='editDotAnnot'>Change</button>";
         content += "<button class='btn-danger btn' id='deleteAnnot'>Delete</button>";
         content += "<button class='btn' id='cancelPanel'>Cancel</button>";
         content +="</div>";
         var cancel = function () {
           
            jQuery('#panel').hide('slide');
            annotools.getMultiAnnot();

          }

          panel.html(content);
        

          jQuery("#cancelPanel").click(function(){cancel();});
          
	      // start delete circle
          jQuery("#deleteAnnot").click(function(e) {
            
             if(annotation.provenance.analysis.execution_id.startsWith('dotnuclei')) {
			   
	             var isUsernameExist = annotation.properties.annotations.hasOwnProperty('username');
                 var annotUsername = [];
                 var isSuperuserExist = annotation.properties.annotations.hasOwnProperty('superuser');
                 var annotSuperuser = '';
	             var currentUsername = annotools.username;
	
                 if (isUsernameExist) {
                     annotUsername = annotation.properties.annotations.username[0];
                 }
                 if (isSuperuserExist) {
                     annotSuperuser = annotation.properties.annotations.superuser;
                 }
				 console.log(isUsernameExist);
				 console.log(typeof annotUsername);
				 console.log(typeof currentUsername);
				 console.log(typeof annotSuperuser);
				 
				  var payload = {
                         "id": id,
                         "secret": ''
                     }
				     jQuery.ajax({
                         url: 'api/Data/getProperties.php?id='+id,
                         type: 'DELETE',
                         data:(payload),
                         success: function(data){
                             console.log(data);
                             //jQuery("#panel").hide("slide");
							 annotation = {};
                             annotools.getMultiAnnot();
                         }
                     });
				 
				 /*
                 if ((annotUsername == currentUsername) || (annotSuperuser == currentUsername)) {
			         //alert('Authorized');
			         var payload = {
                         "id": id,
                         "secret": ''
                     }
				     jQuery.ajax({
                         url: 'api/Data/getProperties.php?id='+id,
                         type: 'DELETE',
                         data:(payload),
                         success: function(data){
                             console.log(data);
                             //jQuery("#panel").hide("slide");
                             annotools.getMultiAnnot();
                         }
                     });
				  }
				  else {
			        alert('HereError deleting markup! You are not authorized to perform this operation');
				    jQuery("#panel").hide("slide");
                    annotools.getMultiAnnot();
			      }*/
              } else {
                  alert("Error deleting markup! You are not authorized to perform this operation");
              }
          }); //end delete circle
          
    
          // start edit
          jQuery("#editDotAnnot").click(function(e) { 
            
			  console.log('Edit Before post annotation:' + JSON.stringify(annotation, null, 4));
			  // create geoJson
			  
			  // check if annotation was not selected (or deleted)
			  if ( Object.getOwnPropertyNames(annotation).length === 0 ) {
				  alert('Please select a dot');
				  
				  return;
			  }
			  
			  // set values
			  var geometryType = annotation.geometry.type;
			  var cx = annotation.geometry.coordinates[0][0][0];
			  var cy = annotation.geometry.coordinates[0][0][1];
			  var objectType = annotation.object_type;
			  var region = annotation.properties.annotations.region;
			  var additionalAnnotation = annotation.properties.annotations.additional_annotation;
			  var additionalNotes = annotation.properties.annotations.additional_notes;
			  var secret = annotation.properties.annotations.secret;
			  var username = annotools.username;
			  var createdBy = annotation.properties.annotations.username;
			  var updatedBy = annotools.username;
			  var superuser = annotation.properties.annotations.superuser;
			  var objectIdOld = id;
			  var radius = annotation.properties.radius;
			  var fillColor = annotation.properties.fill_color;
			  var circleIdOld = annotation.properties.circle_id;
			  var executionId = annotation.provenance.analysis.execution_id;
			  var caseId = annotation.provenance.image.case_id;
	
              var subjectId = caseId.substr(0,12);
              if(subjectId.substr(0,4) != 'TCGA'){
                  subjectId = '';
              }
			  
			  if (region === 'Lymphocyte') {
				  region = 'Non Lymphocyte';
				  fillColor = '#ffff00';
			  }
			  else if (region === 'Non Lymphocyte') {
			      region = 'Lymphocyte';
				  fillColor = 'Lime';
			  }
			  
			  console.log(geometryType);
			  console.log(cx);
			  console.log(cy);
			  console.log(objectType);
			  console.log(region);
			  console.log(additionalAnnotation);
			  console.log(additionalNotes);
			  console.log(secret);
			  console.log(username);
			  console.log(createdBy);
			  console.log(updatedBy);
			  console.log(superuser);
			  console.log(objectIdOld);
			  console.log(radius);
			  console.log(fillColor);
			  console.log(circleIdOld);
			  console.log(executionId);
			  console.log(caseId);
			  console.log(subjectId);
			  console.log(id);

              var editAnnot = {
                  'type': 'Feature',
                  'parent_id': 'self',
                  'randval': Math.random(),
                  'geometry': {
                      'type': geometryType,
                      'coordinates': [
	                      [
                              [
                                  cx,
                                  cy
                              ]
                
                           ]	  
	                   ]
                    },
               'normalized': true,
               'object_type': 'nucleus',
               'properties': {
                   'annotations': {
                       'region' : region, 
                       'additional_annotation' : additionalAnnotation, 
                       'additional_notes' : additionalNotes, 
                       'secret' : secret,
				       'username': [
                           username
                        ],
					    'created_by': createdBy,
					    'updated_by': updatedBy,
                        'superuser': superuser,
					    'object_id_old': objectIdOld
                     },
				   'radius': radius,
                   'fill_color': fillColor,
                   'circle_id': circleIdOld,
                },
                'footprint': 10000,
                'provenance': {
                    'analysis': {
                        'execution_id': executionId,
                        'study_id': '',
                        'source': 'human',
                        'computation': 'detection'
                        },
                    'image': {
                        'case_id': caseId,
                        'subject_id': subjectId
                     }
                 },
                 'date': Date.now(),
	             x: cx,
	             y: cy
	
             }
			  
			  
			 // Step 1: DELETE
			 if ( Object.getOwnPropertyNames(editAnnot).length !== 0 ) {
			     var payload = {
                         "id": id,
                         "secret": ''
                     }
				     jQuery.ajax({
                         url: 'api/Data/getProperties.php?id='+id,
                         type: 'DELETE',
                         data:(payload),
                         success: function(data){
                             console.log(data);
                             //jQuery("#panel").hide("slide");
                             annotools.getMultiAnnot();
							 
							 //aj add post
							 console.log('Post editAnnot:' + JSON.stringify(editAnnot, null, 4));
			                 //Step 2: POST
			                 // Post annotation
                             annotools.addOldAnnot(editAnnot);
							 
							 //save aj
							 
							 
							 //save
	  
			                 console.log('Success edit');
							 
							 
							 //aj end post
							 
                         }
                     });
			 }
			  
			 
			 // Step 2: POST
  

            // console.log('Post editAnnot:' + JSON.stringify(editAnnot, null, 4));
			  
			 // Post annotation
            // annotools.addnewAnnot(editAnnot);
	  
			// console.log('Success edit');
             
          });
          // end edit
}


annotools.prototype.addOldAnnot = function (oldAnnot) // Add Old Annotations
{
  
  console.log(oldAnnot);
  this.saveOldAnnot(oldAnnot);
  // console.log("saved annotation")

  this.displayGeoAnnots();
}

annotools.prototype.saveOldAnnot = function (annotation) // Save Annotation
{
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
      if(res == "unauthorized"){
        alert("Error saving markup!");
      } else {   
        //alert("Successfully edit markup!");
      }
      console.log(err)
      self.getMultiAnnot();
      console.log('succesfully posted')
    }
  })
}

