
import { Calendar, RenderDayCellEventArgs } from '@syncfusion/ej2-calendars'
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
    public $refresh:HTMLButtonElement
    public $deleteAll:HTMLButtonElement
    public $filters:{[key:string]:HTMLButtonElement}
    public panelIsOpen:boolean = false
    public calendar:Calendar

    constructor(
        public $panel:HTMLDivElement = document.getElementById('panel') as HTMLDivElement,
        public $map:HTMLDivElement = document.getElementById('map') as HTMLDivElement
    ){

        for(const button of ['delete','cancel','submit','refresh','deleteAll'])
        (this as any)['$'+button] = this.$panel.querySelector('.'+button) as HTMLButtonElement

        this.$filters = {}
        const colors = ['none','red','orange','green']
        for(const color of colors)
        this.$filters[color] = this.$panel.querySelector('.'+color) as HTMLButtonElement

        mapboxgl.accessToken = 'pk.eyJ1IjoiZ2hvbSIsImEiOiJjazZnYnQ0bHQwa3ZhM2ttbDZ1bXJ1MGMyIn0.OPZcY_xSCyutWX6XbmWraw'
        
        this.initMap().load().setMapListeners().setButtonListeners().setCalendar()

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
            customAttribution: 'Event Manager by &copy; Ghom'
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
            
            this.events.get(id)?.remove()
            this.closePanel()
            
        }
        this.$cancel.onclick = e => this.closePanel()
        this.$submit.onclick = e => this.submit()
        this.$deleteAll.onclick = e => this.clear(true).closePanel()
        this.$refresh.onclick = e => this.refresh().closePanel()

        for(const key in this.$filters)
        this.$filters[key].onclick = e => this.filter(key);

        (document.querySelector('button.open') as HTMLButtonElement).onclick = e => {
            (document.querySelector('#calendar') as HTMLButtonElement).style.top = '50vh'
        }

        return this
    }

    private setCalendar(): App {
        this.calendar = new Calendar({
            min: new Date(Date.now()-(1000*60*60*24*31)),
            max: new Date(Date.now()+(1000*60*60*24*31)),
            value: new Date(),
            renderDayCell: (args:RenderDayCellEventArgs) => {
                const event = Array.from(this.events.values()).find( e => {
                    const end = e.end.isValid() ? e.end.toDate().getTime() : e.start.toDate().getTime() + (1000*60*60*24)
                    if(args.date) return args.date.getTime() >= e.start.toDate().getTime() && args.date.getTime() <= end
                })
                if(event && args.element) args.element.classList.add(event.color)
            }
        })
        this.calendar.appendTo('#calendar');
        (document.querySelector('#calendar .close') as HTMLButtonElement).onclick = e => {
            (document.querySelector('#calendar') as HTMLButtonElement).style.top = '-50vh'
        }
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

    public filter( key:string ): App {
        this.events.forEach( event => {
            if(key === 'none')
            return event.marker.getElement().style.display = 'block'
            if(event.color !== key)
            event.marker.getElement().style.display = 'none'
            else event.marker.getElement().style.display = 'block'
        })
        return this
    }

    public load(): App {

        Storage.forEach( 'events', (mapEventOptions:MapEventOptions, id:string) => {
            this.events.set( id, MapEvent.fromStorage( this, mapEventOptions ) )
        })
        
        return this
    }

    public refresh(): App {
        this.clear(false).load()
        return this
    }

}