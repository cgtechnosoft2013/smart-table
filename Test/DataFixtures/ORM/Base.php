<?php

namespace SDLab\Bundle\SmartTableBundle\Test\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

/*
 * @auto_generated
 */
class Base extends AbstractFixture implements OrderedFixtureInterface
{
    /**
     * {@inheritDoc}
     */
    public function load(ObjectManager $manager)
    {
        $class = new \ReflectionClass('SDLab\Bundle\SmartTableBundle\Test\Entity\Base');
        $propertyId = $class->getProperty('id');
        $propertyId->setAccessible(true);

        /*
        $metadata = $manager->getClassMetaData("SDLab\Bundle\SmartTableBundle\Test\Entity\Base");
        $metadata->setIdGeneratorType(\Doctrine\ORM\Mapping\ClassMetadata::GENERATOR_TYPE_NONE);
        $metadata->setIdGenerator(new \Doctrine\ORM\Id\AssignedGenerator());
        */
        
        for($i=0; $i < 100; $i++) {
            
            $row = new \SDLab\Bundle\SmartTableBundle\Test\Entity\Base();
            //$propertyId->setValue($row, $i);
            $row->setColA($this->generateRandomString());
            $row->setColB($this->generateRandomString(20));
            $row->setColC($this->generateRandomString(50)); 
            $manager->persist($row);
        }

        $manager->flush();
    }
    
    /**
     * {@inheritDoc}
     */
    public function getOrder()
    {
        return 1;
    }
    
    private function generateRandomString($length = 10) {
        
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $randomString;
    }
}