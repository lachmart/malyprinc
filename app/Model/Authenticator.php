<?php

use Nette\Security as NS;

class Authenticator implements NS\IAuthenticator
{
	private $database;

	private $passwords;

	public function __construct(Nette\Database\Context $database, Nette\Security\Passwords $passwords)
	{
		$this->database = $database;
		$this->passwords = $passwords;
	}

	public function authenticate(array $credentials): Nette\Security\IIdentity
	{
		[$username, $password] = $credentials;

		$row = $this->database->table('user')
			->where('email', $username)->fetch();

		if (!$row) {
			throw new Nette\Security\AuthenticationException('Uživatel nenalezen.');
		}

		// if (!$row->emailConfirmed) {
		// 	throw new Nette\Security\AuthenticationException('Před přihlášením prosím, klikni na odkaz v emailu. Tím potvrříš, že emailová adresa patří tobě.');
		// }

		if (!$this->passwords->verify($password, $row->password)) {
			throw new Nette\Security\AuthenticationException('Špatné heslo.');
		}

		return new Nette\Security\Identity($row->id, 'user', ['email' => $row->email, 'isSkaut' => $row->isSkaut]);
	}
}
