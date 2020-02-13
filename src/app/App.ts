
import mapboxgl, { MapMouseEvent, Marker } from 'mapbox-gl'
import MapEvent from "../entities/MapEvent"
import Storage from "./Storage"
import { MapEventOptions, Form } from '../@types/interfaces'

export default class App {

    public map:mapboxgl.Map
    public events:Map<string,MapEvent> = new Map()
    public $delete:HTMLButtonElement
    public $cancel:HTMLButtonElement
    public $submit:HTMLButtonElement
    public $refresh:HTMLButtonElement
    public $deleteAll:HTMLButtonElement
    public panelIsOpen:boolean = false

    constructor(
        public $panel:HTMLDivElement = document.getElementById('panel') as HTMLDivElement,
        public $map:HTMLDivElement = document.getElementById('map') as HTMLDivElement
    ){

        for(const button of ['delete','cancel','submit','refresh','deleteAll'])
        (this as any)['$'+button] = this.$panel.querySelector('.'+button) as HTMLButtonElement

        mapboxgl.accessToken = 'pk.eyJ1IjoiZ2hvbSIsImEiOiJjazZnYnQ0bHQwa3ZhM2ttbDZ1bXJ1MGMyIn0.OPZcY_xSCyutWX6XbmWraw'
        
        this.initMap().load().setMapListeners().setButtonListeners()

    }

    public get form(): Form {
        const object:any = {}
        for(const classe of 'lat,lng,title,description,start,end,id'.split(','))
        object[classe] = this.$panel.querySelector('.' + classe) as HTMLInputElement
        return object as Form
    }

    public get mapEventOptions(): MapEventOptions {
        const form = this.form
        return {
            id: form.id.value,
            lat: Number(form.lat.value),
            lng: Number(form.lng.value),
            title: form.title.value,
            description: form.description.value,
            start: form.start.value,
            end: form.end.value
        }
    }

    private initMap(): App {

        this.map = new mapboxgl.Map({
            container: this.$map,
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [2.448818, 46.684029],
            zoom: 5,
            minZoom: 5,
            maxZoom: 18,
            trackResize: true,
            customAttribution: 'Event Manager by Ghom &copy;'
        })

        return this

    }

    private setMapListeners(): App {

        this.map.on('click', (e:MapMouseEvent) => {

            console.log(e.lngLat)
            
            if(this.panelIsOpen){
                // fermeture du panel
                this.closePanel()
            }else{
                // ouverture du panel avec les champs vides
                this.emptyForm(e).openPanel()
            }

        })

        return this
    }

    private emptyForm( e:MapMouseEvent ): App {
        const form = this.form
        form.id.value = String(Date.now())
        form.lat.value = String(e.lngLat.lat)
        form.lng.value = String(e.lngLat.lng)
        form.start.value = (new Date()).toISOString().slice(0,10)
        for(const classe of ['title','description','end'])
        (form as any)[classe].value = ''
        return this
    }

    private setButtonListeners(): App {
        this.$delete.onclick = e => {

            const form = this.form
            const { id } = this.mapEventOptions
            
            for(const input in form)
            (form as any)[input].value = ''
            
            console.log(this.events.get(id))
            
            this.events.get(id)?.remove()
            this.closePanel()
            
        }
        this.$cancel.onclick = e => this.closePanel()
        this.$submit.onclick = e => this.submit()
        this.$deleteAll.onclick = e => this.clear(true).closePanel()
        this.$refresh.onclick = e => this.refresh().closePanel()

        return this
    }

    public submit(): App {
        const options = this.mapEventOptions
        this.events.set( options.id, new MapEvent( this, options ) )
        this.closePanel()
        return this
    }

    public openPanel(): App {
        this.$panel.style.left = '0'
        this.panelIsOpen = true
        return this
    }

    public closePanel(): App {
        this.$panel.style.left = '-300px'
        this.panelIsOpen = false
        return this
    }

    public clear( hard:boolean ): App {
        this.events.forEach( event => event.remove(hard) )
        return this
    }

    public load(): App {

        Storage.forEach( 'events', (mapEventOptions:MapEventOptions, id:string) => {
            
            this.events.set( id, MapEvent.fromStorage( this, mapEventOptions ) )
            const marker = (this.events.get( id ) as MapEvent).marker

            marker.on('dragstart', (function(marker:Marker){
                this.events.get( this.id ).addToForm()
            }).bind({ events: this.events, id }))

            marker.on('dragend', (function(marker:Marker){
                this.events.get( this.id ).addToForm()
            }).bind({ events: this.events, id }))
        })
        
        return this
    }

    public refresh(): App {
        this.clear(false).load()
        return this
    }

}