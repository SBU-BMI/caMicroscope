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
    
    //geoAnnot.footprint = area;
    geoAnnot.geometry.coordinates = coordinates;

    return geoAnnot;
}

/*
annotools.prototype.generatePointSVG = function (annotations) {

}

annotools.prototype.displayGeoPointAnnots = function () {
	
	var geoJSONs = this.annotations;
	
    this.generatePointSVG(geoJSONs);
    
    var renderStartTime = 9;
    var renderEndTime = 23;
}
*/

annotools.prototype.generateCircleSVG = function(annotationId, nativepoints, annotools) {

    var svgHtml;
    var id = annotationId;
    var nativepoints = nativepoints;

    var currentRadius = 3;
	var hoverRadius = currentRadius * 4;
    var fillColor = '#ffff00';
    var hoverColor = '#ffff00';
	
    var response = annotools.getProperties(annotationId);
	var result = JSON.parse(response.responseText);
    var lymphocyteRegion = 'Lymphocyte';

    // console.log(JSON.stringify(result, null, 4));
    if (result[0].properties.annotations.region === lymphocyteRegion) {
        fillColor = 'lime';
        hoverColor = 'lime';
    }
    
    for (var k = 0; k < nativepoints.length; k++) {

        var cx = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0]);
        var cy = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1]);
				
        svgHtml += '<circle  class="annotationsvg" id="' + id + '" ';
        svgHtml += 'cx="' + cx + '" cy="' + cy + '" r="' + currentRadius + '" fill="' + fillColor + '" ';
        svgHtml += 'onmouseover = "evt.target.setAttribute(\'r\',' + hoverRadius + ');';
        svgHtml += 'evt.target.setAttribute(\'fill\',\'' + hoverColor + '\'); "';
        svgHtml += 'onmouseout = "evt.target.setAttribute(\'r\',' + currentRadius + ');'
        svgHtml += 'evt.target.setAttribute(\'fill\',\'' + fillColor + '\'); "';
        svgHtml += '/>';
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

