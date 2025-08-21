<?php
namespace App\Controller;

use App\Entity\Users;
use App\Service\ActivityLogger;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
        ActivityLogger $logger
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $display = $data['displayName'] ?? null;
        $username = $data['username'] ?? ($display ?? $email);

        if (!$email || !$password) {
            return new JsonResponse(['error' => 'email and password required'], 400);
        }

        $exists = $em->getRepository(Users::class)->findOneBy(['email' => $email]);
        if ($exists) return new JsonResponse(['error' => 'email already used'], 409);

        $u = new Users();
        $u->setEmail($email);
        $u->setUsername($username);
        $u->setDisplayName($display ?? $username);
        $u->setRole('reader');
        $u->setPassword($hasher->hashPassword($u, $password));

        $em->persist($u);
        $em->flush();

        $logger->log($u->getId(), 'USER_CREATE', 'user', $u->getId(), 'Registered');
        return new JsonResponse(['message' => 'registered'], 201);
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?Users $user = null): JsonResponse
    {
        if (!$user) return new JsonResponse(['error' => 'unauthorized'], 401);
        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'username' => $user->getUsername(),
            'displayName' => $user->getDisplayName(),
            'roles' => $user->getRoles(),
            'role' => $user->getRole()
        ]);
    }
}
