<?php
/**
 * Load Javascript
 */

use OCP\Util;

$csp = new \OCP\AppFramework\Http\ContentSecurityPolicy();
$csp->addAllowedConnectDomain('\'self\'');
$csp->addAllowedConnectDomain('https://tblockbook.peercoin.net');
$csp->addAllowedConnectDomain('https://blockbook.peercoin.net');
$cspManager = \OC::$server->query(\OCP\Security\IContentSecurityPolicyManager::class);
$cspManager->addDefaultPolicy($csp);

$eventDispatcher = \OC::$server->getEventDispatcher();
$eventDispatcher->addListener('OCA\Files::loadAdditionalScripts', function(){
    Util::addScript('perpera', 'perpera.tabview' );
    Util::addScript('perpera', 'perpera.plugin' );
    Util::addScript('perpera', 'perpera' );
    Util::addStyle('perpera', 'perpera' );
});

