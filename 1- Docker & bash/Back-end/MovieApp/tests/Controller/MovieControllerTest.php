<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class MovieControllerTest extends WebTestCase
{
    protected static function getKernelClass(): string
    {
        return \App\Kernel::class;
    }
    public function testIndex(): void
    {
        $client = static::createClient();
        $client->request('GET', '/movie');

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('content-type', 'application/json');
    }

    public function testShowMovieFound(): void
    {
        $client = static::createClient();
        $client->request('GET', '/movie/2');

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('content-type', 'application/json');
        $data = json_decode($client->getResponse()->getContent(), true);
        self::assertArrayHasKey('id', $data);
    }

    public function testShowMovieNotFound(): void
    {
        $client = static::createClient();
        $client->request('GET', '/movie/99999');

        self::assertResponseStatusCodeSame(404);
        $data = json_decode($client->getResponse()->getContent(), true);
        self::assertEquals('Movie not found', $data['error']);
    }

    public function testCreateMovieSuccess(): void
    {
        $client = static::createClient();
        $payload = [
            'title' => 'Test Movie',
            'production' => 'Test Production',
            'director' => 'Test Director',
            'start_date' => '2024-01-01',
            'enddate' => '2024-12-31'
        ];
        $client->request(
            'POST',
            '/movie',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        self::assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        self::assertEquals('Test Movie', $data['title']);
    }

    public function testCreateMovieMissingTitle(): void
    {
        $client = static::createClient();
        $payload = [
            'production' => 'Test Production'
        ];
        $client->request(
            'POST',
            '/movie',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        self::assertResponseStatusCodeSame(400);
        $data = json_decode($client->getResponse()->getContent(), true);
        self::assertEquals('Title is required', $data['error']);
    }

    public function testDeleteMovieSuccess(): void
    {
        $client = static::createClient();
        $payload = [
            'title' => 'Test Movie2',
            'production' => 'Test Production2',
            'director' => 'Test Director2',
            'start_date' => '2025-01-01',
            'enddate' => '2026-12-31'
        ];
        $client->request(
            'POST',
            '/movie',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );
        $data = json_decode($client->getResponse()->getContent(), true);
        $client->request('DELETE', '/movie/'. $data['id']);
        self::assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        self::assertEquals('Movie deleted', $data['message']);
    }

    public function testDeleteMovieNotFound(): void
    {
        $client = static::createClient();
        $client->request('DELETE', '/movie/99999');

        self::assertResponseStatusCodeSame(404);
        $data = json_decode($client->getResponse()->getContent(), true);
        self::assertEquals('Movie not found', $data['error']);
    }

    public function testSearchMovie(): void
    {
        $client = static::createClient();
        $client->request('GET', '/movie/search/Test');

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('content-type', 'application/json');
        $data = json_decode($client->getResponse()->getContent(), true);
        self::assertIsArray($data);
    }
}
