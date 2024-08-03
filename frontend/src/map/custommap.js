import MapLibreGlDirections from "@maplibre/maplibre-gl-directions"
import { utils } from "@maplibre/maplibre-gl-directions"

export default class DistanceMeasurementMapLibreGlDirections extends MapLibreGlDirections {
	constructor(map, configuration) {
		super(map, configuration)
	}
	get waypointsFeatures() {
		return this._waypoints
	}

	setWaypointsFeatures(waypointsFeatures) {
		this._waypoints = waypointsFeatures

		this.assignWaypointsCategories()

		this.draw()
	}

	get snappointsFeatures() {
		return this.snappoints
	}

	setSnappointsFeatures(snappointsFeatures) {
		this.snappoints = snappointsFeatures
		this.draw()
	}

	get routelinesFeatures() {
		return this.routelines
	}

	setRoutelinesFeatures(routelinesFeatures) {
		this.routelines = routelinesFeatures
		this.draw()
	}
	// save the original method
	originalBuildRoutelines = utils.buildRoutelines

	// re-define the original `buildRoutelines` method
	buildRoutelines(requestOptions, routes, selectedRouteIndex, snappoints) {
		// call the original method
		const routelines = this.originalBuildRoutelines(
			requestOptions,
			routes,
			selectedRouteIndex,
			snappoints
		)

		// modify the routelines
		routelines[0].forEach((leg, index) => {
			if (leg.properties) leg.properties.distance = routes[0].legs[index].distance
		})

		// return the modified routelines
		return routelines
	}
}

// use a different source name
const sourceName = "maplibre-gl-directions"

const config = {
	sourceName,
	layers: [
		{
			id: "maplibre-gl-directions-snapline",
			type: "line",
			source: "maplibre-gl-directions",
			layout: {
				"line-cap": "round",
				"line-join": "round",
			},
			paint: {
				"line-dasharray": [2, 2],
				"line-color": "#ffffff",
				"line-opacity": 0.65,
				"line-width": 2,
			},
			filter: ["==", ["get", "type"], "SNAPLINE"],
		},
		{
			id: "maplibre-gl-directions-routeline",
			type: "line",
			source: "maplibre-gl-directions",
			layout: {
				"line-cap": "butt",
				"line-join": "round",
			},
			paint: {
				"line-pattern": "routeline",
				"line-width": 4,
			},
			filter: ["==", ["get", "route"], "SELECTED"],
		},
		{
			id: `${sourceName}-routeline-distance`,
			type: "symbol",
			source: sourceName,
			layout: {
				"symbol-placement": "line-center",
				"text-field": "{distance}",
				"text-size": 16,
				"text-ignore-placement": true,
				"text-allow-overlap": true,
				"text-overlap": "always",
			},
			paint: {
				"text-color": "#212121",
				"text-halo-color": "#ffffff",
				"text-halo-width": 1,
			},
			filter: ["==", ["get", "route"], "SELECTED"],
		},
		{
			id: "maplibre-gl-directions-hoverpoint",
			type: "symbol",
			source: "maplibre-gl-directions",
			layout: {
				"icon-image": "balloon-hoverpoint",
				"icon-anchor": "bottom",
				"icon-ignore-placement": true,
				"icon-overlap": "always",
			},
			filter: ["==", ["get", "type"], "HOVERPOINT"],
		},

		{
			id: "maplibre-gl-directions-snappoint",
			type: "symbol",
			source: "maplibre-gl-directions",
			layout: {
				"icon-image": "balloon-snappoint",
				"icon-anchor": "bottom",
				"icon-ignore-placement": true,
				"icon-overlap": "always",
			},
			filter: ["==", ["get", "type"], "SNAPPOINT"],
		},

		{
			id: "maplibre-gl-directions-waypoint",
			type: "symbol",
			source: "maplibre-gl-directions",
			layout: {
				"icon-image": "balloon-waypoint",
				"icon-anchor": "bottom",
				"icon-ignore-placement": true,
				"icon-overlap": "always",
			},
			filter: ["==", ["get", "type"], "WAYPOINT"],
		},
	],
	// update the sensitive layers
	sensitiveSnappointLayers: [`${sourceName}-snappoint`],
	sensitiveWaypointLayers: [`${sourceName}-waypoint`],
	sensitiveRoutelineLayers: [`${sourceName}-routeline`],
	sensitiveAltRoutelineLayers: [],
}

export { config }
