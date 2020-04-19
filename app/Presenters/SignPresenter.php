<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Components;
use Nette\Application\UI\Form;
use App\Model\UserManager;
use App\Model\ZivotManager;
use App\Model\PlanetManager;
use Nette\Utils\Image;
use Nette\Mail\Message;
use Nette\Mail\IMailer;

class SignPresenter extends Nette\Application\UI\Presenter
{
  /** @var  Nette\Security\Passwords */
  private $passwords;

  /** @var IMailer @inject */
	public $mailer;

  /** @var UserManager */
  protected $userManager;

  /** @var ZivotManager */
  protected $zivotManager;

  /** @var PlanetManager */
  protected $planetManager;

/** @persistent */
  public $email;
/** @persistent */
  public $invitedBy;


  public function __construct( UserManager $userManager, PlanetManager $planetManager, ZivotManager $zivotManager, Nette\Security\Passwords $passwords)
	{
    $this->userManager = $userManager;
    $this->zivotManager = $zivotManager;
    $this->planetManager = $planetManager;
    $this->passwords = $passwords;
    if(!isset($this->invitedBy))
      $this->invitedBy = 0;
	}

  public function actionDefault()
  {
      // if($this->user->isLoggedIn()) {
      //     $this->redirect('Map:default');
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
    $this->makeBootstrap4($form);
    return $form;
	}

  public function actionOut()
  {
    $this->user->logout();
    $this->flashMessage('Byl jsi odhlášen', 'alert alert-success');
    $this->redirect('Sign:in');
  }

  public function actionResetpassword($email, $token)
  {
      $newPassword = $this->generateToken();
      if($this->userManager->resetPassword($email, $token, $this->passwords->hash($newPassword))) {
        $this->sendMailReset($newPassword, $email);
        $this->flashMessage('Na email '.$email.' jsme ti poslali další instrukce.', 'alert alert-success');
      }
      else {
          $this->flashMessage('Něco se pokazilo, kontaktuj podporu', 'alert alert-danger');
      }
      $this->redirect('Sign:in');

   }

   private function sendMailReset($token, $email){
     $mail = $this->generateMailMessage($email);
     $mail->setSubject('Heslo do hry Putování za Malým princem bylo resetováno');
    // ->setBody("Dobrý den,\nvaše registrace byla přijata. Potvrďte email....");

      $mail->setBody('Vytvořili jsme ti nové heslo: '.$token.'<br>S tímto heslem se můžeš přihlašovat, ale co nejdříve si jej změň v palubním deníku. Měj se, tým Malého prince.');
      $this->mailer->send($mail);
   }

  public function actionConfirmemail($email, $token)
  {
      if($this->userManager->confirmEmail($email, $token)){
        $this->flashMessage('Email: '.$email.' byl potvrzen.', 'alert alert-success');
      }
      else {
          $this->flashMessage('Email je již potvrzen, nebo máš špatný odkaz. POkud se ti něco nezdá, kontaktuj podporu', 'alert alert-danger');
      }
      $this->redirect('Denik:');

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
          $this->flashMessage('Máš dobré kamarády, jeden z nich tě k nám pozval. Pomoz nám doplnit zbytek informací a můžeme jít na to!', 'alert alert-success');
          $this->invitedBy = $invitation->invitedBy;
        }
        else {
          $this->flashMessage('Pomoz nám doplnit zbytek informací a můžeme jít na to!', 'alert alert-success');
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
    $form->addUpload('avatar', 'Foto:')
      ->addRule(Form::IMAGE, 'Avatar musí být JPEG, PNG nebo GIF.')
    ->addRule(Form::MAX_FILE_SIZE, 'Maximální velikost souboru je 3 mB.', 3 * 1024 * 1024 /* v bytech */);
    $form->addCheckbox('isSkaut', 'Jsem skaut')->setRequired("Tady se mohou registrovat pouze skauti. Chceš i tak hrát? Zařiď si pozvánku od kamaráda, který už hraje ;)");
    $form->addText('stredisko', 'Středisko')->setRequired("Jsi z toho nejlepšího střediska?")
    ->addRule(Form::INTEGER, 'Zadej prosím pouze číslo, například 4.');
    $form->addText('oddil', 'Oddíl')->setRequired("Jak si vede tvůj oddíl?");
    $form->addSubmit('send', 'Registrovat');
    $form->onSuccess[] = [$this, 'register2FormSucceded'];
    $this->makeBootstrap4($form);
    return $form;
	}

  protected function createComponentRegisterInvitedForm()
	{
    $form = $this->createRegister2Form();
    $form->addUpload('avatar', 'Foto:')
      ->addRule(Form::IMAGE, 'Avatar musí být JPEG, PNG nebo GIF.')
    ->addRule(Form::MAX_FILE_SIZE, 'Maximální velikost souboru je 3 mB.', 3 * 1024 * 1024 /* v bytech */);

    $form->addCheckbox('isSkaut', 'Jsem skaut');
    $form->addText('stredisko', 'Středisko')
    ->addRule(Form::INTEGER, 'Zadej prosím pouze číslo, například 4.');
    $form->addText('oddil', 'Oddíl');
    $form->addHidden('invitedBy', 'Pozvánka od:');
    $form->setDefaults(['invitedBy'=>$this->invitedBy]);
    $form->addSubmit('send', 'Registrovat');
    $form->onSuccess[] = [$this, 'register2FormSucceded'];
    $this->makeBootstrap4($form);
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
        $image = $values->avatar->toImage();
        $values->avatar = 1;
      }
      else {
        $values->offsetUnset('avatar');
      }
      $token = $this->generateToken();
      $values->token = $token;

