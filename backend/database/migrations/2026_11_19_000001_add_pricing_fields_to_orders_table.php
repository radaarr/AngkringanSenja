<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->foreignId('promotion_id')->nullable()->after('table_id')->constrained('promotions')->nullOnDelete();
            $table->string('promotion_code', 50)->nullable()->after('promotion_id');
            $table->decimal('service_charge_amount', 12, 2)->default(0)->after('discount_amount');
            $table->decimal('tax_amount', 12, 2)->default(0)->after('service_charge_amount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('promotion_id');
            $table->dropColumn(['promotion_code', 'service_charge_amount', 'tax_amount']);
        });
    }
};
