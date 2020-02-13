
export interface MapEventOptions {
    id: string
    lat: number
    lng: number
    title: string
    description: string
    start: string
    end: string
}

export interface Form {
    id: HTMLInputElement
    lat: HTMLInputElement
    lng: HTMLInputElement
    title: HTMLInputElement
    description: HTMLInputElement
    start: HTMLInputElement
    end: HTMLInputElement
}