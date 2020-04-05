<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Components;


class AjaxPresenter extends BasePresenter
{

  public function actionFly(): void
  {

    //  var_dump($_GET);
  		//$this->payload->message = 'Success';
      //$this->sendPayload();
      $data = ['one' => $_GET['id'],'two' => $_GET['time'],'three' => 'hello'];

	     $this->sendJson($data);
  	  $this->terminate();
  }
}
