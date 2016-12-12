var ToolBar = function (element, options) {
  // console.log(options)
  this.annotools = options.annotool
  // console.log(this.annotools)
  this.FilterTools = options.FilterTools
  this.source = element // The Tool Source Element
  this.top = options.top || '0px'
  this.left = options.left || '150px' // The Tool Location   
  this.height = options.height || '30px'
  this.width = options.width || '270px'
  this.zindex = options.zindex || '100' // To Make Sure The Tool Appears in the Front

  this.iid = options.iid || null
  this.annotationActive = isAnnotationActive()

}
ToolBar.prototype.showMessage = function (msg) {
  console.log(msg)
}

ToolBar.prototype.algorithmSelector = function () {
  var self = this
  var ftree
  xxx = []
}

var available_colors = ['lime', 'red', 'blue', 'orange']
var algorithm_color = {}

function goodalgo (data, status) {
  // console.log(data)
  
  /*
  data.push({

    "title": "Human Test",
    "provenance": {
      "analysis_execution_id": "humantest"
    }
  });
  */  
  var blob = []
  for (i = 0;i < data.length;i++) {
    var n = {}
    //console.log(data[i])
    n.title = "<div class='colorBox' style='background:" + available_colors[i] + "'></div>" + data[i].title
    n.key = i.toString()
    n.refKey = data[i].provenance.analysis_execution_id
    if (n.refKey == 'lymphocyte_necrosis_6' || n.refKey == 'humanmark' || n.refKey == 'lymphocyte_necrosis_555_lowresmax') {
      n.selected = true
    }

    n.color = available_colors[i]
    algorithm_color[data[i].provenance.analysis_execution_id] = available_colors[i]
    blob.push(n)
  }
  ftree = jQuery('#tree').fancytree({
    source: [{
      title: 'Algorithms', key: '1', folder: true,
      children: blob,
      expanded: true
    }],
    minExpandLevel: 1, // 1: root node is not collapsible
    activeVisible: true, // Make sure, active nodes are visible (expanded).
    aria: false, // Enable WAI-ARIA support.
    autoActivate: true, // Automatically activate a node when it is focused (using keys).
    autoCollapse: false, // Automatically collapse all siblings, when a node is expanded.
    autoScroll: false, // Automatically scroll nodes into visible area.
    clickFolderMode: 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
    checkbox: true, // Show checkboxes.
    debugLevel: 2, // 0:quiet, 1:normal, 2:debug
    disabled: false, // Disable control
    focusOnSelect: false, // Set focus when node is checked by a mouse click
    generateIds: false, // Generate id attributes like <span id='fancytree-id-KEY'>
    idPrefix: 'ft_', // Used to generate node id´s like <span id='fancytree-id-<key>'>.
    icons: true, // Display node icons.
    keyboard: true, // Support keyboard navigation.
    keyPathSeparator: '/', // Used by node.getKeyPath() and tree.loadKeyPath().
    minExpandLevel: 1, // 1: root node is not collapsible
    quicksearch: false, // Navigate to next node by typing the first letters.
    selectMode: 2, // 1:single, 2:multi, 3:multi-hier
    tabbable: true, // Whole tree behaves as one single control
    titlesTabbable: false, // Node titles can receive keyboard focus
    beforeSelect: function (event, data) {
      // A node is about to be selected: prevent this for folders:
      if (data.node.isFolder()) {
        return false
      }
    },
    select: function (event, data) {
      jQuery('#tree').attr('algotree', true)
      var node = data.node

      console.log('!SELECTED NODE : ' + node.title)
      targetType = data.targetType
      console.log(node);
      annotool.getMultiAnnot()
    }
  })
  jQuery('#tree').attr('algotree', true)
  annotool.getMultiAnnot()
}

