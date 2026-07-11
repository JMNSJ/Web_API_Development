const fs = require('fs');
const path = require('path');

const provinces = [
  [1, 'Western'], [2, 'Central'], [3, 'Southern'], [4, 'Northern'],
  [5, 'Eastern'], [6, 'North Western'], [7, 'North Central'],
  [8, 'Uva'], [9, 'Sabaragamuwa']
].map(([id, name]) => ({ id, name }));

const districts = [
  [1, 'Colombo', 1], [2, 'Gampaha', 1], [3, 'Kalutara', 1],
  [4, 'Kandy', 2], [5, 'Matale', 2], [6, 'Nuwara Eliya', 2],
  [7, 'Galle', 3], [8, 'Matara', 3], [9, 'Hambantota', 3],
  [10, 'Jaffna', 4], [11, 'Kilinochchi', 4], [12, 'Mannar', 4],
  [13, 'Mullaitivu', 4], [14, 'Vavuniya', 4],
  [15, 'Trincomalee', 5], [16, 'Batticaloa', 5], [17, 'Ampara', 5],
  [18, 'Kurunegala', 6], [19, 'Puttalam', 6],
  [20, 'Anuradhapura', 7], [21, 'Polonnaruwa', 7],
  [22, 'Badulla', 8], [23, 'Monaragala', 8],
  [24, 'Ratnapura', 9], [25, 'Kegalle', 9]
].map(([id, name, province_id]) => ({ id, name, province_id }));

const stationRows = [
  [1, 'Colombo Central Police Station', 1, 6.9271, 79.8612],
  [2, 'Borella Police Station', 1, 6.9147, 79.8770],
  [3, 'Dehiwala Police Station', 1, 6.8516, 79.8654],
  [4, 'Negombo Police Station', 2, 7.2083, 79.8358],
  [5, 'Gampaha Police Station', 2, 7.0873, 80.0144],
  [6, 'Kalutara Police Station', 3, 6.5854, 79.9607],
  [7, 'Panadura Police Station', 3, 6.7132, 79.9026],
  [8, 'Kandy Police Station', 4, 7.2906, 80.6337],
  [9, 'Peradeniya Police Station', 4, 7.2638, 80.5960],
  [10, 'Matale Police Station', 5, 7.4675, 80.6234],
  [11, 'Nuwara Eliya Police Station', 6, 6.9497, 80.7891],
  [12, 'Galle Police Station', 7, 6.0329, 80.2168],
  [13, 'Hikkaduwa Police Station', 7, 6.1395, 80.1041],
  [14, 'Matara Police Station', 8, 5.9549, 80.5550],
  [15, 'Hambantota Police Station', 9, 6.1241, 81.1185],
  [16, 'Jaffna Police Station', 10, 9.6615, 80.0255],
  [17, 'Kilinochchi Police Station', 11, 9.3803, 80.3770],
  [18, 'Mannar Police Station', 12, 8.9810, 79.9044],
  [19, 'Mullaitivu Police Station', 13, 9.2671, 80.8142],
  [20, 'Vavuniya Police Station', 14, 8.7514, 80.4971],
  [21, 'Trincomalee Police Station', 15, 8.5874, 81.2152],
  [22, 'Batticaloa Police Station', 16, 7.7170, 81.7000],
  [23, 'Ampara Police Station', 17, 7.2971, 81.6820],
  [24, 'Kurunegala Police Station', 18, 7.4863, 80.3647],
  [25, 'Puttalam Police Station', 19, 8.0362, 79.8283],
  [26, 'Anuradhapura Police Station', 20, 8.3114, 80.4037],
  [27, 'Polonnaruwa Police Station', 21, 7.9403, 81.0188],
  [28, 'Badulla Police Station', 22, 6.9895, 81.0550],
  [29, 'Monaragala Police Station', 23, 6.8728, 81.3507],
  [30, 'Ratnapura Police Station', 24, 6.6828, 80.3992],
  [31, 'Kegalle Police Station', 25, 7.2513, 80.3464],
  [32, 'Maharagama Police Station', 1, 6.8480, 79.9265]
];
const stationLocations = new Map(stationRows.map(([id, name, district_id, latitude, longitude]) => [
  id, { latitude, longitude }
]));
const stations = stationRows.map(([id, name, district_id]) => ({ id, name, district_id }));

const busyStationIds = [1, 2, 3, 4, 5, 8, 9, 12, 13, 32];
const vehicleStationIds = Array.from({ length: 220 }, (_, index) =>
  index < 120 ? busyStationIds[index % busyStationIds.length] : ((index - 120) % 22) + 10
);
const vehicles = vehicleStationIds.map((station_id, index) => ({
  id: index + 1,
  registration_number: `WP TT ${String(1001 + index).padStart(4, '0')}`,
  device_id: `SLPTTM-${String(index + 1).padStart(4, '0')}`,
  station_id
}));

const pings = [];
for (const vehicle of vehicles) {
  const station = stationLocations.get(vehicle.station_id);
  for (let hour = 0; hour < 168; hour += 1) {
    const angle = (hour / 24) * Math.PI * 2 + vehicle.id * 0.37;
    const radius = 0.006 + ((vehicle.id * 13 + hour * 7) % 20) / 10000;
    pings.push({
      id: pings.length + 1,
      vehicle_id: vehicle.id,
      latitute: Number((station.latitude + Math.sin(angle) * radius).toFixed(6)),
      longitude: Number((station.longitude + Math.cos(angle) * radius).toFixed(6)),
      timestamp: new Date(Date.UTC(2026, 5, 14, hour)).toISOString()
    });
  }
}

const seedData = { provinces, districts, stations, vehicles, pings };
fs.writeFileSync(path.join(__dirname, '..', 'sri-lanka-police-tuktuk-seed.json'), `${JSON.stringify(seedData, null, 2)}\n`);
console.log(`Generated ${pings.length} pings for ${vehicles.length} vehicles.`);
