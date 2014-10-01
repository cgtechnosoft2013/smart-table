<?php

namespace Test\Script;

use Sensio\Bundle\DistributionBundle\Composer\ScriptHandler as BaseScriptHandler;
use Composer\Script\CommandEvent;

class ScriptHandler extends BaseScriptHandler
{

    public static function addComponentsSymlink(CommandEvent $event)
    {
        $compentsDir = __DIR__.'/../../vendor/components';
        $webDir = __DIR__.'/../Framework/web/components';
        shell_exec('ln -s '.$compentsDir.' '.$webDir);
    }
    
    public static function addJSSymlink(CommandEvent $event)
    {
        $compentsDir = __DIR__.'/../../Resources/public/js';
        $webDir = __DIR__.'/../Framework/web/js';
        shell_exec('ln -s '.$compentsDir.' '.$webDir);
    }
    
    public static function addCssSymlink(CommandEvent $event)
    {
        $compentsDir = __DIR__.'/../../Resources/public/css';
        $webDir = __DIR__.'/../Framework/web/css';
        shell_exec('ln -s '.$compentsDir.' '.$webDir);
    }

}