<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Components;


class HomepagePresenter extends BasePresenter
{

  /** @var string */
  	private $anyVariable;

  public function renderDefault()
	{
		if ($this->anyVariable === null) {
			$this->anyVariable = 'default value';
		}
		$this->template->anyVariable = $this->anyVariable;
	}

  	public function handleChangeVariable()
  	{
  		$this->anyVariable = 'changed value via ajax';
  		if ($this->isAjax()) {
  			$this->redrawControl('ajaxChange');
  		}
  	}

  public function actionFly(int $id): void
  {


  		//$this->payload->message = 'Success';
      //$this->sendPayload();
      $data = ['one' => 'Singular sensation','two' => 'Beady little eyes','three' => 'hello'];

	     $this->sendJson($data);
  	  $this->terminate();
  }
}
