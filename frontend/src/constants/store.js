export const STORE = {
  name: 'Home-Ware Store',
  address: 'דיזנגוף 100, תל אביב-יפו',
  addressEn: 'Dizengoff 100, Tel Aviv-Yafo, Israel',
  phone: '03-1234567',
  email: 'hello@homeware.co.il',
  // Approximate coordinates for Dizengoff 100
  lat: 32.0809,
  lng: 34.7749,
};

export function getGoogleMapsEmbedUrl() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const query = encodeURIComponent(STORE.addressEn);

  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&zoom=16&language=he`;
  }

  // Fallback without API key (basic embed)
  return `https://maps.google.com/maps?q=${query}&z=16&hl=he&output=embed`;
}

export function getGoogleMapsDirectionsUrl() {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE.addressEn)}`;
}
