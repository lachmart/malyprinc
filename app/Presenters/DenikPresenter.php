<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Components;
use App\Model\UserManager;
use App\Model\ZivotManager;
use App\Model\ShareManager;
use App\Model\PlanetManager;
use Nette\Application\UI\Form;
use Nette\Utils\Html;
use Nette\Mail\Message;
use Nette\Mail\IMailer;

class DenikPresenter extends BasePresenter
{
  /** @var IMailer @inject */
  public $mailer;

  /** @var UserManager */
  protected $userManager;

  /** @var ZivotManager */
  protected $zivotManager;

  /** @var ShareManager */
  protected $shareManager;

  /** @var PlanetManager */
  protected $planetManager;


  public function __construct(UserManager $userManager, ZivotManager $zivotManager, ShareManager $shareManager, PlanetManager $planetManager)
	{
    $this->userManager = $userManager;
    $this->zivotManager = $zivotManager;
    $this->shareManager = $shareManager;
    $this->planetManager = $planetManager;
	}


  public function actionDefault()
	{
	   $this->setView('prukaz');
  }
  public function renderPrukaz()
	{
		$this->template->pilotInfo = $this->userManager->getUserById($this->user->getId());
  }
  public function renderPratele()
	{
		$this->template->Invited = $this->shareManager->getEmailInvited($this->user->getId());
		$this->template->Shared = $this->shareManager->getSharedAll($this->user->getId());
		$this->template->Received = $this->shareManager->getReceivedActive($this->user->getId());
  }

  public function renderZivot()
	{
    $zivotDone = $this->zivotManager->getDoneToday($this->user->id);
    $this->template->zivotDone = $zivotDone;
    $this->template->allDone = count($zivotDone) === $this->zivotManager->getAll()->count('id');

    $this->template->totalZivotYesterday = $this->zivotManager->getTotal($this->user->id, date('Y-m-d', time()-24*3600));
    $this->template->totalZivotToday = $this->zivotManager->getTotal($this->user->id, date('Y-m-d'));

    $this->template->specialDone = $this->zivotManager->getSpecial($this->user->id,date('Y-m-d'), true);
    $this->template->specialToDo = $this->zivotManager->getSpecial($this->user->id, date('Y-m-d'),false);

  }
  public function renderObjevy()
	{
    $planetsVisited = $this->planetManager->getVisited($this->user->getId());
    $planetsVisitedToTemplate = [];
    foreach ($planetsVisited as $activityDone) {
      $planetsVisitedToTemplate[$activityDone->planetId]['planet'] = $this->planetManager->getPlanetbyId($activityDone->planetId);
      $planetsVisitedToTemplate[$activityDone->planetId]['activityType'] = $this->planetManager->getActivity($activityDone->planetId)->type;
      }
    $this->template->planetsVisited = $planetsVisitedToTemplate;

    $planetsActivityDone = $this->planetManager->getActivitiesDone($this->user->getId());
    $allActivityToTemplate=[];
    foreach ($planetsActivityDone as $activityDone) {
      $allActivityToTemplate[$activityDone->planetId]['planet'] = $this->planetManager->getPlanetbyId($activityDone->planetId);
      $allActivityToTemplate[$activityDone->planetId]['activityType'] = $this->planetManager->getActivity($activityDone->planetId)->type;
      $allActivityToTemplate[$activityDone->planetId]['data'] = $this->planetManager->getPlanetActivitiesDone($activityDone->planetId)->fetchAll();
    }
    $this->template->planetsDone = $allActivityToTemplate;
  }

  public function actionStartsharingto($receivingUserId)
  {		try {
  			$this->shareManager->addSharing($this->user->id, $receivingUserId);
  		} catch (Nette\Database\UniqueConstraintViolationException $e) {
        $this->flashMessage('Vypadá to, že toto sdílení už bylo aktivováno.', 'alert alert-danger');
      }

    $this->redirect("Denik:pratele");
  }
  public function actionStopsharing($receivingUserId)
  {
    $this->shareManager->changeSharingActive($this->user->id, $receivingUserId, 0);
    $this->redirect("Denik:pratele");
  }
  public function actionContinuesharing($receivingUserId)
  {
    $this->shareManager->changeSharingActive($this->user->id, $receivingUserId, 1);
    $this->redirect("Denik:pratele");
  }

  public function actionStopreceiving($sharingUserId)
  {
    $this->shareManager->changeReceivingActive($this->user->id, $sharingUserId, 0);
    $this->redirect("Denik:pratele");
  }

  public function actionContinuereceiving($sharingUserId)
  {
    $this->shareManager->changeReceivingActive($this->user->id, $sharingUserId, 1);
    $this->redirect("Denik:pratele");
  }

