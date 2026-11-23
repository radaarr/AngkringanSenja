<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $imageUrl = $this->image_path
            ? (str_starts_with($this->image_path, 'http') ? $this->image_path : Storage::disk('public')->url($this->image_path))
            : $this->fallbackImage($this->slug, $this->name);

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'image_path' => $this->image_path,
            'image_url' => $imageUrl,
            'is_available' => $this->is_available,
            'is_featured' => $this->is_featured,
            'sort_order' => $this->sort_order,
            'archived_at' => $this->archived_at?->toISOString(),
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }

    private function fallbackImage(?string $slug, ?string $name): string
    {
        $map = [
            'nasi-kucing' => 'http://localhost:8000/storage/products/nasi-kucing.jpeg',
            'nasi-bakar' => 'http://localhost:8000/storage/products/nasi-bakar.jpg',
            'sate-usus' => 'http://localhost:8000/storage/products/sate-ususjpg.jpg',
            'sate-telur-puyuh' => 'http://localhost:8000/storage/products/sate-telur-puyuh.jpg',
            'wedang-jahe' => 'http://localhost:8000/storage/products/wedang-jahe.jpg',
            'teh-manis-hangat' => 'http://localhost:8000/storage/products/teh-manis-hangat.jpg',
            'nasi-sambal-teri' => 'http://localhost:8000/storage/products/nasi-sambal-teri.jpg',
            'nasi-ayam-suwir' => 'http://localhost:8000/storage/products/nasi-ayam-suwir.jpg',
            'nasi-orek-tempe' => 'http://localhost:8000/storage/products/nasi-orek-tempe.jpg',
            'nasi-bandeng-presto' => 'http://localhost:8000/storage/products/nasi-bandeng-presto.jpg',
            'sate-ati-ampela' => 'http://localhost:8000/storage/products/sate-ati-ampela.jpg',
            'sate-kulit' => 'http://localhost:8000/storage/products/sate-kulit.jpg',
            'sate-bakso-bakar' => 'http://localhost:8000/storage/products/sate-bakso-bakar.jpg',
            'sosis-bakar' => 'http://localhost:8000/storage/products/sosis-bakar.jpg',
            'tempe-mendoan' => 'http://localhost:8000/storage/products/tempe-mendoan.jpg',
            'bakwan-sayur' => 'http://localhost:8000/storage/products/bakwan-sayur.jpg',
            'tahu-isi' => 'http://localhost:8000/storage/products/tahu-isi.jpg',
            'pisang-goreng' => 'http://localhost:8000/storage/products/pisang-goreng.jpg',
            'cireng-bumbu-rujak' => 'http://localhost:8000/storage/products/cireng-bumbu-rujak.jpg',
            'kopi-tubruk' => 'http://localhost:8000/storage/products/kopi-tubruk.jpg',
            'susu-jahe' => 'http://localhost:8000/storage/products/susu-jahe.jpg',
            'es-teh-manis' => 'http://localhost:8000/storage/products/es-teh-manis.jpg',
            'jeruk-hangat' => 'http://localhost:8000/storage/products/jeruk-hangat.jpg',
            'wedang-uwuh' => 'http://localhost:8000/storage/products/wedang-uwuh.jpg',
        ];

        if ($slug && isset($map[$slug])) {
            return $map[$slug];
        }

        $generic = [
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80',
        ];
        return $generic[abs(crc32((string) $slug ?: (string) $name)) % count($generic)];
    }
}