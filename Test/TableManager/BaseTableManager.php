<?php

namespace SDLab\Bundle\SmartTableBundle\Test\TableManager;

use Doctrine\ORM\EntityManager;
use Symfony\Component\HttpFoundation\Request;

class BaseTableManager
{

    function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    private $em;
    private $customSearch = array();
    private $fastSearch;
    private $sort;
    private $limit;
    private $offset;
    private $request;
    private $customFields = array();

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @return \Plan\TrainingBundle\DataTable\TrainingTableManager
     */
    public function setRequest(Request $request)
    {
        $this->request = $request;
        return $this;
    }

    public function setCustumSearchFields(array $customFields)
    {
        $this->customFields = $customFields;

        return $this;
    }

    private function manageRequest()
    {
        $this->manageSearch();
        $this->manageOrder();
        $this->manageLimit();
    }

    private function manageSearch()
    {
        $fastSearch = $this->request->get('fastSearch', null);

        if (null != $fastSearch && '' != $fastSearch) {
            $this->fastSearch = $fastSearch;
            return;
        }

        foreach ($this->customFields as $field) {

            $value = $this->request->get('cs-' . $field, null);

            if (null != $value && '' != $value) {

                if (strpos('__s__', $value) != -1) {
                    $value = explode('__s__', $value);
                }

                $this->customSearch[$field] = $value;
            }
        }
    }

    private function manageOrder()
    {
        $columns = explode(',', $this->request->get('sColumns'));

        $iSortCol = $columns[$this->request->get('iSortCol_0', 0)];
        $sSortDir = $this->request->get('sSortDir_0', 'asc');

        $this->sort = array($iSortCol => $sSortDir);
    }

    private function manageLimit()
    {
        $this->limit = $this->request->get('iDisplayLength', 0);
        $this->offset = $this->request->get('iDisplayStart', 0);
    }

    public function getTrainings()
    {
        $trainings = $this->em
                ->getRepository('SDLab\Bundle\SmartTableBundle\Test\Entity\Base')
                ->findForTable(
                $this->fastSearch, $this->customSearch, $this->sort, $this->offset, $this->limit
        );
        return $trainings;
    }

    public function getCount()
    {
        $trainings = $this->em
                ->getRepository('SDLab\Bundle\SmartTableBundle\Test\Entity\Base')
                ->findForTable(
                $this->fastSearch, $this->customSearch, $this->sort
        );
        return count($trainings);
    }

    /*
      public function deleteFilter(){
      $trainings = $this->em
      ->getRepository('PlanTrainingBundle:Training')
      ->findByRequest($this->customSearch);
      foreach($trainings as $training){
      $this->em->remove($this->em->getRepository('PlanTrainingBundle:Training')->find($training['id']));
      }
      $this->em->flush();
      return count($trainings);
      }

      public function end(){
      $this->getLimit();
      $this->getOffset();
      $this->getSearch();
      $this->getSort();
      return $this;
      }
     * 
     */

    public function getJsonResponse()
    {

        $this->manageRequest();

        $count = $this->getCount();

        $json = array(
            'draw' => $this->request->get('sEcho', 0),
            'recordsTotal' => $count,
            'recordsFiltered' => $count,
            'data' => array()
        );

        $trainings = $this->getTrainings();
        foreach ($trainings as $training) {
            $json['data'][] = $training->getBaseSerializedArray();
        }
        return $json;
    }

}
