export const nearProperties = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400',
    rating: 4.8,
    reviews: 73,
    title: 'Entire Bromo mountain view Cabin in Suraya',
    location: 'Malang, Probolinggo',
    rooms: 2,
    area: 673,
    price: 526,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    rating: 4.9,
    reviews: 104,
    title: 'Modern Beach House',
    location: 'Yogyakarta, Beach Road',
    rooms: 3,
    area: 850,
    price: 750,
  },
];

export const topRatedProperties = [
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    rating: 4.9,
    reviews: 104,
    title: 'Entire private villa in Yogyakarta City',
    location: 'Harapan Raya, Yogyakarta',
    rooms: 2,
    area: 488,
    price: 400,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    rating: 4.7,
    reviews: 89,
    title: 'Luxury Apartment',
    location: 'Central Yogyakarta',
    rooms: 4,
    area: 920,
    price: 850,
  },
];

export const userProperties = [
  {
    id: 'u1',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    rating: 0,
    reviews: 0,
    title: 'My Cozy Apartment',
    location: 'Jakarta Selatan',
    rooms: 2,
    area: 72,
    price: 1200,
    status: 'pending' // pending, approved, rejected
  },
  {
    id: 'u2',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    rating: 0,
    reviews: 0,
    title: 'My Cozy Apartment',
    location: 'Jakarta Selatan',
    rooms: 2,
    area: 72,
    price: 1200,
    status: 'pending' // pending, approved, rejected
  }
];

export const allProperties = [...nearProperties, ...topRatedProperties];
