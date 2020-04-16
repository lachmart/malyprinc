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


	public function getAll()
	{
		return $this->database->table($this->table)->fetchAll();
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

	public function getVisited($userId)
	{
			return $this->database->table('userplanet')->where('userId', $userId)->where('activityLink IS NULL')->fetchAll();
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
		->where('activityLink IS NOT NULL');
	}

	public function getActivity($id)
	{
		return $this->database->table('activity')->get($id);
	}

}
