<?php
namespace App\EventSubscriber;

use App\Service\ActivityLogger;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Security;

final class RequestActivitySubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ActivityLogger $logger,
        private readonly Security $security,
    ) {}

    public static function getSubscribedEvents(): array
    {
        // priorité basse, et uniquement sur master requests
        return [ KernelEvents::REQUEST => ['onRequest', -255] ];
    }

    public function onRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) return;

        $req   = $event->getRequest();
        $path  = $req->getRequestUri();
        $meth  = $req->getMethod();
        $from  = $req->headers->get('referer');
        $ip    = $req->getClientIp();
        $ua    = substr((string)$req->headers->get('user-agent'), 0, 250);

        // on ne log pas les assets ni le health
        if (preg_match('#\.(css|js|png|jpg|svg|ico)$#i', $path)) return;

        $user  = $this->security->getUser();
        $uid   = \is_object($user) && method_exists($user, 'getId') ? $user->getId() : null;

        // action générique NAVIGATE
        $this->logger->log(
            $uid,
            'NAVIGATE',
            'http',
            null,
            sprintf('method=%s to=%s from=%s ip=%s ua=%s', $meth, $path, $from ?? '-', $ip, $ua)
        );
    }
}
