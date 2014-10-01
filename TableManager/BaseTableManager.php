<?php

namespace SDLab\Bundle\SmartTableBundle\TableManager;

use Symfony\Component\HttpFoundation\Request;

abstract class BaseTableManager
{
    const NO_SEARCH = 0;
    const FAST_SEARCH = 1;
    const CUSTOM_SEARCH = 2;
    const PARAM_LIST_SEPARATOR = ']__[';
    
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
    protected $fastSearch = self::NO_SEARCH;
    
    /**
     * NO_SEARCH | FAST_SEARCH | CUSTOM_SEARCH
     * 
     * @var intager 
     */
    protected $searchType;

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

    /**
     * Extract FastSearch data form request :
     * POST param "fastSearch"
     */
    protected function extractFastSearchData()
    {
        $fastSearch = $this->request->get('fastSearch', null);
        
        if($this->searchType == self::NO_SEARCH && null != $fastSearch && '' != $fastSearch) {
            
            $this->searchType = self::FAST_SEARCH;
            $this->fastSearch = $fastSearch;
        }
    }
    
    /**
     * Extract FastSearch data form request :
     * POST params starting with "customSearch-"
     */
    protected function extractCustomSearchData()
    {
        if($this->searchType == self::FAST_SEARCH) {
            return null;
        }
        
        foreach($this->request->request->all() as $key => $value) {
            
            if(substr($key, 0, 13) == 'customSearch-' && null != $value && '' != $value) {
                
                $this->customSearch[$key] = $this->getParamValue($value);
                $this->searchType = self::CUSTOM_SEARCH;
            }
        }
    }
    
    /**
     * Explode value string if contains list separator
     * 
     * @param string $value
     * @return string|array
     */
    protected function getParamValue($value)
    {
        if (strpos(self::PARAM_LIST_SEPARATOR, $value) != -1) {
            return explode(self::PARAM_LIST_SEPARATOR, $value);
        }
        
        return $value;
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
        $this->extractFastSearchData();
        $this->extractCustomSearchData();
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
