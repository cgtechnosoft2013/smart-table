<?php

namespace SDLab\Bundle\SmartTableBundle\Test\TableManager;

use SDLab\Bundle\SmartTableBundle\TableManager\BaseTableManager as AbstractTableManager;
use Doctrine\ORM\EntityManager;

class BaseTableManager extends AbstractTableManager
{
    /**
     * @var EntityManager 
     */
    private $entityManager;

    function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }
    
    public function getRowArray($row)
    {
        return $row->getBaseSerializedArray();
    }

    public function getRows()
    {
        $rows = $this->entityManager
                ->getRepository('SDLab\Bundle\SmartTableBundle\Test\Entity\Base')
                ->findForTable(
                $this->fastSearch, $this->customSearch, $this->sort, $this->offset, $this->limit
        );
        return $rows;
    }
    
    public function getTotalCount()
    {
        $rows = $this->entityManager
                ->getRepository('SDLab\Bundle\SmartTableBundle\Test\Entity\Base')
                ->findForTable();
        return count($rows);
    }
    
    
    public function getFilteredCount()
    {
        $rows = $this->entityManager
                ->getRepository('SDLab\Bundle\SmartTableBundle\Test\Entity\Base')
                ->findForTable(
                $this->fastSearch, $this->customSearch, $this->sort
        );
        return count($rows);
    }

}
