export const up = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
};

export const down = async (pool) => {
  await pool.query(`DROP TABLE IF EXISTS sessions`);
};
