<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Forms\FileFormFactory;
use App\Model\UserManager;
use App\Model\ZivotManager;
use App\Model\ShareManager;
use App\Model\PlanetManager;
use App\Model\FlightManager;
use Nette\Application\UI\Form;
use Nette\Application\UI\Multiplier;
use Nette\Utils\Html;
use Nette\Mail\Message;
use Nette\Mail\IMailer;
use Nette\Utils\Image;

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

  /** @var FlightManager */
  protected $flightManager;


  public function __construct(UserManager $userManager, ZivotManager $zivotManager, ShareManager $shareManager, PlanetManager $planetManager, FlightManager $flightManager)
	{
    $this->userManager = $userManager;
    $this->zivotManager = $zivotManager;
    $this->shareManager = $shareManager;
    $this->planetManager = $planetManager;
    $this->flightManager = $flightManager;
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
    $this->template->lifeSupportActive = $this->userManager->getUserById($this->user->id)->lifeSupportActive;
    $zivotDone = $this->zivotManager->getDoneToday($this->user->id);
    $this->template->zivotDone = $zivotDone;
    $this->template->allDone = count($zivotDone) === $this->zivotManager->getAll()->count('id');


    $this->template->totalZivotYesterday = $this->zivotManager->getTotal($this->user->id, date('Y-m-d', time()-24*3600));
    $this->template->totalZivotToday = $this->zivotManager->getTotal($this->user->id, date('Y-m-d'));

    $this->template->specialDone = $this->zivotManager->getSpecial($this->user->id,date('Y-m-d'), true);
    $this->template->specialToDo = $this->zivotManager->getSpecial($this->user->id, date('Y-m-d'),false);

  }

  protected function createComponentZivotForm()
  {
    $form = new Form;

    $zivotDone =  $this->zivotManager->getDoneToday($this->user->id)->fetchAll();
    foreach ($this->zivotManager->getAll() as $id => $row){
      if(array_search($id, array_column($zivotDone, 'zivotId'))===false){
        $form->addCheckbox(strval($id), mb_strtoupper($row->name))
        ->setOption('description', Html::el('span')
		      ->setHtml(' - '.$row->description1.' ('.$row->description2.') - '.$row->value.'%')
	       );
      }
    }

    $form->addSubmit('send', 'Uložit postup');
    $form->onSuccess[] = [$this, 'zivotFormSucceded'];
    $this->makeBootstrap4($form);
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
    $form->addSubmit('send', 'Splnil jsem speciální úkol!');
    $form->onSuccess[] = [$this, 'specialFormSucceded'];
    $this->makeBootstrap4($form);
    return $form;
  }

  public function specialFormSucceded($form, $values)
  {

        $this->zivotManager->updateSpecial($this->user->id);
        $this->redirect("Denik:zivot");
  }

  public function actionDeactivatelifesupport()
  {
    $this->userManager->updateLifeSupportActive($this->user->id, 0);
    $this->redirect("Denik:zivot");
  }

  public function actionActivatelifesupport()
  {
    $this->userManager->updateLifeSupportActive($this->user->id, 1);
    $this->redirect("Denik:zivot");
  }

  public function renderObjevy()
	{
    $this->CheckRank(); //nemá dojít k povýšení?
    $planetsVisited = $this->planetManager->getVisitedNotDone($this->user->getId());
    $planetsVisitedToTemplate = [];
    //navstivene planety (aktivity)
    foreach ($planetsVisited as $visited) {
      if($this->planetManager->getPlanetbyId($visited->planetId)->type == 'worm_hole')
        continue;
      $planetsVisitedToTemplate[$visited->planetId]['planet'] = $this->planetManager->getPlanetbyId($visited->planetId);
      $planetsVisitedToTemplate[$visited->planetId]['activityType'] = 0;
      if($this->planetManager->getActivity($visited->planetId))
        $planetsVisitedToTemplate[$visited->planetId]['activityType'] = $this->planetManager->getActivity($visited->planetId)->type;
        $planetsVisitedToTemplate[$visited->planetId]['activity'] = $this->planetManager->getActivity($visited->planetId);
      }
    $this->template->planetsVisited = $planetsVisitedToTemplate;
    //splnene planety (aktivity)
    $planetsActivityDone = $this->planetManager->getVisited($this->user->getId());
    $allActivityToTemplate=[];
    foreach ($planetsActivityDone as $activityDone) {
      if($this->planetManager->getPlanetbyId( $activityDone->planetId)->type == 'worm_hole')
        continue;
      $allActivityToTemplate[$activityDone->planetId]['planet'] = $this->planetManager->getPlanetbyId($activityDone->planetId);
      $allActivityToTemplate[$activityDone->planetId]['activityType'] = $this->planetManager->getActivity($activityDone->planetId)->type;
      $allActivityToTemplate[$activityDone->planetId]['data'] = $this->planetManager->getPlanetActivitiesDone($activityDone->planetId);
    }
    $this->template->planetsDone = $allActivityToTemplate;
  }

  private function checkRank()
  {
    $user = $this->userManager->getUserById($this->user->getId());
    $activityDoneSum = $this->planetManager->getActivitiesDone($user->id)->count('*');
    $rankEnum = $this->userManager->getRankEnum();
    $rank = 1;
    foreach ($rankEnum as $key => $value){
      if ($value !== null && $value <=  $activityDoneSum)
        $rank = $key;
    }

    if($user->rankId != $rank){
      $this->flashMessage('Byl jsi povýšen!', 'alert alert-success');
      $this->userManager->updateRank($user->id, $rank);
    }


  }

  protected function createComponentPictureForm(): Multiplier
  {
    return new Multiplier(function ($planetId) {
      $form = new Nette\Application\UI\Form;
      $form->addHidden('planetId', $planetId);
      $form->addUpload('ukol', 'Obrázek: ')
        ->addRule(Form::IMAGE, 'Obrázek musí být JPEG, PNG nebo GIF.')
        ->addRule(Form::MAX_FILE_SIZE, 'Maximální velikost souboru je 10 mB.', 10 * 1024 * 1024 /* v bytech */)
        	->setRequired();
      $form->addSubmit('send', 'nahrát splněný úkol!');
      $form->onSuccess[] = [$this, 'pictureFormSucceded'];
      $this->makeBootstrap4($form);
      return $form;
    });
  }

  public function pictureFormSucceded($form, $values)
  {
    if($values->ukol->hasFile()) {
      $link = 'upload/'.$values->planetId.'/'.$this->user->getId();
      $image = $values->ukol->toImage();
      $image->resize(2048 , null, Image::SHRINK_ONLY | Image::FIT);
      $image->save($link.'.jpg', 80, Image::JPEG);
      $image->resize(300 , 300, Image::EXACT);
      $image->save($link.'-thumb.jpg', 80, Image::JPEG);

      $this->planetManager->setActivityDone($this->user->getId(), $values->planetId, $link);

      $this->flashMessage('Právě jsi nahrál aktivitu! Úkol jsi splnil, ale mezi ostatními pracemi se objeví po schválení nezávadnosti obsahu. To může trvat i 24 hodin. Klidně leť dále!', 'alert alert-success');
      $activity =   $this->planetManager->getActivityFromUserPlanet($this->user->getId(), $values->planetId);
      $this->sendMailApprove($activity, 1);
    }

    $this->redirect("Denik:objevy");
  }

  protected function createComponentSoundForm(): Multiplier
  {
    return new Multiplier(function ($planetId) {
      $form = new Nette\Application\UI\Form;
      $form->addHidden('planetId', $planetId);
      $form->addUpload('ukol', 'Zvuk: ')
        ->addRule(Form::MIME_TYPE, "Tady musíš vložit zvukovou nahrávku", 'audio/*')
      ->addRule(Form::MAX_FILE_SIZE, 'Maximální velikost souboru je 8 mB.', 8 * 1024 * 1024 /* v bytech */)
      ->setHtmlAttribute('capture')
      ->setRequired();
      $form->addSubmit('send', 'nahrát splněný úkol!');
      $form->onSuccess[] = [$this, 'soundFormSucceded'];
      $this->makeBootstrap4($form);
      return $form;
    });
  }

  public function soundFormSucceded($form, $values)
  {
    if($values->ukol->hasFile()) {
      //$avatar->resize(300, 300, Image::EXACT);
      $link = 'upload/'.$values->planetId.'/'.$this->user->getId().$values->ukol->getSanitizedName();
      $values->ukol->move($link);
      $this->planetManager->setActivityDone($this->user->getId(), $values->planetId, $link);
      $this->flashMessage('Právě jsi nahrál aktivitu! Úkol jsi splnil, ale mezi ostatními pracemi se objeví po schválení nezávadnosti obsahu. To může trvat i 24 hodin. Klidně leť dále!', 'alert alert-success');
      $activity =   $this->planetManager->getActivityFromUserPlanet($this->user->getId(), $values->planetId);
      $this->sendMailApprove($activity, 2);
    }
    $this->redirect("Denik:objevy");
  }
  protected function createComponentLinkForm(): Multiplier
  {
    return new Multiplier(function ($planetId) {
      $form = new Nette\Application\UI\Form;
      $form->addHidden('planetId', $planetId);
      $form->addText('ukol', 'Link: ')
        ->addRule(Form::URL	, "Potřebujeme url.")
        	->setRequired();
      $form->addSubmit('send', 'nahrát splněný úkol!');
      $form->onSuccess[] = [$this, 'linkFormSucceded'];
      $this->makeBootstrap4($form);
      return $form;
    });
  }

  public function linkFormSucceded($form, $values)
  {

    $link = $values->ukol;
    $this->planetManager->setActivityDone($this->user->getId(), $values->planetId, $link);
    $this->flashMessage('Právě jsi nahrál aktivitu! Úkol jsi splnil, ale mezi ostatními pracemi se objeví po schválení nezávadnosti obsahu. To může trvat i 24 hodin. Klidně leť dále!', 'alert alert-success');
    $activity =   $this->planetManager->getActivityFromUserPlanet($this->user->getId(), $values->planetId);
    $this->sendMailApprove($activity, 3);
    $this->redirect("Denik:objevy");
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

  protected function createComponentInviteForm()
  {
    $form = new Form;


    $form->addEmail('email', 'E-mail');
    $form->addSubmit('send', 'Pozvat přítele');
    $form->onSuccess[] = [$this, 'inviteFormSucceded'];
    $this->makeBootstrap4($form);
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
    $mail->setSubject('Pozvánka do hry Putování za Malým princem');
  //  ->setBody("Dobrý den,\nvaše registrace byla přijata. Potvrďte email....");
    $mail->setHtmlBody('<div>Hráč '.$this->user->getIdentity()->email.' tě pozval do skautské etapové hry Putování za Malým princem.</div>
                              <div>Můžeš se <a href="https://malyprincolomouc.cz/sign/register2?email='.$email.'&invitedBy='.$this->user->getId().'">registrovat zde</a></div><br>
                              <div>Důležité je, aby ses registroval tímto email.</div>
                              <div>Tým Malého prince</div>');

    $this->mailer->send($mail);
  }

  protected function createComponentShareForm()
  {
    $form = new Form;


    $form->addEmail('email', 'E-mail');
    $form->addSubmit('send', 'Sdílet polohu');
    $form->onSuccess[] = [$this, 'shareFormSucceded'];
    $this->makeBootstrap4($form);
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
    $mail->setSubject('Sdilení polohy ve hře Putování za Malým princem');
  //  ->setBody("Dobrý den,\nvaše registrace byla přijata. Potvrďte email....");
    $mail->setBody('Uživatel '.$this->user->getIdentity()->email.' s tebou právě začal sdílet svoji polohu. V nastavení si můžeš jeho zobrazování kdykoliv vypnout. Měj se, tým Malého prince');
    $this->mailer->send($mail);
  }

  private function generateMailMessage($to){
    $mail = new Message;
    $mail->setFrom('Malyprinc <noreply@malyprincolomouc.cz>');
    $mail->addTo($to);
    return $mail;
  }

  public function renderZapisky()
	{
    $user = $this->userManager->getUserById($this->user->id);
    //$this->template->userManager = $user;
    $allInfo = [];
    $this->template->dateCreated = date('d. m. Y',$user->created->getTimestamp());
    $this->template->lifeSupportActive = $user->lifeSupportActive;
    $this->template->activities = $this->planetManager->getActivitiesDone($this->user->id);
    for($i = $user->created; $i <= date('Y-m-d'); $i->modify('+1 day')){
      $info = [];
      $info["date"] = date('d. m. Y',$i->getTimestamp());
      $info["daystart"] = date('Y-m-d 00:00:00.00000',$i->getTimestamp());
      $info["dayfinish"] = date('Y-m-d 23:59:59.00000',$i->getTimestamp());
      $info["zivotDone"] = $this->zivotManager->getDoneDate($this->user->id, $i->getTimestamp());
      $info["zivotDonePercentage"] = $this->zivotManager->getTotal($this->user->id, date('Y-m-d',$i->getTimestamp()));
      $info["specialDone"] = $this->zivotManager->getSpecial($this->user->id,$i->getTimestamp(), true);
      $info["flights"] = $this->flightManager->getDateFlights($user->id,$i->getTimestamp());
      //$info["arivals"] = $this->flightManager->getDateFinishFlight($user->id,$i->getTimestamp());
      array_push($allInfo, $info);
    }
    $this->template->allInfo = $allInfo;

  }

  public function actionApprove($activityId, $token)
  {
      if($this->planetManager->setActivityApproved($activityId, $token)){
        $this->flashMessage('Úkol byl potvrzen.', 'alert alert-success');
      }
      else {
          $this->flashMessage('Úkol je již potvrzen id= '.$activityId.' token´='.$token.', nebo máš špatný odkaz. POkud se ti něco nezdá, kontaktuj podporu', 'alert alert-danger');
      }
      $this->redirect('Denik:');

   }

   private function sendMailApprove($activity, $type){
    if(!$activity->token){
     $token = Nette\Utils\Random::generate(10);
     $this->planetManager->setActivityToken($activity->id, $token);
     $mail = $this->generateMailMessage('lachmart@skaut.cz');
     $mail->addCc('david.pokorny@olc.cz');
     $mail->setSubject('Úkol čeká na schválení');
     // ->setBody("Dobrý den,\nvaše registrace byla přijata. Potvrďte email....");
     if ($type ==1){
       $mail->setHtmlBody('<div>Úkol: <img src="https://malyprincolomouc.cz/'.$activity->activityLink.'.jpg">.</div><br>
                            <div>Potvrzení:
                            <a href="https://malyprincolomouc.cz/denik/approve?activityId='.$activity->id.'&token='.$token.'"> tento odkaz</a>.</div><br>
                            <div>Tým Malého prince</div>');
     }
     elseif ($type ==2){
       $mail->setHtmlBody('<div>Úkol: <a href="https://malyprincolomouc.cz/'.$activity->activityLink.'"> Tady</a>.</div><br>
                            <div>Potvrzení:
                            <a href="https://malyprincolomouc.cz/denik/approve?activityId='.$activity->id.'&token='.$token.'"> tento odkaz</a>.</div><br>
                            <div>Tým Malého prince</div>');
     }
     else {
       $mail->setHtmlBody('<div>Úkol: <a href='.$activity->activityLink.'"> Tady</a>.</div><br>
                            <div>Potvrzení:
                            <a href="https://malyprincolomouc.cz/denik/approve?activityId='.$activity->id.'&token='.$token.'"> tento odkaz</a>.</div><br>
                            <div>Tým Malého prince</div>');
     }
      $this->mailer->send($mail);
      }
   }


}
