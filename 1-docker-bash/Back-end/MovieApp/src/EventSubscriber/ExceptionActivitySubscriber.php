<?php
namespace App\EventSubscriber;

use App\Service\ActivityLogger;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Security;

final class ExceptionActivitySubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ActivityLogger $logger,
        private readonly Security $security,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [ KernelEvents::EXCEPTION => 'onException' ];
    }

    public function onException(ExceptionEvent $event): void
    {
        $e     = $event->getThrowable();
        $req   = $event->getRequest();
        $user  = $this->security->getUser();
        $uid   = \is_object($user) && method_exists($user, 'getId') ? $user->getId() : null;

        $msg = sprintf(
            'type=%s code=%s path=%s msg=%s',
            (new \ReflectionClass($e))->getShortName(),
            (string)($e->getCode() ?: '0'),
            $req->getRequestUri(),
            substr($e->getMessage(), 0, 500)
        );

        $this->logger->log($uid, 'EXCEPTION', 'error', null, $msg);
    }
}
