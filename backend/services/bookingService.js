const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const { getDistance, getSurgeMultiplier } = require('../utils/geolocation');
const mongoose = require('mongoose');
const { queueDriverAssignment } = require('./PostBookingActionsQueue');



// Booking a vehicle for transporting goods
async function bookVehicle(userId, pickupLocation, dropoffLocation, vehicleType) {
    try {
        // Step 1: Calculate the distance and time using the DistanceMatrix.ai API
        const { distanceInKilometers, durationInMinutes } = await getDistance(pickupLocation, dropoffLocation);
        
        // Step 2: Calculate surge multiplier (if any)
        const surgeMultiplier = await getSurgeMultiplier();
        
        // Step 3: Calculate the estimated cost based on distance, time, and surge pricing
        const cost = calculateBookingCost(distanceInKilometers, durationInMinutes, vehicleType, surgeMultiplier);
        
        // Step 4: Create a new booking and save it to the database
        const booking = new Booking({
            userId,
            pickupLocation,
            dropoffLocation,
            vehicleType,
            estimatedCost: cost,
            distance: distanceInKilometers,
            duration: durationInMinutes,
            status: 'pending', // Initial status of the booking
        });
        
        const savedBooking = await booking.save();
        
        // Queue the driver assignment job
        await queueDriverAssignment(savedBooking._id, pickupLocation, vehicleType);
        
        return savedBooking;
    } catch (error) {
        console.error("Error while booking vehicle:", error);
        throw new Error("Failed to book vehicle");
    }
}

// Calculate the booking cost based on distance, duration, vehicle type, and surge pricing
function calculateBookingCost(distanceInKilometers, durationInMinutes, vehicleType, surgeMultiplier) {
    const basePrice = 5; // Base price
    let pricePerKm, pricePerMin;

    // Pricing based on vehicle type
    switch (vehicleType) {
        case 'truck':
            pricePerKm = 3;
            pricePerMin = 0.7;
            break;
        case 'van':
            pricePerKm = 2.5;
            pricePerMin = 0.6;
            break;
        default:
            pricePerKm = 2;
            pricePerMin = 0.5;
            break;
    }

    // Final cost calculation with surge pricing
    const cost = (basePrice + (pricePerKm * distanceInKilometers) + (pricePerMin * durationInMinutes)) * surgeMultiplier;
    return cost.toFixed(2); // Return formatted price
}

//  a driver to the booking based on proximity to the pickup location
async function assignDriver(pickupLocation, vehicleType) {
    try {
        if (!Array.isArray(pickupLocation) || pickupLocation.length !== 2) {
            throw new Error('Invalid pickup location format');
        }

        const [longitude, latitude] = pickupLocation;

        const drivers = await Driver.find({
            isAvailable: true,
            vehicleType: vehicleType,
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 50000 // 50 km radius
                }
            }
        }).limit(1);

        console.log(`Found ${drivers.length} available drivers`);

        if (drivers.length === 0) {
            return null; // No drivers available
        }

        const assignedDriver = drivers[0];
        return assignedDriver;
    } catch (error) {
        console.error("Error while assigning driver:", error);
        throw new Error("Failed to assign driver");
    }
}


// Update driver location
async function updateDriverLocation(driverId, newLocation) {
    try {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');

        driver.location = newLocation;
        await driver.save();
    } catch (error) {
        console.error("Error updating driver location:", error);
        throw new Error('Failed to update driver location');
    }
}

// Update job status (e.g., en route to pickup, goods collected, delivered)
async function updateJobStatus(bookingId, status) {
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error('Booking not found');

        booking.status = status;
        await booking.save();
    } catch (error) {
        console.error("Error updating job status:", error);
        throw new Error('Failed to update job status');
    }
}

module.exports = {
    bookVehicle,
    calculateBookingCost,
    assignDriver,
    updateDriverLocation,
    updateJobStatus
};
