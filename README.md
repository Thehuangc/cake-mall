# L'Atelier du Gateau - Cake Mall

A premium cake e-commerce system with Vue 3 frontend, Spring Boot backend, and MySQL database.

## Features

### Storefront
- Product catalog with categories, search, and filtering
- Shopping cart with real-time updates
- Checkout with province/city/district cascading address selectors
- Order tracking with status timeline
- User registration and login
- Responsive design with mobile hamburger menu

### Admin Dashboard
- Sales statistics and overview
- Product management (CRUD, image upload)
- Category management
- Order management with status transitions
- User management

### Rider System
- Available order listing
- Order acceptance, pickup, and delivery
- Automatic commission calculation (10% of order amount)
- Delivery statistics

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3, Vite, Pinia, Vue Router, Element Plus, SCSS |
| Backend | Spring Boot 3.2, Java 17, Spring Data JPA, Spring Security |
| Auth | JWT (jjwt), BCrypt password hashing |
| Database | MySQL 8.0 / MariaDB |

## Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+

### 1. Database

```sql
CREATE DATABASE cake_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import `database/init.sql` to initialize tables and sample data.

### 2. Backend (Spring Boot)

```bash
cd backend-spring

# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=cake_mall_user
export DB_PASSWORD=your_password
export DB_NAME=cake_mall
export JWT_SECRET=your-random-secret-at-least-32-chars
export ADMIN_EMAIL=admin@cake-mall.com
export ADMIN_PASSWORD=your_admin_password
export RIDER_EMAIL=rider@cake-mall.com
export RIDER_PASSWORD=your_rider_password

# Build and run
mvn package -DskipTests
java -jar target/cake-mall-1.0.0.jar
```

Backend runs on `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Project Structure

```
cake-mall/
├── frontend/                        # Vue 3 frontend
│   └── src/
│       ├── api/                     # API modules
│       ├── components/              # Shared components
│       ├── composables/             # Vue composables
│       ├── data/                    # Static data (regions)
│       ├── layouts/                 # Layout components
│       │   ├── AdminLayout.vue      # Admin sidebar layout
│       │   ├── MainLayout.vue       # Main site layout
│       │   └── RiderLayout.vue      # Rider sidebar layout
│       ├── router/                  # Route definitions
│       ├── stores/                  # Pinia stores
│       ├── styles/                  # Global SCSS
│       └── views/                   # Page components
│           ├── admin/               # Admin pages
│           ├── auth/                # Login/Register
│           ├── cart/                # Shopping cart
│           ├── home/                # Homepage
│           ├── order/               # Checkout & orders
│           ├── product/             # Product list & detail
│           ├── rider/               # Rider pages
│           └── user/                # User profile
│
├── backend-spring/                  # Spring Boot backend
│   └── src/main/java/com/cakemall/
│       ├── config/                  # Security, JWT, CORS
│       ├── module/                  # Business modules
│       │   ├── admin/               # Admin management
│       │   ├── auth/                # Authentication
│       │   ├── cart/                # Shopping cart
│       │   ├── category/            # Categories
│       │   ├── order/               # Orders
│       │   ├── product/             # Products
│       │   ├── rider/               # Rider delivery
│       │   └── user/                # Users
│       └── seed/                    # Data seeder
│
├── backend/                         # Legacy NestJS backend
├── database/                        # SQL scripts
│   └── init.sql
└── DEPLOY.md                        # Deployment guide
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | User login |
| POST | /auth/register | User registration |
| POST | /auth/admin/login | Admin login |
| GET | /auth/profile | Get current user |

### Products & Categories
| Method | Path | Description |
|--------|------|-------------|
| GET | /products | List products (paginated) |
| GET | /products/hot | Hot products |
| GET | /products/new | New products |
| GET | /products/:id | Product detail |
| GET | /categories | List categories |

### Cart & Orders
| Method | Path | Description |
|--------|------|-------------|
| GET | /cart | Get cart items |
| POST | /cart | Add to cart |
| PUT | /cart/:id | Update quantity |
| DELETE | /cart/:id | Remove item |
| POST | /orders | Create order |
| GET | /orders | List orders |
| GET | /orders/:id | Order detail |
| PUT | /orders/:id/cancel | Cancel order |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/dashboard/stats | Dashboard stats |
| CRUD | /admin/products | Product management |
| CRUD | /admin/categories | Category management |
| CRUD | /admin/users | User management |
| GET/PUT | /admin/orders | Order management |
| POST | /admin/upload/image | Image upload |

### Rider
| Method | Path | Description |
|--------|------|-------------|
| GET | /rider/available | Available orders |
| GET | /rider/my-orders | My orders |
| POST | /rider/orders/:id/accept | Accept order |
| POST | /rider/orders/:id/pickup | Pickup order |
| POST | /rider/orders/:id/deliver | Deliver order |
| GET | /rider/stats | Rider statistics |

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| DB_HOST | MySQL host |
| DB_PORT | MySQL port |
| DB_USER | MySQL username |
| DB_PASSWORD | MySQL password |
| DB_NAME | Database name |
| JWT_SECRET | JWT signing secret (min 32 chars) |
| ADMIN_EMAIL | Admin account email |
| ADMIN_PASSWORD | Admin account password |
| RIDER_EMAIL | Rider account email |
| RIDER_PASSWORD | Rider account password |

## Deployment

See [DEPLOY.md](DEPLOY.md) for BaoTa panel deployment guide on Tencent Cloud.

## License

MIT
