<?php

namespace App\Model;

use Nette;

class UserManager
{
	use Nette\SmartObject;
  //define("TABLE", 'zakaznik');
	/** @var Nette\Database\Context */
	private $database;
  private $table = 'user';

	public function __construct(Nette\Database\Context $database)
	{
		$this->database = $database;
	}

	public function getUserByEmail($email)
	{
		return $this->database->table($this->table)
			->where('email', $email)->fetch();
	}
	public function getUserById($id)
	{
		return $this->database->table($this->table)->get($id);
	}
	public function addUser($values)
	{
			return $this->database->table($this->table)->insert($values);
	}
	public function updateUser($values)
	{
			return $this->database->table($this->table)->where('id', $values->id)->update($values);
	}
	public function confirmEmail($email, $token)
	{
			return $this->database->table($this->table)->where('email', $email)->where('token', $token)->update(['emailConfirmed'=>1]);
	}
	public function resetPassword($email, $token, $newPassword)
	{
			return $this->database->table($this->table)->where('email', $email)->where('token', $token)->update(['password'=>$newPassword]);
	}
	public function isInvited($email)
	{
			return $this->database->table('invitations')->where('invitedEmail', $email)->fetch();
	}
	public function setPosition($id, $planetId)
	{
			return $this->database->table($this->table)->where('id', $id)->update(['position'=>$planetId]);
	}

}
