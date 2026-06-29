import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export default function MapView({ places = [] }) {
  const center = places[0]?.lat && places[0]?.lon
    ? [places[0].lat, places[0].lon]
    : [41.3851, 2.1734];

  return (
    <div className="mt-4 h-72 overflow-hidden rounded-2xl border border-gray-200">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place) => (
          <Marker key={place.id} position={[place.lat, place.lon]}>
            <Popup>{place.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
