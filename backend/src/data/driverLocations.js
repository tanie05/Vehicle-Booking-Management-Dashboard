const LOCATIONS = {
  "amandeep.singh@example.com": { lat: 30.7445, lng: 76.7870 },   // Sector 17 Plaza
  "gurpreet.kaur@example.com": { lat: 30.6300, lng: 76.8200 },   // Zirakpur (far)
  "rohit.sharma@example.com": { lat: 30.7287, lng: 76.7708 },   // Sector 22
  "simran.jeet@example.com": { lat: 30.7506, lng: 76.7774 },   // Sector 7
  "vikram.srivastava@example.com": { lat: 30.7195, lng: 76.8008 }, // Sector 27 (FIXED email)
  "jaspreet.singh@example.com": { lat: 30.7000, lng: 76.7500 }, // Sector 38
  "neha.gupta@example.com": { lat: 30.7450, lng: 76.7680 },    // Sector 17
  "mandeep.singh@example.com": { lat: 30.7324, lng: 76.7750 }, // Sector 32
  "ravneet.kaur@example.com": { lat: 30.7047, lng: 76.7213 },  // Mohali Phase 7
  "arjun.mehta@example.com": { lat: 30.7385, lng: 76.7820 },   // Sector 36
};

const getLocation = (email) => LOCATIONS[email] || null;

module.exports = { getLocation, LOCATIONS };
