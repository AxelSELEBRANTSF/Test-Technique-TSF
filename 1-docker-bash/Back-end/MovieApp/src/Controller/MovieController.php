<?php
namespace App\Controller;

use App\Entity\Movie;
use App\Entity\Users;
use App\Repository\MovieRepository;
use App\Service\ActivityLogger;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Security\Voter\MovieVoter;

#[Route('/api/movies')]
class MovieController extends AbstractController
{
    #[Route('', name: 'movies_list', methods: ['GET'])]
    public function list(Request $req, MovieRepository $repo): JsonResponse
    {
        $q = $req->query->get('q');
        $page = max(1, (int)$req->query->get('page', 1));
        $pageSize = min(100, max(1, (int)$req->query->get('pageSize', 20)));
        $offset = ($page - 1) * $pageSize;

        [$items, $total] = $repo->search($q, $pageSize, $offset);

        $rows = array_map(function(Movie $m){
            $creator = $m->getCreatedBy();
            $updater = $m->getUpdatedBy();

            $creatorLabel = $this->userLabel($creator);
            $updaterLabel = $this->userLabel($updater);

            $creatorRole = $creator ? $creator->getRole() : null;
            $creatorIsAdmin = $creator ? (stripos($creatorRole ?? '', 'admin') !== false) : false;

            return [
                'id' => $m->getId(),
                'title' => $m->getTitle(),
                'production' => $m->getProduction(),
                'director' => $m->getDirector(),
                'start_date' => $m->getStartDate()?->format('Y-m-d'),
                'end_date'   => $m->getEndDate()?->format('Y-m-d'),
                'created_at' => $m->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $m->getUpdatedAt()?->format(DATE_ATOM),

                'created_by_id'      => $creator?->getId(),
                'created_by'         => $creatorLabel,
                'created_by_role'    => $creatorRole ? ('ROLE_'.strtoupper($creatorRole)) : null,
                'created_by_is_admin'=> $creatorIsAdmin,
                'updated_by'         => $updaterLabel,
            ];
        }, $items);

        return new JsonResponse([
            'items' => $rows,
            'total' => $total,
            'page' => $page,
            'pageSize' => $pageSize
        ]);
    }

    #[Route('/suggest', name: 'movies_suggest', methods: ['GET'])]
    public function suggest(Request $req, MovieRepository $repo): JsonResponse
    {
        $q = (string)$req->query->get('q', '');
        if ($q === '') return new JsonResponse(['items'=>[]]);
        $titles = $repo->suggestTitles($q, 8);
        return new JsonResponse(['items' => $titles]);
    }

    #[Route('/{id}', name: 'movies_get', methods: ['GET'])]
    public function getOne(Movie $movie): JsonResponse
    {
        $creator = $movie->getCreatedBy();
        $updater = $movie->getUpdatedBy();

        $creatorRoles = $creator?->getRoles() ?? [];
        $creatorIsAdmin = in_array('ROLE_ADMIN', $creatorRoles, true);

        // rôle “principal”
        $creatorRole = null;
        if ($creator && method_exists($creator, 'getRole')) {
            $creatorRole = $creator->getRole();
            if ($creatorRole && !str_starts_with($creatorRole, 'ROLE_')) {
                $creatorRole = 'ROLE_' . strtoupper($creatorRole);
            }
        } else {
            $creatorRole = $creatorIsAdmin
                ? 'ROLE_ADMIN'
                : (in_array('ROLE_EDITOR', $creatorRoles, true) ? 'ROLE_EDITOR' : 'ROLE_USER');
        }

        return new JsonResponse([
            'id' => $movie->getId(),
            'title' => $movie->getTitle(),
            'production' => $movie->getProduction(),
            'director' => $movie->getDirector(),
            'start_date' => $movie->getStartDate()?->format('Y-m-d'),
            'end_date'   => $movie->getEndDate()?->format('Y-m-d'),
            'created_at' => $movie->getCreatedAt()->format(DATE_ATOM),
            'updated_at' => $movie->getUpdatedAt()?->format(DATE_ATOM),

            'created_by_id'       => $creator?->getId(),
            'created_by'          => $this->userLabel($creator),  // ← toujours name > username > email
            'updated_by'          => $this->userLabel($updater),  // ← idem
            'created_by_role'     => $creatorRole,
            'created_by_is_admin' => $creatorIsAdmin,
        ]);
    }

    #[Route('', name: 'movies_create', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function create(
        Request $req,
        EntityManagerInterface $em,
        ActivityLogger $logger
    ): JsonResponse {
        /** @var Users $user */
        $user = $this->getUser();
        $data = json_decode($req->getContent(), true) ?? [];

        foreach (['title','production','director'] as $f) {
            if (empty($data[$f])) return new JsonResponse(['error' => "$f required"], 400);
        }

        $m = new Movie();
        $m->setTitle($data['title']);
        $m->setProduction($data['production']);
        $m->setDirector($data['director']);

        if (!empty($data['start_date'])) $m->setStartDate(new \DateTime($data['start_date']));
        if (!empty($data['end_date'])) $m->setEndDate(new \DateTime($data['end_date']));

        $m->setCreatedBy($user);
        $m->setUpdatedBy($user);

        $em->persist($m);
        $em->flush();

        $logger->log($user->getId(), 'MOVIE_CREATE', 'movie', $m->getId(), $m->getTitle());

        return new JsonResponse(['id' => $m->getId()], 201);
    }

    #[Route('/{id}', name: 'movies_update', methods: ['PUT','PATCH'])]
    public function update(
        Movie $movie,
        Request $req,
        EntityManagerInterface $em,
        ActivityLogger $logger
    ): JsonResponse {
        /** @var Users|null $user */
        $this->denyAccessUnlessGranted(MovieVoter::EDIT, $movie);
        $user = $this->getUser();
        if (!$user) return new JsonResponse(['error' => 'unauthorized'], 401);

        $data = json_decode($req->getContent(), true) ?? [];

        foreach (['title','production','director'] as $f) {
            if (array_key_exists($f, $data) && $data[$f] !== null) {
                $setter = 'set'.str_replace(' ', '', ucwords(str_replace('_',' ',$f)));
                $movie->$setter($data[$f]);
            }
        }
        if (array_key_exists('start_date', $data)) {
            $movie->setStartDate($data['start_date'] ? new \DateTime($data['start_date']) : null);
        }
        if (array_key_exists('end_date', $data)) {
            $movie->setEndDate($data['end_date'] ? new \DateTime($data['end_date']) : null);
        }

        $movie->setUpdatedBy($user);

        $em->flush();

        $logger->log($user->getId(), 'MOVIE_UPDATE', 'movie', $movie->getId(), $movie->getTitle());

        return new JsonResponse(['message' => 'updated']);
    }

    #[Route('/{id}', name: 'movies_delete', methods: ['DELETE'])]
    public function delete(Movie $movie, EntityManagerInterface $em, ActivityLogger $logger): JsonResponse
    {
        $this->denyAccessUnlessGranted(MovieVoter::DELETE, $movie);

        $id = $movie->getId();
        $title = $movie->getTitle();

        $em->remove($movie);
        $em->flush();

        $logger->log($this->getUser()->getId(), 'MOVIE_DELETE', 'movie', $id, $title);

        return new JsonResponse(['message' => 'deleted']);
    }

    /** Retourne un label human-friendly: displayName > username > email */
    private function userLabel(?Users $u): string
    {
        if (!$u) return '';
        return $u->getDisplayName() ?: $u->getUsername() ?: $u->getEmail() ?: '';
    }
}
