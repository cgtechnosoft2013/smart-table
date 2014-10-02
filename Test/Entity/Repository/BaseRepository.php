<?php

namespace SDLab\Bundle\SmartTableBundle\Test\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use SDLab\Bundle\SmartTableBundle\TableManager\BaseTableManager;


class BaseRepository extends EntityRepository
{
    
    public function findForTable($searchType=BaseTableManager::NO_SEARCH, $fastSearch='', $search=array(), $sort=array(), $offset=0, $limit=0)
    {
        $qb = $this->createQueryBuilder('t')
                ->setFirstResult($offset)
                ->setMaxResults($limit)
        ;
        
        foreach($sort as $sortArray) {
            $qb->addOrderBy('t.'.$sortArray['columnName'], $sortArray['dir']);
        }
        
        // perform fast search OR custum search
        if($searchType == BaseTableManager::FAST_SEARCH) {
            $qb ->where('t.id LIKE :search')
                ->orWhere('t.colA LIKE :search')
                ->orWhere('t.colB LIKE :search')
                ->orWhere('t.colC LIKE :search')
                ->setParameter('search', '%'.$fastSearch.'%')
            ;
        } elseif($searchType == BaseTableManager::CUSTOM_SEARCH) {
            
            foreach($search as $key => $value) {
                
                if('' != $value) {
                    
                   
                    if(is_array($value)) {
                        
                        $qb ->andWhere($qb->expr()->in('t.'.$key, ':param_'.$key))
                            ->setParameter('param_'.$key, $value)
                        ;
                        
                    } else {
                    
                        $qb ->andWhere('t.'.$key.' LIKE :param_'.$key)
                            ->setParameter('param_'.$key, '%'.$value.'%')
                        ;
                    }
                    
                }
            }
        }
        
        $paginator = new Paginator($qb->getQuery(), true);
        
        return $paginator;
    }
    
}
