
export default class Storage {

    public static set( name:string, key:string, value:any ): void {
        
        let store = Storage.ensure( name )
        store[key] = value
        localStorage.setItem(name,JSON.stringify(store))

    }

    public static remove( name:string, key:string ): void {

        let store = Storage.ensure( name )
        delete store[key]
        localStorage.setItem(name,JSON.stringify(store))

    }

    public static ensure( name:string ): any {
        
        let store:string|null = localStorage.getItem(name)
        if(!store) return {}
        return JSON.parse(store)

    }

    public static async forEach( name:string, callback:any ): Promise<void> {

        let store = Storage.ensure( name )
        for(const key in store){
            await callback(store[key],key,store)
        }

    }

}