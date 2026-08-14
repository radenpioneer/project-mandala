# React Leaflet fit for Project Mandala

_Research date: 14 August 2026_

## Decision

**Do not add React Leaflet for the current dashboard prototype.** Keep the existing direct Leaflet integration while the map remains one `L.Map` with one GeoJSON layer.

React Leaflet v5 is technically compatible with this repository, but today it would add an abstraction without removing most of the map's project-specific work. Reconsider it if the map becomes a composable feature with several independently mounted layers, controls, popups, or React-owned state transitions.

## Compatibility

The current stable package is `react-leaflet@5.0.0`. Its published release metadata requires `react ^19.0.0`, `react-dom ^19.0.0`, and `leaflet ^1.9.0`; Project Mandala currently has React 19.2.1, React DOM 19.2.1, and Leaflet 1.9.4, so those peer ranges match. React Leaflet 5 also ships its own TypeScript declarations, while Leaflet types remain a separate prerequisite already present in this repo. Sources: [React Leaflet 5 package metadata](https://raw.githubusercontent.com/PaulLeCam/react-leaflet/v5.0.0/packages/react-leaflet/package.json), [v5 release notes](https://github.com/PaulLeCam/react-leaflet/releases/tag/v5.0.0), and [installation guide](https://react-leaflet.js.org/docs/start-installation/).

Use the `v5.0.0` tag or npm release metadata for this decision. The repository's unreleased `master` branch now declares Leaflet `^2.0.0-alpha`, but the published v5.0.0 tag declares Leaflet `^1.9.0`. Source: [unreleased master metadata](https://raw.githubusercontent.com/PaulLeCam/react-leaflet/master/packages/react-leaflet/package.json).

## What the abstraction adds

React Leaflet is a binding, not a replacement renderer: Leaflet still creates the map and renders its DOM/SVG layers. The binding supplies `MapContainer`, React context and hooks, declarative layer components, and lifecycle synchronization. Most component props are creation-time values; only explicitly documented mutable props are synchronized later. Sources: [core concepts and lifecycle](https://react-leaflet.js.org/docs/start-introduction/) and [MapContainer API](https://react-leaflet.js.org/docs/api-map/).

The useful reduction in boilerplate is lifecycle ownership:

- `MapContainer` creates the `LeafletMap` and calls `map.remove()` on unmount.
- Layer hooks add and remove Leaflet layers.
- Event hooks attach handlers with `.on()` and detach them with `.off()`.
- The `GeoJSON` component exposes declarative `data`, `style`, attribution, and event props, although `data` itself is immutable after creation.

Sources: [MapContainer source](https://raw.githubusercontent.com/PaulLeCam/react-leaflet/v5.0.0/packages/react-leaflet/src/MapContainer.tsx), [layer lifecycle source](https://raw.githubusercontent.com/PaulLeCam/react-leaflet/v5.0.0/packages/core/src/layer.ts), [event lifecycle source](https://raw.githubusercontent.com/PaulLeCam/react-leaflet/v5.0.0/packages/core/src/events.ts), and [GeoJSON component API](https://react-leaflet.js.org/docs/api-components/#geojson).

## Fit with the current implementation

Project Mandala currently has one self-contained `LeafletCoverageMap` in `src/react-app/App.tsx`. It creates one map, fetches one province GeoJSON document, adds one `L.geoJSON` layer, fits Indonesia's bounds, and opens React state from feature interactions. Its effect already performs the important symmetric cleanup: it disconnects the `ResizeObserver`, destroys the map with `map.remove()`, and clears the map ref. Leaflet documents `Map.remove()` as destroying the map and clearing related event listeners. Sources: [Leaflet Map reference](https://leafletjs.com/reference.html#map-remove) and [Leaflet GeoJSON guide](https://leafletjs.com/examples/geojson/).

Moving this code to React Leaflet would make map/layer creation more declarative, but it would not eliminate the custom parts that dominate this implementation:

- asynchronous GeoJSON loading and error state;
- province-to-PW lookup and per-feature styling;
- `onEachFeature` tooltips and selection behavior;
- keyboard focus, ARIA attributes, and Enter/Space handling on generated SVG paths;
- container measurement and `invalidateSize()` after hidden/live variants become visible;
- post-load `fitBounds()` and derived minimum zoom.

The official GeoJSON API confirms that `data` is not mutable, while `style` is mutable. A changed dataset therefore needs either a stable one-time load as used here or replacement through React identity (`key`), not an assumption that every prop behaves like an ordinary React DOM prop. Sources: [GeoJSON component API](https://react-leaflet.js.org/docs/api-components/#geojson) and [React Leaflet limitations](https://react-leaflet.js.org/docs/start-introduction/#limitations).

## Lifecycle, Strict Mode, and SSR

The app root enables React `StrictMode`. In development, React deliberately runs an extra setup-cleanup-setup cycle for Effects and callback refs. The current component is compatible with that model because setup has a corresponding cleanup and its async continuation checks whether the component was disposed. React Leaflet's built-in map, layer, and event lifecycles also include cleanup, but custom fetches, observers, plugin code, and DOM listeners would still be the application's responsibility. Sources: [React StrictMode](https://react.dev/reference/react/StrictMode), [React `useEffect`](https://react.dev/reference/react/useEffect), and the React Leaflet lifecycle sources above.

React Leaflet is explicitly incompatible with server-side rendering because Leaflet accesses the DOM when loaded. Project Mandala currently mounts the dashboard with `createRoot`, so this is not a present blocker. If the Cloudflare/Vite app later adds SSR, the map and its Leaflet imports must be isolated behind a client-only boundary or deferred import; adopting React Leaflet does not solve that constraint. Source: [React Leaflet SSR limitation](https://react-leaflet.js.org/docs/start-introduction/#limitations).

## Bundle and dependency trade-offs

Adding `react-leaflet` adds one runtime package plus its sole runtime dependency, `@react-leaflet/core`; React, React DOM, and Leaflet stay peer dependencies, so Leaflet should not be duplicated. The package is ESM, exposes subpaths, and declares `sideEffects: false`, allowing a modern bundler to tree-shake unused exports. Leaflet CSS and an explicitly sized map container remain required either way. Sources: [React Leaflet 5 package metadata](https://raw.githubusercontent.com/PaulLeCam/react-leaflet/v5.0.0/packages/react-leaflet/package.json) and [setup requirements](https://react-leaflet.js.org/docs/start-setup/).

The cost is therefore not another mapping engine, but additional wrapper code, another package/API surface, and React Leaflet's Hippocratic-2.1 license instead of Leaflet's BSD-2-Clause license. The license difference should be reviewed before a production adoption. Sources: [React Leaflet package license](https://raw.githubusercontent.com/PaulLeCam/react-leaflet/v5.0.0/packages/react-leaflet/package.json) and [Leaflet package metadata](https://www.npmjs.com/package/leaflet).

## Revisit when

Adopt React Leaflet v5 if two or more of these become true:

- several map layers or controls mount and unmount from React state;
- multiple components need the map instance through context;
- layer styles, handlers, tooltips, or attribution change frequently through React props;
- the same map primitives need reuse across routes or dashboard modules;
- manual layer/listener cleanup starts producing regressions.

Until then, the direct Leaflet component is the smaller and clearer boundary for this prototype.
