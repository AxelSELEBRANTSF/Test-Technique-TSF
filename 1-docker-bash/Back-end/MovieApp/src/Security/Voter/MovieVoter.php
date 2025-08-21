<?php
namespace App\Security\Voter;

use App\Entity\Movie;
use App\Entity\Users;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class MovieVoter extends Voter
{
    public const EDIT = 'MOVIE_EDIT';
    public const DELETE = 'MOVIE_DELETE';

    protected function supports(string $attribute, $subject): bool
    {
        return in_array($attribute, [self::EDIT, self::DELETE], true) && $subject instanceof Movie;
    }

    protected function voteOnAttribute(string $attribute, $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof Users) return false;

        /** @var Movie $movie */
        $movie = $subject;

        return match ($attribute) {
            self::EDIT   => $this->canEdit($movie, $user),
            self::DELETE => $this->canDelete($movie, $user),
            default      => false,
        };
    }

    private function canEdit(Movie $movie, Users $user): bool
    {
        if (in_array('ROLE_ADMIN', $user->getRoles(), true)) return true;

        // lecteur: jamais
        $isEditor = in_array('ROLE_EDITOR', $user->getRoles(), true);
        if (!$isEditor) return false;

        // éditeur: ok sauf si créé par admin et que ce n'est pas lui
        $creator = $movie->getCreatedBy();
        $creatorIsAdmin = $creator && in_array('ROLE_ADMIN', $creator->getRoles(), true);
        $own = $creator && $creator->getId() === $user->getId();
        return !$creatorIsAdmin || $own;
    }

    private function canDelete(Movie $movie, Users $user): bool
    {
        return in_array('ROLE_ADMIN', $user->getRoles(), true);
    }
}
