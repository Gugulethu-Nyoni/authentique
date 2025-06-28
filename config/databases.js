// config/databases.js

const mysqlConfig = {
  host: process.env.DB_MYSQL_HOST,
  port: process.env.DB_MYSQL_PORT,
  user: process.env.DB_MYSQL_USER,
  password: process.env.DB_MYSQL_PASSWORD,
  database: process.env.DB_MYSQL_NAME,
  poolLimit: process.env.DB_MYSQL_POOL_LIMIT,
};

export default {
  mysql: mysqlConfig,
};
