
import * as L from 'leaflet'
import Storage from '../app/Storage'
import App from '../app/App'

export default class MapEvent {

    public marker:L.Marker

    constructor(
        private app:App,
        private options:any,
        private id:string = String(Date.now())
    ){
        Storage.set( 'events', id, options )
        this.marker = L.marker([options.lat,options.lng]).addTo(app.map)
    }

    remove(){
        Storage.remove( 'events', this.id )
        this.marker.remove()
    }

    popup(){
        L.popup()
            .setLatLng(L.latLng( this.options.lat, this.options.lng ))
            .setContent(`
                <h2> ${this.options.title} </h2>
                <p> ${this.options.description} </p>
            `)
            .openOn(this.app.map)
    }

}