<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250805112622 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE movie DROP FOREIGN KEY FK_1D5EF26F896DBBDE');
        $this->addSql('ALTER TABLE movie DROP FOREIGN KEY FK_1D5EF26FB03A8386');
        $this->addSql('DROP INDEX IDX_1D5EF26FB03A8386 ON movie');
        $this->addSql('DROP INDEX IDX_1D5EF26F896DBBDE ON movie');
        $this->addSql('ALTER TABLE movie DROP created_by_id, DROP updated_by_id, CHANGE start_date start_date DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE movie ADD created_by_id INT DEFAULT NULL, ADD updated_by_id INT DEFAULT NULL, CHANGE start_date start_date DATETIME NOT NULL');
        $this->addSql('ALTER TABLE movie ADD CONSTRAINT FK_1D5EF26F896DBBDE FOREIGN KEY (updated_by_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE movie ADD CONSTRAINT FK_1D5EF26FB03A8386 FOREIGN KEY (created_by_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_1D5EF26FB03A8386 ON movie (created_by_id)');
        $this->addSql('CREATE INDEX IDX_1D5EF26F896DBBDE ON movie (updated_by_id)');
    }
}
