<?php
namespace App\Controller;

use App\Entity\Users;
use App\Service\ActivityLogger;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    #[Route('/users', name: 'admin_users_list', methods: ['GET'])]
    public function listUsers(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $q = trim((string)$req->query->get('q', ''));
        $page = max(1, (int)$req->query->get('page', 1));
        $pageSize = min(100, max(1, (int)$req->query->get('pageSize', 20)));
        $offset = ($page - 1) * $pageSize;

        $qb = $em->getRepository(Users::class)->createQueryBuilder('u')
            ->orderBy('u.id', 'DESC')
            ->setMaxResults($pageSize)
            ->setFirstResult($offset);

        if ($q !== '') {
            $like = '%'.str_replace(['%','_'], ['\%','\_'], mb_strtolower($q)).'%';
            $qb->andWhere('LOWER(u.email) LIKE :q OR LOWER(u.username) LIKE :q OR LOWER(u.displayName) LIKE :q OR LOWER(u.role) LIKE :q')
               ->setParameter('q', $like);
        }

        $items = $qb->getQuery()->getResult();

        $countQb = $em->getRepository(Users::class)->createQueryBuilder('u')
            ->select('COUNT(u.id)');
        if ($q !== '') {
            $countQb->andWhere('LOWER(u.email) LIKE :q OR LOWER(u.username) LIKE :q OR LOWER(u.displayName) LIKE :q OR LOWER(u.role) LIKE :q')
                    ->setParameter('q', '%'.str_replace(['%','_'], ['\%','\_'], mb_strtolower($q)).'%');
        }
        $total = (int)$countQb->getQuery()->getSingleScalarResult();

        $rows = array_map(function(Users $u) {
            return [
                'id' => $u->getId(),
                'email' => $u->getEmail(),
                'username' => $u->getUsername(),
                'displayName' => $u->getDisplayName(),
                'role' => $u->getRole(),
                'created_at' => $u->getCreatedAt()?->format(DATE_ATOM),
            ];
        }, $items);

        return new JsonResponse(['items' => $rows, 'total' => $total, 'page' => $page, 'pageSize' => $pageSize]);
    }

    #[Route('/users/{id}/role', name: 'admin_users_set_role', methods: ['PUT','PATCH'])]
    public function setRole(
        Users $target,
        Request $req,
        EntityManagerInterface $em,
        ActivityLogger $logger
    ): JsonResponse {
        /** @var Users $actor */
        $actor = $this->getUser();

        $data = json_decode($req->getContent(), true) ?? [];

        // Accepter { role: "editor" } ou { role: "ROLE_EDITOR" } ou même { roles: ["ROLE_EDITOR"] }
        $input = null;
        if (isset($data['role']) && is_string($data['role'])) {
            $input = $data['role'];
        } elseif (!empty($data['roles']) && is_array($data['roles'])) {
            $input = (string)($data['roles'][0] ?? '');
        }

        if (!$input) {
            return new JsonResponse(['error' => 'missing role'], 400);
        }

        $normalized = strtolower(preg_replace('/^role_/', '', strtoupper($input)));
        $normalized = strtr($normalized, ['user' => 'user', 'editor' => 'editor', 'admin' => 'admin']);

        $allowed = ['user','reader','editor','admin'];
        if (!in_array($normalized, $allowed, true)) {
            return new JsonResponse(['error' => 'invalid role'], 400);
        }

        // Harmonise: "user" = "reader"
        if ($normalized === 'user') $normalized = 'reader';

        // Interdit de modifier un autre admin (exigence énoncé)
        if ($target->getRole() === 'admin' && $actor->getId() !== $target->getId()) {
            return new JsonResponse(['error' => 'cannot modify other admins'], 403);
        }

        $old = $target->getRole();
        $target->setRole($normalized);
        $em->flush();

        $logger->log($actor->getId(), 'USER_ROLE_CHANGE', 'user', $target->getId(), "$old -> $normalized");

        $roleWithPrefix = 'ROLE_' . strtoupper($normalized);
        return new JsonResponse([
            'id'          => $target->getId(),
            'email'       => $target->getEmail(),
            'username'    => $target->getUsername(),
            'displayName' => $target->getDisplayName(),
            'role'        => $roleWithPrefix,
            'roles'       => [$roleWithPrefix],
            'created_at'  => $target->getCreatedAt()?->format(DATE_ATOM),
        ]);
    }

    #[Route('/users/{id}', name: 'admin_users_delete', methods: ['DELETE'])]
    public function deleteUser(
        Users $target,
        EntityManagerInterface $em,
        ActivityLogger $logger
    ): JsonResponse {
        /** @var Users $actor */
        $actor = $this->getUser();

        // Interdictions: ne pas supprimer d’autres admins
        if ($target->getRole() === 'admin' && $actor->getId() !== $target->getId()) {
            return new JsonResponse(['error' => 'cannot delete other admins'], 403);
        }

        // on refuse la suppression de soi-même
        if ($actor->getId() === $target->getId()) {
            return new JsonResponse(['error' => 'cannot delete yourself'], 400);
        }

        $id = $target->getId();
        $email = $target->getEmail();

        $em->remove($target);
        $em->flush();

        $logger->log($actor->getId(), 'USER_DELETE', 'user', $id, $email ?? 'n/a');

        return new JsonResponse(['message' => 'deleted']);
    }
}