ToolBar.prototype.toggleAlgorithmSelector = function () {
  if (!jQuery('#algosel').attr('eb')) {
    jQuery('#algosel').attr('eb', true)
    // console.log("initializing...")
    jQuery('#algosel').css({
      'width': '300px',
      'zIndex': 199,
      'visibility': 'hidden'
    })
    jQuery('#algosel').on('mousedown', function (e) {
      jQuery(this).addClass('draggable').parents().on('mousemove', function (e) {
        jQuery('.draggable').offset({
          top: e.pageY - jQuery('.draggable').outerHeight() / 2,
          left: e.pageX - jQuery('.draggable').outerWidth() / 2
        }).on('mouseup', function () {
          jQuery(this).removeClass('draggable')
        })
      })
      e.preventDefault()
    }).on('mouseup', function () {
      jQuery('.draggable').removeClass('draggable')
    })
  }
  if (jQuery('#algosel').css('visibility') == 'visible') {
    jQuery('#algosel').css({
      'visibility': 'hidden'
    })
  } else {
    jQuery('#algosel').css({
      'visibility': 'visible'
    })
  }
  this.showMessage('Algorithm Selection Toggled')
}

ToolBar.prototype.setNormalMode = function() {
  this.annotools.mode = 'normal';
  jQuery("canvas").css("cursor", "default");
  jQuery("#drawRectangleButton").removeClass('active');
  jQuery("#drawFreelineButton").removeClass('active');
  jQuery("#drawDotButton").removeClass("active");   // Dot Tool
  jQuery("#freeLineMarkupButton").removeClass("active");
  jQuery("#markuppanel").hide();
  this.annotools.drawLayer.hide()
  this.annotools.addMouseEvents()       
}

