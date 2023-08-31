
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { closeMarkerLabel } from './GMapMarkersLabelOverlayView'
import GMapLoader from './GMapLoader'
// import { createColorScale } from '@/util/helpers';

export interface IMarkerOption {
    id: string
    position: google.maps.LatLngLiteral
    /** 建立真實節點的渲染方法，@return 節點 */
    renderer: (root: HTMLElement) => ([HTMLDivElement, (i: GMapAdvancedMarkers) => void])  // return dom and unmount fn
    panOffset?: number[] // [x,y]
}

export interface IGMapAdvancedMarkersOpts extends IMarkerOption {
    isNotDrawingOnMap: boolean // draw the real-dom or not
    onClick?: (ins: GMapAdvancedMarkers) => void
}

export class GMapAdvancedMarkers {
    // #region STATICS of Markers
    private static domZIdx = 0

    static get incrementalDomIdx() {
        GMapAdvancedMarkers.domZIdx += 1
        return GMapAdvancedMarkers.domZIdx
    }

    static idMarkerMap: Map<string, GMapAdvancedMarkers> = new Map()
    static setMarkerStatus(id: string, status: boolean) {
        const marker = GMapAdvancedMarkers.idMarkerMap.get(id)
        marker && marker.setActive(status)
    }

    static setAllMarkersVisibility(bool: boolean) {
        for (const [, marker] of GMapAdvancedMarkers.idMarkerMap) {
            marker && marker.setVisible(bool)
        }
    }

    static deActiveAllMarkers() {
        for (const [, marker] of GMapAdvancedMarkers.idMarkerMap) {
            marker && marker.setActive(false)
        }
    }

    /** "create new" marker and the just add to map */
    static addMarkers(optList: IGMapAdvancedMarkersOpts[], map: google.maps.Map) {
        for (const opt of optList) {
            // eslint-disable-next-line no-new
            new GMapAdvancedMarkers(opt, map)
        }
        return GMapAdvancedMarkers.idMarkerMap
    }

    /** "create new" marker and then add it to cluster */
    static addMarkersToCluster(optList: IGMapAdvancedMarkersOpts[], map: google.maps.Map) {
        GMapAdvancedMarkers.markerClusterer!.addMarkers(optList.map((o) => new GMapAdvancedMarkers(o, map).markIns))
    }

    /** contains the real-DOM manipulating */
    static destroyAll() {
        GMapAdvancedMarkers._removeAllMarkers()
        GMapAdvancedMarkers._removeAllMarkerInClusterMarkers()
    }

    /** contains the real-DOM manipulating */
    static destroy(id: string) {
        const marker = GMapAdvancedMarkers.idMarkerMap.get(id)
        if (marker) {
            marker.destroy()
            GMapAdvancedMarkers.markerClusterer!.removeMarker(marker.markIns)
        }
    }

    private static _removeAllMarkers() {
        for (const [, marker] of GMapAdvancedMarkers.idMarkerMap) {
            marker.destroy()
        }
        GMapAdvancedMarkers.idMarkerMap.clear()
    }

    private static markerClusterer?: MarkerClusterer = undefined

