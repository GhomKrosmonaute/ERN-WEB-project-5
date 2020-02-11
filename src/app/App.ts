
import * as L from "leaflet"
import MapEvent from "../entities/MapEvent"
import Storage from "./Storage"

export default class App {

    public map:L.Map
    private events:MapEvent[] = []

    constructor(
        private $panel:HTMLElement = document.getElementById('panel'),
        private $map:HTMLElement = document.getElementById('map')
    ){
        
        this.initMap()

        this.map.on('load', () => {
            Storage.forEach( 'events', (mapEventOptions:any, key:string) => {
                this.events.push( new MapEvent( this, mapEventOptions, key ) )
            })
        })

        this.map.on('click', e => {

            console.log(e);

            // envoie les infos du clic dans le panel
            // envoie aussi l'id de l'event cliqué si il y en a un pas loin du curseur

            // si un event est cliqué, affiche une popup

            const form = this.form

            form.lat.value = (e as any).latlng.lat
            form.lng.value = (e as any).latlng.lng
            form.title.value = '';
            form.description.value = '';
            form.start.value = '';
            form.end.value = '';
            form.id.value = ''; // l'id de l'event visé ou rien

            this.$panel.style.display = 'flex'
            form.title.focus()

        });

        (this.$panel.querySelector('.submit') as HTMLElement).onclick = e => {

            // send to storage

            const form = this.form

            const event = {
                id: form.id.value,
                lat: Number(form.lat.value),
                lng: Number(form.lng.value),
                title: form.title.value,
                description: form.description.value,
                start: form.start.value,
                end: form.end.value,
            }

            this.$panel.style.display = 'none'

            this.events.push( new MapEvent( this, event, event.id ? event.id : String(Date.now()) ) )

        }

    }

    private get form(): any {
        return {
            lat: this.$panel.querySelector('.lat'),
            lng: this.$panel.querySelector('.lng'),
            title: this.$panel.querySelector('.title'),
            description: this.$panel.querySelector('.description'),
            start: this.$panel.querySelector('.start'),
            end: this.$panel.querySelector('.end'),
            id: this.$panel.querySelector('.id')
        }
    }

    private initMap(): App {

        this.map = L.map(this.$map)
            .setView(L.latLng(46.684029, 2.448818), 6)
            .invalidateSize(true)
            .setMaxBounds(L.latLngBounds(
                L.latLng(51.04139389812637, -4.350585937500001),
                L.latLng(41.50857729743935, 7.998046875000001)
            ))

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Event Manager by Ghom &copy;',
            maxZoom: 18,
            minZoom: 6,
            id: 'mapbox/streets-v11',
            accessToken: 'pk.eyJ1IjoiZ2hvbSIsImEiOiJjazZnYnQ0bHQwa3ZhM2ttbDZ1bXJ1MGMyIn0.OPZcY_xSCyutWX6XbmWraw'
        }).addTo(this.map)

        return this

    }

    public addMapEvent( options:any ): App {
        this.events.push( new MapEvent( this, options ) )
        return this
    }

}