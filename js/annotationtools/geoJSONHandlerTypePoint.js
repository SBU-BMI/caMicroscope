annotools.prototype.generateGeoTemplateTypePoint = function () {
  
    var case_id = this.iid
    var subject_id = case_id.substr(0,12);
    if(subject_id.substr(0,4) != 'TCGA'){
        subject_id = '';
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
            'circle_id': '',
            'polygon_object_ids': []
        },
        'footprint': 10000,
        'provenance': {
            'analysis': {
                'execution_id': 'dotnuclei',
                'study_id': '',
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


annotools.prototype.generateCircleSVGByAnnotation = function(annotation, annotationId) {

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
    var createdBy = annotation.properties.annotations.created_by;
    var createdOn = annotation.properties.annotations.created_on;
    if (createdOn) {
        createdOn = new Date(createdOn).toLocaleDateString();
    }
    var updatedBy = annotation.properties.annotations.updated_by;
    var updatedOn = annotation.properties.annotations.updated_on;
    if (updatedOn) {
        updatedOn = new Date(updatedOn).toLocaleDateString();
    }
   
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
        
        if (createdBy) {
            text += '\n';
            text += 'Created by: ' + createdBy;
        }
        
        if (createdOn) {
            text += '\n';
            text += 'Created on: ' + createdOn;
        }
        
        if (updatedBy) {
            text += '\n';
            text += 'Updated by: ' + updatedBy;
        }
        
        if (updatedOn) {
            text += '\n';
            text += 'Updated on: ' + updatedOn;
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

annotools.prototype.deleteAnnotByObjectId = function(annotId) {

    var self = this;
    var payload = {
        "id": annotId,
        "secret": ''
    };
    
    jQuery.ajax({
        url: 'api/Data/getProperties.php?id=' + annotId,
        type: 'DELETE',
        data:(payload),
        success: function(data) {
            console.log(data);
            //jQuery("#panel").hide("slide");
            self.getMultiAnnot();
        }
    });
}

annotools.prototype.deleteRectDotAnnot = function(annotation, annotId) {
	
    var self = this;
    var confirmMsg = 'Are you sure you want to delete this dashed rectangle?\nOK or Cancel.';
    
    if (self.isUserAuthorized(annotation)) {
       
        var isConfirm = confirm(confirmMsg);
        if (isConfirm) {
            self.deleteAnnotByObjectId(annotId);
            jQuery('#panel').hide('slide');
        }
        else {
            //jQuery("#panel").hide("slide");
            self.getMultiAnnot();
        }
    }
    else {
        self.getUnauthorizedMsg();
        jQuery('#panel').hide('slide');
        self.getMultiAnnot();
    }               
}

annotools.prototype.manageCircleAnnot = function(annotations) {
    
    var self = this;
    var annotations = this.annotations;
    var annotation = {};
    jQuery('#panel').height(320);
    var panel = jQuery('#panel').show('slide');
    //jQuery('#panel').height( 300 ).css({backgroundColor: 'white'});          
    var id = event.target.id;
    var url = "api/Data/getProperties.php?id=" + id;
    var content = '';
    var panelBody = '';
    
    panel.html('');
    jQuery(".annotationsvg").css("opacity", 0.5);
    jQuery("#" + event.target.id).css("opacity", 1);
    
    content   += "<div id = 'panelHeader'><h4>Manage Annotations</h4></div>";
    panelBody += "<div id='panelBody' style='background:white;height:280px;'>";
    panelBody += "<div class='markupProperty' style='color:maroon;'><strong>Annotation Details:</strong></div>";
    
    if (annotations) {
        for (var i in annotations) {
            var annotOld = annotations[i];
            var idOld = '';
            var properties = {};
            if (annotOld['_id']) {
                idOld = annotOld['_id']['$oid'];
             }
            if (idOld == id) {
                annotation = annotOld;
                properties = annotation.properties.annotations;
                for (var j in properties) {
                    if (j == 'created_on' || j == 'updated_on') {
                        properties[j] = new Date(properties[j]).toLocaleDateString();
                    }
                    
                    if(j == "secret") {
                    }
                    else {
                        var line = "<div class='markupProperty' style='color:black;'><strong>" + j + "</strong>: " + properties[j] + "</div>";
                        panelBody += line;
                    }
                }
            }       
        }
    }
    
    content += panelBody;
    content += "<button class='btn' id='editDotAnnot' style='background:green'>Change</button>";
    content += "<button class='btn-danger btn' id='deleteAnnot' title='Delete selected dot'>Delete</button>";
    content += "<button class='btn' id='cancelPanel'>Cancel</button>";
    content +="</div>";
    
    panel.html(content);
    
    // cancel
    jQuery("#cancelPanel").click(function() {
        self.cancel();
    });
    
    // delete selected circle
    jQuery("#deleteAnnot").click(function(e) {
        if(self.isDotToolExecutionId(annotation)) { 
            if (self.isUserAuthorized(annotation)) {
                if (!id || !id.length){
                    self.getSelectAnnotMsg();
                    return;
                 }
                 self.deleteAnnotByObjectId(id);
                 id = '';
                 //
                 panel.html('');
                 
                 jQuery('#panel').height(260);
                 
                 var newContent = '';
                 newContent += "<div id = 'panelHeader'><h4>Information Message</h4></div>";
                 newContent += "<div id='panelBody' style='background:white;height:220px;'>";
                 newContent += "<div class='markupProperty' style='color:maroon;'><strong>Please select a dot<strong></div>";
                 newContent += "<button class='btn' id='cancelPanel'>Cancel</button>";
                 newContent +="</div>";
                 panel.html(newContent);
                 jQuery("#cancelPanel").click(function() {
                     self.cancel();
                 }); 
             }
             else {
                 self.getUnauthorizedMsg();
                 jQuery("#panel").hide("slide");
                 self.getMultiAnnot();
             }
        } else {
            self.getUnauthorizedMsg();
        }
    }); //end delete circle
          
    
    // edit selected circle
    jQuery("#editDotAnnot").click(function(e) { 
            
        if ( Object.getOwnPropertyNames(annotation).length === 0 ) {
            self.getSelectAnnotMsg();
            return;
        }
			  
        // set values
        var editedAnnot = self.generateEditedGeoTemplateTypePoint(annotation, id);
        // step 1: DELETE
        if ( Object.getOwnPropertyNames(editedAnnot).length !== 0 && id != '') {
            var payload = {
               "id": id,
               "secret": ''
            }
            
            jQuery.ajax({
                url: 'api/Data/getProperties.php?id='+id,
                type: 'DELETE',
                data:(payload),
                success: function(data){
                    // console.log(data);
                    // jQuery("#panel").hide("slide");
                    self.getMultiAnnot();
                    // console.log('Post editedAnnot:' + JSON.stringify(editedAnnot, null, 4));
                    // step 2: POST
                    self.addEditedAnnot(editedAnnot);
                    var cellType = editedAnnot.properties.annotations.region;
                    var colorStyle = 'black';
                    if (cellType === 'Lymphocyte') {
                        colorStyle = 'green';
                    }
                    else {
                        colorStyle = 'orange';
                    }
                    editedAnnot = {};
                    id = '';
                    //
                     panel.html('');
                 
                     jQuery('#panel').height(260);
                    
                    
                     var newContent = '';
                     newContent += "<div id = 'panelHeader'><h4>Information Message</h4></div>";
                     newContent += "<div id='panelBody' style='background:white;height:220px;'>";
                     newContent += "<div class='markupProperty' style='color:" + colorStyle + "'<strong>The selected annotation has been successfully changed into the " + cellType + " type.<strong></div><br><br>";
                     newContent += "<div class='markupProperty' style='color:maroon;'><strong>Please select a dot<strong></div>";
                     newContent += "<button class='btn' id='cancelPanel'>Cancel</button>";
                     newContent +="</div>";
                     panel.html(newContent);
                     jQuery("#cancelPanel").click(function() {
                        self.cancel();
                     });
                    //
                }
            });
        }
        else {
            self.getSelectAnnotMsg();
            return;
        }
    });
    // end edit
} //end manage


annotools.prototype.addEditedAnnot = function (editedAnnot) {
    this.saveEditedAnnot(editedAnnot);
    this.displayGeoAnnots();
}

annotools.prototype.saveEditedAnnot = function (annotation) {
    var self = this;

    jQuery.ajax({
        'type': 'POST',
        url: 'api/Data/getAnnotSpatial.php',
        data: annotation,
        success: function (res, err) {
            console.log("response: ");
            console.log(res);
            if(res == "unauthorized"){
                alert("Error saving markup!");
            } else {   
                //alert("Successfully edit markup!");
            }
            console.log(err);
            self.getMultiAnnot();
            console.log('succesfully posted');
        }
    })
}

annotools.prototype.getSuperuser = function(annotation) {
    
    var self = this;
    var defaultSuperuser = 'Tianhao.Zhao';
    var isSuperuserExist = annotation.properties.annotations.hasOwnProperty('superuser');
    var annotSuperuser = '';
    
    if (isSuperuserExist) {
        var tmpSuperuser = annotation.properties.annotations.superuser;
        if (typeof tmpSuperuser != 'string') {
            tmpSuperuser = tmpSuperuser.toString();
        }
        if (tmpSuperuser && tmpSuperuser.length > 0) {
            annotSuperuser = tmpSuperuser;
        }
        else {
            annotSuperuser = defaultSuperuser;
        }
    }
    else {
        annotSuperuser = defaultSuperuser;
    }
    
    console.log('annotSuperuser: ' + annotSuperuser);
    
    return annotSuperuser;   
}

annotools.prototype.getDotToolDefaultKey = function(annotation) {
    
    var self = this;
    var defaultDotToolKey = 'dot1';
    var isDefaultDotToolKeyExist = annotation.properties.annotations.hasOwnProperty('secret');
    var annotDotToolKey = '';
    
    if (isDefaultDotToolKeyExist) {
        var tmpKey = annotation.properties.annotations.secret;
        if (typeof tmpKey != 'string') {
            tmpKey = tmpKey.toString();
        }
        if (tmpKey && tmpKey.length > 0) {
            annotDotToolKey = tmpKey;
        }
        else {
            annotDotToolKey = defaultDotToolKey;
        }
    }
    else {
        annotDotToolKey = defaultDotToolKey;
    }
    
    console.log('annotDotToolKey: ' + annotDotToolKey);
    
    return annotDotToolKey;   
    
}

annotools.prototype.isUserAuthorized = function(annotation) {
	
    var self = this;
	var isAuthorized = false;
	
    var isUsernameExist = annotation.properties.annotations.hasOwnProperty('username');
    var annotUsername = [];
    var isSuperuserExist = annotation.properties.annotations.hasOwnProperty('superuser');
    var annotSuperuser = '';
	var currentUsername = self.username.toString();
	
    if (isUsernameExist) {
        annotUsername = annotation.properties.annotations.username[0].toString();
    }
                 
    if (isSuperuserExist) {
        annotSuperuser = annotation.properties.annotations.superuser;
        if (typeof annotSuperuser != 'string') {
            annotSuperuser = annotSuperuser.toString();
        }
    }
   
	if ((annotUsername == currentUsername) || (annotSuperuser == currentUsername) || (!isUsernameExist) || (!isSuperuserExist)) {
		isAuthorized = true;
	}
	
	return isAuthorized;
				 
}

annotools.prototype.getUnauthorizedMsg = function() {
    
    return alert('Error deleting markup! You are not authorized to perform this operation');
}

annotools.prototype.getSelectAnnotMsg = function() {
    
    return alert('Please select a dot');
}

annotools.prototype.isDotToolExecutionId = function(annotation) {
    
    var isExecutionId = false;
    
    if(annotation.provenance.analysis.execution_id.startsWith('dotnuclei')) {
        isExecutionId = true;
    }
    return isExecutionId;
}

annotools.prototype.generateEditedGeoTemplateTypePoint = function (annotation, annotId) {
    
    var self = this;

    // set values
    var geometryType = annotation.geometry.type;
    var cx = annotation.geometry.coordinates[0][0][0];
    var cy = annotation.geometry.coordinates[0][0][1];
    var objectType = annotation.object_type;
    var region = annotation.properties.annotations.region;
    var additionalAnnotation = annotation.properties.annotations.additional_annotation;
    var additionalNotes = annotation.properties.annotations.additional_notes;
    var secret = annotation.properties.annotations.secret;
    var username = self.username;
    var createdBy = annotation.properties.annotations.created_by;
    var createdOn = annotation.properties.annotations.created_on;
    var updatedBy = self.username;
    var updatedOn = Date.now();
    var superuser = annotation.properties.annotations.superuser;
    var objectIdOld = annotId;
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
	
     /*
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
     console.log(createdOn);
     console.log(updatedBy);
     console.log(updatedOn);
     console.log(superuser);
     console.log(objectIdOld);
     console.log(radius);
     console.log(fillColor);
     console.log(circleIdOld);
     console.log(executionId);
     console.log(caseId);
     console.log(subjectId);
     console.log(annotId);
     */

     var editedGeoAnnot = {
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
                    'created_on': createdOn,
                    'updated_by': updatedBy,
                    'updated_on': updatedOn,
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
			  
        return editedGeoAnnot;
}

annotools.prototype.cancel = function() {
    var self = this;
    jQuery('#panel').hide('slide');
    self.getMultiAnnot();  
}