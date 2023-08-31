import { Loader, LoaderOptions } from '@googlemaps/js-api-loader'

/**
 * google map 加載類
 */
export default class GMapLoader extends Loader {

    static MarkerLibrary: google.maps.MarkerLibrary
    static MapsLibrary: google.maps.MapsLibrary
    static CoreLibrary: google.maps.CoreLibrary

    static gMapLoaderIns?: GMapLoader = undefined
    private constructor(loaderOptions: LoaderOptions) { super(loaderOptions) }

    /**
     * 加載基本需要的類
     * @param loaderOptions 
     * @returns 
     */
    static async load(loaderOptions?: LoaderOptions) {
        if (GMapLoader.gMapLoaderIns !== undefined) {
            return GMapLoader.gMapLoaderIns
        }
        GMapLoader.gMapLoaderIns = new GMapLoader({
            version: 'weekly',
            ...loaderOptions,
            apiKey: loaderOptions?.apiKey ?? '',
        })
        GMapLoader.MarkerLibrary = await GMapLoader.gMapLoaderIns.importLibrary('marker')
        GMapLoader.MapsLibrary = await GMapLoader.gMapLoaderIns.importLibrary('maps')
        GMapLoader.CoreLibrary = await GMapLoader.gMapLoaderIns.importLibrary('core')
        return GMapLoader.gMapLoaderIns
    }

}
