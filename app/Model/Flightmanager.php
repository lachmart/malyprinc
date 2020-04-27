<?php

namespace App\Model;

use Nette;

class FlightManager
{
	use Nette\SmartObject;
  //define("TABLE", 'zakaznik');
	/** @var Nette\Database\Context */
	private $database;
  private $table = 'flight';

	public function __construct(Nette\Database\Context $database)
	{
		$this->database = $database;
	}


	public function getAll()
	{
		return $this->database->table($this->table);
	}

	public function addFlight($data)
	{
		return $this->database->table($this->table)->insert($data);
	}

	public function getActualFlight($userId)
	{
		return $this->database->table($this->table)
		->where('userId', $userId)
		->where('finish >', date('Y-m-d\TH:i:s.u'))
		->fetch();
	}
	public function getlastFinishedFlight($userId)
	{
		return $this->database->table($this->table)
		->where('userId', $userId)
		->where('finish <', date('Y-m-d\TH:i:s.u'))
		->order('id DESC')
		->limit(1)
		->fetch();
	}
	public function getDateFlights($userId, $date)
	{
		return $this->database->table($this->table)
		->where('userId', $userId)
		->where('(start BETWEEN "'. date('Y-m-d 00:00:00', $date).'" AND "'. date('Y-m-d 23:59:59', $date).'") OR (finish BETWEEN "'. date('Y-m-d 00:00:00', $date).'" AND "'. date('Y-m-d 23:59:59', $date).'")');
		//->where('start <', date('Y-m-d\T23:59:59', $date));
	}
	public function getDateFinishFlight($userId, $date)
	{
		return $this->database->table($this->table)
		->where('userId', $userId)
		->where('finish >', date('Y-m-d\T00:00:00', $date))
		->where('finish <', date('Y-m-d\T23:59:59', $date));
	}


}
