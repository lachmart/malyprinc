<?php

namespace App\Model;

use Nette;

class ZivotManager
{
	use Nette\SmartObject;
  //define("TABLE", 'zakaznik');
	/** @var Nette\Database\Context */
	private $database;
  private $table = 'zivot';

	public function __construct(Nette\Database\Context $database)
	{
		$this->database = $database;
	}


	public function getAll()
	{
		return $this->database->table($this->table);
	}


	public function getDoneToday($userId)
	{
		return $this->database->table('zivotuser')
		->where('userId',$userId)
		->where('date',date('Y-m-d'));
	}
	public function getDoneDate($userId, $date)
	{
		return $this->database->table('zivotuser')
		->where('userId',$userId)
		->where('date',date('Y-m-d', $date));
	}
	public function addUserZivot($userId, $zivotId)
	{
		$values= [
	      'userId' => $userId,
	      'zivotId' => $zivotId,
	      'date'  => date('Y-m-d'),
	    ];
		return $this->database->table('zivotuser')->insert($values);
	}


	public function getAllSpecial()
	{
		return $this->database->table('special');
	}
	public function getSpecial($userId, $date , $done)
	{
		return $this->database->table('specialuser')
		->where('userId',$userId)
		->where('date', $date)
		->where('done',$done)->fetch();
	}
	public function updateSpecial($userId)
	{
		return $this->database->table('specialuser')
		->where('userId',$userId)
		->where('date', date('Y-m-d'))
		->update(['done'=>1]);
	}
	public function generateSpecial($userId)
	{
		$specialIds = range(1, $this->getAllSpecial()->count());
		shuffle($specialIds);
			$time = time();
		foreach ($specialIds as $specialId) {
			$time += 3*24*3600;
			$values= [
				'userId' => $userId,
				'specialId' => $specialId,
				'date'  => date('Y-m-d', $time)
			];
			$this->database->table('specialuser')->insert($values);
			//$time +=24*3600;
		}
	}
	public function getTotal($userId, $date)
	{
		$total = 0;
		$zivoty = $this->database->table('zivotuser')
		->where('userId',$userId)
		->where('date', $date);

		foreach($zivoty as $zivot){
			$total += $zivot->zivot->value;
		}
		$special = $this->getSpecial($userId, $date, true);
		if($special)
			$total+=$special->special->value;

		return $total;

	}


}
