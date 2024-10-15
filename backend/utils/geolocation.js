const axios = require('axios');

// Calculate distance between two locations using DistanceMatrix.ai API
async function getDistance(pickupLocation, dropoffLocation) {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    // Format the origin and destination for the request
    const origin = `${pickupLocation[1]},${pickupLocation[0]}`;
    const destination = `${dropoffLocation[1]},${dropoffLocation[0]}`;

    console.log("Origin:", origin, "Destination:", destination);
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${origin}&origins=${destination}&units=imperial&key=${apiKey}`;

    // const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`;
    console.log("API URL:", url);

    try {
        const response = await axios.get(url);
        console.log("API Response:", JSON.stringify(response.data, null, 2));

        // Check if the response status is OK and elements exist
        if (response.data.status === "OK" && response.data.rows[0].elements[0].status === "OK") {
            const distanceInMeters = response.data.rows[0].elements[0].distance.value;
            const durationInSeconds = response.data.rows[0].elements[0].duration.value;
            
            console.log("Distance in meters:", distanceInMeters, "Duration in seconds:", durationInSeconds);

            // Return the calculated distance and duration
            return { 
                distanceInKilometers: distanceInMeters / 1000, 
                durationInMinutes: durationInSeconds / 60 
            };
        } else {
            console.log("Unexpected response from  API:", response.data);
            throw new Error("Invalid response from API");
        }
    } catch (error) {
        console.error("Error fetching distance:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        throw new Error("Failed to fetch distance and duration.");
    }
}

// Surge pricing logic (unchanged)
async function getSurgeMultiplier() {
    const currentHour = new Date().getHours();
    if (currentHour >= 7 && currentHour < 10) {
        return 1.5; // Morning rush hour
    } else if (currentHour >= 16 && currentHour < 19) {
        return 1.3; // Evening rush hour
    } else {
        return 1.0; // Normal pricing
    }
}

module.exports = { getDistance, getSurgeMultiplier };