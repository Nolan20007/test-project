<?php

function creatium_embed($subdomain, $path) {
    if (!function_exists('curl_init')) {
        die('Error: curl module is missing');
    }

    if (strpos($subdomain, '/') !== false) {
        die('Error: wrong subdomain');
    }

    $ch = curl_init("https://$subdomain/" . ltrim($path, '/'));

    $embed = '1';
    if (isset($_SERVER['HTTP_HOST']) && isset($_SERVER['REQUEST_URI'])) {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $embed = "$protocol://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    }

    $headers = ["X-Creatium-Embed: $embed"];

    // Передаем Cookie посетителя
    if (isset($_SERVER['HTTP_COOKIE'])) {
        $headers[] = "Cookie: $_SERVER[HTTP_COOKIE]";
    }

    // Передаем IP адрес посетителя
    if (isset($_SERVER['REMOTE_ADDR'])) {
        $headers[] = "X-Forwarded-For: $_SERVER[REMOTE_ADDR]";
    }

    foreach ($_SERVER as $key => $value) {
        if ($key === 'HTTP_HOST' || $key === 'HTTP_COOKIE') continue;
        else if (strpos($key, 'HTTP_') === 0) {

            // Преобразование строк типа HTTP_KEY_EXAMPLE в Key-Example
            $header = implode('-', array_map(
                'ucfirst', array_slice(explode('_', strtolower($key)), 1)
            ));

            $headers[] = "$header: $value";
        }
    }

    curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($ch, $header) use ($subdomain) {
        $length = strlen($header);

        if (strpos($header, ': ') > 0) {
            if (strpos(strtolower($header), 'transfer-encoding') === 0) {
                // Если кодирование отличается, ошибка возникает, поэтому пропускаем
            } else if (strpos(strtolower($header), 'location') === 0) {
                if (isset($_SERVER['HTTP_HOST'])) {
                    // По возможности заменяем домен на текущий в редиректах
                    header(str_ireplace($subdomain, $_SERVER['HTTP_HOST'], $header));
                }
            } else {
                header($header);
            }
        }

        return $length;
    });

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($ch);

    http_response_code(curl_getinfo($ch, CURLINFO_RESPONSE_CODE));

    if (curl_error($ch)) {
        die(curl_error($ch));
    }

    curl_close($ch);

    print $result;
}
