
import mapboxgl, { MapMouseEvent } from 'mapbox-gl'
import MapEvent from "../entities/MapEvent"
import Storage from "./Storage"
import { MapEventOptions, Form } from '../@types/interfaces'

export default class App {

    public map:mapboxgl.Map
    public events:Map<string,MapEvent> = new Map()
    public $delete:HTMLButtonElement
    public $cancel:HTMLButtonElement
    public $submit:HTMLButtonElement

    constructor(
        private $panel:HTMLDivElement = document.getElementById('panel') as HTMLDivElement,
        private $map:HTMLDivElement = document.getElementById('map') as HTMLDivElement
    ){

        this.$delete = this.$panel.querySelector('.delete') as HTMLButtonElement
        this.$cancel = this.$panel.querySelector('.cancel') as HTMLButtonElement
        this.$submit = this.$panel.querySelector('.submit') as HTMLButtonElement

        mapboxgl.accessToken = 'pk.eyJ1IjoiZ2hvbSIsImEiOiJjazZnYnQ0bHQwa3ZhM2ttbDZ1bXJ1MGMyIn0.OPZcY_xSCyutWX6XbmWraw'
        
        this.initMap().setMapListeners().setButtonListeners()

    }

    public get form(): Form {
        const object:any = {}
        for(const classe of 'lat,lng,title,description,start,end,id'.split(','))
        object[classe] = this.$panel.querySelector('.' + classe) as HTMLInputElement
        return object as Form
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

        this.map.on('load', () => {
            Storage.forEach( 'events', (mapEventOptions:MapEventOptions, id:string) => {
                this.events.set( id, MapEvent.fromStorage( this, mapEventOptions ) )
            })
        })

        this.map.on('click', (e:MapMouseEvent) => {

            console.log(e)

            const form = this.form
            const entry = Array.from(this.events).find( entry => entry[1].clicked(e.lngLat) )

            if(entry){
                entry[1].addToForm()
            }else{
                form.id.value = String(Date.now())
                form.lat.value = String(e.lngLat.lat)
                form.lng.value = String(e.lngLat.lng)
                form.start.value = (new Date()).toISOString().slice(0,10)
                for(const classe of ['title','description','end'])
                (form as any)[classe].value = ''
            }

            this.$panel.style.left = '0'
            form.title.focus()

        })

        return this
    }

    private setButtonListeners(): App {
        this.$cancel.onclick = e => this.$panel.style.display = 'none'
        this.$delete.onclick = e => {

            const form = this.form
            const id = form.id.value

            for(const input in form)
            (form as any)[input].value = ''

            this.events.get(id)?.remove()

            this.$panel.style.left = '-300px'

        }
        this.$submit.onclick = e => {

            this.$panel.style.left = '-300px'
            this.submit()

        }

        return this
    }

    public submit(): App {
        const form = this.form
        this.events.set( form.id.value, new MapEvent( this, form ) )
        return this
    }

}