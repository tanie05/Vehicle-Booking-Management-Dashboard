const LOCATIONS = {
  "amandeep.singh@example.com": { lat: 30.7415, lng: 76.7853 },
  "gurpreet.kaur@example.com": { lat: 30.7072, lng: 76.7648 },
  "rohit.sharma@example.com": { lat: 30.7287, lng: 76.7708 },
  "simran.jeet@example.com": { lat: 30.7506, lng: 76.7774 },
  "vikram.verma@example.com": { lat: 30.7195, lng: 76.8008 },
  "jaspreet.singh@example.com": { lat: 30.6929, lng: 76.7603 },
  "neha.gupta@example.com": { lat: 30.7449, lng: 76.7715 },
  "mandeep.singh@example.com": { lat: 30.7324, lng: 76.7750 },
  "ravneet.kaur@example.com": { lat: 30.7047, lng: 76.7213 },
  "arjun.mehta@example.com": { lat: 30.7385, lng: 76.7820 },
};

const getLocation = (email) => LOCATIONS[email] || null;

module.exports = { getLocation, LOCATIONS };
