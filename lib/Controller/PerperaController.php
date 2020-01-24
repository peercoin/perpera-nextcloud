<?php
namespace OCA\Perpera\Controller;

use OCP\AppFramework\Controller;
use OCP\IRequest;
use OC\Files\Filesystem;
use OCP\AppFramework\Http\JSONResponse;


class PerperaController extends Controller {

		protected $language;

		public function __construct($appName, IRequest $request) {

				parent::__construct($appName, $request);

				// get i10n
				$this->language = \OC::$server->getL10N('perpera');

		}

		/**
		 * callback function to get md5 hash of a file
		 * @NoAdminRequired
		 * @param (string) $source - filename
		 * @param (string) $type - hash algorithm type
		 */
	  public function hash($source, $type) {
	  		if(!$this->checkAlgorithmType($type)) {
	  			return new JSONResponse(
							array(
									'response' => 'error',
									'msg' => $this->language->t('The algorithm type "%s" is not a valid or supported algorithm type.', array($type))
							)
					);
	  		}

				if($hash = $this->getHash($source, $type)){
						return new JSONResponse(
								array(
										'response' => 'success',
										'msg' => $hash
								)
						);
				} else {
						return new JSONResponse(
								array(
										'response' => 'error',
										'msg' => $this->language->t('File not found.')
								)
						);
				};

	  }

	  protected function getHash($source, $type) {

	  	if($info = Filesystem::getLocalFile($source)) {
			if ($type == "sha2-256") {
				return hash_file("sha256", $info);
			}
			if ($type == "sha2-512") {
				return hash_file("sha512", $info);
			}
			if ($type == "sha3-256") {
				return hash("sha3-256", file_get_contents($info));
			}
			if ($type == "sha3-512") {
				return hash("sha3-512", file_get_contents($info));
			}
	  	}

	  	return false;
	  }

	  public function checkAlgorithmType($type) {
	  	return in_array($type, $this->getAllowedAlgorithmTypes());
	  }

	  protected function getAllowedAlgorithmTypes() {
	  	return array(
				'sha2-256',
				'sha2-512',
				'sha3-256',
				'sha3-512'
			);
		}
}

