# Team 5 - E-commerce Platform 🛒This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



## Gajah Nusa Building Materials Online Store## Getting Started



### OverviewFirst, run the development server:

Complete e-commerce platform for online building material sales with shopping cart, checkout, and order tracking.

```bash

### Tech Stacknpm run dev

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS# or

- **State Management**: Zustand (with localStorage persistence)yarn dev

- **Backend**: FastAPI, Python# or

- **Database**: SQLitepnpm dev

- **UI Components**: Heroicons# or

- **Notifications**: React Hot Toastbun dev

```

### Features Implemented

✅ **Homepage**Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- Hero banner with call-to-action

- 8 building material categoriesYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- Featured products grid

- Responsive designThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



✅ **Product Catalog**## Learn More

- Products listing page with search

- Category filters (8 categories)To learn more about Next.js, take a look at the following resources:

- Sort by: name, price (low-high), price (high-low), stock

- Product cards with price, stock status- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- Grid layout responsive- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



✅ **Product Details**You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- Full product information

- Quantity selector## Deploy on Vercel

- Stock availability indicator

- Add to cart / Buy now buttonsThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

- Related products section

- Quality guarantees displayCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


✅ **Shopping Cart**
- View all cart items
- Quantity management (+/-)
- Remove items
- Order summary with tax calculation (PPN 11%)
- Shipping cost
- Persistent cart (localStorage)
- Empty cart state

✅ **Checkout Flow**
- 3-step process: Shipping → Payment → Confirmation
- Shipping information form (name, email, phone, address)
- Payment method selection:
  - 💵 Cash on Delivery
  - 💳 Credit/Debit Card
  - 🏦 Bank Transfer
- Order summary sidebar
- Form validation
- Order confirmation page

✅ **Order Tracking**
- Email-based order lookup
- Order history display
- Status tracking (pending, confirmed, processing, shipped, delivered, cancelled)
- Expandable order details
- Price breakdown
- Order items list
- Shipping address
- Reorder functionality
- Print invoice

✅ **Backend API**
- Product management (16 sample products)
- Customer management
- Order processing
- Stock management
- RESTful endpoints

### Architecture

```
team5-ecommerce/
├── app/
│   ├── layout.tsx              # Root layout with Header, Footer
│   ├── page.tsx                # Homepage
│   ├── products/
│   │   ├── page.tsx           # Products listing
│   │   └── [id]/page.tsx      # Product detail
│   ├── cart/page.tsx          # Shopping cart
│   ├── checkout/page.tsx      # Checkout flow
│   └── orders/page.tsx        # Order tracking
├── components/
│   ├── Header.tsx             # Top navigation, search, cart
│   └── Footer.tsx             # Footer with links
├── store/
│   └── cartStore.ts           # Zustand cart state
├── backend/
│   ├── main.py                # FastAPI application
│   └── requirements.txt       # Python dependencies
└── start-team5.bat            # Startup script
```

### API Endpoints

**Products**
- `GET /api/products` - List all products (with optional category filter)
- `GET /api/products/{id}` - Get product details
- `GET /api/categories` - List categories

**Customers**
- `POST /api/customers/` - Create customer (guest checkout)
- `GET /api/customers/email/{email}` - Get customer by email
- `POST /api/customers/register` - Register customer (with password)
- `POST /api/customers/login` - Customer login

**Orders**
- `POST /api/orders/` - Create order
- `GET /api/orders/customer/{customer_id}` - Get customer orders

### Installation & Setup

1. **Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

2. **Start Services**
```bash
# Easy way: Use startup script
start-team5.bat

# Manual way:
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
npm run dev
```

3. **Access Application**
- Frontend: http://localhost:3005
- Backend API: http://localhost:8005
- API Documentation: http://localhost:8005/docs

### Database Schema

**Products Table**
```sql
- id (PK)
- name
- description
- price
- category (cement, bricks, steel, tiles, paint, tools, electrical, plumbing)
- stock
- unit (sak, pcs, kg, m2, liter, etc)
- created_at
```

**Customers Table**
```sql
- id (PK)
- email (unique)
- password
- name
- phone
- address
- created_at
```

**Orders Table**
```sql
- id (PK)
- order_number
- customer_id (FK)
- subtotal
- tax (11%)
- shipping
- total
- status (pending, confirmed, processing, shipped, delivered, cancelled)
- payment_method (cash, card, transfer)
- shipping_address
- notes
- created_at
- updated_at
```

**Order Items Table**
```sql
- id (PK)
- order_id (FK)
- product_id (FK)
- product_name
- quantity
- price
```

### Sample Products (16 items)

**Cement (3 items)**
- Semen Gajah - Rp 65,000/sak (120 stock)
- Semen Merah Putih - Rp 63,000/sak (150 stock)
- Semen Nusantara - Rp 67,000/sak (100 stock)

**Bricks & Blocks (2 items)**
- Bata Merah Press - Rp 1,200/pcs (5000 stock)
- Batako Abu-abu - Rp 3,500/pcs (3000 stock)

**Steel & Iron (2 items)**
- Besi Beton 12mm - Rp 145,000/batang (200 stock)
- Besi Hollow 4x4 - Rp 85,000/batang (150 stock)

**Tiles (2 items)**
- Keramik Lantai 40x40 - Rp 55,000/m2 (800 stock)
- Keramik Dinding 25x40 - Rp 48,000/m2 (1000 stock)

**Paint (2 items)**
- Cat Tembok Putih - Rp 185,000/5kg (300 stock)
- Cat Kayu & Besi - Rp 95,000/liter (250 stock)

**Tools (2 items)**
- Sekop Beton - Rp 145,000/pcs (80 stock)
- Cangkul Baja - Rp 95,000/pcs (100 stock)

**Electrical (2 items)**
- Kabel NYM 2x2.5 - Rp 18,500/meter (2000 stock)
- Stop Kontak 4 Lubang - Rp 45,000/pcs (500 stock)

**Plumbing (1 item)**
- Pipa PVC 3 inch - Rp 85,000/batang (400 stock)

### User Flow

1. **Browse Products**
   - Homepage → Categories → Products listing
   - Search functionality in header
   - Filter by category, sort by price/name/stock

2. **Add to Cart**
   - Product detail → Select quantity → Add to cart
   - OR Quick add from products listing
   - Cart counter updates in header

3. **Checkout**
   - Cart → Checkout button
   - Fill shipping information
   - Select payment method
   - Review order → Place order
   - Receive order confirmation with order number

4. **Track Order**
   - Orders page → Enter email
   - View order history
   - Expand order to see details
   - Check order status
   - Print invoice / Reorder

### Testing

1. **Add products to cart**
2. **Test cart operations** (add, remove, quantity change)
3. **Complete checkout** with test data
4. **Track order** using email from checkout
5. **Verify order details** in tracking page

### Integration with Other Teams

- **Team 2 (Logistics)**: Order fulfillment, delivery tracking
- **Team 3 (Finance)**: Payment processing, invoice generation
- **Team 6 (Retail POS)**: Stock sync with physical stores
- **Team 7 (Customer Service)**: Order support, customer inquiries
- **Team 8 (Analytics)**: Sales reports, customer behavior

### Next Steps
- Connect with Team 2 for delivery management
- Integrate with Team 3 for payment gateway
- Sync stock with Team 6 retail stores
- Customer review and rating system
- Wishlist functionality
- Email notifications
- Advanced search with filters
- Product recommendations

---

**Status**: ✅ **PRODUCTION READY**
**Port**: 3005 (Frontend), 8005 (Backend)
**Last Updated**: January 2025
