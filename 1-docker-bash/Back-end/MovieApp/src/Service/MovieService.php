<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Movie;

class MovieService {
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }
    public function getAllMovies(): array
    {
        $allMovies = $this->entityManager->getRepository(Movie::class)->findAll();
        usort($allMovies, fn($a, $b) => strtotime($a->getStartDate()->format('Y-m-d')) - strtotime($b->getStartDate()->format('Y-m-d')));
        return $allMovies;
    }
    public function createMovie(array $data): Movie
    {
        $movie = new Movie();
        $movie->setTitle($data['title'] ?? '');
        $movie->setProduction($data['production'] ?? '');
        $movie->setDirector($data['director'] ?? '');
        $movie->setStartDate(isset($data['start_date']) ? new \DateTime($data['start_date']) : "");
        $movie->setEnddate(isset($data['end_date']) ? new \DateTime($data['end_date']) : null);

        $this->entityManager->persist($movie);
        $this->entityManager->flush();

        return $movie;
    }

    public function getMovieById(int $id): ?Movie
    {
        return $this->entityManager->getRepository(Movie::class)->find($id);
    }

    public function deleteMovie(int $id): bool
    {
        $movie = $this->getMovieById($id);
        if (!$movie) {
            return false;
        }
        $this->entityManager->remove($movie);
        $this->entityManager->flush();
        return true;
    }

    public function searchMovie(string $query): array
    {
        $qb = $this->entityManager->createQueryBuilder();
        $qb->select('m')
            ->from(Movie::class, 'm')
            ->where('m.title LIKE :query')
            ->setParameter('query', '%' . $query . '%');

        return $qb->getQuery()->getResult();
    }
}