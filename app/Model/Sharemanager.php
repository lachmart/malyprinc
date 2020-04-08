<?php

namespace App\Model;

use Nette;

class ShareManager
{
	use Nette\SmartObject;
	/** @var Nette\Database\Context */
	private $database;
  private $tableInvitation = 'invitations';
  private $tableSharing = 'sharing';

	public function __construct(Nette\Database\Context $database)
	{
		$this->database = $database;
	}


	public function getEmailInvited($userId)
	{
		return $this->database->table($this->tableInvitation)->where('invitedBy',$userId);
	}
	public function getSharedAll($userId)
	{
		return $this->database->table($this->tableSharing)->where('sharingUser',$userId);
	}
	public function getReceivedActive($userId)
	{
		return $this->database->table($this->tableSharing)->where('receivingUser',$userId)
		->where('sharingActive', 1);
	}


	public function addInvitation($userId, $email)
	{
		$values = ([
			'invitedEmail' => $email,
			'invitedBy' => $userId
		]);
		return $this->database->table($this->tableInvitation)->insert($values);
	}

	public function addSharing($sharingId, $receivingId)
	{
		$values = ([
			'sharingUser' => $sharingId,
			'receivingUser' => $receivingId
		]);
		return $this->database->table($this->tableSharing)->insert($values);
	}

	public function changeSharingActive($sharingId, $receivingId, $active)
	{
		return $this->database->table($this->tableSharing)
		->where('sharingUser', $sharingId)
		->where('receivingUser', $receivingId)
		->update(['sharingActive'=>$active]);
	}
	public function changeReceivingActive($receivingId, $sharingId, $active)
	{
		return $this->database->table($this->tableSharing)
		->where('sharingUser', $sharingId)
		->where('receivingUser', $receivingId)
		->update(['receivingActive'=>$active]);
	}



}
