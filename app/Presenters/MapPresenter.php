<?php

declare(strict_types=1);

namespace App\Presenters;
use App\Model\UserManager;
use App\Model\ZivotManager;
use App\Model\ShareManager;
use App\Model\FlightManager;
use App\Model\PlanetManager;

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
  /** @var PlanetManager */
  protected $planetManager;

  private $hourConstant = 1440/75;
  public function __construct(UserManager $userManager, ZivotManager $zivotManager, ShareManager $shareManager, FlightManager $flightManager, PlanetManager $planetManager)
  {
    $this->userManager = $userManager;
    $this->zivotManager = $zivotManager;
    $this->shareManager = $shareManager;
    $this->flightManager = $flightManager;
    $this->planetManager = $planetManager;
  }

  public function renderDefault()
	{

	}

  public function actionPlanets(): void
  {

      $data = array();
      $planets = $this->planetManager->getAll($this->userManager->getUserById($this->user->getId())->rank);

      foreach($planets as $planet){
        $planet = $planet->toArray();
        $planet["visited"] = $this->planetManager->getJsonVisited($this->user->getId(), $planet['id']);
        array_push($data,$planet);
      }
      $data = ["planet"=>$data];
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
    $actualPosition = null;
    if($actualFlight){
      $actualFlight= [
         //"userId"=>$this->user->getId(),
         "source_id"=>$actualFlight->sourcePlanetId,
         "target_id"=>$actualFlight->targetPlanetId,
         "start_at"=>$actualFlight->start,
         "finish_at"=>$actualFlight->finish,
        ];
    }
    else {
      $lastFlight = $this->flightManager->getlastFinishedFlight($user->id);
      if($lastFlight){
        if($lastFlight->targetPlanetId != $user->position){
          $this->setPosition($lastFlight->targetPlanetId);
          $actualPosition = $lastFlight->targetPlanetId;
        }
        else {
          $actualPosition = $user->position;
        }
      }
      else {
        $actualPosition = 1; //pokud jsem neletel, jsem na zemi (ano je to skarede zjednoduseni)
      }
    }

      $data = [
         "id"=>$user->id,
          "name"=>$user->nickname,
          "rank_id"=>$user->rankId,
          "rank_name"=>$user->rank->rankName,
          "category_id"=>$user->age,
          "category_name"=>"skauti/skautky od 6 do 9 třídy",
          "actual_position"=> $actualPosition,
          "actual_flight"=>$actualFlight,
          "photo"=> $photoPath
      ];
	    $this->sendJson($data);
  	  $this->terminate();
  }

  public function actionFlight(): void
  {
    $flight = [    "userId"=>$this->user->getId(),
                   "sourcePlanetId"=>$_GET['source_id'],
                   "targetPlanetId"=>$_GET['target_id'],
                   "start"=>date('Y-m-d\TH:i:s.u'),
                  // "finish"=>$_GET['finish_at'],
                 ];
   $distanceRecieved = $_GET['distance'];
   if(!$this->confirmPosition($flight["sourcePlanetId"])){
     $this->sendJson(false);
     $this->terminate();
   }
   $this->confirmDistance($flight["sourcePlanetId"], $flight["targetPlanetId"], $distanceRecieved);
   if(!$this->confirmDistance($flight["sourcePlanetId"], $flight["targetPlanetId"], $distanceRecieved)){
     $this->sendJson(false);
     $this->terminate();
   }

    $flightTime = (int) round($distanceRecieved/$this->hourConstant); //travel time in hours

    $flight['finish'] = date('Y-m-d\TH:i:s.u', strtotime($flight['start']) + 3600*$flightTime);

    $this->flightManager->addFlight($flight);
    $this->sendJson(true);
    $this->terminate();
  }

  private function confirmDistance($sourceId, $targetId, $distance){
    $source = $this->planetManager->getPlanetById($sourceId);
    $target = $this->planetManager->getPlanetById($targetId);

    $a = $source->x - $target->x;
    $b = $source->y - $target->y;
    $c = sqrt(($a*$a)+($b*$b));

    return round($c) == round($distance);
  }

  private function confirmPosition($planetId){
    if($this->flightManager->getActualFlight($this->user->getId()))
      return false;

    return ($this->userManager->getUserById($this->user->getId())->position == $planetId);
  }

  private function confirmSetPosition($planetId){
    if($this->flightManager->getActualFlight($this->user->getId()))
      return false;

    $lastFlight = $this->flightManager->getlastFinishedFlight($this->user->getId());
    if($lastFlight)
      return ($lastFlight->targetPlanetId == $planetId);

    return false;
  }
  private function setPosition($newPosition){
    $this->planetManager->setPosition($this->user->getId(), $newPosition);
    $this->userManager->setPosition($this->user->getId(), $newPosition);
  }

  public function actionSetposition(): void
  {
    $newPosition = $_GET['target_id'];
    $newName = $_GET['new_name'];
    if(!$this->confirmSetPosition($newPosition)){
      $this->sendJson(false);
      $this->terminate();
    }
    if($newName)
      $this->planetManager->setNewName($newPosition, $newName);

    $this->setPosition($newPosition);
	  $this->sendJson(true);
    $this->terminate();
  }

  public function actionActivity(): void
  {
    $activity = $this->planetManager->getActivity($_GET['planet_id']);
    if($activity)
      $this->sendJson($activity->toArray());
    else {
      $this->sendJson(null);
    }
    $this->terminate();
  }
  public function actionLifesupport(): void
  {

    $day = date('Y-m-d', time()-24*3600);// date('Y-m-d',strtotime($_GET['time']));
    $percentage = $this->zivotManager->getTotal($this->user->getId(), $day);
    $status = false;

    if($percentage >=70 || $this->userManager->getUserById($this->user->getId())->position === 1)
      $status = true;

    $this->sendJson([
                    "day"=>$day,
                    "status"=>$status,
                    "percentage"=>$percentage,
                 ]);

    $this->terminate();
  }
}
