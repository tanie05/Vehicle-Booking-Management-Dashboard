# API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Create a new user (role defaults to `customer`) |
| POST | `/api/auth/login` | Public | Login, returns JWT token |
| POST | `/api/auth/drivers` | Admin | Create a driver user |
| POST | `/api/auth/managers` | Admin | Create a manager user |
| POST | `/api/vehicles` | Admin | Create a vehicle |
| GET | `/api/vehicles` | Admin | List all vehicles |
| GET | `/api/drivers` | Admin, Manager | List drivers (manager sees only their city) |
| POST | `/api/bookings` | Customer | Create a booking |
| GET | `/api/bookings` | All roles | List bookings — admin sees all, manager sees their city, driver sees assigned, customer sees own |
| PATCH | `/api/bookings/:id/assign` | Admin, Manager | Assign a driver to a pending booking |
| PATCH | `/api/bookings/:id/unassign` | Admin, Manager | Unassign driver from an assigned booking |
| PATCH | `/api/bookings/:id/complete` | Admin, Manager, Driver | Mark an assigned booking as completed |
| PATCH | `/api/bookings/:id/cancel` | Admin, Manager, Driver, Customer | Cancel a booking |

### Query filters for `GET /api/bookings`

| Param | Type | Example |
|-------|------|---------|
| `status` | string | `?status=pending` |
| `city` | string | `?city=Delhi` |
| `today` | boolean | `?today=true` |
| `yesterday` | boolean | `?yesterday=true` |
| `bookingDate` | date | `?bookingDate=2026-06-29` |
