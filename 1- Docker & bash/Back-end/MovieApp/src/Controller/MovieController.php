<?php

namespace App\Controller;

use App\Service\MovieService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class MovieController extends AbstractController
{
    private MovieService $movieService;

    public function __construct(MovieService $movieService)
    {
        $this->movieService = $movieService;
    }

    #[Route('/movie', name: 'app_movie', methods:['GET'])]
    public function index(): JsonResponse
    {
        $movies = $this->movieService->getAllMovies();
        $data = array_map(function($movie) {
            return [
                'id' => $movie->getId(),
                'title' => $movie->getTitle(),
                'production' => $movie->getProduction(),
                'director' => $movie->getDirector(),
                'start_date' => $movie->getStartDate() ?? "",
                'enddate' => $movie->getEnddate() ?? "",
            ];
        }, $movies);

        return $this->json($data);
    }
    #[Route('/movie/{id}', name: 'app_movie_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $movie = $this->movieService->getMovieById($id);
        if (!$movie) {
            return $this->json(['error' => 'Movie not found'], 404);
        }
        $data = [
            'id' => $movie->getId(),
            'title' => $movie->getTitle(),
            'production' => $movie->getProduction(),
            'director' => $movie->getDirector(),
            'start_date' => $movie->getStartDate() ?? "",
            'enddate' => $movie->getEnddate() ?? "",
        ];
        return $this->json($data);
    }

    #[Route('/movie', name: 'app_movie_create', methods: ['POST'])]
    public function create(): JsonResponse
    {
        $request = $this->getRequest();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['title'])) {
            return $this->json(['error' => 'Title is required'], 400);
        }

        $movie = $this->movieService->createMovie($data);
        $response = [
            'id' => $movie->getId(),
            'title' => $movie->getTitle(),
            'production' => $movie->getProduction(),
            'director' => $movie->getDirector(),
            'start_date' => $movie->getStartDate() ?? "",
            'enddate' => $movie->getEnddate() ?? "",
        ];
        return $this->json($response, 201);
    }

    #[Route('/movie/{id}', name: 'app_movie_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $deleted = $this->movieService->deleteMovie($id);
        if (!$deleted) {
            return $this->json(['error' => 'Movie not found'], 404);
        }
        return $this->json(['message' => 'Movie deleted']);
    }

    #[Route('/movie/search/{query}', name: 'app_movie_search', methods: ['GET'])]
    public function search(string $query): JsonResponse
    {
        $movies = $this->movieService->searchMovie($query);
        $data = array_map(function($movie) {
            return [
                'id' => $movie->getId(),
                'title' => $movie->getTitle(),
                'production' => $movie->getProduction(),
                'director' => $movie->getDirector(),
                'start_date' => $movie->getStartDate() ?? "",
                'enddate' => $movie->getEnddate() ?? "",
            ];
        }, $movies);

        return $this->json($data);
    }

    private function getRequest()
    {
        return $this->container->get('request_stack')->getCurrentRequest();
    }
}