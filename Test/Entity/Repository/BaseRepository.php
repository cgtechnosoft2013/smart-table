<?php

namespace SDLab\Bundle\SmartTableBundle\Test\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;


class BaseRepository extends EntityRepository
{
    
    public function findForTable($fastSearch='', $seach=array(), $sort=array(), $offset=0, $limit=0)
    {
        $qb = $this->createQueryBuilder('t')
                ->setFirstResult($offset)
                ->setMaxResults($limit)
        ;
        
        foreach($sort as $column => $direction) {
            $qb->addOrderBy('t.'.$column, $direction);
        }
        
        // perform fast search OR custum search
        if('' != $fastSearch) {
            $qb ->where('t.code LIKE :search')
                ->orWhere('t.name LIKE :search')
                ->orWhere('t.duration LIKE :search')
                ->orWhere('t.field LIKE :search')
                ->orWhere('t.subField LIKE :search')
                ->setParameter('search', '%'.$fastSearch.'%')
            ;
        } else {
            
            foreach($seach as $column => $value) {
                
                if('' != $value) {
                    
                    if(is_array($value)) {
                        
                        $qb ->andWhere($qb->expr()->in('t.'.$column, ':param_'.$column))
                            ->setParameter('param_'.$column, $value)
                        ;
                        
                    } else {
                    
                        $qb ->andWhere('t.'.$column.' LIKE :param_'.$column)
                            ->setParameter('param_'.$column, $value)
                        ;
                    }
                }
            }
        }
        
        $paginator = new Paginator($qb->getQuery(), true);
        
        return $paginator;
    }
    
}
