<?php
namespace App\EventSubscriber;

use App\Service\ActivityLogger;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Events;
use Symfony\Component\Security\Core\Security;

final class DoctrineActivitySubscriber implements EventSubscriber
{
    public function __construct(
        private readonly ActivityLogger $logger,
        private readonly Security $security,
    ) {}

    public function getSubscribedEvents(): array
    {
        return [ Events::onFlush ];
    }

    public function onFlush(OnFlushEventArgs $args): void
    {
        $em   = $args->getEntityManager();
        $uow  = $em->getUnitOfWork();

        $user = $this->security->getUser();
        $uid  = \is_object($user) && method_exists($user, 'getId') ? $user->getId() : null;

        // INSERTS
        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            [$etype,$eid] = [$this->etype($entity), $this->idOf($entity)];
            $msg = 'fields='.json_encode($this->scalarize($this->valuesOf($entity)), JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
            $this->logger->log($uid, 'ENTITY_CREATE', $etype, $eid, $msg);
        }

        // UPDATES
        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            $changeSet = $uow->getEntityChangeSet($entity);
            $diff = [];
            foreach ($changeSet as $field => [$old, $new]) {
                $diff[$field] = ['old'=>$this->scalarize($old), 'new'=>$this->scalarize($new)];
            }
            [$etype,$eid] = [$this->etype($entity), $this->idOf($entity)];
            $msg = 'changes='.json_encode($diff, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
            $this->logger->log($uid, 'ENTITY_UPDATE', $etype, $eid, $msg);
        }

        // DELETES
        foreach ($uow->getScheduledEntityDeletions() as $entity) {
            [$etype,$eid] = [$this->etype($entity), $this->idOf($entity)];
            $msg = 'last_state='.json_encode($this->scalarize($this->valuesOf($entity)), JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
            $this->logger->log($uid, 'ENTITY_DELETE', $etype, $eid, $msg);
        }
    }

    private function etype(object $e): string
    {
        // "App\Entity\Movie" -> "movie"
        return strtolower((new \ReflectionClass($e))->getShortName());
    }
    private function idOf(object $e): ?int
    {
        if (method_exists($e, 'getId')) {
            $id = $e->getId();
            return \is_scalar($id) ? (int)$id : null;
        }
        return null;
    }
    private function valuesOf(object $e): array
    {
        // extrait un snapshot simple des champs "publics" via getters
        $out = [];
        foreach (get_class_methods($e) as $m) {
            if (str_starts_with($m, 'get') && $m !== 'getId') {
                try {
                    $val = $e->$m();
                } catch (\Throwable) { continue; }
                $name = lcfirst(substr($m, 3));
                $out[$name] = $this->scalarize($val);
            }
        }
        // remet l'id
        $out['id'] = $this->idOf($e);
        return $out;
    }
    private function scalarize(mixed $v): mixed
    {
        if ($v instanceof \DateTimeInterface) return $v->format(DATE_ATOM);
        if (\is_object($v)) {
            if (method_exists($v, 'getId')) return ['class'=> (new \ReflectionClass($v))->getShortName(), 'id'=>$v->getId()];
            return (new \ReflectionClass($v))->getShortName();
        }
        if (\is_array($v)) {
            // map récursif mais borné
            $out = [];
            foreach ($v as $k=>$vv) $out[$k] = $this->scalarize($vv);
            return $out;
        }
        return $v;
    }
}
