
const express = require('express');
const {seedData} = require('../db')



const router = express.Router();



// ---------------------------------------------------------
// 4. Vehicles
// ---------------------------------------------------------

// GET /vehicles (Collection)
router.get('/', (req, res) => {
    res.status(200).json(seedData.vehicles);
});

// GET /vehicles/:vehicleId
router.get('/:vehicleId', (req, res) => {
    const id = Number(req.params.vehicleId);

    const vehicle = seedData.vehicles.find(v => v.id === id);

    if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
    }

    const vehiclePings = seedData.pings.filter(p => p.vehicle_id === id);
    const lastPing = vehiclePings.length > 0
        ? vehiclePings[vehiclePings.length - 1]
        : null;

    res.status(200).json({
        ...vehicle,
        last_ping: lastPing
    });
});

// GET /vehicles/:vehicle-id/pings (Scoped collection)
router.get('/:vehicleId/pings', (req, res) => {
    const id = req.params.vehicleId;
    
    // First, verify the vehicle exists (to return 404 if it doesn't)
    const vehicle = seedData.vehicles.find(v => v.id == id);
    if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
    }

    // Filter pings that belong strictly to this vehicle
    const vehiclePings = seedData.pings.filter(ping => ping.vehicle_id == id);
    res.status(200).json(vehiclePings);
});

// POST /vehicles/:vehicleId/pings (Create a new ping for a vehicle)
router.post('/:vehicleId/pings', (req, res) => {
    const id = Number(req.params.vehicleId);
    const apiKey = req.get('X-API-Key');

    if (!apiKey) {
        return res.status(401).json({ error: 'Missing X-API-Key header' });
    }

    if (apiKey !== 'key_v01') {
        return res.status(403).json({ error: 'Invalid API key' });
    }

    const vehicle = seedData.vehicles.find(v => v.id === id);
    if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
    }

    const { latitude, longitude, speed } = req.body;
    if (latitude === undefined || longitude === undefined || speed === undefined) {
        return res.status(400).json({ error: 'latitude, longitude, and speed are required' });
    }

    const nextPingId = seedData.pings.reduce((max, ping) => Math.max(max, ping.id), 0) + 1;
    const newPing = {
        id: nextPingId,
        vehicle_id: id,
        latitude,
        longitude,
        speed,
        timestamp: new Date().toISOString()
    };

    seedData.pings.push(newPing);
    res.status(201)
        .location(`/v1/api/vehicles/${id}/pings/${nextPingId}`)
        .json(newPing);
});

// GET /vehicles/:vehicle-id/last-position 
router.get('/:vehicleId/last-position', (req, res) => {
    const id = req.params.vehicleId;
    
    // First, verify the vehicle exists (to return 404 if it doesn't)
    const vehicle = seedData.vehicles.find(v => v.id == id);
    if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
    }

    // Filter pings that belong strictly to this vehicle
    const vehiclePings = seedData.pings.filter(ping => ping.vehicle_id == id);
    res.status(200).json(vehiclePings);
});


module.exports = router