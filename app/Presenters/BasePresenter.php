<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Components;
use Carrooi\Menu\UI\IMenuComponentFactory;
use Carrooi\Menu\UI\MenuComponent;
use App\Model\UserManager;

class BasePresenter extends Nette\Application\UI\Presenter
{


  protected function startup(): void
  {
    parent::startup();
		if(!$this->user->isLoggedIn()) {
      $this->redirect('Sign:in', ['backlink' => $this->storeRequest()]);
    }
  }

	public function actionLogout(): void
	{
		$this->getUser()->logout();
		$this->flashMessage('Odhlášení proběhlo úspěšně. Těšíme se na další návštěvu.');
		$this->redirect('Homepage:default');
	}

	protected function createComponentMenu(): MenuComponent
	{
		if ($this->getUser()->isLoggedIn())
			return $this->menuFactory->create('user');
		else {
			return $this->menuFactory->create('guest');
		}
	}

}
