<?php

namespace App\Model;

use Nette;

class PlanetManager
{
	use Nette\SmartObject;
  //define("TABLE", 'zakaznik');
	/** @var Nette\Database\Context */
	private $database;
  private $table = 'planets';

	public function __construct(Nette\Database\Context $database)
	{
		$this->database = $database;
	}


	public function getAll($rank)
	{
		return $this->database->table($this->table)->where('visible_at_rank <=', $rank)->fetchAll();
	}
	public function getPlanetById($id)
	{
		return $this->database->table($this->table)->get($id);
	}

	public function setNewName($planetId, $newName)
	{
		$planet = $this->getPlanetById($planetId);
		if(!$planet->custom_name)
			return $planet->update(['custom_name'=>$newName]);
	}

	public function setPosition($userId, $planetId)
	{
			if($this->database->table('userplanet')->where('userId', $userId)->where('planetId', $planetId)->fetch())
				return;
			$this->database->table('userplanet')->insert(['userId'=>$userId, 'planetId'=>$planetId]);
	}

	public function getVisitedNotDone($userId)
	{
			return $this->database->table('userplanet')->where('userId', $userId)->where('activityLink IS NULL')->order('id DESC')->fetchAll();
	}
	public function getVisited($userId)
	{
			return $this->database->table('userplanet')->where('userId', $userId)->order('id DESC')->fetchAll();
	}

	public function wasVisited($userId, $planetId)
	{
		if( $this->database->table('userplanet')->where('userId', $userId)->where('planetId', $planetId)->fetch())
			return true;
		return false;
	}

	public function getJsonVisited($userId, $planetId)
	{
		if( $this->database->table('userplanet')
		->where('userId', $userId)
		->where('planetId', $planetId)
		->where('activityLink IS NOT NULL')
		->fetch())
			return true;
		return false;
	}
	public function setActivityDone($userId, $planetId, $link)
	{
		return $this->database->table('userplanet')
		->where('userId', $userId)
		->where('planetId', $planetId)
		->update(['activityLink'=>$link]);
	}
	public function setActivityToken($id, $token)
	{
		return $this->database->table('userplanet')
		->where('id', $id)
		->update(['token'=>$token]);
	}
	public function setActivityApproved($id, $token)
	{
		return $this->database->table('userplanet')
		->where('id', $id)
		->where('token', $token)
		->update(['approved'=>true]);
	}
	public function getActivitiesDone($userId)
	{
		return $this->database->table('userplanet')
		->where('userId', $userId)
		->where('activityLink IS NOT NULL');
	}

	public function getPlanetActivitiesDone($planetId)
	{
		return $this->database->table('userplanet')
		->where('planetId', $planetId)
		->where('activityLink IS NOT NULL')
		->where('approved', true)
		->order('id DESC');
	}

	public function getActivityFromUserPlanet($userId, $planetId)
	{
		return $this->database->table('userplanet')
		->where('userId', $userId)
		->where('planetId', $planetId)
		->fetch();
	}

	public function getActivity($id)
	{
		return $this->database->table('activity')->get($id);
	}

}
