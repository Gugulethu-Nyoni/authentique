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
npx authentique-init
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

---

## 📚 Database Migrations

### 📂 Migration Files Location

Migrations are stored in:

```
src/adapters/databases/mysql/migrations/
```

Each file follows this naming convention:

```
0001-initial-schema.js
0002-add-columns.js
```

---

### 📑 Migration File Structure

Each migration exports two async functions:

* `up(pool)` → applies changes
* `down(pool)` → reverts them

---

### 📖 Sample Migration File

📄 **0001-initial-schema.js**

```javascript
export const up = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL
    );
  `);
};

export const down = async (pool) => {
  await pool.query(`DROP TABLE IF EXISTS users`);
};
```

---

### 📢 Running Migrations

Run migrations via:

```bash
npx authentique-migrate
```

Authentique will:

* Load environment variables
* Connect using the selected database adapter
* Run all `up()` migration files sequentially

---

## 🖥️ Start Development Servers

```bash
npm run setup
```

Launches:

* API server: `http://localhost:3001`
* Auth UI: `http://localhost:3000`

---

## 🛠️ Troubleshooting

**Permissions issue?**

```bash
npm run prepare
```

**Migration errors?**

```bash
npx authentique-migrate rollback
npx authentique-migrate
```

---

## ✅ Next Steps

* Access dashboard via `http://localhost:3000`
* Test API endpoints
* Customize auth flows in `config/auth.js`
* Create your own migrations in
  `src/adapters/databases/mysql/migrations/`


