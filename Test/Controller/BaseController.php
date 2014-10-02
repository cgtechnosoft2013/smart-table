<?php

namespace SDLab\Bundle\SmartTableBundle\Test\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class BaseController extends Controller
{
    
    /**
     * @Route("/table/test/base", name="table-base")
     * @Template("SDLabSmartTableBundle:Test:Base/base.html.twig")
     */
    public function baseAction()
    {
        return array();
    }
    
    /**
     * @Route("/table/test/jarvis", name="table-jarvis")
     * @Template("SDLabSmartTableBundle:Test:Base/jarvis.html.twig")
     */
    public function jarvisAction()
    {
        return array();
    }
    
    
    /**
     * @Route("/table/test/base/data", name="table-base-data")
     */
    public function baseDataAction(Request $request)
    {
        if (true !== $request->isXmlHttpRequest()) {
            throw new AccessDeniedHttpException();
        }

        $tableManager = $this->get('sdlab.smart_table.test.base.manager');
        
        $json = $tableManager
                ->setRequest($request)
                //->setCustumSearchFields(array('name', 'field', 'subField'))
                ->getJsonResponse();

        return new JsonResponse($json);
    }

}
