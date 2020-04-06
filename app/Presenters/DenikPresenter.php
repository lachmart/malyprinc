<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Components;
use App\Model\UserManager;
use App\Model\ZivotManager;
use App\Model\ShareManager;
use Nette\Application\UI\Form;
use Nette\Utils\Html;


class DenikPresenter extends BasePresenter
{
  /** @var UserManager */
  protected $userManager;

  /** @var ZivotManager */
  protected $zivotManager;

  /** @var ShareManager */
  protected $shareManager;


  public function __construct(UserManager $userManager, ZivotManager $zivotManager, ShareManager $shareManager)
	{
    $this->userManager = $userManager;
    $this->zivotManager = $zivotManager;
    $this->shareManager = $shareManager;
	}


  public function renderPrukaz()
	{
		$this->template->pilotInfo = $this->userManager->getUserById($this->user->getId());
  }
  public function renderPratele()
	{
		$this->template->Invited = $this->shareManager->getUserInvited($this->user->getId());
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

  protected function createComponentZivotForm()
  {
    $form = new Form;
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

    $form->addEmail('email', 'E-mail');
    $form->addSubmit('send', 'Pozvat přítele');
    $form->onSuccess[] = [$this, 'inviteFormSucceded'];
    return $form;
  }

  public function inviteFormSucceded($form, $values)
  {
        $this->shareManager->addInvitation($this->user->id,$values->email);
        $this->redirect("Denik:pratele");
  }




}
