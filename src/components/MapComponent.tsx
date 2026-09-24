import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCommandCenter } from '../context/CommandCenterContext';

// Fix Leaflet default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Custom HTML Icons using Leaflet divIcon with crisp light theme contrast
const createIncidentIcon = (priority: string) => {
  const bg = priority === 'critical' ? '#dc2626' : priority === 'high' ? '#ea580c' : '#0d9488';
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        background: ${bg};
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
      ">
        <span style="font-size: 15px; line-height: 1;">🔥</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const createDroneIcon = (status: string) => {
  const border = status === 'on_site' ? '#dc2626' : status === 'en_route' ? '#d97706' : '#0d9488';
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        background: #ffffff;
        border: 2px solid ${border};
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      ">
        <span style="font-size: 14px; line-height: 1;">✈️</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

/** Response Base / Fire Camp marker — tent icon represents a field base */
const createStationIcon = () => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: #ffffff;
        border: 2px solid #0284c7;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      ">
        <span style="font-size: 14px; line-height: 1;">⛺</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Component to handle map view updates
const MapCenterUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1 });
  }, [center, map]);
  return null;
};

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  showStations?: boolean;
  showDrones?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  // Default center: Tadoba Andhari Tiger Reserve
  center = [20.2450, 79.3038],
  zoom = 11,
  height = '100%',
  showStations = true,
  showDrones = true,
}) => {
  const { incidents, drones, stations, setSelectedIncidentId, setActiveScreen } = useCommandCenter();

  return (
    <div style={{ height, width: '100%' }} className="relative overflow-hidden rounded-xl border border-slate-200 shadow-xs">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapCenterUpdater center={center} />

        {/* CartoDB Voyager Tile Layer (Clean light theme) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Response Bases & Coverage Radii */}
        {showStations &&
          stations.map((st) => (
            <React.Fragment key={st.id}>
              <Marker
                position={[st.location.latitude, st.location.longitude]}
                icon={createStationIcon()}
              >
                <Popup>
                  <div className="p-1 space-y-1">
                    <p className="font-bold text-xs text-sky-700">{st.name}</p>
                    <p className="text-[11px] text-slate-700">{st.address}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      <span>Drones Docked: {st.dockedDrones}/{st.totalDrones}</span> |{' '}
                      <span>Crew: {st.availableResponders}/{st.totalResponders}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[st.location.latitude, st.location.longitude]}
                radius={3000}
                pathOptions={{ color: '#0284c7', weight: 1.5, dashArray: '4, 4', fillOpacity: 0.06 }}
              />
            </React.Fragment>
          ))}

        {/* Wildfire Incidents */}
        {incidents
          .filter((i) => i.status !== 'resolved' && i.status !== 'cancelled')
          .map((inc) => (
            <Marker
              key={inc.id}
              position={[inc.location.latitude, inc.location.longitude]}
              icon={createIncidentIcon(inc.priority)}
            >
              <Popup>
                <div className="p-1 space-y-2 max-w-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-teal-700">{inc.id}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        inc.priority === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {inc.priority}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 leading-tight">{inc.title}</p>
                  <p className="text-[11px] text-slate-500">{inc.address}</p>
                  {inc.temperatureMax && (
                    <p className="text-[10px] font-mono text-rose-600 font-semibold">
                      Thermal Peak: {inc.temperatureMax}°C
                    </p>
                  )}
                  {inc.containmentPercent !== undefined && (
                    <p className="text-[10px] font-mono text-amber-600 font-semibold">
                      Containment: {inc.containmentPercent.toFixed(0)}%
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      setActiveScreen('incident_detail');
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold py-1.5 rounded-lg shadow-xs transition-colors"
                  >
                    Open Incident Inspector
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Active Drones */}
        {showDrones &&
          drones.map((drone) => (
            <React.Fragment key={drone.id}>
              <Marker
                position={[drone.currentLocation.latitude, drone.currentLocation.longitude]}
                icon={createDroneIcon(drone.status)}
              >
                <Popup>
                  <div className="p-1 space-y-1">
                    <p className="font-mono font-bold text-xs text-teal-700">
                      {drone.id} ({drone.model})
                    </p>
                    <p className="text-[11px] text-slate-800">
                      Status: <span className="uppercase font-bold">{drone.status}</span>
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Battery: {drone.batteryPercent}% | Altitude: {drone.altitudeMeters}m
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Draw flight path line to assigned incident */}
              {drone.assignedIncidentId &&
                (() => {
                  const targetInc = incidents.find((i) => i.id === drone.assignedIncidentId);
                  if (!targetInc) return null;
                  return (
                    <Polyline
                      positions={[
                        [drone.currentLocation.latitude, drone.currentLocation.longitude],
                        [targetInc.location.latitude, targetInc.location.longitude],
                      ]}
                      pathOptions={{ color: '#0d9488', weight: 2.5, dashArray: '6, 6' }}
                    />
                  );
                })()}
            </React.Fragment>
          ))}
      </MapContainer>
    </div>
  );
};

