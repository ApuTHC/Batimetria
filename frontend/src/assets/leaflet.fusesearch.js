import Fuse from 'fuse.js';
import "https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.js"
import L from "leaflet";

// From http://www.tutorialspoint.com/javascript/array_map.htm
if (!Array.prototype.map)
{// @ts-expect-error
  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };
}
// @ts-expect-error
L.Control.FuseSearch = L.Control.extend({
    
    includes: L.Evented.prototype,
    
    options: {
        position: 'topright',
        title: 'Search',
        panelTitle: '',
        placeholder: 'Search',
        caseSensitive: false,
        threshold: 0.5,
        maxResultLength: null,
        showResultFct: null,
        showInvisibleFeatures: true
    },
    // @ts-expect-error
    initialize: function(options) {
        L.setOptions(this, options);
        // @ts-expect-error
        this._panelOnLeftSide = (this.options.position.indexOf("left") !== -1);
    },
    // @ts-expect-error
    onAdd: function(map) {
        
        var ctrl = this._createControl();
        this._createPanel(map);
        this._setEventListeners();
        map.invalidateSize();
        
        return ctrl;
    },
    // @ts-expect-error
    onRemove: function(map) {
        
        this.hidePanel(map);
        this._clearEventListeners();
        this._clearPanel(map);
        this._clearControl();
        
        return this;
    },
    
    _createControl: function() {

        var className = 'leaflet-fusesearch-control',
            container = L.DomUtil.create('div', className);

        // Control to open the search panel
        // @ts-expect-error
        var butt = this._openButton = L.DomUtil.create('a', 'button', container);
        butt.href = '#';
        butt.title = this.options.title;
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.on(butt, 'click', stop)
                  .on(butt, 'mousedown', stop)
                  .on(butt, 'touchstart', stop)
                  .on(butt, 'mousewheel', stop)
                  .on(butt, 'MozMousePixelScroll', stop);
        L.DomEvent.on(butt, 'click', L.DomEvent.preventDefault);
        L.DomEvent.on(butt, 'click', this.showPanel, this);

        return container;
    },
    
    _clearControl: function() {
        // Unregister events to prevent memory leak
        // @ts-expect-error
        var butt = this._openButton;
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.off(butt, 'click', stop)
                  .off(butt, 'mousedown', stop)
                  .off(butt, 'touchstart', stop)
                  .off(butt, 'mousewheel', stop)
                  .off(butt, 'MozMousePixelScroll', stop);
        L.DomEvent.off(butt, 'click', L.DomEvent.preventDefault);
        L.DomEvent.off(butt, 'click', this.showPanel);
    },
    // @ts-expect-error
    _createPanel: function(map) {
        var _this = this;

        // Create the search panel
        var mapContainer = map.getContainer();
        var className = 'leaflet-fusesearch-panel',
            // @ts-expect-error
            pane = this._panel = L.DomUtil.create('div', className, mapContainer);
        
        // Make sure we don't drag the map when we interact with the content
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.on(pane, 'click', stop)
                .on(pane, 'dblclick', stop)
                .on(pane, 'mousedown', stop)
                .on(pane, 'touchstart', stop)
                .on(pane, 'mousewheel', stop)
                .on(pane, 'MozMousePixelScroll', stop);

        // place the pane on the same side as the control
        // @ts-expect-error
        if (this._panelOnLeftSide) {
            L.DomUtil.addClass(pane, 'left');
        } else {
            L.DomUtil.addClass(pane, 'right');
        }

        // Intermediate container to get the box sizing right
        var container = L.DomUtil.create('div', 'content', pane);
        
        var header = L.DomUtil.create('div', 'header', container);
        if (this.options.panelTitle) {
           var title = L.DomUtil.create('p', 'panel-title', header);
            title.innerHTML = this.options.panelTitle;
        }
        
        // Search image and input field
        L.DomUtil.create('img', 'search-image', header);
        // @ts-expect-error
        this._input = L.DomUtil.create('input', 'search-input', header);
        // @ts-expect-error
        this._input.maxLength = 30;
        // @ts-expect-error
        this._input.placeholder = this.options.placeholder;
        // @ts-expect-error
        this._input.onkeyup = function(evt) {
            var searchString = evt.currentTarget.value;
            _this.searchFeatures(searchString);
        };

        // Close button
        // @ts-expect-error
        var close = this._closeButton = L.DomUtil.create('a', 'close', header);
        close.innerHTML = '&times;';
        L.DomEvent.on(close, 'click', this.hidePanel, this);
        
        // Where the result will be listed
        // @ts-expect-error
        this._resultList = L.DomUtil.create('div', 'result-list', container); 
        
        return pane;
    },
    // @ts-expect-error
    _clearPanel: function(map) {

        // Unregister event handlers
        var stop = L.DomEvent.stopPropagation;
        // @ts-expect-error
        L.DomEvent.off(this._panel, 'click', stop)
        // @ts-expect-error
                  .off(this._panel, 'dblclick', stop)
        // @ts-expect-error
                  .off(this._panel, 'mousedown', stop)
        // @ts-expect-error
                  .off(this._panel, 'touchstart', stop)
        // @ts-expect-error
                  .off(this._panel, 'mousewheel', stop)
        // @ts-expect-error
                  .off(this._panel, 'MozMousePixelScroll', stop);

        // @ts-expect-error
        L.DomEvent.off(this._closeButton, 'click', this.hidePanel);

        var mapContainer = map.getContainer();
        // @ts-expect-error
        mapContainer.removeChild(this._panel);

        // @ts-expect-error
        this._panel = null;
    },

    _setEventListeners : function() {
        var that = this;
        // @ts-expect-error
        var input = this._input;
        // @ts-expect-error
        this._map.addEventListener('overlayadd', function() {
            that.searchFeatures(input.value);
        });
        // @ts-expect-error
        this._map.addEventListener('overlayremove', function() {
            that.searchFeatures(input.value);
        });
    },
    
    _clearEventListeners: function() {
        // @ts-expect-error
        this._map.removeEventListener('overlayadd');
        // @ts-expect-error
        this._map.removeEventListener('overlayremove');
    },

    isPanelVisible: function () {
        // @ts-expect-error
        return L.DomUtil.hasClass(this._panel, 'visible');
    },

    showPanel: function () {
        if (! this.isPanelVisible()) {
        // @ts-expect-error
            L.DomUtil.addClass(this._panel, 'visible');
            // Preserve map centre
        // @ts-expect-error
            this._map.panBy([this.getOffset() * 0.5, 0], {duration: 0.5});
        // @ts-expect-error
            this.fire('show');
        // @ts-expect-error
            this._input.select();
            // Search again as visibility of features might have changed
        // @ts-expect-error
            this.searchFeatures(this._input.value);
        }
    },
// @ts-expect-error
    hidePanel: function (e) {
        if (this.isPanelVisible()) {
            // @ts-expect-error
            L.DomUtil.removeClass(this._panel, 'visible');
            // Move back the map centre - only if we still hold this._map
            // as this might already have been cleared up by removeFrom()
            // @ts-expect-error
            if (null !== this._map) {
            // @ts-expect-error
                this._map.panBy([this.getOffset() * -0.5, 0], {duration: 0.5});
            }
            // @ts-expect-error
            this.fire('hide');
            if(e) {
                L.DomEvent.stopPropagation(e);
            }
        }
    },
    
    getOffset: function() {
        // @ts-expect-error
        if (this._panelOnLeftSide) {
        // @ts-expect-error
            return - this._panel.offsetWidth;
        } else {
        // @ts-expect-error
            return this._panel.offsetWidth;
        }
    },
// @ts-expect-error
    indexFeatures: function(data, keys) {

        var jsonFeatures = data.features || data;

// @ts-expect-error
        this._keys = keys;
// @ts-expect-error
        var properties = jsonFeatures.map(function(feature) {
            // Keep track of the original feature
            feature.properties._feature = feature;
            return feature.properties;
        });

        var options = {
            keys: keys,
            caseSensitive: this.options.caseSensitive,
            threshold : this.options.threshold
        };

// @ts-expect-error
        this._fuseIndex = new Fuse(properties, options);
    },
    // @ts-expect-error
    searchFeatures: function(string) {
        // @ts-expect-error
        var result = this._fuseIndex.search(string);
        
        // Empty result list
        var listItems = document.querySelectorAll(".result-item");
        for (let i = 0 ; i < listItems.length ; i++) {
            listItems[i].remove();
        }

        var resultList = document.querySelector('.result-list');
        var num = 0;
        var max = this.options.maxResultLength;
        for (var i in result) {
            var props = result[i];
            var feature = props.item._feature;
            var popup = this._getFeaturePopupIfVisible(feature);
            
            if (undefined !== popup || this.options.showInvisibleFeatures) {
                this.createResultItem(props.item, resultList, popup);
                if (undefined !== max && ++num === max)
                    break;
            }
        }
    },
    
    refresh: function() {
        // Reapply the search on the indexed features - useful if features have been filtered out
        if (this.isPanelVisible()) {
            // @ts-expect-error
            this.searchFeatures(this._input.value);
        }
    },
    // @ts-expect-error
    _getFeaturePopupIfVisible: function(feature) {
        var layer = feature.layer;
        // @ts-expect-error
        if (undefined !== layer && this._map.hasLayer(layer)) {
            return layer.getPopup();
        }
    },
    // @ts-expect-error
    createResultItem: function(props, container, popup) {
        var _this = this;
        var feature = props._feature;

        // Create a container and open the associated popup on click
        var resultItem = L.DomUtil.create('p', 'result-item', container);
        
        if (undefined !== popup) {
            L.DomUtil.addClass(resultItem, 'clickable');
            resultItem.onclick = function() {
                
                if (window.matchMedia("(max-width:480px)").matches) {
                    _this.hidePanel();
                    feature.layer.openPopup();
                } else {
                    _this._panAndPopup(feature, popup);
                }
            };
        }

        // Fill in the container with the user-supplied function if any,
        // otherwise display the feature properties used for the search.
        if (null !== this.options.showResultFct) {
            // @ts-expect-error
            this.options.showResultFct(feature, resultItem);
        } else {
            // @ts-expect-error
            var str = '<b>' + props[this._keys[0]] + '</b>';
            // @ts-expect-error
            for (var i = 1; i < this._keys.length; i++) {
            // @ts-expect-error
                str += '<br/>' + props[this._keys[i]];
            }
            resultItem.innerHTML = str;
        }

        return resultItem;
    },
    // @ts-expect-error
    _panAndPopup : function(feature, popup) {
        // Temporarily adapt the map padding so that the popup is not hidden by the search pane
    // @ts-expect-error
        if (this._panelOnLeftSide) {
            var oldPadding = popup.options.autoPanPaddingTopLeft;
            var newPadding = new L.Point(- this.getOffset(), 10);
            popup.options.autoPanPaddingTopLeft = newPadding;
            feature.layer.openPopup();
            popup.options.autoPanPaddingTopLeft = oldPadding;
        } else {
            var oldPadding = popup.options.autoPanPaddingBottomRight;
            var newPadding = new L.Point(this.getOffset(), 10);
            popup.options.autoPanPaddingBottomRight = newPadding;
            feature.layer.openPopup();
            popup.options.autoPanPaddingBottomRight = oldPadding;
        }
    }
});
// @ts-expect-error
L.control.fuseSearch = function(options) {
    // @ts-expect-error
    return new L.Control.FuseSearch(options);
};
