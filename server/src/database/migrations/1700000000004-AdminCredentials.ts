import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminCredentials1700000000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE admin_credentials (
      user_id CHAR(36) NOT NULL PRIMARY KEY,
      password_hash VARCHAR(255) NOT NULL,
      updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      CONSTRAINT fk_admin_credentials_user FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE admin_credentials');
  }
}
