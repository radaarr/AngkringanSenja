<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Role;
use App\Models\Table;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $roles = collect(['Owner','Cashier','Kitchen Staff'])->mapWithKeys(fn ($name) => [
            $name => Role::query()->create(['name' => $name, 'slug' => Str::slug($name, '_')])->id,
        ]);

        User::query()->create(['name'=>'Owner','email'=>'owner@angkringan.test','password'=>Hash::make('password'),'role_id'=>$roles['Owner'],'is_active'=>true]);
        User::query()->create(['name'=>'Kasir','email'=>'cashier@angkringan.test','password'=>Hash::make('password'),'role_id'=>$roles['Cashier'],'is_active'=>true]);
        User::query()->create(['name'=>'Dapur','email'=>'kitchen@angkringan.test','password'=>Hash::make('password'),'role_id'=>$roles['Kitchen Staff'],'is_active'=>true]);

        $catNasi = Category::query()->create(['name'=>'Nasi & Makanan','slug'=>'nasi-makanan','sort_order'=>1]);
        $catSate = Category::query()->create(['name'=>'Sate-satean','slug'=>'sate-satean','sort_order'=>2]);
        $catMinum = Category::query()->create(['name'=>'Minuman','slug'=>'minuman','sort_order'=>3]);

        $products = [
            ['category_id'=>$catNasi->id,'name'=>'Nasi Kucing','slug'=>'nasi-kucing','price'=>5000,'is_featured'=>true,'description'=>'Nasi hangat porsi pas dengan sambal dan topping khas angkringan.'],
            ['category_id'=>$catNasi->id,'name'=>'Nasi Bakar','slug'=>'nasi-bakar','price'=>8000,'description'=>'Nasi berbumbu dibakar dalam daun pisang, harum dan gurih.'],
            ['category_id'=>$catSate->id,'name'=>'Sate Usus','slug'=>'sate-usus','price'=>4000,'is_featured'=>true,'description'=>'Sate usus ayam bumbu manis gurih, dibakar hingga kecokelatan.'],
            ['category_id'=>$catSate->id,'name'=>'Sate Telur Puyuh','slug'=>'sate-telur-puyuh','price'=>5000,'description'=>'Telur puyuh bacem manis gurih, favorit pendamping nasi kucing.'],
            ['category_id'=>$catMinum->id,'name'=>'Wedang Jahe','slug'=>'wedang-jahe','price'=>7000,'is_featured'=>true,'description'=>'Minuman jahe hangat dengan gula, pas untuk menemani malam.'],
            ['category_id'=>$catMinum->id,'name'=>'Teh Manis Hangat','slug'=>'teh-manis-hangat','price'=>4000,'description'=>'Teh manis hangat klasik, sederhana dan menenangkan.'],
        ];
        foreach ($products as $i => $p) {
            Product::query()->create($p + ['is_available'=>true,'sort_order'=>$i+1]);
        }

        foreach (range(1,5) as $i) {
            Table::query()->create(['name'=>"Meja $i",'code'=>"M$i",'qr_token'=>Str::random(32),'is_active'=>true]);
        }

        $beras = Ingredient::query()->create(['name'=>'Beras','unit'=>'kg','current_stock'=>10,'min_stock'=>2]);
        $telur = Ingredient::query()->create(['name'=>'Telur Puyuh','unit'=>'pcs','current_stock'=>100,'min_stock'=>20]);
        $nasi = Product::query()->where('slug','nasi-kucing')->first();
        $sateTelur = Product::query()->where('slug','sate-telur-puyuh')->first();
        if ($nasi) Recipe::query()->create(['product_id'=>$nasi->id,'ingredient_id'=>$beras->id,'quantity_required'=>0.1,'unit'=>'kg']);
        if ($sateTelur) Recipe::query()->create(['product_id'=>$sateTelur->id,'ingredient_id'=>$telur->id,'quantity_required'=>3,'unit'=>'pcs']);
    }
}