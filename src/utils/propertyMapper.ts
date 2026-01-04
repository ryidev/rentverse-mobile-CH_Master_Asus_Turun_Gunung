// Helper function to map backend property data to PropertyCard format
export const mapPropertyToCard = (property: any) => {
  // Calculate average rating from backend data
  const averageRating = property.averageRating || 0;
  const ratingCount = property.ratingCount || property._count?.ratings || 0;

  // Get first image or use placeholder
  const image = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400';

  // Format location from city and state
  const location = property.state
    ? `${property.city}, ${property.state}`
    : property.city || 'Unknown Location';

  return {
    id: property.id,
    image,
    rating: averageRating > 0 ? averageRating.toFixed(1) : '0.0',
    reviews: ratingCount,
    title: property.title,
    location,
    rooms: property.bedrooms || 0,
    area: property.areaSqm || 0,
    price: parseFloat(property.price || 0),
    // Keep all original data for detail view
    ...property,
  };
};

export const mapPropertiesToCards = (properties: any[]) => {
  return properties.map(mapPropertyToCard);
};
