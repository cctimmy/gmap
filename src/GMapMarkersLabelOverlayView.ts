import { GMapAdvancedMarkers } from './GMapAdvancedMarkers'
import GMapLoader from './GMapLoader'

type GMapMarkersLabelOverlayView = InstanceType<ReturnType<typeof getClass>>

export interface IGMapMarkersLabelOverlayViewOption {
    mark: GMapAdvancedMarkers
    /** 建立真實節點的渲染方法，@return 節點 */
    renderer: (root: HTMLElement) => ([HTMLDivElement, (i: GMapMarkersLabelOverlayView) => void])  // return dom and unmount fn
}

const getClass = (OverlayView: typeof google.maps.OverlayView) => class GMapMarkersLabelOverlayView extends OverlayView {

    dom: HTMLDivElement
    destroyer?: (i: GMapMarkersLabelOverlayView) => void
    mark: GMapAdvancedMarkers

    constructor(properties: IGMapMarkersLabelOverlayViewOption) {
        super()

        this.mark = properties.mark
        this.setMap(this.mark.map)
        // #region renderer

        this.dom = document.createElement('div')
        const [el, destroyer] = properties.renderer(this.dom)
        this.dom.append(el)
        this.destroyer = destroyer

        // #endregion
    }

    override onAdd() {
        const panes = this.getPanes()
        if (panes === null) {
            return
        }
        panes.overlayMouseTarget.appendChild(this.dom)
    }

    override async draw() {
        try {
            const point = this.getProjection().fromLatLngToDivPixel(this.mark.markIns.position!)

            const { x, y } = point!
            this.dom.style.left = `${x + 20}px`
            this.dom.style.top = `${y - 20}px`
            this.dom.style.zIndex = `${GMapAdvancedMarkers.incrementalDomIdx}`
            this.dom.style.position = 'absolute'
        } catch {
            throw (new Error(" marker label drawing fail !"))
        }
    }

    destroy() {
        this.destroyer && this.destroyer(this)
        if (this.dom.parentNode) {
            this.dom.parentNode.removeChild(this.dom)
        }
    }

    static getInstance(properties: IGMapMarkersLabelOverlayViewOption) {
        return new this(properties)
    }
}

// #region static fns


export let labelOverlayView: GMapMarkersLabelOverlayView | undefined

export const closeMarkerLabel = () => {
    if (labelOverlayView !== undefined) {
        labelOverlayView.destroy()
    }
}

export const openMarkerLabel = (opts: IGMapMarkersLabelOverlayViewOption) => {
    closeMarkerLabel()
    labelOverlayView = getClass(GMapLoader.MapsLibrary.OverlayView).getInstance(opts)
}

// #endregion