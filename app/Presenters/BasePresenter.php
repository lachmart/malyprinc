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
		$this->redirect('Map:default');
	}

	protected function createComponentMenu(): MenuComponent
	{
		if ($this->getUser()->isLoggedIn())
			return $this->menuFactory->create('user');
		else {
			return $this->menuFactory->create('guest');
		}
	}

  protected function makeBootstrap4(Nette\Application\UI\Form $form): void
  {
    $renderer = $form->getRenderer();
    $renderer->wrappers['controls']['container'] = null;
    $renderer->wrappers['pair']['container'] = 'div class="form-group row"';
    $renderer->wrappers['pair']['.error'] = 'has-danger';
    $renderer->wrappers['control']['container'] = 'div class=col-sm-9';
    $renderer->wrappers['label']['container'] = 'div class="col-sm-3 col-form-label"';
    $renderer->wrappers['control']['description'] = 'span class=form-text';
    $renderer->wrappers['control']['errorcontainer'] = 'span class=form-control-feedback';
    $renderer->wrappers['control']['.error'] = 'is-invalid';

    foreach ($form->getControls() as $control) {
      $type = $control->getOption('type');
      if ($type === 'button') {
        $control->getControlPrototype()->addClass(empty($usedPrimary) ? 'btn btn-primary' : 'btn btn-secondary');
        $usedPrimary = true;

      } elseif (in_array($type, ['text', 'textarea', 'select'], true)) {
        $control->getControlPrototype()->addClass('form-control');

      } elseif ($type === 'file') {
        $control->getControlPrototype()->addClass('form-control-file');

      } elseif (in_array($type, ['checkbox', 'radio'], true)) {
        if ($control instanceof Nette\Forms\Controls\Checkbox) {
          $control->getLabelPrototype()->addClass('form-check-label');
        } else {
          $control->getItemLabelPrototype()->addClass('form-check-label');
        }
        $control->getControlPrototype()->addClass('form-check-input');
        $control->getSeparatorPrototype()->setName('div')->addClass('form-check');
      }
    }
  }

}
