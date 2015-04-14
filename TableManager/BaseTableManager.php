<?php

namespace SDLab\Bundle\SmartTableBundle\TableManager;

use Symfony\Component\HttpFoundation\Request;

abstract class BaseTableManager
{
    const NO_SEARCH = 0;
    const FAST_SEARCH = 1;
    const CUSTOM_SEARCH = 2;
    
    /**
     * @var Request 
     */
    protected $request;

    /**
     * name => value (string or array if multiple select)
     *  
     * @var array 
     */
    protected $customSearch = array();
    
    /**
     * @var string
     */
    protected $fastSearch;
    
    /**
     * NO_SEARCH | FAST_SEARCH | CUSTOM_SEARCH
     * 
     * @var intager 
     */
    protected $searchType = self::NO_SEARCH;

    /**
     * columnName => sortDirection
     * 
     * @var array 
     */
    protected $sort = array();
    
    /**
     * @var integer 
     */
    protected $limit;
    
    /**
     * @var integer 
     */
    protected $offset;

    abstract public function getTotalCount();
    
    abstract public function getFilteredCount();
    
    abstract public function getRows();
    
    abstract protected function getRowArray($row);

    /**
     * Set Request to manager to extract and organize data
     * 
     * @param \Symfony\Component\HttpFoundation\Request|array $request
     * @return \Plan\TrainingBundle\DataTable\TrainingTableManager
     */
    public function setRequest($request)
    {
        $this->request = $request;
        return $this;
    }
    
    public function extactSearch()
    {
        $extractor = new FilterExtractor();
        $extractor->setRequest($this->request)
                  ->extactSearch();
        
        $this->searchType = $extractor->getSearchType();
        $this->fastSearch = $extractor->getFastSearch();
        $this->customSearch = $extractor->getCustomSearch();
        
        return $this;
    }
    
    /**
     * Extract sort data from request
     */
    protected function extractSort()
    {
        if(null != $this->request->get('iSortCol_0', null) ) {
            // dataTable V1.9

            $sortColumnNb = intval($this->request->get('iSortCol_0'));
            $sortColumnName = self::secureString($this->request->get('mDataProp_'.$sortColumnNb));

            $this->sort = array(
                array(
                    'columnName' => $sortColumnName,
                    'dir' => intval($this->request->get('sSortDir_0'))
                )
            );
        } else {
            // dataTable V1.10+
            $columns = $this->request->get('columns');
            $sortArray = $this->request->get('order', array());

            // add column name to sort Array
            foreach($sortArray as $index => $sortColumnArray) {
                $sortColumnArray['columnName'] = self::secureString($columns[$sortColumnArray['column']]['name']);
                $sortArray[self::secureString($index)] = $sortColumnArray;
            }

            $this->sort = $sortArray;
        }
    }

    /**
     * Extract limits (limit and offset) from Request
     */
    protected function extactLimits()
    {
        $this->limit = intval($this->request->get('length', 0));
        $this->offset = intval($this->request->get('start', 0));
    }
    
    /**
     * @param integer $limit
     * @param integer $offset
     * @return \SDLab\Bundle\SmartTableBundle\TableManager\BaseTableManager
     */
    public function setLimits($limit, $offset)
    {
        $this->limit = intval($limit);
        $this->offset = intval($offset);
        
        return $this;
    }
    
    /**
     * Create array formated to be send to dataTable
     * 
     * @return array
     */
    public function getJsonResponse()
    {
        $this->extactSearch();
        $this->extractSort();
        $this->extactLimits();
        
        $json = array(
            'draw' => $this->request->get('draw', 0),
            'recordsTotal' => $this->getTotalCount(),
            'recordsFiltered' => $this->getFilteredCount(),
            'data' => array()
        );

        $rows = $this->getRows();
        foreach ($rows as $row) {
            $json['data'][] = $this->getRowArray($row);
        }
        return $json;
    }
    
    /**
     * Possibility to Secure (ensure there is no sql injection)
     * 
     * @param type $string
     */
    static public function secureString($string)
    {
        // no added security (managed by doctrine in main project)
        return $string;
    }

}
