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
      'annotations': []
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
  
  return geoJSONTemplateTypePoint;
}


// under development
annotools.prototype.convertCircleToGeo = function (annotation) {
 
  var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x), this.imagingHelper.physicalToDataY(annotation.y))
  
  /* Compute footprint(area)*/
  var physicalX1 = this.imagingHelper.logicalToPhysicalX(annotation.x);
  var physicalY1 = this.imagingHelper.logicalToPhysicalY(annotation.y);
 
  var helper = this.imagingHelper;
  var dataX1 = helper.physicalToDataX(physicalX1);
  var dataY1 = helper.physicalToDataY(physicalY1);
  
  // The area of circle is pi times the square of its radius.
  var radius = 3;
  var area = radius * radius * Math.PI;

  var coordinates = [];
  var x = annotation.x;
  var y = annotation.y;
  var geoAnnot = this.generateGeoTemplateTypePoint();
  coordinates.push([]);
  // coordinates[0].push([])
  coordinates[0].push([x, y]);
  geoAnnot.x = x
  geoAnnot.y = y;
  geoAnnot.footprint = area;
  geoAnnot.geometry.coordinates = coordinates;

  return geoAnnot;
}