<?php
declare(strict_types=1);
namespace OCA\Perpera\Controller;
use PHPUnit\Framework\TestCase;
use OCP\AppFramework\Http\JSONResponse;
class PerperaControllerTest extends TestCase {
    private $appName;
    private $request;
    protected $perpera;

    protected function setUp() {
        parent::setUp();
        $this->appName = 'perpera';
        $this->request = $this->getMockBuilder('\OCP\IRequest')
            ->disableOriginalConstructor()
            ->getMock();
        $this->perpera = new \OCA\Perpera\Controller\PerperaController($this->appName, $this->request);
    }

    public function testPerperaController() {
        $this->assertEquals(true, $this->perpera->checkAlgorithmType("sha2-256"));
        $this->assertEquals(true, $this->perpera->checkAlgorithmType("sha2-512"));
        $this->assertEquals(true, $this->perpera->checkAlgorithmType("sha3-256"));
        $this->assertEquals(true, $this->perpera->checkAlgorithmType("sha3-512"));
        $this->assertEquals(false, $this->perpera->checkAlgorithmType("sha-512"));
    }
}
