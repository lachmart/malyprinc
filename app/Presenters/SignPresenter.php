<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Components;
use Nette\Application\UI\Form;
use App\Model\UserManager;
use Nette\Utils\Image;


class SignPresenter extends Nette\Application\UI\Presenter
{
  /** @var  Nette\Security\Passwords */
  private $passwords;

  /** @var UserManager */
  protected $userManager;

/** @persistent */
  public $email;
/** @persistent */
  public $invitedBy;


  public function __construct(Nette\Security\Passwords $passwords, UserManager $userManager)
	{
    $this->passwords = $passwords;
    $this->userManager = $userManager;
    if(!isset($this->invitedBy))
      $this->invitedBy = 0;
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
    $form->addEmail('email', 'Tvůj E-mail:')->setRequired('Zadej prosím email');
    $form->addSubmit('send', 'Registrovat');
    $form->onSuccess[] = [$this, 'registerFormSucceded'];

    return $form;
	}

  public function actionOut()
  {
    $this->user->logout();
    $this->flashMessage('Byl jsi odhlášen', 'alert alert-success');
    $this->redirect('Homepage:default');
  }

  public function registerFormSucceded($form, $values)
  {

      if(isset($this->userManager->getUserByEmail($values->email)->email)) {
          $this->flashMessage('Tento email už je zaregistrován. Zapomněl jsi heslo?', 'alert alert-danger');
          return;
        }

      $this->email = $values->email;
      $invitation = $this->userManager->isInvited($values->email);
      if(isset($invitation->InvitedBy)) {
          $this->flashMessage('Pozvaný člověk, který se chce registrovat', 'alert alert-success');
          $this->invitedBy = $invitation->invitedBy;
        }
        else {
          $this->flashMessage('Nový člověk, kterýmusí být skaut', 'alert alert-success');
      }
      $this->redirect('Sign:register2');
  }

  public function renderRegister2(){
    $this->template->email = $this->email;
    $this->template->invitedBy =  $this->invitedBy;
  }
private function createRegister2Form()
	{
    $form = new Form;
    // mohu použít $this->database
    $form->addHidden('email', 'email');
    $form->addText('nickname', 'Přezdívka')->setRequired("Zadej prosím přezdívku, ať vím jak ti říkat");
    $form->addText('name', 'Jméno a příjmení')->setRequired("Přezdívka je důležitější, ale rádi bychom věděli, jak se jmenuješ.");

    $form->addPassword('password', 'heslo')->setRequired("Heslo je potřeba, aby ses mohl přihlásit");
    $form->addUpload('avatar', 'Foto:')
    	->addRule(Form::IMAGE, 'Avatar musí být JPEG, PNG nebo GIF.')
    ->addRule(Form::MAX_FILE_SIZE, 'Maximální velikost souboru je 3 mB.', 3 * 1024 * 1024 /* v bytech */)
    ->setDefaultValue('file');
  //  ->addCondition(!$form::FILLED)
    //->addFilter(function () {return null;});

    $vekove_kategorie = [
      '1' => '0 - 8 let',
      '2' => '9 - 14 let',
      '3'  => '15 a více let',
    ];
    $form->addSelect('age', 'Věk:', $vekove_kategorie)
       ->setPrompt('Zvol svou věkovou kategorii')->setRequired();


    $form->setDefaults(['email'=>$this->email]);
    return $form;
	}

  protected function createComponentRegisterSkautForm()
	{
    $form = $this->createRegister2Form();

    $form->addCheckbox('isSkaut', 'Jsem skaut')->setRequired("Tady se mohou registrovat pouze skauti. Chceš i tak hrát? Zařiď si pozvánku od kamaráda, který už hraje ;)");
    $form->addText('stredisko', 'Středisko')->setRequired("Jsi z toho nejlepšího střediska?")
    ->addRule(Form::INTEGER, 'Zadej prosím pouze číslo, například 4.');
    $form->addText('oddil', 'Oddíl')->setRequired("Jak si vede tvůj oddíl?");
    $form->addSubmit('send', 'Registrovat');
    $form->onSuccess[] = [$this, 'register2FormSucceded'];
    return $form;
	}

  protected function createComponentRegisterInvitedForm()
	{
    $form = $this->createRegister2Form();

    $form->addCheckbox('isSkaut', 'Jsem skaut');
    $form->addText('stredisko', 'Středisko')
    ->addRule(Form::INTEGER, 'Zadej prosím pouze číslo, například 4.');
    $form->addText('oddil', 'Oddíl');
    $form->addHidden('invitedBy', 'Pozvánka od:');
    $form->setDefaults(['invitedBy'=>$this->invitedBy]);
    $form->addSubmit('send', 'Registrovat');
    $form->onSuccess[] = [$this, 'register2FormSucceded'];
    return $form;
	}


