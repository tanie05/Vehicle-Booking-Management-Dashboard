# Vehicle Management

A web app for managing vehicle bookings, driver assignments, and scheduling.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io
- **Frontend:** React, Vite, CSS Modules, Socket.io-client

## Schema

### User

| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique, lowercase |
| `passwordHash` | String | required |
| `phone` | String | optional |
| `role` | String | enum: `admin`, `manager`, `driver`, `customer` |
| `city` | String | required |
| `vehicleNumber` | String | optional (for drivers) |

### Booking

| Field | Type | Notes |
|---|---|---|
| `customerName` | String | required |
| `customerPhone` | String | required |
| `pickupAddress` | String | required |
| `dropAddress` | String | required |
| `city` | String | required |
| `journeyStart` | Date | required |
| `journeyEnd` | Date | required |
| `status` | String | enum: `pending`, `assigned`, `completed`, `cancelled` |
| `driverId` | ObjectId | ref: User |
| `assignedBy` | ObjectId | ref: User |

### Schedule

| Field | Type | Notes |
|---|---|---|
| `driverId` | ObjectId | ref: User, required |
| `bookingId` | ObjectId | ref: Booking, required |
| `from` | Date | required |
| `to` | Date | required |

## API

All endpoints prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | Register a new user |
| POST | `/auth/login` | No | Login |

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/bookings` | No | Create a booking (kept public for simpler testing) |
| GET | `/bookings` | admin, manager, driver | List bookings (supports `?status=`, `?city=`, `?today`, `?yesterday`, `?search=`) |
| GET | `/bookings/cities` | admin, manager | List distinct cities |
| PATCH | `/bookings/:id/assign` | admin, manager | Assign a driver |
| PATCH | `/bookings/:id/unassign` | admin, manager | Unassign a driver |
| PATCH | `/bookings/:id/complete` | admin, manager, driver | Complete a booking |
| PATCH | `/bookings/:id/cancel` | admin, manager, driver, customer | Cancel a booking |

### Drivers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/drivers` | admin, manager | List drivers (supports `?city=`, `?availableOnly=true`) |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/users` | No | Create a user |
| PATCH | `/users/:id/role` | admin | Update user role |

## Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env   # configure MongoDB URI and JWT secret
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```
