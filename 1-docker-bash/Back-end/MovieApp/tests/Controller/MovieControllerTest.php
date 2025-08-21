<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class MovieControllerTest extends WebTestCase
{
    public function testAccessMoviesWithoutTokenShouldFail(): void
    {
        $client = static::createClient();

        // On tente d'accéder à la liste des films sans Authorization header
        $client->request('GET', '/api/movies');

        // Symfony doit répondre 401 Unauthorized
        $this->assertResponseStatusCodeSame(401);
    }

    public function testAccessMoviesWithValidTokenShouldSucceed(): void
    {
        $client = static::createClient();

        // On fait un login pour récupérer un JWT
        $client->jsonRequest('POST', '/api/login', [
            'email' => 'admin@movieapp.com',
            'password' => 'admin',
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $data);

        $token = $data['token'];

        // On réutilise le token pour appeler /api/movies
        $client->setServerParameter('HTTP_Authorization', sprintf('Bearer %s', $token));
        $client->request('GET', '/api/movies');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
    }
}
