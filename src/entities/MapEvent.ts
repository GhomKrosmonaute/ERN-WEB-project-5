
import mapboxgl from 'mapbox-gl'
import Storage from '../app/Storage'
import App from '../app/App'
import { MapEventOptions, Form } from '../@types/interfaces'

export default class MapEvent {

    public marker:mapboxgl.Marker
    private options:MapEventOptions

    constructor(
        private app:App,
        mapEventOptions?:MapEventOptions
    ){

        this.options = mapEventOptions || this.app.mapEventOptions

        Storage.set( 'events', this.options.id, this.options )

        this.marker = new mapboxgl.Marker()
            .setLngLat([this.options.lng,this.options.lat])
            .setDraggable(true)
            .setPopup(
                new mapboxgl.Popup({className:'popup'})
                    .setLngLat([this.options.lng, this.options.lat])
                    .setHTML(`
                        <h2> ${this.options.title} </h2>
                        <p> ${this.options.description} </p>
                    `)
                    .addTo(app.map)
            )
            .addTo(app.map)

    }

    public addToForm(): MapEvent {
        const form = this.app.form
        for(const prop in this.options)
        (form as any)[prop].value = String((this.options as any)[prop])
        this.app.openPanel()
        return this
    }

    public remove( hard:boolean = true ): void {
        this.marker.remove()
        this.app.events.delete( this.options.id )
        if(hard) Storage.remove( 'events', this.options.id )
    }

    public static fromStorage( app:App, options:MapEventOptions ): MapEvent {
        const event = new MapEvent( app, options )
        for(const option in options)
        (event.options as any)[option] = (options as any)[option]
        return event
    }

}