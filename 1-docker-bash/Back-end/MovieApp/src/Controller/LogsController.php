<?php
// Back-End/MovieApp/src/Controller/LogsController.php

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

/**
 * Contrôleur admin des logs.
 * Hypothèses de schéma:
 *   - Table user_activity_logs alias l
 *     colonnes: id, user_id, action, entitytype, entity_id, message, created_at
 *   - Table users alias u
 *     colonnes: id, email, (display_name optionnelle)
 */
#[Route('/api/admin/logs')]
#[IsGranted('ROLE_ADMIN')]
class LogsController extends AbstractController
{
    #[Route('', name: 'admin_logs_index', methods: ['GET'])]
    public function index(Request $request, Connection $conn): JsonResponse
    {
        $q        = trim((string) $request->query->get('q', ''));
        $page     = max(1, (int) $request->query->get('page', 1));
        $pageSize = min(200, max(1, (int) $request->query->get('pageSize', 20)));
        $offset   = ($page - 1) * $pageSize;

        $wheres = [];
        $params = [];

        if ($q !== '') {
            $wheres[] = '(l.action LIKE :like OR l.entity_type LIKE :like OR l.message LIKE :like OR u.email LIKE :like)';
            $params['like'] = '%'.$q.'%';
        }

        $whereSql = $wheres ? ('WHERE '.implode(' AND ', $wheres)) : '';

        // total
        $sqlCount = "
            SELECT COUNT(*) AS c
            FROM user_activity_logs l
            LEFT JOIN users u ON u.id = l.user_id
            $whereSql
        ";
        $total = (int) $conn->fetchOne($sqlCount, $params);

        // items
        $sqlItems = "
            SELECT
              l.id,
              l.user_id,
              u.email AS user_email,
              l.action,
              l.entity_type,
              l.entity_id,
              l.message,
              l.created_at
            FROM user_activity_logs l
            LEFT JOIN users u ON u.id = l.user_id
            $whereSql
            ORDER BY l.id DESC
            LIMIT :limit OFFSET :offset
        ";

        // DBAL param types pour limit/offset
        $stmt = $conn->prepare($sqlItems);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue('limit', $pageSize, \PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, \PDO::PARAM_INT);
        $items = $stmt->executeQuery()->fetchAllAssociative();

        // réponse paginée
        return $this->json([
            'items'    => array_map(function (array $r) {
                return [
                    'id'          => (int) $r['id'],
                    'user_id'     => $r['user_id'] !== null ? (int) $r['user_id'] : null,
                    'user_email'  => $r['user_email'] ?? null,
                    'action'      => $r['action'] ?? null,
                    'entity_type' => $r['entity_type'] ?? null,
                    'entity_id'   => isset($r['entity_id']) && $r['entity_id'] !== null ? (int) $r['entity_id'] : null,
                    'message'     => $r['message'] ?? null,
                    'created_at'  => $r['created_at'] ?? null,
                ];
            }, $items),
            'total'    => $total,
            'page'     => $page,
            'pageSize' => $pageSize,
        ]);
    }

    #[Route('/suggest', name: 'admin_logs_suggest', methods: ['GET'])]
    public function suggest(Request $request, Connection $conn): JsonResponse
    {
        $q = trim((string) $request->query->get('q', ''));
        if (mb_strlen($q) < 2) {
            return $this->json(['items' => []]);
        }

        $actions = $conn->fetchFirstColumn(
            "SELECT DISTINCT l.action FROM user_activity_logs l WHERE l.action LIKE :q ORDER BY l.action LIMIT 5",
            ['q' => $q.'%']
        );

        $entities = $conn->fetchFirstColumn(
            "SELECT DISTINCT l.entity_type FROM user_activity_logs l WHERE l.entity_type LIKE :q ORDER BY l.entity_type LIMIT 5",
            ['q' => $q.'%']
        );

        $emails = $conn->fetchFirstColumn(
            "SELECT DISTINCT u.email FROM user_activity_logs l
             JOIN users u ON u.id = l.user_id
             WHERE u.email LIKE :q
             ORDER BY u.email
             LIMIT 5",
            ['q' => $q.'%']
        );

        // Extraction cheap de tokens du message (optionnelle)
        $messageTokens = $conn->fetchFirstColumn(
            "SELECT DISTINCT token FROM (
               SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(l.message, ' ', n.n), ' ', -1)) AS token
               FROM user_activity_logs l
               JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
                             UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) n
                 ON n.n <= 10
               WHERE l.message IS NOT NULL AND l.message <> '' AND l.message LIKE :like
            ) t
            WHERE token <> '' AND token LIKE :q
            LIMIT 10",
            ['like' => '%'.$q.'%', 'q' => $q.'%']
        );

        $all = array_values(array_unique(array_filter([
            ...($actions ?: []),
            ...($entities ?: []),
            ...($emails ?: []),
            ...($messageTokens ?: []),
        ], fn($s) => is_string($s) && $s !== '')));

        return $this->json(['items' => array_slice($all, 0, 10)]);
    }
}
