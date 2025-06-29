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

## 📖 Authentique UI Configuration

**Authentique UI** is a fully optional, lightweight user interface layer that ships alongside the **Authentique authentication package**. It provides a clean, modular, and extensible frontend to support full authentication workflows out of the box — without requiring a JavaScript framework.

**Note:** All you need to do to set up Authentique UI is to update the variables in the `config.js` file — that’s it.

---

## ⚙️ UI Capabilities

Authentique UI includes:

* **User signup**
  With support for multiple database adapters as configured in your **Authentique backend setup**:

  * MySQL
  * Supabase
  * MongoDB
  * SQLite

* **Email-based account confirmation**
  New users must confirm their email address before login is permitted.

* **Secure email and password login**
  Authentication is JWT-based and secured via **HttpOnly cookies**.
  These tokens are **never accessible from frontend JavaScript** and are confined to backend-managed cookies.

* **Email-based password recovery**
  Users can request a password reset via email, with secure token-based confirmation.

* **Automatic redirection to a prebuilt authentication dashboard template**
  Upon login, users are automatically redirected to a prebuilt authentication dashboard template. This dashboard serves as a flexible foundation that you can easily customize to fit your application's unique requirements. By running database migrations with Authentique backends and extending the Authentique UI, you can quickly build a full-stack CRUD application with minimal effort. The solution is framework-agnostic but optimized for the Semantq JS framework, giving you maximum flexibility and speed in development.

---

## 🔒 Security Model

Authentique UI makes all authentication API calls via **frontend proxy routes**, preventing the frontend from making direct cross-origin requests to the authentication backend.
JWT tokens are stored in **HttpOnly cookies** set by the backend — these cookies are:

* Not accessible via JavaScript
* Automatically included in API requests to authenticated endpoints
* Secure and domain-confined

---

## 📂 Configuring the Backend API Endpoint

All Authentique UI scripts that communicate with the backend load a configuration object from:

```
authentiqueui/auth/js/config.js
```

This defines the environment and base backend API URLs dynamically based on the current host, or allows for manual environment selection.

---

## 📜 `config.js` Structure

```js
/**
 * AppConfig
 * 
 * Application runtime configuration for Authentique UI.
 * 
 * ENV can either be set dynamically based on the window location
 * or manually for testing/dev purposes by assigning a fixed value:
 * 
 * Example:
 *   ENV: 'development'
 *   ENV: 'production'
 * 
 * BASE_URLS can be customized to point to your backend's dev or production
 * environment as needed.
 */
const AppConfig = {
  // Automatically detect the environment, or set manually for testing
  ENV: (typeof window !== 'undefined' && window.location.hostname.includes('localhost'))
    ? 'development'
    : 'production',

  // Define your backend API base URLs for different environments
  BASE_URLS: {
    development: 'http://localhost:3000',
    production: 'https://api.botaniqsa.com'
  },

  /**
   * Dynamically returns the base API URL for the current environment
   */
  get BASE_URL() {
    return this.BASE_URLS[this.ENV] || this.BASE_URLS.development;
  }
};

export default AppConfig;
```

---

## 📦 How Config Is Imported and Used

Each Authentique UI module that requires access to backend API endpoints **imports `AppConfig` from the config file**. So you don't need to do this - it s already taken care of - all you need to do is update the variaables in the config.js file. 

Example:

```js
import AppConfig from './config.js';
```

API paths are then constructed using `AppConfig.BASE_URL` like this:

```js
const PATHS = {
  FORGOT_PASSWORD_API: `${AppConfig.BASE_URL}/api/forgot-password`, // Assuming backend is on 3000
  LOGIN_PAGE: '/login' // Assuming your login page is at /login
};
```

This ensures your frontend modules automatically target the correct API environment without needing to hardcode endpoint URLs.

---

## 📌 Important Notes:

* The **config file must be located at:**
  `authentiqueui/auth/js/config.js`
* No staging environment is included by default.
  The provided environments are:

  * `development` (for localhost testing)
  * `production` (for live deployment)

If necessary, you can extend the `BASE_URLS` object for additional environments as required for your own project.

---

✅ This setup ensures your Authentique UI and backend remain cleanly decoupled, environment-aware, and highly secure.

---

Would you like me to draft a companion section explaining **how to add a new environment config (e.g. QA or test env)**, or detail **the proxy route pattern in the UI server** as well?





## ✅ Next Steps

* Access dashboard via `http://localhost:3000`
* Test API endpoints
* Customize auth flows in `config/auth.js`
* Create your own migrations in
  `src/adapters/databases/mysql/migrations/`


