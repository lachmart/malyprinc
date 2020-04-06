<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Components;
use App\Model\UserManager;


class DenikPresenter extends BasePresenter
{

  /** @var UserManager */
  protected $userManager;


  public function __construct(UserManager $userManager)
	{
    $this->userManager = $userManager;
	}


  public function renderPrukaz()
	{
		$this->template->pilotInfo = $this->userManager->getUserById($this->user->getId());
  }

}
