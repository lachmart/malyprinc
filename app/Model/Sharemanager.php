<?php

namespace App\Model;

use Nette;

class ShareManager
{
	use Nette\SmartObject;
	/** @var Nette\Database\Context */
	private $database;
  private $tableInvitation = 'invitations';

	public function __construct(Nette\Database\Context $database)
	{
		$this->database = $database;
	}


	public function getUserInvited($userId)
	{
		return $this->database->table($this->tableInvitation)->where('invitedBy',$userId);
	}


	public function addInvitation($userId, $email)
	{
		$values = ([
			'invitedEmail' => $email,
			'invitedBy' => $userId
		]);
		return $this->database->table($this->tableInvitation)->insert($values);

	}



}
