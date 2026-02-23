export const PRODUCTS = [
  {
    id: '1',
    name: 'Green Blazer',
    price: '₹2,499',
    image: 'https://picsum.photos/seed/greenblazer/500/625',
    images: [
      'https://picsum.photos/seed/greenblazer/500/625',
      'https://picsum.photos/seed/greenblazer2/500/625',
    ],
    brand: 'STRYDEEVA',
    description: 'Regular fit blazer. Featuring a button-down collar and long sleeves with buttoned cuffs. Button-up front.',
    materialCare: '50% Linen, 50% Cotton Blend Fabric. Machine Wash.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '2',
    name: 'White Dress',
    price: '₹5,000',
    image: 'https://picsum.photos/seed/whitedress/500/625',
    images: [
      'https://picsum.photos/seed/whitedress/500/625',
      'https://picsum.photos/seed/whitedress2/500/625',
      'https://picsum.photos/seed/whitedress3/500/625',
    ],
    brand: 'STRYDEEVA',
    description: 'Relaxed slip dress with delicate straps. Soft drape and midi length. Layer with knit cardigan for a relaxed look.',
    materialCare: '100% Cotton. Hand Wash or Delicate Cycle.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '3',
    name: 'Blue Smth',
    price: '₹5,000',
    image: 'https://picsum.photos/seed/bluesmth/500/625',
    images: [
      'https://picsum.photos/seed/bluesmth/500/625',
      'https://picsum.photos/seed/bluesmth2/500/625',
      'https://picsum.photos/seed/bluesmth3/500/625',
    ],
    brand: 'STRYDEEVA',
    description: 'Wide-leg jumpsuit with wrap-style top and long sleeves. Tailored for a polished silhouette.',
    materialCare: 'Viscose Blend. Dry Clean Recommended.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '4',
    name: 'Olive Coat',
    price: '₹6,500',
    image: 'https://picsum.photos/seed/olivecoat/500/625',
    images: ['https://picsum.photos/seed/olivecoat/500/625'],
    brand: 'STRYDEEVA',
    description: 'Structured olive coat with notched lapel and single-breasted closure. Full lining.',
    materialCare: 'Wool Blend. Dry Clean Only.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '5',
    name: 'Beige Trousers',
    price: '₹4,200',
    image: 'https://picsum.photos/seed/beigetrousers/500/625',
    images: ['https://picsum.photos/seed/beigetrousers/500/625'],
    brand: 'STRYDEEVA',
    description: 'High-waist tailored trousers in beige. Straight leg and side zip closure.',
    materialCare: 'Cotton Twill. Machine Wash Cold.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '6',
    name: 'Black Jumpsuit',
    price: '₹5,800',
    image: 'https://picsum.photos/seed/blackjumpsuit/500/625',
    images: ['https://picsum.photos/seed/blackjumpsuit/500/625'],
    brand: 'STRYDEEVA',
    description: 'Sleek black jumpsuit with V-neck and wide legs. Belt included.',
    materialCare: 'Polyester Blend. Machine Wash.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '7',
    name: 'Cream Blouse',
    price: '₹3,900',
    image: 'https://picsum.photos/seed/creamblouse/500/625',
    images: ['https://picsum.photos/seed/creamblouse/500/625'],
    brand: 'STRYDEEVA',
    description: 'Lightweight cream blouse with subtle puff sleeves and front tie detail.',
    materialCare: 'Silk Blend. Dry Clean Only.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '8',
    name: 'Navy Blazer',
    price: '₹5,500',
    image: 'https://picsum.photos/seed/navyblazer/500/625',
    images: ['https://picsum.photos/seed/navyblazer/500/625'],
    brand: 'STRYDEEVA',
    description: 'Classic navy blazer with gold-tone buttons. Fitted cut for a sharp look.',
    materialCare: 'Wool Blend. Dry Clean Only.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '9',
    name: 'Rust Midi Skirt',
    price: '₹4,600',
    image: 'https://picsum.photos/seed/rustmidi/500/625',
    images: ['https://picsum.photos/seed/rustmidi/500/625'],
    brand: 'STRYDEEVA',
    description: 'A-line midi skirt in rust. Side zip and lining. Pairs with blouses or knits.',
    materialCare: 'Cotton Blend. Machine Wash.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
]

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id)
}

export function getSimilarProducts(currentId, limit = 3) {
  return PRODUCTS.filter((p) => p.id !== currentId).slice(0, limit)
}

export function parsePrice(priceStr) {
  if (!priceStr) return 0
  const num = String(priceStr).replace(/[₹,\s]/g, '')
  return parseInt(num, 10) || 0
}
