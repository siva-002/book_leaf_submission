import { Sequelize } from 'sequelize';
import { config } from './config';

export const sequelize = config.db.url
  ? new Sequelize(config.db.url, {
      dialect: 'postgres',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
    })
  : new Sequelize(config.db.database, config.db.username, config.db.password, {
      host: config.db.host,
      port: config.db.port,
      dialect: 'postgres',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
    });

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(
      `[Database] Sequelize successfully connected to PostgreSQL (${config.db.host}:${config.db.port}/${config.db.database}).`
    );
  } catch (error) {
    console.error('[Database] PostgreSQL connection error:', error);
    throw error;
  }
};
