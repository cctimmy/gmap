import GMapLoader from "./GMapLoader"

export class GMap {

    static getMap(mapId: string) {
        return GMap.idGMmapInsMap.get(mapId)
    }

    private static idGMmapInsMap: Map<string, google.maps.Map> = new Map()

    /**
     * 建立基本地圖，需要加載 MarkerLibrary、MapsLibrary、CoreLibrary
     */
    static async createMap(mapDiv: HTMLElement, opts: google.maps.MapOptions & { mapId: string }) {
        await GMapLoader.load()
        if (GMap.idGMmapInsMap.has(opts.mapId)) {
            return GMap.idGMmapInsMap.get(opts.mapId)
        }
        const gMapIns = new GMapLoader.MapsLibrary.Map(mapDiv, opts)
        GMap.idGMmapInsMap.set(opts.mapId!, gMapIns)
        await new Promise<void>((resolve) => gMapIns.addListener('tilesloaded', () => resolve()))
        return gMapIns
    }

    static flyTo(map: google.maps.Map, latLngLiteral: google.maps.LatLngLiteral) {
        map.panTo(latLngLiteral)
        map.setZoom(12)
    }

}