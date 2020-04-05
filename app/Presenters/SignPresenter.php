<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Components;
use Nette\Application\UI\Form;
use App\Model\UserManager;


class SignPresenter extends Nette\Application\UI\Presenter
{
  /** @var  Nette\Security\Passwords */
  private $passwords;

  /** @var UserManager */
  protected $userManager;

  public function __construct(Nette\Security\Passwords $passwords, UserManager $userManager)
	{
    $this->passwords = $passwords;
    $this->userManager = $userManager;
	}

  public function actionDefault()
  {
      // if($this->user->isLoggedIn()) {
      //     $this->redirect('Homepage:default');
      // } else {
      //     $this->redirect('Sign:in');
      // }
  }

  protected function createComponentRegisterForm()
	{
    $form = new Form;
    // mohu použít $this->database
    $form->addText('username', 'jméno')->setRequired('Zadejte prosím jméno');
    $form->addPassword('password', 'heslo');
    $form->addSubmit('send', 'Registrovat');
    $form->onSuccess[] = [$this, 'registerFormSucceded'];

    return $form;
	}

  public function registerFormSucceded($form, $values)
  {
    $values->password = $this->passwords->hash($values->password);
    try {
      //$this->user->login($values->name, $values->pass);
      $row = $this->userManager->addUser($values);
    } catch (Nette\Database\UniqueConstraintViolationException $e) {
      $form->addError('Zvolené uživatelské jméno není unikátní.');
    }
    $this->flashMessage('Registrace proběhla úspěšně', 'alert alert-success');
$this->redirect('Homepage:default');
    // mohu použít $this->database
    // zpracovani formulare
  }

  protected function createComponentSignForm()
	{
    $form = new Form;
    // mohu použít $this->database
    $form->addText('name', 'jméno');
    $form->addPassword('pass', 'heslo');
    $form->addSubmit('send', 'Přihlásit');
    $form->onSuccess[] = array($this, 'signInFormSucceeded');

		return $form;
	}

  public function signInFormSucceeded(Form $form, $values)
  {
    $this->user->setExpiration('14 days');


    $values = $form->getValues();
    try {
  	// pokusíme se přihlásit uživatele...
  	  $this->user->login($values->name, $values->pass);
    } catch (Nette\Security\AuthenticationException $e) {
      $this->flashMessage('Nesprávné přihlašovací jméno nebo heslo.', 'alert alert-danger');

    }
    $this->redirect('Homepage:default');
  }

  protected function createComponentForgotForm()
	{
    $form = new Form;
    // mohu použít $this->database
    $form->addEmail('email', 'email')->setRequired('Zadejte prosím email');
    $form->addSubmit('send', 'Zapomenout');
    $form->onSuccess[] = [$this, 'forgotsFormSucceeded'];

		return $form;
	}

  public function forgotsFormSucceeded(Form $form, $values)
  {
    $token = Random::generate(10);
    try { ///update row zakaznik $values email

      //$this->user->login($values->name, $values->pass);
      $row = $this->database->table('zakaznik')->insert($values);
    } catch (Nette\Database\UniqueConstraintViolationException $e) {


      return;
    }
  }


}
