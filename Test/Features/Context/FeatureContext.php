<?php

namespace SDLab\Bundle\SmartTableBundle\Test\Features\Context;

use Symfony\Component\HttpKernel\KernelInterface;
use Behat\Symfony2Extension\Context\KernelAwareInterface;
use Behat\MinkExtension\Context\MinkContext;
use Behat\Behat\Event\StepEvent;
use Behat\Mink\Driver\Selenium2Driver;
use Behat\Behat\Context\BehatContext,
    Behat\Behat\Exception\PendingException;
use Behat\Gherkin\Node\PyStringNode,
    Behat\Gherkin\Node\TableNode;
use Behat\Behat\Context\Step;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Behat\Mink\Exception\ResponseTextException;
use Behat\Mink\Exception\ElementTextException;

//
// Require 3rd-party libraries here:
//
//   require_once 'PHPUnit/Autoload.php';
//   require_once 'PHPUnit/Framework/Assert/Functions.php';
//

/**
 * Feature context.
 */
class FeatureContext extends MinkContext //MinkContext if you want to test web implements KernelAwareInterface { { { {
{
    private $kernel;
    private $parameters;

    /**
     * Initializes context with parameters from behat.yml.
     *
     * @param array $parameters
     */
    public function __construct(array $parameters) {
        $this->parameters = $parameters;
    }

    /**
     * Sets HttpKernel instance.
     * This method will be automatically called by Symfony2Extension ContextInitializer.
     *
     * @param KernelInterface $kernel
     */
    public function setKernel(KernelInterface $kernel) {
        $this->kernel = $kernel;
    }

    /**
     * Take screenshot when step fails.
     * Works only with Selenium2Driver.
     *
     * @AfterStep
     */
    public function takeScreenshotAfterFailedStep(StepEvent $event) {

        if (StepEvent::FAILED === $event->getResult()) {
            echo 'This step failed.';
            $driver = $this->getSession()->getDriver();
            if ($driver instanceof Selenium2Driver) {

                $step = $event->getStep();
                $id = $step->getParent()->getTitle() . '.' . $step->getType() . ' ' . $step->getText();
                $fileName = 'Test/Framework/app/screenshot/' . 'Fail.' . preg_replace('/[^a-zA-Z0-9-_\.]/', '_', $id) . '.jpg';

                file_put_contents($fileName, $driver->getScreenshot());
            }
        } else if ($event->getResult() == 1) {
            echo 'This step skipped.';
        }
    }

    /**
     * @Then /^I wait for (\d+) second$/
     */
    public function iWaitForSecond($second) {
        $this->getSession()->wait($second * 1000);
    }
    
    /**
     * Wait until the page contains specified text.
     *
     * @Then /^(?:|I )wait to see "(?P<text>(?:[^"]|\\")*)"$/
     */
    public function IWaitForSeen($text)
    {
        $this->spin(function($context) use ($text){
            return $context->pageTextContains($text);
        }, 20);
    }
    
    /**
     * Wait until specified CSS contains specified text.
     *
     * @Then /^(?:|I )wait to see "(?P<text>(?:[^"]|\\")*)" in the "(?P<element>[^"]*)" element$/
     */
    public function iWaitToSeeInTheElement($element, $text)
    {
        $this->spin(function($context) use ($element, $text){
            return $context->elementTextContains('css', $element, $context->publicFixStepArgument($text));
        }, 20);
    }
   
    /**
     * @Then /^(?:|I )take a screeshot$/
     */
    public function iTakeAScreenShot() {
        $driver = $this->getSession()->getDriver();
        file_put_contents("Test/Framework/app/screenshot/".uniqid().'.jpg', $driver->getScreenshot());
    }

    public function spin ($lambda, $wait = 60)
    {
        for ($i = 0; $i < $wait; $i++)
        {
            try {
                if ($lambda($this)) {
                    return true;
                }
            } catch (Exception $e) {
                // do nothing
            }

            sleep(1);
        }

        $backtrace = debug_backtrace();

        throw new \Exception('Spin error');
    }
    
    public function pageTextContains($text)
    {
        try {
            $this->assertSession()->pageTextContains($text);
            return true;
        } catch(ResponseTextException $e) {
            return false;
        }
    }
    
    public function elementTextContains($selectorType, $selector, $test)
    {
        try {
            $this->assertSession()->elementTextContains($selectorType, $selector, $test);
            return true;
        } catch(ElementTextException $e) {
            return false;
        }
    }
    
    public function publicFixStepArgument($argument)
    {
        return $this->fixStepArgument($argument);
    }
}
