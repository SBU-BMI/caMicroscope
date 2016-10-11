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
      'radius': 4,
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

/*
annotools.prototype.test = function() {
    alert('hello alina');
}
*/


// under development
annotools.prototype.convertCircleToGeo = function (annotation) {
 
    var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x), this.imagingHelper.physicalToDataY(annotation.y))
	var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x + annotation.w), this.imagingHelper.physicalToDataY(annotation.y + annotation.h))

    /* Compute footprint(area)*/
	var physicalW = this.imagingHelper.logicalToPhysicalX(annotation.w);
	var helper = this.imagingHelper;
	var dataW  = helper.physicalToDataX(physicalW);
	var radius = dataW / 2;
	
	var area = radius * radius * Math.PI;
    
	var coordinates = [];
	var x = annotation.x;
	var y = annotation.y;
	var w = annotation.w;
	var h = annotation.h;
	var r = w / 2;
	var cx = x + r;
	var cy = y + r;
	var geoAnnot = this.generateGeoTemplateTypePoint();
	coordinates.push([]);
	// coordinates[0].push([])
	coordinates[0].push([cx, cy]);
	//geoAnnot.x = x;
	//geoAnnot.y = y;
    geoAnnot.x = cx;
    geoAnnot.y = cy;
    
    geoAnnot.properties.radius = r;
    
	geoAnnot.footprint = area;
	geoAnnot.geometry.coordinates = coordinates;

  return geoAnnot;
}

