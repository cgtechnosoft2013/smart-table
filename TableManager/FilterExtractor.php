<?php

namespace SDLab\Bundle\SmartTableBundle\TableManager;

use Symfony\Component\HttpFoundation\Request;

class FilterExtractor
{    
    /**
     * @var array
     */
    protected $filterArray;

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
    protected $searchType = BaseTableManager::NO_SEARCH;

    /**
     * Set Request to manager to extract and organize data
     * 
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @return \Plan\TrainingBundle\DataTable\TrainingTableManager
     */
    public function setRequest(Request $request)
    {
        $this->searchType = $request->get('searchType', BaseTableManager::NO_SEARCH);
        $this->fastSearch = $request->get('fastSearch', null);
        $this->filterArray = $request->request->all();
        return $this;
    }
    
    /**
     * Set filter to manager
     * 
     * @param array $filter
     */
    public function setFilter(array $filter)
    {
        $this->searchType = isset($filter['searchType']) ? $filter['searchType'] : BaseTableManager::NO_SEARCH;
        $this->fastSearch = isset($filter['fastSearch']) ? $filter['fastSearch'] : null;
        $this->filterArray = $filter;
        return $this;
    }
    
    
    public function getSearchType()
    {
        return $this->searchType;
    }
    
    public function getFastSearch()
    {
        return $this->fastSearch;
    }
    
    public function getCustomSearch()
    {
        return $this->customSearch;
    }
    
    
    public function extactSearch()
    {
        if($this->searchType == BaseTableManager::FAST_SEARCH) {
            
            if(null == $this->fastSearch || '' == $this->fastSearch) {
                $this->searchType = BaseTableManager::NO_SEARCH;
            }
            
        } elseif($this->searchType == BaseTableManager::CUSTOM_SEARCH) {
            $this->extractCustomSearchData();
        }
    }
    
    /**
     * Extract FastSearch data form filter :
     * POST params starting with "customSearch-"
     */
    public function extractCustomSearchData()
    {
        if($this->searchType != BaseTableManager::CUSTOM_SEARCH) {
            return;
        }
        
        foreach($this->filterArray as $key => $value) {
            
            if(substr($key, 0, 13) == 'customSearch-' && null != $value && '' != $value && '[""]' != $value) {
                
                $this->customSearch[substr($key, 13)] = $this->getParamValue($value);
                $this->searchType = BaseTableManager::CUSTOM_SEARCH;
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
        if (null !== json_decode($value) && $value !== '') {
            return json_decode($value);
        }
        
        return $value;
    }

}
