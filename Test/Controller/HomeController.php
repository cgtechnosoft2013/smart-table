<?php

namespace SDLab\Bundle\SmartTableBundle\Test\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class HomeController extends Controller
{
    
    /**
     * @Route("/")
     * @Template("SDLabSmartTableBundle:Test:Home/home.html.twig")
     */
    public function homeAction()
    {
        return array();
    }

}
