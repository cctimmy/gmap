<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <div ref="mapRef" style="position: absolute; width: 100%; height: 100%"></div>
</template>

<script lang="tsx" setup>
import { createApp, defineComponent, onMounted, ref } from "vue";
import MapMarker from "./components/MapMarker.vue";
import MapMarkerLabel from "./components/MapMarkerLabel.vue";
import { GMap, GMapAdvancedMarkers, openMarkerLabel } from "@/../lib/index";
import type { IGMapAdvancedMarkersOpts } from "@/../lib/index";
import locations from "@/assets/locations.json";

defineComponent({
  name: "App",
});

const mapRef = ref<HTMLDivElement | null>(null);
let mapInstance: any = null;

onMounted(async () => {
  console.log("vue3 component mounted ! ");
  if (mapRef.value) {
    console.log("get dom by ref", mapRef.value);
    const gMapIns = await GMap.createMap(mapRef.value, {
      mapId: "uuid",
      center: { lat: 25.03746, lng: 121.564558 },
      clickableIcons: false,
      disableDefaultUI: true,
      zoom: 12,
    });
    mapInstance = gMapIns;
    console.log("g map ins", gMapIns === mapInstance);
    addMarkers(mapInstance);
  }
});

const addMarkers = (mapInstance: any) => {
  const markers: IGMapAdvancedMarkersOpts[] = locations.map((opt) => ({
    id: opt.id,
    position: {
      lat: +opt.latitude,
      lng: +opt.longitude,
    },
    isNotDrawingOnMap: true,
    renderer: (root) => {
      const vm = createApp(MapMarker);
      return [vm.mount(root).$el, () => vm.unmount()];
    },
    onClick: (mIns) => {
      openMarkerLabel({
        mark: mIns,
        renderer: (root) => {
          const vm = createApp(MapMarkerLabel);
          return [vm.mount(root).$el, () => vm.unmount()];
        },
      });
    },
  }));
  GMapAdvancedMarkers.setClusterMarkers(markers, mapInstance);
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
