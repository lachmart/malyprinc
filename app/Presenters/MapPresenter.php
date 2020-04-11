<?php

declare(strict_types=1);

namespace App\Presenters;
use App\Model\UserManager;
use App\Model\ZivotManager;
use App\Model\ShareManager;
use App\Model\FlightManager;

use Nette;
use App\Components;


class MapPresenter extends BasePresenter
{

  /** @var ShareManager */
  protected $shareManager;
  /** @var UserManager */
  protected $userManager;
  /** @var ZivotManager */
  protected $zivotManager;
  /** @var FlightManager */
  protected $flightManager;

  public function __construct(UserManager $userManager, ZivotManager $zivotManager, ShareManager $shareManager, FlightManager $flightManager)
  {
    $this->userManager = $userManager;
    $this->zivotManager = $zivotManager;
    $this->shareManager = $shareManager;
    $this->flightManager = $flightManager;
  }

  public function renderDefault()
	{

	}

  public function actionPlanets(): void
  {
    //  var_dump($_GET);
  		//$this->payload->message = 'Success';
      //$this->sendPayload();
    //  $data = ['one' => $_GET['id'],'two' => $_GET['time'],'three' => 'hello'];
        $data = [ "planet" => [
              ["id" => 1, "name" => "Země", "size" => 150, "type" => "earth"],
              ["id" => 2346, "name" => null, "custom_name" =>  "Šamanova", "x" => 300, "y" => 100, "size" => 70, "type" => "standard_planet"],
              ["id" => 3245, "name" => "Tutu vesmírná planeta", "x" => 600, "y" => 600, "size" => 40, "type" => "standard_planet"],
              ["id" => 4125, "name" => "Dejmalova", "x" => 1100, "y" => 610, "size" => 60, "type" => "chair_planet", "shadow_color" => "orange", "aspect_ration" => 1.23],
              ["id" => 5987, "name" => "Vojačkova", "x" => 1150, "y" => 200, "size" => 80, "type" => "standard_planet"],
              ["id" => 5917, "name" => "Hernova", "x" => 900, "y" => 520, "size" => 60, "type" => "standard_planet"],
              ["id" => 8765, "name" => null, "custom_name" => null, "x" => 1110, "y" => 250, "size" => 20, "type" => "standard_planet"],
              ["id" => 7865, "name" => "Proxima", "x" => 424, "y" => 500, "size" => 60, "type" => "special_planet"],
              ["id" => 1456, "name" => "Royova", "x" => 700, "y" => 160, "size" => 90, "type" => "special_planet"],
              ["id" => 2456, "x" => 550, "y" => 356, "type" => "worm_hole", "end" =>  2457],
              ["id" => 2457, "x" => 1220, "y" => 543, "type" => "worm_hole", "end" =>  2456],
          ]];
	    $this->sendJson($data);
  	  $this->terminate();
  }

  public function actionPilot(): void
  {
    //  var_dump($_GET);
  		//$this->payload->message = 'Success';
      //$this->sendPayload();
    //  $data = ['one' => $_GET['id'],'two' => $_GET['time'],'three' => 'hello'];

    $user = $this->userManager->getUserById($this->user->getId());

    $photoPath = '';
    if($user->avatar){
      $photoPath = '/upload/avatars/'.$user->id.'.jpg';
    }
    else{
      $photoPath = '/upload/avatars/placeholder.jpg';
    }

    $actualFlight = $this->flightManager->getActualFlight($user->id);
    if($actualFlight){
      $actualFlight= [
         "userId"=>$this->user->getId(),
         "source_id"=>$actualFlight->sourcePlanetId,
         "target_id"=>$actualFlight->sourcePlanetId,
         "start_at"=>$actualFlight->start,
         "finish_at"=>$actualFlight->finish,
        ];
    }

      $data = [
         "id"=>$user->id,
          "name"=>$user->nickname,
          "rank_id"=>$user->rank,
          "rank_name"=>"Nadporučík vesmírné stanice",
          "category_id"=>$user->age,
          "category_name"=>"skauti/skautky od 6 do 9 třídy",
          "actual_position"=> $user->position,
          "actual_flight"=>$actualFlight,
          "photo"=> $photoPath
      ];
	    $this->sendJson($data);
  	  $this->terminate();
  }

  public function actionFlight(): void
  {
    $this->flightManager->addFlight([
               "userId"=>$this->user->getId(),
               "sourcePlanetId"=>$_GET['source_id'],
               "targetPlanetId"=>$_GET['target_id'],
               "start"=>$_GET['start_at'],
               "finish"=>$_GET['finish_at'],
      ]
    );

	    $this->sendJson(true);
      $this->terminate();
  }

  public function actionSetposition(): void
  {
	    $this->sendJson(true);
      $this->terminate();
  }
}
