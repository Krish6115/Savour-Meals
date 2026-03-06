import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
// This is a known issue where the icon images are not correctly imported
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons can be added here if needed
const volunteerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to recenter map when coordinates change
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng]);
        }
    }, [lat, lng, map]);
    return null;
};

const MapComponent = ({
    center = { lat: 20.5937, lng: 78.9629 }, // Default to India center
    zoom = 13,
    markers = [],
    className = "leaflet-map"
}) => {
    // Filter out invalid markers
    const validMarkers = markers.filter(m => m.lat && m.lng);

    // If no center provided but we have markers, center on the first marker
    const mapCenter = (center.lat && center.lng)
        ? [center.lat, center.lng]
        : (validMarkers.length > 0 ? [validMarkers[0].lat, validMarkers[0].lng] : [20.5937, 78.9629]);

    return (
        <div className="map-container" style={{ height: '400px', width: '100%', marginBottom: '20px', borderRadius: '10px', overflow: 'hidden' }}>
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {validMarkers.map((marker, idx) => (
                    <Marker
                        key={idx}
                        position={[marker.lat, marker.lng]}
                        icon={marker.type === 'volunteer' ? volunteerIcon : DefaultIcon}
                    >
                        <Popup>
                            {marker.popup || 'Location'}
                        </Popup>
                    </Marker>
                ))}

                <RecenterMap lat={mapCenter[0]} lng={mapCenter[1]} />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
