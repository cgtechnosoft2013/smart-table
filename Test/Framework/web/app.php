<?php

require_once __DIR__.'/../autoload.php';

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Debug\Debug;

Debug::enable();

require_once __DIR__.'/../AppKernel.php';

$kernel = new AppKernel('test', true);
//$kernel->loadClassCache();
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
