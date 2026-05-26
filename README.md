# Carlos Hilado Memorial State University (CHMSU) - Alumni Online Directory

A modern, secure, and user-friendly web portal for CHMSU to register, search, track, and manage alumni records. The system utilizes a multi-campus tenant architecture where administrators can oversee all records and staff, while campus-scoped staff can only access and manage records pertaining to their specific campus.

---

## Technology Stack

The application is built on top of the following modern technologies:
- **Backend Framework**: [Laravel 12](file:///home/rovie/CHMSU-Alumni-Online-Directory/composer.json)
- **Frontend Adapter**: [Inertia.js v2 (React)](file:///home/rovie/CHMSU-Alumni-Online-Directory/package.json)
- **Frontend Framework**: [React 19](file:///home/rovie/CHMSU-Alumni-Online-Directory/package.json)
- **Styling**: [Tailwind CSS v4](file:///home/rovie/CHMSU-Alumni-Online-Directory/package.json)
- **Build Tool**: [Vite](file:///home/rovie/CHMSU-Alumni-Online-Directory/vite.config.js)
- **Database**: MySQL 8.x

---


## Local Development Setup

Follow these steps to set up the application in a local development environment.

### Prerequisites

Ensure you have the following installed on your machine:
- PHP >= 8.2
- Composer
- Node.js >= 18 & npm
- MySQL >= 8.0

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/rovie21703/CHMSU-Alumni-Online-Directory.git
   cd CHMSU-Alumni-Online-Directory
   ```

2. **Set up Environment Variables**:
   Copy the example environment file and configure your local settings:
   ```bash
   cp .env.example .env
   ```
   Open the [`.env`](file:///home/rovie/CHMSU-Alumni-Online-Directory/.env) file and configure your database settings:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=chmsu-aod
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   ```

3. **Install Dependencies**:
   ```bash
   # Install PHP dependencies
   composer install

   # Install Node dependencies
   npm install
   ```

4. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

5. **Run Migrations & Seed Database**:
   This runs all database migrations and seeds reference data along with the default administrator account:
   ```bash
   php artisan migrate --seed
   ```

6. **Start the Development Server**:
   The project is configured with a custom script using `concurrently` to launch the Laravel web server, queue listener, and Vite hot-reloading server in a single terminal command:
   ```bash
   composer run dev
   ```
   Once started, you can access the application at `http://localhost:8000`.

---

## Default Credentials

After database seeding, you can log in to the admin panel using the following credentials:

- **Login URL**: `http://localhost:8000/login`
- **Email**: `admin@chmsu.edu.ph`
- **Password**: `Admin.chmsu2026`

*(Remember to change the administrator password immediately after logging in for the first time)*

---

## Testing & Code Quality

### Running Tests
The project uses **Pest** for automated unit and feature testing:
```bash
php artisan test
```

### Formatting Code
Run **Laravel Pint** to format all PHP files matching project conventions:
```bash
vendor/bin/pint --dirty --format agent
```

Format JS/TSX files using **Prettier**:
```bash
npm run format
```

### Production Build Dry-Run
To verify that all assets compile without TypeScript or bundle errors:
```bash
npm run build
```

---

## Production Deployment Guide

When deploying to a production server (such as VPS, Laravel Cloud, or AWS), make sure to complete this checklist for performance and security.

### 1. Hardening Environment Configuration
Update your [`.env`](file:///home/rovie/CHMSU-Alumni-Online-Directory/.env) file with production-ready settings:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://alumni.chmsu.edu.ph

# Force secure cookies (requires HTTPS)
SESSION_SECURE_COOKIE=true

# Keep session encryption enabled
SESSION_ENCRYPT=true
```

### 2. Optimizing Performance
Cache Laravel configurations, routes, and views so they don't have to be recompiled on every request:
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache Blade/Inertia views
php artisan view:cache
```

### 3. Compiling Frontend Assets
Build production-optimized JavaScript, CSS, and asset bundles:
```bash
npm run build
```

### 4. Background Queue Worker
To ensure background tasks (like exporting records or sending notifications) process smoothly, run a queue worker. In production, use a process manager like **Supervisor** to keep the queue running continuously:
```bash
php artisan queue:work --tries=3 --timeout=90
```

### 5. Web Server Configuration
Ensure your Nginx or Apache server is configured to:
- Direct all traffic to the `public/index.php` entrypoint.
- Force redirect HTTP traffic to HTTPS.
- Set secure permission levels on directories (`storage` and `bootstrap/cache` must be writable by the web server user, e.g. `www-data`).
