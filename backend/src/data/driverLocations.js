const LOCATIONS = {
  "amandeep.singh@example.com": { lat: 30.7445, lng: 76.7870 },   // Sector 17 Plaza
  "neha.gupta@example.com": { lat: 30.7450, lng: 76.7680 },       // Sector 17
  "arjun.mehta@example.com": { lat: 30.7420, lng: 76.7850 },      // Sector 17 Market
  "simran.jeet@example.com": { lat: 30.7580, lng: 76.7800 },      // Sector 14 (PU)
  "ravneet.kaur@example.com": { lat: 30.7560, lng: 76.7820 },     // Sector 14
  "gurpreet.kaur@example.com": { lat: 30.7100, lng: 76.7700 },    // Sector 25
  "jaspreet.singh@example.com": { lat: 30.7080, lng: 76.7720 },   // Sector 25
  "mandeep.singh@example.com": { lat: 30.7120, lng: 76.7680 },    // Sector 25 (offline)
  "rohit.sharma@example.com": { lat: 30.7287, lng: 76.7708 },     // Sector 22
  "vikram.srivastava@example.com": { lat: 30.7260, lng: 76.7740 }, // Sector 22 (busy)
};

const getLocation = (email) => LOCATIONS[email] || null;

module.exports = { getLocation, LOCATIONS };
