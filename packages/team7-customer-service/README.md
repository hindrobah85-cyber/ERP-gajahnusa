# Team 7 - Customer Service CRM

🎫 **Customer Service & Support Management System**

## 📋 Overview

Comprehensive customer service CRM with ticket management, live chat, knowledge base, and analytics.

## 🎯 Key Features

### 1. 🎫 Ticket Management
- Create, assign, and track support tickets
- Priority levels (High, Medium, Low)
- Status workflow (Open → Pending → In Progress → Resolved)
- Full conversation history
- SLA tracking

### 2. 👥 Customer Database
- Complete customer profiles
- Ticket history per customer
- Customer status (Active, VIP, Inactive)
- Contact information management

### 3. 💬 Live Chat
- Real-time customer support chat
- Multiple concurrent conversations
- Message history
- Typing indicators

### 4. 📚 Knowledge Base
- Self-service help articles
- Category organization
- View tracking
- Search functionality

### 5. 📈 Reports & Analytics
- Ticket trends and statistics
- Response time metrics
- Resolution rate tracking
- Customer satisfaction scores

## 🛠️ Tech Stack

### Frontend
- **Framework**: Svelte 4 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: svelte-routing
- **HTTP Client**: Axios
- **Port**: 3007

### Backend
- **Language**: Go 1.21
- **Framework**: Gin
- **ORM**: GORM
- **Database**: SQLite
- **Port**: 8007

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Go 1.21+

### Automated Start (Recommended)

From root directory `Project_ERP`:

```bash
.\packages\team7-customer-service\start-team7.bat
```

### Manual Start

**Terminal 1 - Backend:**
```bash
cd packages/team7-customer-service/backend
go mod download
go run main.go
```

**Terminal 2 - Frontend:**
```bash
cd packages/team7-customer-service
npm install
npm run dev
```

## 📡 API Endpoints

Base URL: `http://localhost:8007`

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer

### Messages
- `GET /api/messages/ticket/:ticketId` - Get ticket messages
- `POST /api/messages` - Create message

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 📊 Database Schema

### Tickets Table
- `id` - Primary key
- `ticket_code` - Unique ticket identifier (TKT-001)
- `customer_id` - Foreign key to customers
- `subject` - Ticket subject
- `description` - Detailed description
- `priority` - High, Medium, Low
- `status` - Open, Pending, In Progress, Resolved
- `assignee` - Assigned agent
- `created_at`, `updated_at` - Timestamps

### Customers Table
- `id` - Primary key
- `name` - Customer name
- `email` - Unique email
- `phone` - Contact number
- `status` - Active, VIP, Inactive
- `since` - Customer since date

### Messages Table
- `id` - Primary key
- `ticket_id` - Foreign key to tickets
- `sender` - Message sender (Customer/Agent)
- `message` - Message content
- `created_at` - Timestamp

## 🎨 UI Pages

1. **Dashboard** - Overview statistics and recent tickets
2. **Tickets** - Full ticket list with filters
3. **Ticket Detail** - Individual ticket with conversation
4. **Customers** - Customer database
5. **Customer Detail** - Individual customer profile
6. **Live Chat** - Real-time chat interface
7. **Knowledge Base** - Help articles library
8. **Reports** - Analytics and metrics

## 👨‍💻 Development

```bash
# Frontend dev
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend dev
go run main.go       # Start server
go build             # Build executable
```

## 📝 Sample Data

After first run, the system includes sample:
- 5 tickets (various priorities and statuses)
- 4 customers (Active and VIP)
- Knowledge base articles
- Chat conversations

## 🔧 Configuration

Frontend port: `vite.config.ts`
```typescript
server: { port: 3007 }
```

Backend port: `main.go`
```go
r.Run(":8007")
```

CORS: Backend configured for `http://localhost:3007`

---

**Built with ❤️ for Gajah Nusa - Team 7**
