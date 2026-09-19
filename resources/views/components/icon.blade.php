@props(['name', 'size' => 20])

@php
    $paths = [
        'hardhat' => '<path d="M4 15.5h16M6 15.5v2.5h12v-2.5M7 15.5V10a5 5 0 0 1 10 0v5.5M4.5 11h15M12 5v6"/>',
        'book' => '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5ZM4 5.5v15M8 7h8M8 11h8"/>',
        'arrow-right' => '<path d="M4 12h16M14 6l6 6-6 6"/>',
    ];
@endphp

<svg {{ $attributes->merge(['class' => 'shrink-0', 'width' => $size, 'height' => $size, 'viewBox' => '0 0 24 24', 'fill' => 'none', 'stroke' => 'currentColor', 'stroke-width' => '1.8', 'stroke-linecap' => 'round', 'stroke-linejoin' => 'round', 'aria-hidden' => 'true']) }}>{!! $paths[$name] ?? '' !!}</svg>
