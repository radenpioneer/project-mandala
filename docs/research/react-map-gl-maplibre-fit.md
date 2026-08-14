# react-map-gl + MapLibre fit for Project Mandala

_Research date: 14 August 2026_

## Decision

**Do not replace the current direct Leaflet implementation for this PW choropleth.** The existing map is a small, static, Indonesia-only view: one 38-province GeoJSON document, one polygon layer mapped to 32 PW, no basemap tiles, one tooltip, and one selection dialog. Its SVG paths are made individually focusable and operable with Enter/Space in [`LeafletCoverageMap`](../../src/react-app/App.tsx), which is particularly valuable here.

`react-map-gl` + MapLibre is technically compatible and architecturally sound, but it would exchange that simple DOM/SVG model for a WebGL2 canvas, an ESM worker, a larger runtime, and an app-owned accessibility layer. Reconsider it when the product actually needs large vector-tile datasets, many dynamic layers, GPU-heavy styling/animation, deck.gl, or synchronized/controlled maps.

## Current versions and React 19

As checked against the official releases and npm metadata on the research date, the current stable packages are `react-map-gl@8.1.2` and `maplibre-gl@6.3.0`. `react-map-gl` 8.1.2 explicitly added MapLibre GL JS v6 support; MapLibre 6.3.0 is the latest renderer release. Sources: [`react-map-gl` v8.1.2 release](https://github.com/visgl/react-map-gl/releases/tag/v8.1.2), [MapLibre GL JS v6.3.0 release](https://github.com/maplibre/maplibre-gl-js/releases/tag/v6.3.0).

The published `react-map-gl` package declares `react >=16.3.0` and `react-dom >=16.3.0`, so this repo's React 19.2.1 satisfies the declared peer range. Actual mount/unmount and navigation behavior still needs testing. Sources: [`react-map-gl` package metadata](https://github.com/visgl/react-map-gl/blob/v8.1.2/modules/main/package.json), [Project Mandala package metadata](../../package.json).

## Architecture and data requirements

MapLibre GL JS is a TypeScript/WebGL renderer whose visual output is governed by the MapLibre Style Specification. `react-map-gl/maplibre` wraps that imperative engine with a reactive React API: camera state can be controlled through props, while `<Source>` and `<Layer>` declaratively create and update map sources and style layers. Source and layer updates are shallow-diffed, and stable IDs/React keys remain important. Sources: [MapLibre overview](https://maplibre.org/maplibre-gl-js/docs/), [`react-map-gl` design philosophy](https://visgl.github.io/react-map-gl/docs), [`Source` API](https://visgl.github.io/react-map-gl/docs/api-reference/maplibre/source), [`Layer` API](https://visgl.github.io/react-map-gl/docs/api-reference/maplibre/layer).

The current PW data does **not** require a hosted tile provider or API token. It can be rendered with an explicit empty inline style such as `{version: 8, sources: {}, layers: []}`, then a GeoJSON `<Source>` plus fill and line `<Layer>` components. The GeoJSON may be inline or fetched from a CORS-enabled URL. A basemap is a separate product choice: adding one means choosing and licensing a style/tile provider or self-hosting its tiles, glyphs, and sprites. Sources: [Style root specification](https://maplibre.org/maplibre-style-spec/root/), [source specification](https://maplibre.org/maplibre-style-spec/sources/), [custom-data guide](https://visgl.github.io/react-map-gl/docs/get-started/adding-custom-data), [token and provider guidance](https://visgl.github.io/react-map-gl/docs/get-started/mapbox-tokens).

That structure would help if many React-owned layers changed independently. Here it would mostly restate one `L.geoJSON` layer while preserving the dominant custom work: PW mapping, privacy styling, tooltips, selection, bounds, attribution, loading failure, and accessible detail UI.

## Lifecycle and SSR

The React wrapper releases the underlying map's resources on unmount by default. It also offers `reuseMaps` for frequently remounted maps, but retained instances keep construction-time constraints. MapLibre has shared worker resources and an optional `prewarm()` path for apps that repeatedly create maps. Sources: [`Map` lifecycle and `reuseMaps`](https://visgl.github.io/react-map-gl/docs/api-reference/maplibre/map), [MapLibre `prewarm`](https://maplibre.org/maplibre-gl-js/docs/API/functions/prewarm/).

`react-map-gl` includes an official Next.js SSR example, and its `mapLib` prop accepts a dynamic import for code splitting. MapLibre v6 documents an additional Vite SSR setting (`ssr.noExternal: ['maplibre-gl']`) for builds that otherwise resolve the wrong server entry. The safe architecture remains: server-render the shell and semantic data representation, then initialize the WebGL map in the browser. Sources: [official Next.js example](https://github.com/visgl/react-map-gl/tree/8.1-release/examples/get-started/nextjs), [`mapLib` loading options](https://visgl.github.io/react-map-gl/docs/api-reference/maplibre/map), [MapLibre ESM/Vite setup](https://maplibre.org/maplibre-gl-js/docs/).

Project Mandala currently uses a client `createRoot`, so SSR is not a reason to migrate either way.

## Accessibility and keyboard interaction

This is the strongest reason to retain Leaflet for the current design.

MapLibre's built-in keyboard handler supports map-level navigation: arrow-key panning plus zoom, rotation, and pitch shortcuts. Its feature interaction API is pointer-oriented: `interactiveLayerIds` adds rendered features to mouse/touch callbacks such as `onClick`. A GL fill layer is painted into a WebGL canvas, so its individual polygons are not native focusable DOM elements. Sources: [MapLibre `KeyboardHandler`](https://maplibre.org/maplibre-gl-js/docs/API/classes/KeyboardHandler/), [`interactiveLayerIds` and pointer callbacks](https://visgl.github.io/react-map-gl/docs/api-reference/maplibre/map), [WebGL renderer overview](https://maplibre.org/maplibre-gl-js/docs/).

Therefore, keyboard-selectable PW polygons are not supplied by `react-map-gl` or MapLibre. A migration would need an app-owned semantic companion—preferably a PW list or table with real buttons, synchronized selection and hover, visible focus, and an announced detail region. Projected DOM buttons/markers are another option, but are more complex and can collide at Indonesia-wide zoom. This conclusion is an inference from the official canvas renderer, keyboard API, and pointer feature API.

The current Leaflet code already assigns each generated SVG path `tabindex="0"`, `role="button"`, an accessible name, dialog semantics, and Enter/Space activation. Keeping an adjacent semantic PW list would still improve discoverability, but MapLibre would make such a list mandatory rather than complementary.

## Performance, bundle, worker, and CSP

MapLibre is designed for GPU rendering of substantial styled geospatial data. That advantage is not meaningful for only 38 province features, where SVG is already inexpensive.

As a reproducible package-artifact check, `npm pack` of the official `maplibre-gl@6.3.0` tarball contains about 1.06 MB of production ESM across the main, shared, and worker files (about 273 KiB after gzip), plus about 81 KiB of CSS (10 KiB gzip). The currently installed Leaflet 1.9.4 ESM and CSS are about 107 KiB and 3.5 KiB gzip respectively. These are not final Vite chunk sizes, but they show that moving renderers increases the mapping payload before the React adapter and application code. The wrapper can dynamically import `maplibre-gl` so this cost does not have to enter the initial route chunk. Sources: [MapLibre v6.3.0 package metadata](https://github.com/maplibre/maplibre-gl-js/blob/v6.3.0/package.json), [`mapLib` dynamic import](https://visgl.github.io/react-map-gl/docs/api-reference/maplibre/map), [Leaflet 1.9.4 package metadata](https://github.com/Leaflet/Leaflet/blob/v1.9.4/package.json).

MapLibre v6 is ESM-only, targets modern JavaScript, requires WebGL2, and separates rendering work into an ESM worker. For Vite, the official setup is to import `maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url` and pass it to `setWorkerUrl`; plain `?url` is insufficient for the worker's shared-module dependency. Under strict CSP, the worker can be served from a same-origin URL, avoiding a `worker-src blob:` allowance. Remote GeoJSON, styles, tiles, glyphs, and sprites still require the appropriate network/CSP directives. Sources: [MapLibre v6 release notes](https://github.com/maplibre/maplibre-gl-js/releases/tag/v6.0.0), [MapLibre ESM, Vite, and CSP setup](https://maplibre.org/maplibre-gl-js/docs/).

The present direct Leaflet map needs neither WebGL2 nor a worker. Its remote GeoJSON fetch is already the only map-data network dependency and could be self-hosted independently of renderer choice.

## Licensing

`react-map-gl` is MIT-licensed and MapLibre GL JS is BSD-3-Clause. Those licenses cover the libraries, not the map data or any future style/tile service. The current province dataset is CC BY 4.0 and is already credited through the map attribution control; that attribution must remain after any renderer change. Sources: [`react-map-gl` license](https://github.com/visgl/react-map-gl/blob/master/LICENSE), [MapLibre GL JS license](https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt), [province GeoJSON repository](https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces), [MapLibre attribution control](https://maplibre.org/maplibre-gl-js/docs/API/classes/AttributionControl/).

## Revisit the decision when

Adopt `react-map-gl@8.1.2` + `maplibre-gl@6.3.0` when at least one concrete requirement justifies the renderer change:

- data moves from 38 inline polygons to large vector-tile sources or many frequently updated features;
- multiple independent sources/layers need declarative React ownership and style diffing;
- GPU-based transitions, heatmaps, terrain, 3D, or deck.gl overlays become product requirements;
- several maps need synchronized controlled camera state;
- a semantic PW list/table is designed as the primary keyboard and screen-reader interaction, so canvas polygons no longer need to carry that responsibility.

If that threshold is reached, use an empty no-basemap style for this view, a GeoJSON `<Source>` with separate fill/line `<Layer>` elements, `initialViewState.bounds` for Indonesia, `maxBounds`, `renderWorldCopies={false}`, Vite's documented worker URL, route-level lazy loading, and a sibling semantic PW control. Until then, direct Leaflet is the smaller, more accessible, and lower-risk fit.
