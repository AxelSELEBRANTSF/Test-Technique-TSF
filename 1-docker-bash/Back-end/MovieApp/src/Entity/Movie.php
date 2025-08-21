<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Entity\Users;

#[ORM\Entity(repositoryClass: \App\Repository\MovieRepository::class)]
#[ORM\Table(name: "movie")]
#[ORM\HasLifecycleCallbacks]
class Movie
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column(type:"integer")]
    private ?int $id = null;

    #[ORM\Column(type:"string", length:255)]
    private string $title;

    #[ORM\Column(type:"string", length:255)]
    private string $production;

    #[ORM\Column(type:"string", length:255)]
    private string $director;

    #[ORM\Column(name:"start_date", type:"date", nullable:true)]
    private ?\DateTimeInterface $startDate = null;

    #[ORM\Column(name:"end_date", type:"date", nullable:true)]
    private ?\DateTimeInterface $endDate = null;

    #[ORM\Column(name:"created_at", type:"datetime_immutable")]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(name:"updated_at", type:"datetime", nullable:true)]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\ManyToOne(targetEntity: Users::class)]
    #[ORM\JoinColumn(name: "created_by_user_id", referencedColumnName: "id", nullable: true, onDelete: "SET NULL")]
    private ?Users $createdBy = null;

    #[ORM\ManyToOne(targetEntity: Users::class)]
    #[ORM\JoinColumn(name: "updated_by_user_id", referencedColumnName: "id", nullable: true, onDelete: "SET NULL")]
    private ?Users $updatedBy = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        if (!isset($this->createdAt)) $this->createdAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTime();
    }

    // Getters/Setters

    public function getId(): ?int { return $this->id; }

    public function getTitle(): string { return $this->title; }
    public function setTitle(string $t): self { $this->title = $t; return $this; }

    public function getProduction(): string { return $this->production; }
    public function setProduction(string $p): self { $this->production = $p; return $this; }

    public function getDirector(): string { return $this->director; }
    public function setDirector(string $d): self { $this->director = $d; return $this; }

    public function getStartDate(): ?\DateTimeInterface { return $this->startDate; }
    public function setStartDate(?\DateTimeInterface $dt): self { $this->startDate = $dt; return $this; }

    public function getEndDate(): ?\DateTimeInterface { return $this->endDate; }
    public function setEndDate(?\DateTimeInterface $dt): self { $this->endDate = $dt; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeInterface { return $this->updatedAt; }

    public function getCreatedBy(): ?Users { return $this->createdBy; }
    public function setCreatedBy(?Users $u): self { $this->createdBy = $u; return $this; }

    public function getUpdatedBy(): ?Users { return $this->updatedBy; }
    public function setUpdatedBy(?Users $u): self { $this->updatedBy = $u; return $this; }
}