  protected function createComponentZivotForm()
  {
    $form = new Form;
    $this->makeBootstrap4($form);
    $zivotDone =  $this->zivotManager->getDoneToday($this->user->id)->fetchAll();
    foreach ($this->zivotManager->getAll() as $id => $row){
      if(array_search($id, array_column($zivotDone, 'zivotId'))===false){
        $form->addCheckbox(strval($id), $row->name)
        ->setOption('description', Html::el('span')
		      ->setHtml(' - '.$row->description1.' ('.$row->description2.') - '.$row->value.'%')
	       );
      }
    }

    $form->addSubmit('send', 'Uložit postup');
    $form->onSuccess[] = [$this, 'zivotFormSucceded'];
    return $form;
  }

  public function zivotFormSucceded($form, $values)
  {
    //\var_dump($values);
    foreach($values as $key=>$value){
      if($value)
        $this->zivotManager->addUserZivot($this->user->id, $key);
    }
    $this->redirect("Denik:zivot");
  }
  protected function createComponentSpecialForm()
  {
    $form = new Form;
    $this->makeBootstrap4($form);

    $form->addSubmit('send', 'Splnil jsem speciální úkol!');
    $form->onSuccess[] = [$this, 'specialFormSucceded'];
    return $form;
  }

  public function specialFormSucceded($form, $values)
  {

        $this->zivotManager->updateSpecial($this->user->id);
        $this->redirect("Denik:zivot");
  }

  protected function createComponentInviteForm()
  {
    $form = new Form;
    $this->makeBootstrap4($form);

    $form->addEmail('email', 'E-mail');
    $form->addSubmit('send', 'Pozvat přítele');
    $form->onSuccess[] = [$this, 'inviteFormSucceded'];
    return $form;
  }

  public function inviteFormSucceded($form, $values)
  {
    if(!$this->user->identity->isSkaut){
      $this->flashMessage('Bohužel se jedná o skautskou hru a další hráč mohou zvát pouze skauti.', 'alert alert-danger');
      $this->redirect("Denik:pratele");
    }
    if($this->userManager->getUserByEmail($values->email)){
      $this->flashMessage('Tento uživatel už je zaregistrovaný. Můžeš s ním sdílet polohu.', 'alert alert-danger');
      $this->redirect("Denik:pratele");
    }
    try {
      $this->shareManager->addInvitation($this->user->id,$values->email);
    } catch (Nette\Database\UniqueConstraintViolationException $e) {
      $this->flashMessage('Na tento email už jsme pozvánku poslali. Možná byl pozván někým jiným...', 'alert alert-danger');
      $this->redirect("Denik:pratele");
    }
    $this->sendMailInvited($values->email);
    $this->flashMessage('Úspěšně jsi pozval '.$values->email.' na adresu jsme mu poslali email.', 'alert alert-success');
        $this->redirect("Denik:pratele");
  }
  private function sendMailInvited($email){
    $mail = $this->generateMailMessage($email);
    $mail->setSubject('SPozvánka malyprinc');
  //  ->setBody("Dobrý den,\nvaše registrace byla přijata. Potvrďte email....");
    $mail->setHtmlBody('<b>Sample HTML</b> Uživatel '.$this->user->getIdentity()->email.'stě pozval do skautské online hry malyprinc. Můžeš se registrovat na adrese....');

    $this->mailer->send($mail);
  }

  protected function createComponentShareForm()
  {
    $form = new Form;
    $this->makeBootstrap4($form);

    $form->addEmail('email', 'E-mail');
    $form->addSubmit('send', 'Sdílet polohu');
    $form->onSuccess[] = [$this, 'shareFormSucceded'];
    return $form;
  }

  public function shareFormSucceded($form, $values)
  {
    $user = $this->userManager->getUserByEmail($values->email);
    if($user === null)
      $form->addError('Takového hráče tu nemáme.');
    else{
      try {
  			 $this->shareManager->addSharing($this->user->id,$user->id);
  		} catch (Nette\Database\UniqueConstraintViolationException $e) {
        $this->flashMessage('Vypadá to, že toto sdílení už bylo aktivováno.', 'alert alert-danger');
        $this->redirect("Denik:pratele");
      }
      $this->sendMailShared($values->email);
      $this->flashMessage($values->email. 'si teď může zobrazit tvoji polohu.', 'alert alert-success');
      $this->redirect("Denik:pratele");
      }
  }

  private function sendMailShared($email){
    $mail = $this->generateMailMessage($email);
    $mail->setSubject('Sdilení polohy malyprinc');
  //  ->setBody("Dobrý den,\nvaše registrace byla přijata. Potvrďte email....");
    $mail->setHtmlBody('<b>Sample HTML</b> Uživatel '.$this->user->getIdentity()->email.'s tebou právě začal sdílet polohu. V nastavení si můžeš jeho zobrazování kdykoliv vypnout.');

    $this->mailer->send($mail);
  }

  private function generateMailMessage($to){
    $mail = new Message;
    $mail->setFrom('Malyprinc <noreply@localhost.local>');
    $mail->addTo($to);
    return $mail;
  }



}
