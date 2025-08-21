<?php
namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class LoginController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function __invoke(): JsonResponse
    {
        return new JsonResponse(['error' => 'Authentication should be handled by the firewall'], 500);
    }
}