ToolBar.prototype.createButtons = function () {
  // this.tool = jQ(this.source)
  var tool = jQuery('#' + 'tool') // Temporary dom element while we clean up mootools
  var self = this


  // Fetch algorithms for Image
  jQuery(document).ready(function () {
    // console.log(options)
    // var self= this

    jQuery.get('api/Data/getAlgorithmsForImage.php?iid=' + self.iid, function (data) {
      d = JSON.parse(data)

      goodalgo(d, null)
    })
    // console.log("here")
    jQuery('#submitbtn').click(function () {
      var selKeys = jQuery('#tree').fancytree('getTree').getSelectedNodes()
      var param = ''
      for (i = 0;i < selKeys.length;i++) {
        param = param + '&Val' + (i + 1).toString() + '=' + selKeys[i].title
      }
    })
  })

  tool.css({
    'position': 'absolute',
    'left': this.left,
    'top': this.top,
    'width': this.width,
    'height': this.height,
    'z-index': this.zindex
  })

  tool.addClass('annotools') // Update Styles
  // this.tool.makeDraggable(); //Make it Draggable.


  if (this.annotationActive) {

    /*
     * Ganesh
     * Mootools to Jquery for creation of toolbar buttons
     */

    this.filterbutton = jQuery('<img>', {
      'title': 'Filter Markups',
      'class': 'toolButton inactive',
      'src': 'images/filter.svg'
    })
    tool.append(this.filterbutton) // Filter Button

    this.hidebutton = jQuery('<img>', {
      'title': 'Show/Hide Markups',
      'class': 'toolButton inactive',
      'src': 'images/hide.svg'
    })
    tool.append(this.hidebutton)

    this.heatDownButton = jQuery('<img>', {
        'title': 'Decrease opacity',
        'class': 'toolButton inactive',
        'src': 'images/Opacity_down.svg',
        'id': 'heatDownButton',
    });
    tool.append(this.heatDownButton);     // Button for decreasing opacity

    this.heatUpButton = jQuery('<img>', {
	'title': 'Increase opacity',
	'class': 'toolButton inactive',
	'src': 'images/Opacity_up.svg',
	'id': 'heatUpButton',
    });
    tool.append(this.heatUpButton);	// Button for increasing opacity

    this.colorMapButton = jQuery('<img>', {
      'class': 'colorMapButton',
      'title': 'ColorMap',
      'src': 'images/colors.svg'
    })
    tool.append(this.colorMapButton)

    //this.spacer = jQuery('<img>', {
    //  'class': 'spacerButton inactive',
    //  'src': 'images/divider.svg'
    //})
    //tool.append(this.spacer)

    this.showWeightPanel = jQuery('<img>', {
        'title': 'Show weight panel',
        'class': 'toolButton inactive',
        'src': 'images/Heatmap.svg',
        'id': 'showWeightPanel',
    });
    tool.append(this.showWeightPanel);    // Button for showing the weight panel

    this.freeMarkupButton = jQuery('<img>', {
      'title': 'Free line Markup',
      'class': 'toolButton inactive',
      'src': 'images/pencil.svg',
      'id': 'freeLineMarkupButton'
    })
    tool.append(this.freeMarkupButton) 	  // Markup Pencil Tool
	
   
    /*
     * Event handlers on click for the buttons
     */
    this.hidebutton.on('click', function () {
      this.annotools.toggleMarkups()
    }.bind(this))

    this.filterbutton.on('click', function () {
      this.toggleAlgorithmSelector()
    // this.removeMouseEvents()
    // this.promptForAnnotation(null, "filter", this, null)
    }.bind(this))

    this.heatUpButton.on('click', function () {
	this.annotools.heatmap_opacity = Math.min(1, this.annotools.heatmap_opacity + 0.1);
	this.annotools.getMultiAnnot();
    }.bind(this))

    this.heatDownButton.on('click', function () {
	this.annotools.heatmap_opacity = Math.max(0, this.annotools.heatmap_opacity - 0.1);
	this.annotools.getMultiAnnot();
    }.bind(this))

    this.showWeightPanel.on('click', function () {
	console.log('click on showing weight panel');
	if (jQuery('#weightpanel').is(":visible"))
	{
		jQuery('#weightpanel').hide();
	}
	else
	{
		if (this.annotools.loadedWeight == false) {
			this.annotools.updateHeatVarFromSlideBar();
			this.annotools.loadedWeight = true;
		}
		console.log(this.annotools.heat_weight);
		jQuery('#weightpanel').show();
	}
    }.bind(this))


    this.freeMarkupButton.on('click', function () {

      if(this.annotools.mode == 'free_markup'){
        this.setNormalMode();
      } else {
        //set pencil mode
        this.annotools.mode = 'free_markup'
        this.annotools.drawMarkups()

        jQuery("canvas").css("cursor", "crosshair");
        //jQuery("drawFreelineButton").css("opacity", 1);
        jQuery("#drawRectangleButton").removeClass("active");
        jQuery("#drawDotButton").removeClass("active");     // Dot Tool
	jQuery("#drawFreelineButton").removeClass("active");
        jQuery("#freeLineMarkupButton").addClass("active");
	jQuery("#markuppanel").show();

	// Check if being on moving mode --> switch to drawing mode
	if (document.getElementById("rb_Moving").checked) {
		console.log('do switching');
		document.getElementById('rb_Moving').checked = false;
		document.getElementById('LymPos').checked = true;
	}
      }

    }.bind(this))


    var toolButtons = jQuery('.toolButton')
    toolButtons.each(function () {
      jQuery(this).on({
        'mouseenter': function () {
          this.addClass('selected')
        },
        'mouseleave': function () {
          this.removeClass('selected')
        }
      })
    })

    /*
    for (var i = 0; i < toolButtons.length; i++) {
        toolButtons[i].on({
            'mouseenter': function () {
                this.addClass('selected')
            },
            'mouseleave': function () {
                this.removeClass('selected')
            }
        })
    }
    */

    /*
     * Ganesh: Using the Mootools version as the jquery version breaks things 
     *
    this.messageBox = jQuery('<div>', {
        'id': 'messageBox'
    })
    jQuery("body").append(this.messageBox)
    */

  }
  this.ajaxBusy = jQuery('<img>', {
    'class': 'colorMapButton',
    'id': 'ajaxBusy',
    'style': 'scale(0.5, 1)',
    'src': 'images/progress_bar.gif'
  })
  tool.append(this.ajaxBusy)
  this.ajaxBusy.hide()

  this.titleButton = jQuery('<p>', {
    'class': 'titleButton',
    'text': 'caMicroscope'
  })
  tool.append(this.titleButton)

  this.iidbutton = jQuery('<p>', {
    'class': 'iidButton',
    'text': 'SubjectID :' + this.iid
  })
  tool.append(this.iidbutton)

  /* ASHISH - disable quit button
      this.quitbutton = new Element('img', {
          'title': 'quit',
          'class': 'toolButton',
          'src': 'images/quit.svg'
      }).inject(this.tool) //Quit Button
  */
  if (this.annotationActive) {
  }
}

