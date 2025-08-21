<?php
namespace App\Repository;

use App\Entity\Movie;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class MovieRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry) { parent::__construct($registry, Movie::class); }

    /**
     * Recherche paginée avec q sur title|director|production.
     * Retourne [items, total]
     */
    public function search(?string $q, int $limit = 20, int $offset = 0): array
    {
        $q = trim((string)$q);

        // Requête liste AVEC fetch join sur createdBy/updatedBy
        $qb = $this->createQueryBuilder('m')
            ->leftJoin('m.createdBy', 'cb')->addSelect('cb')
            ->leftJoin('m.updatedBy', 'ub')->addSelect('ub')
            ->orderBy('m.id', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ($q !== '') {
            // Inutile de LOWER() si ta collation MySQL est déjà case-insensitive
            $qb->andWhere('m.title LIKE :q OR m.director LIKE :q OR m.production LIKE :q')
            ->setParameter('q', "%{$q}%");
        }

        $items = $qb->getQuery()->getResult(); // -> Movie[] avec users déjà hydratés

        // Requête total (sans join inutile)
        $countQb = $this->createQueryBuilder('m')
            ->select('COUNT(m.id)');
        if ($q !== '') {
            $countQb->andWhere('m.title LIKE :q OR m.director LIKE :q OR m.production LIKE :q')
                    ->setParameter('q', "%{$q}%");
        }
        $total = (int) $countQb->getQuery()->getSingleScalarResult();

        return [$items, $total];
    }


    /** Autocomplétion sur le titre, limite courte */
    public function suggestTitles(string $q, int $limit = 8): array
    {
        $like = '%'.str_replace(['%','_'], ['\%','\_'], mb_strtolower($q)).'%';

        return $this->createQueryBuilder('m')
            ->select('m.title')
            ->andWhere('m.title LIKE :q')
            ->setParameter('q', '%'.$q.'%')
            ->groupBy('m.title')
            ->orderBy('m.title', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()->getSingleColumnResult();
    }
}
