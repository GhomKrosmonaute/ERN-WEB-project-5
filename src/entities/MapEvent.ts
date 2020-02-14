
import mapboxgl from 'mapbox-gl'
import moment from 'moment'
import Storage from '../app/Storage'
import App from '../app/App'
import { MapEventOptions } from '../@types/interfaces'
import { Status } from '../@types/types'

moment.locale('fr-FR')

export default class MapEvent {

    public marker:mapboxgl.Marker
    public popup:mapboxgl.Popup
    private options:MapEventOptions

    constructor(
        private app:App,
        mapEventOptions?:MapEventOptions
    ){

        this.options = mapEventOptions || this.app.mapEventOptions

        Storage.set( 'events', this.options.id, this.options )

        this.popup = new mapboxgl.Popup({className:'popup'})
            .setLngLat([this.options.lng, this.options.lat])
            .addTo(app.map)

        this.popup.on('open', () => {
            const end = this.end.isValid() ? this.end : false
            this.popup.setHTML(`
                <h2> ${this.options.title} </h2>
                <p> ${this.options.description} </p>
                <p> 
                    ${end ? `
                        Du ${this.start.format('Do MMM YYYY')}
                        au ${this.end.format('Do MMM YYYY')}
                    ` : `Le ${this.start.format('Do MMM YYYY')}`
                    }
                </p>
                <span style="color:${this.color}"> ${this.message} </span>
            `)
        })

        this.marker = new mapboxgl.Marker()
            .setLngLat([this.options.lng,this.options.lat])
            .setDraggable(true)
            .setPopup(this.popup)
            .addTo(app.map)

        this.marker.on('dragstart', () => this.addToForm() )
        this.marker.on('dragend', () => this.addToForm() )
        this.marker.getElement().addEventListener('click', () => {
            this.app.openPanel()
            this.addToForm()
        })

        this.marker.getElement().setAttribute( 'title', this.message || this.options.title )
        this.marker.getElement().querySelector('g[fill="#3FB1CE"]')?.setAttribute('fill',this.color)

    }

    public get start(): moment.Moment { return moment(this.options.start) }
    public get end(): moment.Moment { return moment(this.options.end) }
    public get color(): 'red' | 'orange' | 'green' {
        switch(this.status){
            case 'in three days'  : return 'orange'
            case 'not yet passed' : return 'green'
            default : return 'red'
        }
    }
    public get message(): string {
        switch(this.status){
            case 'in three days'  : return 'Commence dans ' + this.start.fromNow()
            case 'not yet passed' : return ''
            default : return 'L\'évenement est passé.'
        }
    }
    public get status(): Status {
        const timeout = (this.start.unix() * 1000) - Date.now()
        if(timeout > 1000 * 60 * 60 * 24 * 3){
            return 'not yet passed'
        }else if(timeout < 0){
            return 'past'
        }
        return 'in three days'
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