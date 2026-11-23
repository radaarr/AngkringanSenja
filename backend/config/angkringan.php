<?php

return [
    'tax' => [
        'enabled' => env('TAX_ENABLED', true),
        'rate' => env('TAX_RATE', 10),
    ],

    'service_charge' => [
        'enabled' => env('SERVICE_CHARGE_ENABLED', false),
        'rate' => env('SERVICE_CHARGE_RATE', 0),
    ],
];
