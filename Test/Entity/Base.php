<?php

namespace SDLab\Bundle\SmartTableBundle\Test\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="base")
 * @ORM\Entity(repositoryClass="SDLab\Bundle\SmartTableBundle\Test\Entity\Repository\BaseRepository")
 */
class Base
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="col_b", type="string")
     */
    private $colA;

    /**
     * @var string
     *
     * @ORM\Column(name="col_a", type="string")
     */
    private $colB;
    
    /**
     * @var string
     *
     * @ORM\Column(name="col_c", type="string")
     */
    private $colC;
    
    public function getBaseSerializedArray()
    {
        return array(
            'id' => $this->id,
            'colA' => $this->colA,
            'colB' => $this->colB,
            'colC' => $this->colC
        );
    }

    public function getId()
    {
        return $this->id;
    }
    
    public function setColA($value)
    {
        $this->colA = $value;
        
        return $this;
    }
    
    public function getColA()
    {
        return $this->colA;
    }
    
    public function setColB($value)
    {
        $this->colB = $value;
        
        return $this;
    }
    
    public function getColB()
    {
        return $this->colB;
    }
    
    public function setColC($value)
    {
        $this->colC = $value;
        
        return $this;
    }
    
    public function getColC()
    {
        return $this->colC;
    }
}
