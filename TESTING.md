# Testing Guide

## Sample Credentials

Use the following creds for tesing
### Admin
```
Email: admin@example.com
Password: Test@123
Role: admin
```

### Manager (Bengaluru)
```
Email: manager.bengaluru@example.com
Password: Test@123
Role: manager
City: Bengaluru
```


## Sample Booking Payloads

### Bengaluru bookings

```json
{
  "customerName": "Priya Sharma",
  "customerPhone": "9876543210",
  "pickupAddress": "Indiranagar",
  "dropAddress": "Whitefield",
  "city": "Bengaluru",
  "journeyStart": "2026-07-01T10:00:00.000Z",
  "journeyEnd": "2026-07-01T11:00:00.000Z"
}
```
