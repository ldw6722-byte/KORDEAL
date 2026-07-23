import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface CountryMapProps {
  mapColor?: string;
}

const markers = [
  { latLng: [-104.657039, 37.2580397], name: "United States" },
  { latLng: [73.7276105, 20.7504374], name: "India" },
  { latLng: [-11.6368, 53.613], name: "United Kingdom" },
  { latLng: [115.2092761, -25.0304388], name: "Australia" },
];

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  return (
      <ComposableMap
          projection="geoMercator"
          style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
              geographies.map((geo) => (
                  <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredRegion(geo.rsmKey)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      style={{
                        default: {
                          fill: mapColor || "#D0D5DD",
                          stroke: "none",
                          outline: "none",
                        },
                        hover: {
                          fill: "#465fff",
                          fillOpacity: 0.7,
                          cursor: "pointer",
                          outline: "none",
                        },
                        pressed: {
                          fill: "#465FFF",
                          outline: "none",
                        },
                      }}
                  />
              ))
          }
        </Geographies>

        {markers.map(({ latLng, name }) => (
            <Marker key={name} coordinates={latLng as [number, number]}>
              <circle
                  r={4}
                  fill="#465FFF"
                  stroke="white"
                  strokeWidth={1}
              />
            </Marker>
        ))}
      </ComposableMap>
  );
};

export default CountryMap;
