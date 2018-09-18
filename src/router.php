<?php

use Slim\Http\Request;
use Slim\Http\Response;

$app->get('[/]', function (Request $request, Response $response, array $args) {
    // Merge locals into globals
    $content = [
        'pageTitle' => 'PHP Boilerplate'
    ];

    // Render the route
    return $this->view->render($response, 'index.html', $content);
})->setName('index');