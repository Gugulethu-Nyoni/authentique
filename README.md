# Authentique
Framework Agnostic User Authentication Package - Semantq Native

# MCSR Auth Stack

Framework-agnostic authentication solution with:
- Multiple database support (MySQL, SQLite, Supabase, MongoDB)
- Social auth (GitHub, Google, Facebook, Twitter)
- Email flows (Resend integration)

## Installation & Setup

### 1. Install Package
```bash
npm install authentique
```

### 2. Initialize Configuration
Run the interactive setup:
```bash
npx authentique-init
```

You'll be prompted for:
- Database type (MySQL/Supabase/SQLite/MongoDB)
- Email provider (Resend/Mailgun/SMTP/Sendgrid)
- Whether to include built-in auth UI

Example flow:
```bash
? Choose your database: MySQL
? Select email provider: Resend 
? Include built-in auth UI? Yes

✅ Configuration complete!
```

### 3. Configure Environment
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

### 4. Verify Installation
Check created config files:
```bash
ls config/
# Should show:
# authentique.config.js
# databases.js
# auth.js
```

### 5. Run Migrations
Initialize your database:
```bash
npx authentique-migrate
```

### 6. Start Development Server
```bash
npm run setup
```
This simultaneously launches:
- API server on `http://localhost:3001`
- Auth UI on `http://localhost:3000`

## Next Steps
- Access the dashboard at `http://localhost:3000`
- Test API endpoints with your preferred client
- Customize auth flows in `config/auth.js`

---

### Troubleshooting
If you encounter permission issues:
```bash
# Re-run permission setup
npm run prepare
```

For migration problems:
```bash
# Rollback and retry
npx authentique-migrate rollback
npx authentique-migrate
```