      $id = $this->userManager->addUser($values)->id;
      if(isset($image)) {
        $this->saveAvatar($image, $id);
      }
      $this->zivotManager->generateSpecial($id);
      $this->planetManager->setPosition($id, 1);
      $this->sendMailRegistered($token, $values->email);
      $this->flashMessage('Registrace proběhla úspěšně, na mail jsme ti poslali odkaz pro ověření, že jde o tvoji emailovou adresu.', 'alert alert-success');
      $this->redirect('Sign:in');

  }

  private function sendMailRegistered($token, $email){
    $mail = $this->generateMailMessage($email);
	  $mail->setSubject('Potvrzení registrace do hry Putování za Malým princem');
	  // ->setBody("Dobrý den,\nvaše registrace byla přijata. Potvrďte email....");

    $mail->setHtmlBody('Vítej kamaráde!<br><div>Hra Putování za Malým princem je připravena a po potvrzení
                             <a href="https://malyprincolomouc.cz/sign/confirmemail?email='.$email.'&token='.$token.'">odkazu</a> můžeš začít hrát.</div><br>
                             <div>Ještě by se ti mohl hodit tento <a href="https://malyprincolomouc.cz/download/pruvodce-hrou-maly-princ.pdf">průvodce hrou</a>.</div>
                             <div>Hodně zábavy</div><br>
                             <div>Tým Malého prince</div>');

     $this->mailer->send($mail);
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
    ->addRule(Form::MAX_FILE_SIZE, 'Maximální velikost souboru je 3 mB.', 3 * 1024 * 1024 /* v bytech */);
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
    $this->makeBootstrap4($form);
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
        $this->saveAvatar($values->avatar->toImage(), $values->id);
        $values->avatar = 1;
      }
      else {
        $values->offsetUnset('avatar');
      }
      $this->userManager->updateUser($values);
      $this->sendMailChanged($this->user->getIdentity()->email);
      $this->flashMessage('Změna proběhla úspěšně', 'alert alert-success');
      $this->redirect('Denik:prukaz');

  }

  private function sendMailChanged($email){
    $mail = $this->generateMailMessage($email);
	  $mail->setSubject('Změne údajů do hry Putování za Malým princem');
	  // ->setBody("Dobrý den,\nvaše registrace byla přijata. Potvrďte email....");

    $mail->setBody('Údaje ve tvém účtu byly změněny. Nebyl jsi to ty? Dej nám o tom prosím vědět. Měj se, tým Malého prince');
    $this->mailer->send($mail);
  }


  protected function createComponentSignForm()
	{
    $form = new Form;

    $form->addEmail('email', 'Email');
    $form->addPassword('password', 'Heslo');
    $form->addSubmit('send', 'Přihlásit');
    $form->onSuccess[] = array($this, 'signInFormSucceeded');
    $form->setDefaults(['email'=>$this->email]);
    $this->makeBootstrap4($form);
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
    $this->redirect('Map:default');
  }

  protected function createComponentForgotForm()
	{
    $form = new Form;
    $form->addEmail('email', 'email')->setRequired('Zadejte prosím email');
    $form->addSubmit('send', 'Zapomenout');
    $form->onSuccess[] = [$this, 'forgotsFormSucceeded'];

    $this->makeBootstrap4($form);
		return $form;
	}

  public function forgotsFormSucceeded(Form $form, $values)
  {
    $user = $this->userManager->getUserByEmail($values->email);
    if ($user){
      $values->id = $user->id;
      $token = $this->generateToken();
      $values->token = $token;
      try {
        $this->userManager->updateUser($values);
      } catch (Nette\Database\UniqueConstraintViolationException $e) {
        $this->flashMessage('Nic se nestalo. Napiš nám na podporu.', 'alert alert-danger');
        return;
      }
        $this->sendMailForgot($token, $values->email);
        $this->flashMessage('Na email jsme ti poslali instrukce.', 'alert alert-success');
    }
    else
      $this->flashMessage('Nic se nestalo. Napiš nám na podporu.', 'alert alert-danger');

  }

  private function sendMailForgot($token, $email){
    $mail = $this->generateMailMessage($email);
    $mail->setSubject('Zapomenuté heslo do hry Putování za Malým princem');
    $mail->setHtmlBody('<div>Nic si z toho nedělej, to se stává i v lepších rodinách :-). Heslo si změň zde: <a href="https://malyprincolomouc.cz/sign/resetpassword?email='.$email.'&token='.$token.'">odkaz</a>
                        </div><br>
                        <div>Tým Malého prince</div>');

    $this->mailer->send($mail);
  }

  private function saveAvatar(Image $avatar, $userId)
  {
    $avatar->resize(300, 300, Image::EXACT);
    $avatar->save('upload/avatars/'.$userId.'.jpg', 80, Image::JPEG);
  }

  private function generateToken(){
    return Nette\Utils\Random::generate(10);
  }
  private function generateMailMessage($to){
    $mail = new Message;
    $mail->setFrom('Malyprinc <noreply@malyprincolomouc.cz>');
    $mail->addTo($to);
    return $mail;
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
