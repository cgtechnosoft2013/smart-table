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
    protected $sort;
    
    /**
     * @var integer 
     */
    protected $limit;
    
    /**
     * @var integer 
     */
    protected $offset;

    abstract protected function getTotalCount();
    
    abstract protected function getFilteredCount();
    
    abstract protected function getRows();
    
    abstract protected function getRowArray($row);

    /**
     * Set Request to manager to extract and organize data
     * 
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @return \Plan\TrainingBundle\DataTable\TrainingTableManager
     */
    public function setRequest(Request $request)
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
    }
    
    /**
     * Extract sort data from request
     */
    protected function extractSort()
    {
        $columns = $this->request->get('columns');
        $sortArray = $this->request->get('order', array());
        
        // add column name to sort Array
        foreach($sortArray as $index => $sortColumnArray) {
            $sortColumnArray['columnName'] = $columns[$sortColumnArray['column']]['name'];
            $sortArray[$index] = $sortColumnArray;
        }

        $this->sort = $sortArray;
    }

    /**
     * Extract limits (limit and offset) from Request
     */
    protected function extactLimits()
    {
        $this->limit = $this->request->get('length', 0);
        $this->offset = $this->request->get('start', 0);
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

}
