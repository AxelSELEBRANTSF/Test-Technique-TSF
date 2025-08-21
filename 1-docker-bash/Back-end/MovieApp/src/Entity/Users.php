<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

#[ORM\Entity]
#[ORM\Table(name: "users")]
class Users implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column(type:"integer")]
    private ?int $id = null;

    #[ORM\Column(type:"string", length:255)]
    private string $username = '';

    #[ORM\Column(type:"string", length:190, unique:true, nullable:true)]
    private ?string $email = null;

    #[ORM\Column(name:"password_hash", type:"string", length:255, nullable:true)]
    private ?string $password = null;

    #[ORM\Column(name:"display_name", type:"string", length:100, nullable:true)]
    private ?string $displayName = null;

    #[ORM\Column(type:"string", length:16, options:["default" => "reader"])]
    private string $role = 'reader';

    #[ORM\Column(name:"created_at", type:"datetime_immutable")]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getUsername(): string { return $this->username; }
    public function setUsername(string $u): self { $this->username = $u; return $this; }

    public function getEmail(): ?string { return $this->email; }
    public function setEmail(?string $e): self { $this->email = $e; return $this; }

    // PasswordAuthenticatedUserInterface
    public function getPassword(): ?string { return $this->password; }
    public function setPassword(?string $hash): self { 
        $this->password = $hash; 
        return $this; 
    }

    public function getDisplayName(): ?string { return $this->displayName; }
    public function setDisplayName(?string $d): self { $this->displayName = $d; return $this; }

    public function getRole(): string { return $this->role; }
    public function setRole(string $r): self { $this->role = $r; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(?\DateTimeImmutable $dt): self { $this->createdAt = $dt; return $this; }

    public function getUserIdentifier(): string
    {
        // on force l’email pour rester cohérent avec le provider et le JWT
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        // map enum DB -> rôles Symfony
        return match ($this->role) {
            'admin'  => ['ROLE_USER','ROLE_EDITOR','ROLE_ADMIN'],
            'editor' => ['ROLE_USER','ROLE_EDITOR'],
            default  => ['ROLE_USER'],
        };
    }

    public function eraseCredentials(): void {}
    public function getSalt(): ?string { return null; }
}
