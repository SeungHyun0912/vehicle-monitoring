import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { VehicleEntity } from '../database/entities/vehicle.entity';
import { AMREntity } from '../database/entities/amr.entity';
import { AGVEntity } from '../database/entities/agv.entity';
import { OHTEntity } from '../database/entities/oht.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [VehicleEntity, AMREntity, AGVEntity, OHTEntity],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
