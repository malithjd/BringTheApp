// Feature flags — gate premium features for paid tier later
// Set PAID_FEATURES=false to disable Auto.dev listings/photos/market avg
// Read lazily to avoid ESM import timing issues with dotenv
export function getFeatures() {
  return {
    marketListings: process.env.PAID_FEATURES !== 'false',
    vehiclePhotos: process.env.PAID_FEATURES !== 'false',
    marketAverage: process.env.PAID_FEATURES !== 'false',
  };
}

export function isEnabled(feature) {
  return getFeatures()[feature] !== false;
}
