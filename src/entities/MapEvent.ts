
import mapboxgl from 'mapbox-gl'
import Storage from '../app/Storage'
import App from '../app/App'
import { MapEventOptions, Form } from '../@types/interfaces'

export default class MapEvent {

    public marker:mapboxgl.Marker
    private options:MapEventOptions

    constructor(
        private app:App,
        form:Form
    ){

        this.options = {
            id: form.id.value,
            lat: Number(form.lat.value),
            lng: Number(form.lng.value),
            title: form.title.value,
            description: form.description.value,
            start: form.start.value,
            end: form.end.value
        }

        Storage.set( 'events', this.options.id, this.options )

        this.marker = new mapboxgl.Marker()
            .setLngLat([this.options.lng,this.options.lat])
            .setPopup(
                new mapboxgl.Popup({className:'popup'})
                    .setLngLat([this.options.lng, this.options.lat])
                    .setHTML(`
                        <h2> ${this.options.title} </h2>
                        <p> ${this.options.description} </p>
                    `)
                    .addTo(this.app.map)
            )
            .addTo(app.map)

    }

    public clicked( mouse:{lng:number,lat:number} ): boolean {
        const border:number = 0.5
        return (
            mouse.lat > this.options.lat - border && mouse.lat < this.options.lat + border &&
            mouse.lng > this.options.lng - border && mouse.lng < this.options.lng + border            
        )
    }

    public addToForm(){
        const form = this.app.form
        for(const prop in this.options)
        (form as any)[prop].value = String((this.options as any)[prop])
    }

    public remove(): void {
        Storage.remove( 'events', this.options.id )
        this.app.events.delete( this.options.id )
        this.marker.remove()
    }

    public static fromStorage( app:App, options:MapEventOptions ): MapEvent {
        const event = new MapEvent( app, app.form )
        for(const option in options)
        (event.options as any)[option] = (options as any)[option]
        return event
    }

}