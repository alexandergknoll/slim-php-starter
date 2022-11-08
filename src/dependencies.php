<?php

use Slim\Http\Uri;
use Slim\Http\Environment;
use Slim\Views\Twig;
use Slim\Views\TwigExtension;
use Monolog\Logger;
use Monolog\Processor\UidProcessor;
use Monolog\Handler\StreamHandler;

$c = $app->getContainer();

// Register Twig on container
$c['view'] = function ($c) {
    // Instantiate and add Slim specific extension
    $basePath = rtrim(str_ireplace('index.php', '', $c->get('request')->getUri()->getBasePath()), '/');
    $view->addExtension(new TwigExtension($c->get('router'), $basePath));

    return $view;
};


// Register Twig View helper
$c['view'] = function ($c) {
    $settings = $c->get('settings')['view'];

    $debug = $settings['environment'] != 'production';
    $cache = $settings['environment'] == 'production' ? __DIR__ . '/../cache' : false;
    $view = new Twig($settings['template_path'], [
        'debug' => $debug,
        'cache' => $cache
    ]);

    // Instantiate and add Slim specific extension
    $router = $c->get('router');
    $uri = Uri::createFromEnvironment(new Environment($_SERVER));
    $view->addExtension(new TwigExtension($router, $uri));

    return $view;
};


// Register Monolog logger
$c['logger'] = function ($c) {
    $settings = $c->get('settings')['logger'];
    $logger = new Logger($settings['name']);
    $logger->pushProcessor(new UidProcessor());
    $logger->pushHandler(new StreamHandler($settings['path'], $settings['level']));
    return $logger;
};