    /**
     *  指顯示 optList 給予的標記 (( 已 id 辨別 是否已存在 ))
     *  已存在的僅改變樣式 style 而不重繪
     *  不存在的則新建
     * @todo
     * private static colorScale = createColorScale([0, 10], [[255, 0, 0], [0, 255, 0]]);
     */
    static setClusterMarkers(optList: IGMapAdvancedMarkersOpts[], map: google.maps.Map) {
        //  已初始化過
        if (GMapAdvancedMarkers.markerClusterer !== undefined) {
            const optsMap = new Map(optList.map((o) => [o.id, o]))
            // 已存在的 改變樣式
            for (const [id, marker] of GMapAdvancedMarkers.idMarkerMap) {
                marker.setVisible(optsMap.has(id))
                if (!optsMap.has(id)) {
                    GMapAdvancedMarkers.markerClusterer.removeMarker(marker.markIns)
                }
            }
            // 否則再實例化新的
            for (const [id, opt] of optsMap) {
                GMapAdvancedMarkers.markerClusterer.addMarker(
                    GMapAdvancedMarkers.idMarkerMap.get(id)?.markIns ?? new GMapAdvancedMarkers(opt, map).markIns
                )
            }
            return
        }
        GMapAdvancedMarkers.markerClusterer = new MarkerClusterer({
            map,
            markers: optList.map((opt) => new GMapAdvancedMarkers(opt, map).markIns),
            renderer: {
                render: ({ count, position }: any, stats: any) => {
                    // const color = GMapAdvancedMarkers.colorScale(10 * (count / stats.clusters.markers.max));
                    const color = '#556fff'
                    const svg = window.btoa(`
    <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity=".8" r="70" />
    </svg>`)

                    return new GMapLoader.MarkerLibrary.Marker({
                        position,
                        icon: {
                            url: `data:image/svg+xml;base64,${svg}`,
                            scaledSize: new GMapLoader.CoreLibrary.Size(75, 75),
                        },
                        label: {
                            text: String(count),
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '12px',
                        },
                        // adjust zIndex to be above other markers
                        zIndex: Number(GMapLoader.MarkerLibrary.Marker.MAX_ZINDEX) + count,
                    })
                },
            },
        })
    }

    private static _removeAllMarkerInClusterMarkers() {
        GMapAdvancedMarkers.markerClusterer && GMapAdvancedMarkers.markerClusterer.clearMarkers()
        GMapAdvancedMarkers.markerClusterer = undefined
    }
    // #endregion

    private position: google.maps.LatLngLiteral
    private dom: HTMLDivElement
    private destroyer?: (i: GMapAdvancedMarkers) => void
    private panOffset: number[] = [0, 0]
    private clickHandler?: IGMapAdvancedMarkersOpts['onClick']

    public map: google.maps.Map
    public id: string
    public markIns: google.maps.marker.AdvancedMarkerElement

    constructor(properties: IGMapAdvancedMarkersOpts, map: google.maps.Map) {
        this.id = properties.id
        this.map = map
        this.position = properties.position
        this.clickHandler = properties.onClick

        if (properties.panOffset !== undefined) {
            this.panOffset = properties.panOffset
        }

        // #region renderer
        this.dom = document.createElement('div')
        const [el, destroyer] = properties.renderer(this.dom)
        this.dom.append(el)
        this.destroyer = destroyer

        // #endregion
        this.markIns = new GMapLoader.MarkerLibrary.AdvancedMarkerElement({
            map: properties.isNotDrawingOnMap ? null : this.map,
            position: this.position,
            content: this.dom,
            zIndex: GMapAdvancedMarkers.incrementalDomIdx,
        })

        this.markIns.addListener('click', () => {
            // console.log({ domEvent, latLng })
            // console.log([latLng.lat, latLng.lng])
            this.clickHandler && this.clickHandler(this)
            this.setActive(true)
        })

        GMapAdvancedMarkers.idMarkerMap.set(this.id, this)
    }

    async setActive(bool: boolean) {
        if (!this.dom) {
            throw new Error(this.dom)
        }
        if (!bool) {
            this.dom.style.animation = ''
            return
        }

        this.map.panTo(this.position)
        this.map.setZoom(17)
        this.map.panBy(this.panOffset[0], this.panOffset[1])

        this.dom.style.animation = 'marker-actived-scale 1s infinite'

        this.markIns!.zIndex = GMapAdvancedMarkers.incrementalDomIdx

        this.clickHandler && (await this.clickHandler(this))
    }

    setVisible(v: boolean) {
        this.dom!.style.visibility = v ? 'visible' : 'hidden'
    }

    destroy() {
        this.destroyer && this.destroyer(this)
        GMapAdvancedMarkers.idMarkerMap.delete(this.id)
        if (this.dom.parentNode) {
            this.dom.parentNode.removeChild(this.dom)
        }
        this.dom = null as any
        closeMarkerLabel()
    }
}
