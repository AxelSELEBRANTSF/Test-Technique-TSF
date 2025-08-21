<?php
// src/EventSubscriber/SecurityActivitySubscriber.php
namespace App\EventSubscriber;

use App\Service\ActivityLogger;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;
use Symfony\Component\Security\Http\Event\LoginFailureEvent;
use Symfony\Component\Security\Http\Event\LogoutEvent;

final class SecurityActivitySubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ActivityLogger $logger,
        private readonly RequestStack $requestStack,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            LoginSuccessEvent::class => 'onLoginSuccess',
            LoginFailureEvent::class => 'onLoginFailure',
            LogoutEvent::class       => 'onLogout',
        ];
    }

    public function onLoginSuccess(LoginSuccessEvent $event): void
    {
        $token  = $event->getAuthenticatedToken();
        $user   = method_exists($token, 'getUser') ? $token->getUser() : null;
        $uid    = is_object($user) && method_exists($user, 'getId') ? $user->getId() : null;
        $email  = is_object($user) && method_exists($user, 'getEmail') ? $user->getEmail() : null;
        $ip     = $this->requestStack->getCurrentRequest()?->getClientIp();

        // signature existante: log(userId, action, entityType, entityId, message)
        $this->logger->log($uid, 'LOGIN_SUCCESS', 'auth', null, sprintf('email=%s ip=%s', $email, $ip));
    }

    public function onLoginFailure(LoginFailureEvent $event): void
    {
        $identifier = method_exists($event, 'getUserIdentifier') ? $event->getUserIdentifier() : null;
        $ip         = $this->requestStack->getCurrentRequest()?->getClientIp();
        $error      = $event->getException()?->getMessage();

        // pas d’utilisateur authentifié → userId null
        $this->logger->log(null, 'LOGIN_FAILURE', 'auth', null, sprintf('id=%s ip=%s err=%s', $identifier, $ip, $error));
    }

    public function onLogout(LogoutEvent $event): void
    {
        $token = $event->getToken();
        $user  = $token?->getUser();
        $uid   = is_object($user) && method_exists($user, 'getId') ? $user->getId() : null;
        $email = is_object($user) && method_exists($user, 'getEmail') ? $user->getEmail() : null;
        $ip    = $this->requestStack->getCurrentRequest()?->getClientIp();

        $this->logger->log($uid, 'LOGOUT', 'auth', null, sprintf('email=%s ip=%s', $email, $ip));
    }
}
