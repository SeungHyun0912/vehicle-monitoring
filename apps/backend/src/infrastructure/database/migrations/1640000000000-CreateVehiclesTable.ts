import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateVehiclesTable1640000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'manufacturer',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'model',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'IDLE'",
          },
          {
            name: 'isEnabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'specification',
            type: 'jsonb',
            isNullable: false,
          },
          // AMR specific fields
          {
            name: 'lidarEnabled',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'cameraEnabled',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'ultrasonicEnabled',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'autonomyLevel',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'mapId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'obstacleAvoidanceConfig',
            type: 'jsonb',
            isNullable: true,
          },
          // AGV specific fields
          {
            name: 'guideType',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'lineFollowingConfig',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'loadType',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'maxLoadWeight',
            type: 'float',
            isNullable: true,
          },
          // OHT specific fields
          {
            name: 'railId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'hoistStatus',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'railPosition',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'railSegments',
            type: 'jsonb',
            isNullable: true,
          },
          // Timestamps
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for better query performance
    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({
        name: 'IDX_VEHICLE_TYPE',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({
        name: 'IDX_VEHICLE_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({
        name: 'IDX_VEHICLE_ENABLED',
        columnNames: ['isEnabled'],
      }),
    );

    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({
        name: 'IDX_VEHICLE_TYPE_ENABLED',
        columnNames: ['type', 'isEnabled'],
      }),
    );

    // Enable UUID extension if not already enabled
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('vehicles', 'IDX_VEHICLE_TYPE_ENABLED');
    await queryRunner.dropIndex('vehicles', 'IDX_VEHICLE_ENABLED');
    await queryRunner.dropIndex('vehicles', 'IDX_VEHICLE_STATUS');
    await queryRunner.dropIndex('vehicles', 'IDX_VEHICLE_TYPE');
    await queryRunner.dropTable('vehicles');
  }
}
