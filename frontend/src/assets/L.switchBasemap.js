import L from "leaflet";
import $ from 'jquery';

// @ts-expect-error
L.Control.basemapsSwitcher = L.Control.extend({
    options: {
        position: 'topright',
    },
    // @ts-expect-error
    initialize: function(layers, options){
        L.Util.setOptions(this, options);
        // @ts-expect-error
        this.layers = layers
    },
    // @ts-expect-error
    onAdd: function (map){
        // @ts-expect-error
        const container = this.container = L.DomUtil.create('div', 'leaflet-control-basemapsSwitcher');

        this._createItems();
        // this._collapse();

        // container.addEventListener('mouseover', () => {
        //     this._expand();
        // })

        // container.addEventListener('mouseout', () => {
        //     this._collapse();
        // })

        return container;
    },

    _createItems() {
        // @ts-expect-error
        this.layers.forEach( (obj, index) => {

            obj.id = index

            const imgContainer = L.DomUtil.create('div', 'basemapImg');
            const img = L.DomUtil.create('div');
            const name = L.DomUtil.create('div', 'name');
            const check = L.DomUtil.create('div', 'check');
            name.innerHTML = obj.name

            if(obj.layer?._map){
                // @ts-expect-error
                this.activeMap = obj
                check.classList.add('activeMap');
            }

            img.style.backgroundImage = `url(${obj.icon})`;
            imgContainer.append(img)
            img.append(check)
            img.append(name)

            imgContainer.addEventListener('click', () =>{

                this._removeLayers(obj.layer);

                if(!obj.layer?._map){
                    // @ts-expect-error
                    obj.layer.addTo(this._map);
                    obj.layer.bringToBack()
                    // @ts-expect-error
                    this.activeMap = obj;
                    // this._collapse();
                    // @ts-expect-error
                    this._map.fire('basemapChange', { layer : obj.layer });

                    // Añadir
                    $(".check").removeClass('activeMap');


                    check.classList.add('activeMap');
                }

            })
            // @ts-expect-error
            this.container.append(imgContainer)

        })
    },
    // @ts-expect-error
    _removeLayers(layer){
        // @ts-expect-error
        this.layers.forEach( (obj) =>{
            if(obj.layer._leaflet_id !== layer._leaflet_id && obj.layer?._map) {
                // @ts-expect-error
                this._map.removeLayer(obj.layer);
            }
        })
    },

    _collapse(){
        // @ts-expect-error
        this.container.childNodes.forEach( (child, index) => {
            // @ts-expect-error
            if(index !== this.activeMap.id){
                child.classList.add('hidden')
                let check = child.querySelector('.check')
                check.classList.remove('activeMap')
            }
        })

    },

    _expand(){
        // @ts-expect-error
        this.container.childNodes.forEach( (child) => {
            child.classList.remove('hidden')
        })
    }

})
// @ts-expect-error
L.basemapsSwitcher = function(layers, options){
    // @ts-expect-error
    return new L.Control.basemapsSwitcher(layers, options);
}
