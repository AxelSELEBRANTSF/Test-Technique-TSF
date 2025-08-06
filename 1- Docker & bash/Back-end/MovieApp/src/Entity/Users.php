<?php

namespace App\Entity;

use App\Repository\UsersRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UsersRepository::class)]
class Users
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $firstname = null;

    /**
     * @var Collection<int, Movie>
     */
    #[ORM\OneToMany(targetEntity: Movie::class, mappedBy: 'createdBy')]
    private Collection $movieCreated;

    /**
     * @var Collection<int, Movie>
     */
    #[ORM\OneToMany(targetEntity: Movie::class, mappedBy: 'updatedBy')]
    private Collection $updatedMovies;

    public function __construct()
    {
        $this->movieCreated = new ArrayCollection();
        $this->updatedMovies = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): static
    {
        $this->firstname = $firstname;

        return $this;
    }

    /**
     * @return Collection<int, Movie>
     */
    public function getMovieCreated(): Collection
    {
        return $this->movieCreated;
    }

    public function addMovieCreated(Movie $movieCreated): static
    {
        if (!$this->movieCreated->contains($movieCreated)) {
            $this->movieCreated->add($movieCreated);
            $movieCreated->setCreatedBy($this);
        }

        return $this;
    }

    public function removeMovieCreated(Movie $movieCreated): static
    {
        if ($this->movieCreated->removeElement($movieCreated)) {
            // set the owning side to null (unless already changed)
            if ($movieCreated->getCreatedBy() === $this) {
                $movieCreated->setCreatedBy(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Movie>
     */
    public function getUpdatedMovies(): Collection
    {
        return $this->updatedMovies;
    }

    public function addUpdatedMovie(Movie $updatedMovie): static
    {
        if (!$this->updatedMovies->contains($updatedMovie)) {
            $this->updatedMovies->add($updatedMovie);
            $updatedMovie->setUpdatedBy($this);
        }

        return $this;
    }

    public function removeUpdatedMovie(Movie $updatedMovie): static
    {
        if ($this->updatedMovies->removeElement($updatedMovie)) {
            // set the owning side to null (unless already changed)
            if ($updatedMovie->getUpdatedBy() === $this) {
                $updatedMovie->setUpdatedBy(null);
            }
        }

        return $this;
    }
}
