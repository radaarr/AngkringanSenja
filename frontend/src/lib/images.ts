export const productFallbackImages: Record<string, string> = {
  'nasi-kucing': 'http://localhost:8000/storage/products/nasi-kucing.jpeg',
  'nasi-bakar': 'http://localhost:8000/storage/products/nasi-bakar.jpg',
  'sate-usus': 'http://localhost:8000/storage/products/sate-ususjpg.jpg',
  'sate-telur-puyuh': 'http://localhost:8000/storage/products/sate-telur-puyuh.jpg',
  'wedang-jahe': 'http://localhost:8000/storage/products/wedang-jahe.jpg',
  'teh-manis-hangat': 'http://localhost:8000/storage/products/teh-manis-hangat.jpg',
  'nasi-sambal-teri': 'http://localhost:8000/storage/products/nasi-sambal-teri.jpg',
  'nasi-ayam-suwir': 'http://localhost:8000/storage/products/nasi-ayam-suwir.jpg',
  'nasi-orek-tempe': 'http://localhost:8000/storage/products/nasi-orek-tempe.jpg',
  'nasi-bandeng-presto': 'http://localhost:8000/storage/products/nasi-bandeng-presto.jpg',
  'sate-ati-ampela': 'http://localhost:8000/storage/products/sate-ati-ampela.jpg',
  'sate-kulit': 'http://localhost:8000/storage/products/sate-kulit.jpg',
  'sate-bakso-bakar': 'http://localhost:8000/storage/products/sate-bakso-bakar.jpg',
  'sosis-bakar': 'http://localhost:8000/storage/products/sosis-bakar.jpg',
  'tempe-mendoan': 'http://localhost:8000/storage/products/tempe-mendoan.jpg',
  'bakwan-sayur': 'http://localhost:8000/storage/products/bakwan-sayur.jpg',
  'tahu-isi': 'http://localhost:8000/storage/products/tahu-isi.jpg',
  'pisang-goreng': 'http://localhost:8000/storage/products/pisang-goreng.jpg',
  'cireng-bumbu-rujak': 'http://localhost:8000/storage/products/cireng-bumbu-rujak.jpg',
  'kopi-tubruk': 'http://localhost:8000/storage/products/kopi-tubruk.jpg',
  'susu-jahe': 'http://localhost:8000/storage/products/susu-jahe.jpg',
  'es-teh-manis': 'http://localhost:8000/storage/products/es-teh-manis.jpg',
  'jeruk-hangat': 'http://localhost:8000/storage/products/jeruk-hangat.jpg',
  'wedang-uwuh': 'http://localhost:8000/storage/products/wedang-uwuh.jpg',
}

const generic = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80',
]

export function getProductImage(slug?: string | null, imageUrl?: string | null, id?: number): string {
  if (imageUrl) return imageUrl
  if (slug && productFallbackImages[slug]) return productFallbackImages[slug]
  return generic[(id || 0) % generic.length]
}
