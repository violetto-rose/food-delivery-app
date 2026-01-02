# Food Delivery App

A full-stack food delivery web application built with React and Supabase, featuring user authentication, restaurant browsing, shopping cart management, and order tracking.

## Features

### User Authentication

- Secure email/password registration and login
- User profile management with delivery address
- Dietary preference settings (vegetarian/non-vegetarian)
- Protected routes for authenticated users

### Restaurant Browsing

- Browse restaurants with featured menu items
- Filter restaurants by vegetarian preference, cuisine, delivery time, and price
- View detailed restaurant pages with full menus
- Filter by "Favorites Only" to see your saved top picks
- Responsive image carousels for restaurants and menu items

### Ratings & Reviews

- Rate orders out of 5 stars after delivery
- View average ratings and review counts for restaurants
- Favorite/Unfavorite restaurants for quick access

### Shopping Cart

- Add items to cart with automatic quantity management
- Increment/decrement item quantities
- Single-restaurant cart restriction (prevents multi-restaurant orders)
- Real-time cart total calculation with delivery fees
- Apply promo coupons for discounts
- Persistent cart storage in database

### Order Management

- Complete checkout process with address collection
- Order history with detailed item breakdown
- Order status tracking (pending, preparing, on the way, delivered, cancelled)
- Visual status indicators with color-coded badges

## Tech Stack

### Frontend

- React 18 with Vite
- React Router for navigation

### Backend

- Supabase (PostgreSQL database)
- Supabase Auth for authentication
- Row Level Security (RLS) policies for data protection

## Database Schema

### Tables

- **profiles**: User information and preferences
- **restaurants**: Restaurant details and metadata
- **menu_items**: Menu items with pricing and categorization
- **cart**: Shopping cart with user-specific items
- **orders**: Order records with status tracking
- **order_items**: Individual items within orders
- **favorites**: User's favorited restaurants
- **ratings**: User ratings for completed orders

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account

### Setup Steps

1. Clone the repository

```bash
git clone https://github.com/violetto-rose/food-delivery-app.git
cd food-delivery-app
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

4. Set up Supabase database

Run the SQL files in your Supabase SQL Editor in this order:

- `supabase/tables.sql` - Creates tables and schema
- `supabase/enums.sql` - Creates ENUM types
- `supabase/policies.sql` - Sets up RLS policies
- `supabase/demoData.sql` - Populates demo data (optional)

5. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
food-delivery-app/
├── src/
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Loading.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Restaurant.jsx
│   │   ├── Cart.jsx
│   │   └── Orders.jsx
│   │   └── Profile.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase/
│   ├── tables.sql
│   ├── enums.sql
│   ├── policies.sql
│   └── demoData.sql
└── public/
```
