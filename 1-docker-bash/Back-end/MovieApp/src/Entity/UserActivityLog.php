<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name:"user_activity_logs")]
class UserActivityLog
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column(type:"bigint")]
    private ?int $id = null;

    #[ORM\Column(name:"user_id", type:"integer", nullable:true)]
    private ?int $userId = null;

    #[ORM\Column(type:"string", length:50)]
    private string $action;

    #[ORM\Column(name:"entity_type", type:"string", length:50, nullable:true)]
    private ?string $entityType = null;

    #[ORM\Column(name:"entity_id", type:"integer", nullable:true)]
    private ?int $entityId = null;

    #[ORM\Column(type:"text", nullable:true)]
    private ?string $message = null;

    #[ORM\Column(type:"string", length:45, nullable:true)]
    private ?string $ip = null;

    #[ORM\Column(name:"user_agent", type:"string", length:255, nullable:true)]
    private ?string $userAgent = null;

    #[ORM\Column(name:"created_at", type:"datetime_immutable", nullable:true, options:["default" => "CURRENT_TIMESTAMP"])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }

    // Getters/setters minimalistes
    public function setUserId(?int $id): void { $this->userId = $id; }
    public function setAction(string $a): void { $this->action = $a; }
    public function setEntityType(?string $t): void { $this->entityType = $t; }
    public function setEntityId(?int $e): void { $this->entityId = $e; }
    public function setMessage(?string $m): void { $this->message = $m; }
    public function setIp(?string $ip): void { $this->ip = $ip; }
    public function setUserAgent(?string $ua): void { $this->userAgent = $ua; }
}
