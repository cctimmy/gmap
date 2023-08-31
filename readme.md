```
# rollup start dev
npm run dev
```

```
# vue3 demo start

cd ./example/vue3
npm run serve
```

```typescript
class GMap {
  /**
   * 以 mapId 取得地圖實例
   */
  static getMap(mapId: string): google.maps.Map | undefined;
  private static idGMmapInsMap;
  /**
   * 建立基本地圖，需要加載依賴 : MarkerLibrary、MapsLibrary、CoreLibrary
   * 可建立多個地圖實例 以 mapId 識別
   */
  static createMap(
    mapDiv: HTMLElement,
    opts: google.maps.MapOptions & {
      mapId: string;
    }
  ): Promise<google.maps.Map | undefined>;
  /**
   * 移動 給定 地圖實例 到 指定的 位置
   */
  static flyTo(
    map: google.maps.Map,
    latLngLiteral: google.maps.LatLngLiteral
  ): void;
}

// 建立地圖
const gMapIns = await GMap.createMap(DOM, {
  mapId: "uuid",
  center: { lat: 25.03746, lng: 121.564558 },
  clickableIcons: false,
  disableDefaultUI: true,
  zoom: 12,
});
```

```typescript
// marker 所需要的 資料結構
interface IMarkerOption {
  id: string;
  position: google.maps.LatLngLiteral;
  /** 建立真實節點的渲染方法，@return 節點 */
  renderer: (
    root: HTMLElement
  ) => [HTMLDivElement, (i: GMapAdvancedMarkers) => void];
  panOffset?: number[];
}
interface IGMapAdvancedMarkersOpts extends IMarkerOption {
  isNotDrawingOnMap: boolean;
  onClick?: (ins: GMapAdvancedMarkers) => void;
}
```

### rollup & publish

```javascript
"rollup-plugin-dts": "^4.2.1", // 自動生成 ts 的型別定義擋
"rollup-plugin-esbuild": "^4.9.1" // 編譯 ts 成現代 ESmodule
```

- `./rollup.config.js` 使用 `./example/*` 內容作為範例，因此除了 `./dist` 還要額外編譯結果到 ./example 內

- `.npmrc` 設定 `registry` 公開 或 私有自建的 位置
  - 如個人公開位置 : 執行 `npm login` 登入個人帳號(免費版只能公開，所以需要設定`access=public`)，然後執行`npm run publish`就能按照`packages.json`內的相關對應設定來發布
  - [私建在 Azure devops artifacts feed](https://learn.microsoft.com/en-us/azure/devops/artifacts/npm/upstream-sources?view=azure-devops)
