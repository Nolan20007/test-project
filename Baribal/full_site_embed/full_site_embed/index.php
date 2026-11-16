<?php

// Вот тут нужно указать ваш тестовый поддомен
const SITE_URL = 'example.creatium.site';

// Тут можно добавить разных перенаправлений с кодом 301
$redirects = [
    '/simple-redirect-a' => '/simple-redirect-b',
    '/multiple-redirect-a/*' => '/multiple-redirect-b/*',
];

// А тут подмены адреса можно настроить для ЧПУ
$rewrites = [
    '/simple-rewrite-a' => '/simple-rewrite-b',
    '/multiple-rewrite-a/*' => '/multiple-rewrite-b/*',
];



// Дальше лучше не трогать, без опыта в программировании

$path = $_SERVER['REQUEST_URI'];

foreach ($redirects as $from => $to) {
    $regexp = '/^' . str_replace('\\*', '([^\/\?\&\=]+)', preg_quote($from, '/')) . '/i';

    if (preg_match($regexp, $path, $match)) {
        header("HTTP/1.1 301 Moved Permanently");
        header("Location: " . str_replace('*', $match[1], $to));
        die();
    }
}

foreach ($rewrites as $from => $to) {
    $regexp = '/^' . str_replace('\\*', '([^\/\?\&\=]+)', preg_quote($from, '/')) . '/i';

    if (preg_match($regexp, $path, $match)) {
        $path = str_replace('*', $match[1], $to);
        break;
    }
}

include_once('creatium_embed.php');
creatium_embed(SITE_URL, $path);