<?php
namespace App\Service;

use App\Entity\UserActivityLog;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class ActivityLogger
{
    public function __construct(private EntityManagerInterface $em, private RequestStack $rs) {}

    public function log(?int $userId, string $action, ?string $etype=null, ?int $eid=null, ?string $message=null): void
    {
        $req = $this->rs->getCurrentRequest();
        $log = new UserActivityLog();
        $log->setUserId($userId);
        $log->setAction($action);
        $log->setEntityType($etype);
        $log->setEntityId($eid);
        $log->setMessage($message);
        $log->setIp($req?->getClientIp());
        $log->setUserAgent($req?->headers->get('User-Agent'));
        $this->em->persist($log);
        $this->em->flush();
    }
}
