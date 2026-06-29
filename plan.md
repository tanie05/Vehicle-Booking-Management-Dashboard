# Vehicle Booking Management Dashboard - Technical Design & Implementation Specification

## Goal

Build a production-quality full-stack application using:

* Backend: Node.js + Express
* Database: MongoDB + Mongoose
* Frontend: React + TypeScript + Vite
* Authentication: JWT
* Real-time updates: Socket.IO
* Styling: TailwindCSS
* State Management: React Query (TanStack Query)
* Forms: React Hook Form
* Validation: Zod
* Architecture: Controller → Service → Repository pattern

This is not just a CRUD project. The codebase should demonstrate clean architecture, separation of concerns, maintainability, and scalability.

---

# Functional Requirements

There are three roles.

## Admin

* Login
* View bookings across all cities
* Assign booking to driver
* Cancel booking
* View summary metrics
* Filter bookings

---

## Manager

Each manager belongs to exactly one city.

Manager can

* Login
* View bookings only for their city
* Assign booking to available drivers in their city
* Cancel booking
* View metrics only for their city

---

## Driver

Drivers do not have a dashboard in this assignment.

Drivers only exist so bookings can be assigned to them.

---

# Booking Creation

Bookings are NOT created from the frontend.

Bookings are created through Postman using

POST /api/bookings

Whenever a booking is created, all connected dashboards should receive the booking immediately through Socket.IO without refreshing.

---

# High Level Architecture

React Dashboard

↓

Axios API Client

↓

Express Controllers

↓

Services (Business Logic)

↓

Repositories (Database Layer)

↓

MongoDB

Socket.IO runs alongside Express and is used only for realtime events.

---

# Folder Structure

backend/

src/

controllers/

services/

repositories/

models/

routes/

middlewares/

validators/

config/

socket/

utils/

types/

server.ts

app.ts

frontend/

src/

components/

pages/

layouts/

hooks/

api/

types/

context/

utils/

sockets/

---

# Database Design

## User Collection

One User model should support all roles.

Fields

* _id
* name
* email
* passwordHash
* role

  * admin
  * manager
  * driver
* city
* driverStatus

  * available
  * busy
  * offline
* vehicleRef (optional)
* isActive
* createdAt
* updatedAt

Only drivers use driverStatus.

Managers use city.

Admins ignore city restrictions.

---

## Vehicle Collection (Optional)

Fields

* registrationNumber
* model
* type
* assignedDriver

Relationship

Driver → Vehicle (1:1)

Keep this optional but structure code so it can easily be enabled.

---

## Booking Collection

Fields

* customerName

* customerPhone

* pickupLocation

* dropLocation

* city

* bookingTime

* pickupTime

* estimatedDropTime

* actualDropTime

status

enum

pending

assigned

completed

cancelled

driverRef

assignedBy

cancelledBy

cancelledReason

createdAt

updatedAt

history[]

History object

action

performedBy

timestamp

remarks

Every assignment/cancellation/completion should append to history.

---

# Business Rules

Only Pending bookings can be assigned.

Only Assigned bookings can become Completed.

Cancelled bookings cannot be modified.

Manager can only assign drivers from the same city.

Manager can only see bookings belonging to their city.

Admin can see everything.

Driver must be

role = driver

AND

driverStatus = available

before assignment.

Assigning a booking automatically changes

driverStatus

available

↓

busy

Completing booking changes

busy

↓

available

Cancelling booking should not affect completed bookings.

---

# Repository Layer

Repositories should only perform database operations.

BookingRepository

create()

findById()

findBookings(filters)

assignDriver()

cancelBooking()

completeBooking()

UserRepository

findByEmail()

findAvailableDrivers()

findManagers()

updateDriverStatus()

No business logic inside repositories.

---

# Service Layer

Business logic belongs here.

BookingService

createBooking()

assignBooking()

cancelBooking()

completeBooking()

getBookings()

Responsibilities

Validate booking status

Validate driver availability

Validate city permissions

Update booking

Update driver availability

Emit socket events

Maintain booking history

Throw domain-specific errors

---

# Controllers

Controllers should

Validate request

Call service

Return response

Nothing else.

---

# Authentication

JWT Authentication

POST /login

Return

accessToken

user details

Protect every route except login.

Middleware

authenticate()

authorize(roles)

Example

authorize(["admin"])

authorize(["manager"])

authorize(["admin","manager"])

---

# API Endpoints

Authentication

POST /api/auth/signin

POST /api/auth/login

Bookings

POST /api/bookings

GET /api/bookings

GET /api/bookings/

PATCH /api/bookings//assign

PATCH /api/bookings//cancel

PATCH /api/bookings//complete

Drivers

GET /api/drivers

Supports

city

availability

---

# Filtering

GET /bookings

Supports

status

city

today

yesterday

bookingDate

search

managerId

Example

/bookings?city=Bangalore&status=pending

/bookings?today=true

---

# Dashboard

Top summary cards

Total

Pending

Assigned

Completed

Cancelled

Booking table

Customer

Pickup

Drop

City

Status

Assigned Driver

Booking Time

Actions

Actions

Assign

Cancel

Search

Filters

Today

Yesterday

City

Status

Pagination

Sorting

---

# Socket.IO

Events

booking-created

booking-assigned

booking-cancelled

booking-completed

When booking created

Emit booking-created

When booking assigned

Emit booking-assigned

When cancelled

Emit booking-cancelled

When completed

Emit booking-completed

Managers should join rooms based on city.

Admins receive every event.

Example

socket.join(city)

io.to(city).emit(...)

---

# Error Handling

Create custom error classes

NotFoundError

UnauthorizedError

ValidationError

ConflictError

Global Express error middleware.

Return consistent response format.

---

# Response Format

Success

{
success: true,
data: {},
message: ""
}

Failure

{
success: false,
message: "",
errors: []
}

---

# Validation

Use Zod.

Validate

Login

Booking creation

Assignment

Cancellation

Query parameters

No validation logic inside controllers.

---

# Frontend

React + TypeScript

Use

React Query

Axios

React Router

TailwindCSS

Socket.IO Client

Keep components reusable.

Suggested pages

Login

Dashboard

BookingTable

BookingFilters

AssignDriverModal

SummaryCards

Navbar

---

# Nice UX

Loading skeletons

Toast notifications

Optimistic updates

Confirmation dialog before cancellation

Driver dropdown only shows available drivers

Role-based navigation

---

# Seed Script

Create

1 Admin

2 Managers

5 Drivers

20 Sample Bookings

Cities

Bangalore

Gurugram

Delhi

---

# Bonus Features

Booking audit history

Dark mode

CSV export

Driver availability indicator

Live badge for incoming bookings

Debounced search

Pagination

---

# Code Quality

Use TypeScript everywhere.

No business logic inside controllers.

No direct Mongoose calls from controllers.

Follow SOLID principles where practical.

Write readable code over clever code.

Favor composition over inheritance.

Keep functions small.

Name variables meaningfully.

Add comments only where necessary.

The final application should resemble production-quality code rather than a tutorial project.
