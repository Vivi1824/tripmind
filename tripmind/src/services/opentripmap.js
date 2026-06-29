const CATEGORY_MAP = {
  all: "",
  museums: "museums",
  food: "foods",
  nature: "parks",
  shopping: "shops",
  history: "historic",
};

function formatCategory(kind) {
  const normalized = kind?.split(",")[0] || "place";
  return normalized.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function getOpenTripMapPlaceDetails(xid) {
  const apiKey = import.meta.env.VITE_OPENTRIPMAP_API_KEY;

  if (!apiKey) {
    throw new Error("Add a VITE_OPENTRIPMAP_API_KEY to your environment to load live place details.");
  }

  if (!xid) {
    throw new Error("The place identifier is missing.");
  }

  const detailsResponse = await fetch(`https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${apiKey}`);

  if (!detailsResponse.ok) {
    throw new Error("Unable to load this place from OpenTripMap.");
  }

  const details = await detailsResponse.json();
  const properties = details.properties || {};
  const [lon, lat] = details.geometry?.coordinates || [];

  return {
    id: xid,
    name: properties.name || "Unnamed place",
    description: properties.wikipedia_extracts?.text || properties.kinds || "This place is part of your trip.",
    kinds: (properties.kinds || "")
      .split(",")
      .slice(0, 4)
      .map(formatCategory),
    address: [properties.address?.city, properties.address?.street, properties.address?.postcode].filter(Boolean).join(", "),
    lat,
    lon,
  };
}

export async function searchOpenTripMapAttractions({ city, category = "all", radius = 2500, limit = 12 }) {
  const apiKey = import.meta.env.VITE_OPENTRIPMAP_API_KEY;

  if (!apiKey) {
    throw new Error("Add a VITE_OPENTRIPMAP_API_KEY to your environment to load live attractions.");
  }

  const cleanCity = city?.trim();
  if (!cleanCity) {
    throw new Error("Insert a city to search for attractions.");
  }

  const geonameResponse = await fetch(
    `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(cleanCity)}&apikey=${apiKey}`
  );

  if (!geonameResponse.ok) {
    throw new Error("The city could not be found in OpenTripMap.");
  }

  const geoname = await geonameResponse.json();

  const kinds = CATEGORY_MAP[category] || "";
  const placesUrl = new URL("https://api.opentripmap.com/0.1/en/places/radius");
  placesUrl.searchParams.set("lat", geoname.lat);
  placesUrl.searchParams.set("lon", geoname.lon);
  placesUrl.searchParams.set("radius", radius);
  placesUrl.searchParams.set("limit", limit);
  placesUrl.searchParams.set("apikey", apiKey);

  if (kinds) {
    placesUrl.searchParams.set("kinds", kinds);
  }

  const placesResponse = await fetch(placesUrl.toString());

  if (!placesResponse.ok) {
    throw new Error("The attraction request failed. Please try again.");
  }

  const placesData = await placesResponse.json();

  const attractions = (placesData.features || [])
    .map((feature) => {
      const properties = feature.properties || {};
      const address = properties.address || {};
      const [lon, lat] = feature.geometry?.coordinates || [];

      return {
        id: properties.xid || `${properties.name || "place"}-${lat}-${lon}`,
        name: properties.name || "Unnamed place",
        kinds: (properties.kinds || "")
          .split(",")
          .slice(0, 3)
          .map(formatCategory),
        distance: properties.dist,
        address: [address.city, address.street, address.postcode].filter(Boolean).join(", "),
        lat,
        lon,
      };
    })
    .filter((place) => place.name !== "Unnamed place");

  return {
    city: geoname.name || cleanCity,
    attractions,
  };
}
