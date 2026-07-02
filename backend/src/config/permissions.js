const permissions = {
  "/api/users/:id/role": {
    PATCH: ["admin"],
  },
  "/api/drivers": {
    GET: ["admin", "manager"],
  },
  "/api/bookings": {
    GET: ["admin", "manager", "driver", "customer"],
  },
  "/api/bookings/cities": {
    GET: ["admin", "manager"],
  },
  "/api/bookings/:id/assign": {
    PATCH: ["admin", "manager"],
  },
  "/api/bookings/:id/unassign": {
    PATCH: ["admin", "manager"],
  },
  "/api/bookings/:id/complete": {
    PATCH: ["admin", "manager", "driver"],
  },
  "/api/bookings/:id/cancel": {
    PATCH: ["admin", "manager", "driver", "customer"],
  },
  "/api/bookings/:id/accept": {
    PATCH: ["driver"],
  },
  "/api/bookings/:id/reject": {
    PATCH: ["driver"],
  },
  "/api/bookings/:id/status": {
    PATCH: ["driver"],
  },
};

const patternCache = {};

const pathToRegex = (pattern) => {
  if (patternCache[pattern]) return patternCache[pattern];
  const regexStr = pattern.replace(/:[\w]+/g, "([^/]+)");
  const regex = new RegExp(`^${regexStr}$`);
  patternCache[pattern] = regex;
  return regex;
};

const matchRoute = (method, path) => {
  for (const [pattern, methods] of Object.entries(permissions)) {
    const allowedRoles = methods[method];
    if (!allowedRoles) continue;
    if (pathToRegex(pattern).test(path)) {
      return allowedRoles;
    }
  }
  return null;
};

module.exports = { permissions, matchRoute, pathToRegex };
