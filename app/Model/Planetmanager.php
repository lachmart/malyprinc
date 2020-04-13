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

	public function addFlight($data)
	{
		return $this->database->table($this->table)->insert($data);
	}

	public function getActualFlight($userId)
	{
		return $this->database->table($this->table)
		->where('userId', $userId)
		->where('finish >', time())
		->fetch();
	}
}
