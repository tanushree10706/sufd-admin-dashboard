import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCommandCenter } from '../context/CommandCenterContext';

// Fix Leaflet default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Custom HTML Icons using Leaflet divIcon
const createIncidentIcon = (priority: string) => {
  const color = priority === 'critical' ? '#ffb4ab' : priority === 'high' ? '#ffb95f' : '#6bd8cb';
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        background: ${color};
        border: 2px solid #051424;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px ${color};
      ">
        <span style="font-size: 16px; color: #051424;">🔥</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createDroneIcon = (status: string) => {
  const color = status === 'on_site' ? '#ffb4ab' : status === 'en_route' ? '#ffb95f' : '#6bd8cb';
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        position: relative;
        width: 26px;
        height: 26px;
        background: #122131;
        border: 2px solid ${color};
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 8px ${color};
      ">
        <span style="font-size: 14px;">✈️</span>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const createStationIcon = () => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        width: 26px;
        height: 26px;
        background: #273647;
        border: 2px solid #6bd8cb;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="font-size: 14px;">🏢</span>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
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
  center = [34.0522, -118.2437],
  zoom = 13,
  height = '100%',
  showStations = true,
  showDrones = true,
}) => {
  const { incidents, drones, stations, setSelectedIncidentId, setActiveScreen } = useCommandCenter();

  return (
    <div style={{ height, width: '100%' }} className="relative overflow-hidden rounded-xl border border-[#3d4947]">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapCenterUpdater center={center} />

        {/* CartoDB Dark Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Stations & Coverage Radii */}
        {showStations &&
          stations.map((st) => (
            <React.Fragment key={st.id}>
              <Marker
                position={[st.location.latitude, st.location.longitude]}
                icon={createStationIcon()}
              >
                <Popup>
                  <div className="p-1 space-y-1">
                    <p className="font-bold text-xs text-[#6bd8cb]">{st.name}</p>
                    <p className="text-[11px] text-[#d4e4fa]">{st.address}</p>
                    <div className="text-[10px] text-[#bcc9c6] font-mono">
                      <span>Drones Docked: {st.dockedDrones}/{st.totalDrones}</span> | 
                      <span> Available Staff: {st.availableResponders}/{st.totalResponders}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[st.location.latitude, st.location.longitude]}
                radius={2500}
                pathOptions={{ color: '#6bd8cb', weight: 1, dashArray: '4, 4', fillOpacity: 0.05 }}
              />
            </React.Fragment>
          ))}

        {/* Incidents */}
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
                    <span className="font-mono text-xs font-bold text-[#6bd8cb]">{inc.id}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      inc.priority === 'critical' ? 'bg-[#93000a] text-white' : 'bg-[#ca8100] text-white'
                    }`}>
                      {inc.priority}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-[#d4e4fa] leading-tight">{inc.title}</p>
                  <p className="text-[11px] text-[#bcc9c6]">{inc.address}</p>
                  {inc.temperatureMax && (
                    <p className="text-[10px] font-mono text-[#ffb4ab]">Max Temp: {inc.temperatureMax}°C</p>
                  )}
                  <button
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      setActiveScreen('incident_detail');
                    }}
                    className="w-full bg-[#6bd8cb] text-[#003732] text-[11px] font-bold py-1 rounded hover:brightness-110 transition-all"
                  >
                    Open Incident Inspector
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Drones */}
        {showDrones &&
          drones.map((drone) => (
            <React.Fragment key={drone.id}>
              <Marker
                position={[drone.currentLocation.latitude, drone.currentLocation.longitude]}
                icon={createDroneIcon(drone.status)}
              >
                <Popup>
                  <div className="p-1 space-y-1">
                    <p className="font-mono font-bold text-xs text-[#6bd8cb]">{drone.id} ({drone.model})</p>
                    <p className="text-[11px] text-[#d4e4fa]">Status: <span className="uppercase font-bold">{drone.status}</span></p>
                    <p className="text-[10px] font-mono text-[#bcc9c6]">Battery: {drone.batteryPercent}% | Altitude: {drone.altitudeMeters}m</p>
                  </div>
                </Popup>
              </Marker>

              {/* Draw Flight Path line to assigned incident */}
              {drone.assignedIncidentId && (
                (() => {
                  const targetInc = incidents.find((i) => i.id === drone.assignedIncidentId);
                  if (!targetInc) return null;
                  return (
                    <Polyline
                      positions={[
                        [drone.currentLocation.latitude, drone.currentLocation.longitude],
                        [targetInc.location.latitude, targetInc.location.longitude],
                      ]}
                      pathOptions={{ color: '#6bd8cb', weight: 2, dashArray: '5, 5' }}
                    />
                  );
                })()
              )}
            </React.Fragment>
          ))}
      </MapContainer>
    </div>
  );
};
