<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class MenuExpansionSeeder extends Seeder
{
    public function run(): void
    {
        $nasi = Category::query()->firstOrCreate(['slug' => 'nasi-makanan'], ['name' => 'Nasi & Makanan', 'sort_order' => 1, 'is_active' => true]);
        $sate = Category::query()->firstOrCreate(['slug' => 'sate-satean'], ['name' => 'Sate-satean', 'sort_order' => 2, 'is_active' => true]);
        $minum = Category::query()->firstOrCreate(['slug' => 'minuman'], ['name' => 'Minuman', 'sort_order' => 3, 'is_active' => true]);
        $gorengan = Category::query()->firstOrCreate(['slug' => 'gorengan-camilan'], ['name' => 'Gorengan & Camilan', 'sort_order' => 4, 'is_active' => true]);

        $items = [
            ['category_id' => $nasi->id, 'name' => 'Nasi Sambal Teri', 'slug' => 'nasi-sambal-teri', 'price' => 7000, 'is_featured' => true, 'description' => 'Nasi hangat dengan sambal teri pedas gurih khas angkringan.', 'image_path' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 10],
            ['category_id' => $nasi->id, 'name' => 'Nasi Ayam Suwir', 'slug' => 'nasi-ayam-suwir', 'price' => 9000, 'description' => 'Nasi porsi pas dengan ayam suwir bumbu pedas manis.', 'image_path' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 11],
            ['category_id' => $nasi->id, 'name' => 'Nasi Orek Tempe', 'slug' => 'nasi-orek-tempe', 'price' => 6000, 'description' => 'Nasi hangat dengan orek tempe manis gurih dan renyah.', 'image_path' => 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 12],
            ['category_id' => $nasi->id, 'name' => 'Nasi Bandeng Presto', 'slug' => 'nasi-bandeng-presto', 'price' => 12000, 'description' => 'Nasi dengan bandeng presto lembut, duri lunak, kaya rasa.', 'image_path' => 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 13],

            ['category_id' => $sate->id, 'name' => 'Sate Ati Ampela', 'slug' => 'sate-ati-ampela', 'price' => 5000, 'description' => 'Sate ati ampela bacem manis gurih, dibakar hingga wangi.', 'image_path' => 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 20],
            ['category_id' => $sate->id, 'name' => 'Sate Kulit', 'slug' => 'sate-kulit', 'price' => 4000, 'is_featured' => true, 'description' => 'Sate kulit ayam renyah gurih dengan bumbu bacem khas.', 'image_path' => 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 21],
            ['category_id' => $sate->id, 'name' => 'Sate Bakso Bakar', 'slug' => 'sate-bakso-bakar', 'price' => 5000, 'description' => 'Bakso tusuk dibakar dengan olesan kecap pedas manis.', 'image_path' => 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 22],
            ['category_id' => $sate->id, 'name' => 'Sosis Bakar', 'slug' => 'sosis-bakar', 'price' => 6000, 'description' => 'Sosis bakar jumbo dengan saus pedas dan mayones.', 'image_path' => 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 23],

            ['category_id' => $gorengan->id, 'name' => 'Tempe Mendoan', 'slug' => 'tempe-mendoan', 'price' => 4000, 'is_featured' => true, 'description' => 'Tempe tipis berbalut tepung, digoreng setengah matang, gurih lembut.', 'image_path' => 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 30],
            ['category_id' => $gorengan->id, 'name' => 'Bakwan Sayur', 'slug' => 'bakwan-sayur', 'price' => 3000, 'description' => 'Gorengan bakwan sayur renyah, cocok jadi teman wedang hangat.', 'image_path' => 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 31],
            ['category_id' => $gorengan->id, 'name' => 'Tahu Isi', 'slug' => 'tahu-isi', 'price' => 3000, 'description' => 'Tahu goreng isi sayuran berbumbu, renyah di luar lembut di dalam.', 'image_path' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 32],
            ['category_id' => $gorengan->id, 'name' => 'Pisang Goreng', 'slug' => 'pisang-goreng', 'price' => 5000, 'description' => 'Pisang goreng manis legit dengan balutan tepung renyah.', 'image_path' => 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 33],
            ['category_id' => $gorengan->id, 'name' => 'Cireng Bumbu Rujak', 'slug' => 'cireng-bumbu-rujak', 'price' => 5000, 'description' => 'Cireng kenyal gurih disajikan dengan sambal rujak pedas manis.', 'image_path' => 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 34],

            ['category_id' => $minum->id, 'name' => 'Kopi Tubruk', 'slug' => 'kopi-tubruk', 'price' => 6000, 'is_featured' => true, 'description' => 'Kopi hitam tubruk khas angkringan, pekat dan aromatik.', 'image_path' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 40],
            ['category_id' => $minum->id, 'name' => 'Susu Jahe', 'slug' => 'susu-jahe', 'price' => 8000, 'description' => 'Perpaduan susu hangat dan jahe segar, menenangkan dan menghangatkan.', 'image_path' => 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 41],
            ['category_id' => $minum->id, 'name' => 'Es Teh Manis', 'slug' => 'es-teh-manis', 'price' => 5000, 'description' => 'Teh manis segar dengan es batu, pelepas dahaga favorit.', 'image_path' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 42],
            ['category_id' => $minum->id, 'name' => 'Jeruk Hangat', 'slug' => 'jeruk-hangat', 'price' => 6000, 'description' => 'Perasan jeruk segar disajikan hangat, kaya vitamin C.', 'image_path' => 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 43],
            ['category_id' => $minum->id, 'name' => 'Wedang Uwuh', 'slug' => 'wedang-uwuh', 'price' => 8000, 'description' => 'Minuman rempah khas Jogja dengan kayu secang, jahe, dan cengkeh.', 'image_path' => 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=1200&q=80', 'sort_order' => 44],
        ];

        foreach ($items as $item) {
            $slug = $item['slug'];
            $data = array_merge([
                'is_available' => true,
                'is_featured' => false,
                'archived_at' => null,
            ], $item);
            Product::query()->updateOrCreate(['slug' => $slug], $data);
        }
    }
}
