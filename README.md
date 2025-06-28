## 📖 Authentique

**Framework-Agnostic User Authentication Package – Semantq Native**

---

## 🚀 MCSR Auth Stack

A lightweight, framework-agnostic authentication system supporting:

* ✅ Multiple databases (MySQL, SQLite, Supabase, MongoDB)
* ✅ Social auth (GitHub, Google, Facebook, Twitter)
* ✅ Email auth flows (Resend/Mailgun/SMTP)

---

## 📦 Installation & Setup

### 1️⃣ Install Package

```bash
npm install authentique
```

---

### 2️⃣ Initialize Configuration

Run interactive setup:

```bash
npm run setup
```

You’ll be prompted for:

* Database type (MySQL/Supabase/SQLite/MongoDB)
* Email provider (Resend/Mailgun/SMTP)
* Whether to include a built-in auth UI

Example:

```bash
? Choose your database: MySQL
? Select email provider: Resend
? Include built-in auth UI? Yes

✅ Configuration complete!
```

---

### 3️⃣ Configure Environment

Ensure your `.env` file contains required variables:

```ini
# Database (MySQL example)
DB_ADAPTER=mysql
DB_MYSQL_HOST=localhost
DB_MYSQL_PORT=3306
DB_MYSQL_USER=root
DB_MYSQL_PASSWORD=yourpassword
DB_MYSQL_NAME=auth_db

# Authentication
JWT_SECRET=your_secure_secret_here
JWT_ACCESS_EXPIRY=15m

# Email (Resend example)
EMAIL_DRIVER=resend
RESEND_API_KEY=re_123456789
EMAIL_FROM=noreply@yourdomain.com
```

---

### 4️⃣ Verify Installation

Confirm generated config files:

```bash
ls config/
# Should show:
# authentique.config.js
# databases.js
# env-loader.js
```

## 📦 Database Migrations

Authentique uses a simple migration system to manage your database schema over time. Migrations are organized by adapter in:

```
src/adapters/databases/<adapter>/migrations/
```

For example for MySQL:

```
src/adapters/databases/mysql/migrations/
```

Each migration file must export an `up(pool)` function to apply changes, and optionally a `down(pool)` function to rollback.

---

### 📜 Running Migrations

To run all pending migrations:

```bash
npx authentique-migrate
```

This will:

* Check for a `migrations` table (and create it if missing)
* Find all `.js` migration files in the adapter’s `migrations/` directory
* Skip any migrations already logged in the `migrations` table
* Run pending migrations sequentially
* Log each applied migration into the `migrations` table

---

### 🔙 Rolling Back Migrations

To rollback the **latest migration**:

```bash
npx authentique-migrate rollback
```

To rollback a specific number of recent migrations:

```bash
npx authentique-migrate rollback <number>
```

**Examples:**

* Rollback the last 1 migration:

  ```bash
  npx authentique-migrate rollback
  ```

* Rollback the last 3 migrations:

  ```bash
  npx authentique-migrate rollback 3
  ```

* Rollback all applied migrations:

  ```bash
  npx authentique-migrate rollback 999
  ```

**Note:** Only migrations with a `down(pool)` function can be rolled back. Migrations without one will be skipped with a warning.

---

### 📄 Example Migration File for MySQL

```javascript
// src/adapters/databases/mysql/migrations/0001-create-users.js

export async function up(pool) {
  await pool.query(`
    CREATE TABLE users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL
    )
  `);
}

export async function down(pool) {
  await pool.query(`DROP TABLE IF EXISTS users`);
}
```

---

### ✅ Migration Logging

* Applied migrations are tracked in a `migrations` table:

  ```sql
  SELECT * FROM migrations;
  ```
* Each entry records the migration filename and when it was run.

---

## 📦 Database Migration Commands

| Command                                     | Description                                                         | Example                                |
| :------------------------------------------ | :------------------------------------------------------------------ | :------------------------------------- |
| `npx authentique-migrate`                   | Runs all pending migrations not yet recorded in the migrations log. | `npx authentique-migrate`              |
| `npx authentique-migrate rollback`          | Rolls back the latest applied migration.                            | `npx authentique-migrate rollback`     |
| `npx authentique-migrate rollback <number>` | Rolls back the specified number of latest applied migrations.       | `npx authentique-migrate rollback 2`   |
| `npx authentique-migrate rollback 999`      | Rolls back **all** applied migrations (safe upper limit).           | `npx authentique-migrate rollback 999` |

---

## 📂 Migrations Directory Structure

Migrations are stored per adapter:

```
src/adapters/databases/<adapter>/migrations/
```






## ✅ Next Steps

* Access dashboard via `http://localhost:3000`
* Test API endpoints
* Customize auth flows in `config/auth.js`
* Create your own migrations in
  `src/adapters/databases/mysql/migrations/`