  public function register2FormSucceded($form, $values)
  {
      if(isset($this->userManager->getUserByEmail($values->email)->email)){
          $this->flashMessage('Tento email už je zaregistrován. Zapomněl jsi heslo?', 'alert alert-danger');
          $this->redirect('Sign:forgot');
    }

      if($values->password)
        $values->password = $this->passwords->hash($values->password);
      else {
        $values->offsetUnset('password');
      }



      if($values->avatar->hasFile()) {
        $this->saveAvatar($values->avatar->toImage());
        $values->avatar = 1;
      }
      else {
        $values->offsetUnset('avatar');
      }
      $this->flashMessage('Registrace proběhla úspěšně', 'alert alert-success');
      $this->redirect('Sign:in');

  }

  protected function createComponentChangeForm()
  {
    $form = new Form;
    // mohu použít $this->database
    $form->addHidden('email', 'email');
    $form->addText('nickname', 'Přezdívka')->setRequired("Zadej prosím přezdívku, ať vím jak ti říkat");
    $form->addText('name', 'Jméno a příjmení')->setRequired("Přezdívka je důležitější, ale rádi bychom věděli, jak se jmenuješ.");

    $form->addPassword('password', 'heslo');
    $form->addUpload('avatar', 'Foto:')
      ->addRule(Form::IMAGE, 'Avatar musí být JPEG, PNG nebo GIF.')
    ->addRule(Form::MAX_FILE_SIZE, 'Maximální velikost souboru je 3 mB.', 3 * 1024 * 1024 /* v bytech */)
    ->setDefaultValue('file');
  //  ->addCondition(!$form::FILLED)
    //->addFilter(function () {return null;});

    $vekove_kategorie = [
      '1' => '0 - 8 let',
      '2' => '9 - 14 let',
      '3'  => '15 a více let',
    ];
    $form->addSelect('age', 'Věk:', $vekove_kategorie)
       ->setPrompt('Zvol svou věkovou kategorii')->setRequired();
    $form->addText('stredisko', 'Středisko')
    ->addRule(Form::INTEGER, 'Zadej prosím pouze číslo, například 4.');
    $form->addText('oddil', 'Oddíl');
    $form->setDefaults($this->userManager->getUserById($this->user->id));

    $form->addSubmit('send', 'Změnit údaje');
    $form->onSuccess[] = [$this, 'changeFormSucceded'];
    return $form;
  }

  public function changeFormSucceded($form, $values)
  {
    $values->id = $this->user->id;

      if($values->password)
        $values->password = $this->passwords->hash($values->password);
      else {
        $values->offsetUnset('password');
      }

      if($values->avatar->hasFile()) {
        $this->saveAvatar($values->avatar->toImage());
        $values->avatar = 1;
      }
      else {
        $values->offsetUnset('avatar');
      }
      $this->userManager->updateUser($values);
      $this->flashMessage('Změna proběhla úspěšně', 'alert alert-success');
      $this->redirect('Denik:prukaz');

  }

  protected function createComponentSignForm()
	{
    $form = new Form;
    $form->addEmail('email', 'Email');
    $form->addPassword('password', 'Heslo');
    $form->addSubmit('send', 'Přihlásit');
    $form->onSuccess[] = array($this, 'signInFormSucceeded');
    $form->setDefaults(['email'=>$this->email]);
		return $form;
	}

  public function signInFormSucceeded(Form $form, $values)
  {
    $this->user->setExpiration('14 days');


    $values = $form->getValues();
    try {
  	  $this->user->login($values->email, $values->password);
    } catch (Nette\Security\AuthenticationException $e) {
      $this->flashMessage('Nesprávné přihlašovací jméno nebo heslo.', 'alert alert-danger');

    }
    $this->redirect('Homepage:default');
  }

  protected function createComponentForgotForm()
	{
    $form = new Form;
    $form->addEmail('email', 'email')->setRequired('Zadejte prosím email');
    $form->addSubmit('send', 'Zapomenout');
    $form->onSuccess[] = [$this, 'forgotsFormSucceeded'];

		return $form;
	}

  public function forgotsFormSucceeded(Form $form, $values)
  {
    $values->id = $this->userManager->getUserByEmail($values->email)->id;
    $values->token = Nette\Utils\Random::generate(10);
    try { ///update row zakaznik $values email

      //$this->user->login($values->name, $values->pass);
      $this->userManager->updateUser($values);
    } catch (Nette\Database\UniqueConstraintViolationException $e) {
      return;
    }
    $this->flashMessage('Nic se nestalo. Napiš nám na podporu.', 'alert alert-danger');
  }

  public function saveAvatar(Image $avatar)
  {
    $avatar->resize(300, 300, Image::EXACT);
    $avatar->save('upload/avatars/'.$this->user->id.'.jpg', 80, Image::JPEG);
  }

}
