export interface VeltoraProduct {
  id: number;
  modelName: string;
  tagline: string;
  price: number;
  tier: string;
  image: string;
  description: string;
  caseDiameter: string;
  movementRef: string;
  strapOptions: string[];
}

interface FakeProductInput {
  id: number;
  price: number;
  image: string;
  description: string;
}

interface SanityProductInput {
  modelName?: string;
  tagline?: string;
  collectionTier?: string;
  higgsfield_heroImage?: string;
  description?: string;
}

export function transformToVeltora(fakeProduct: FakeProductInput, sanityData?: SanityProductInput): VeltoraProduct {
  const collectionNames = ['NOIR I', 'SOLEIL', 'ABYSSAL', 'REGENCY', 'STRATO', 'AURORA'];
  const tiers = ['Tourbillon', 'Perpetual', 'Diver', 'Limited', 'Tourbillon', 'Perpetual'];
  
  const index = fakeProduct.id % 6;
  const modelName = sanityData?.modelName ?? collectionNames[index];
  
  // Custom taglines for watch models
  const taglines = [
    'Obsidian engineering of human ambition.',
    'Forged from weathered brass and golden light.',
    'Mastering the crushing depths of the abyss.',
    'A heritage monument of classical mechanics.',
    'Futuristic racing caliber engineered in carbon.',
    'Luminous sapphire reflecting aurora hues.'
  ];

  // Map to generated Higgsfield images
  const imageNames = [
    '/assets/collection_noir.png',
    '/assets/collection_soleil.png',
    '/assets/collection_abyssal.png',
    '/assets/collection_regency.png',
    '/assets/collection_strato.png',
    '/assets/collection_aurora.png'
  ];

  const caseDiameters = ['41mm', '40mm', '43mm', '39mm', '42mm', '41mm'];
  const movementRefs = ['Caliber V-9.1', 'Caliber V-9.2', 'Caliber V-9.3', 'Caliber V-9.4', 'Caliber V-9.5', 'Caliber V-9.6'];
  const strapOptions = [
    ['alligator', 'steel', 'rubber'],
    ['calfskin', 'steel', 'nato'],
    ['rubber', 'titanium'],
    ['alligator', 'calfskin'],
    ['nato', 'rubber', 'steel'],
    ['rubber', 'nato', 'titanium']
  ];

  return {
    id: fakeProduct.id,
    modelName,
    tagline: sanityData?.tagline ?? taglines[index],
    price: Math.round(fakeProduct.price * 180), // Luxury pricing transform
    tier: sanityData?.collectionTier ?? tiers[index],
    image: sanityData?.higgsfield_heroImage ?? imageNames[index],
    description: sanityData?.description ?? fakeProduct.description,
    caseDiameter: caseDiameters[index],
    movementRef: movementRefs[index],
    strapOptions: strapOptions[index]
  };
}
