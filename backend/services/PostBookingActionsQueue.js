const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');

async function logAllDrivers() {
    try {
      const drivers = await Driver.find(); // Fetch all drivers from the DB
      console.log(`Total drivers found: ${drivers.length}`);
      drivers.forEach(driver => {
        console.log(`Driver ID: ${driver._id}, Name: ${driver.name}, Vehicle Type: ${driver.vehicleType}, Available: ${driver.isAvailable}`);
      });
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }
  
  // Call the function to log drivers

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

const driverQueue = new Queue('driver-assignments', { 
  connection: redisConnection
});

const worker = new Worker('driver-assignments', async (job) => {
  const { bookingId, pickupLocation, vehicleType } = job.data;

  try {
    console.log(`Processing job ${job.id} for booking ${bookingId}`);
    console.log(`Pickup location: ${JSON.stringify(pickupLocation)}, Vehicle type: ${vehicleType}`);

    if (!Array.isArray(pickupLocation) || pickupLocation.length !== 2) {
      throw new Error('Invalid pickup location format');
    }

    console.log("pickkk", pickupLocation)
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

  logAllDrivers();

    console.log(`Found ${drivers.length} available drivers`);

    if (drivers.length === 0) {
      await Booking.findByIdAndUpdate(bookingId, { status: 'no_driver_available', runValidators: false });
      throw new Error('No available drivers found');
    }

    const assignedDriver = drivers[0];

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        driverId: assignedDriver._id,
        status: 'pending'
      },
      { new: true }
    );

    if (!updatedBooking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // assignedDriver.isAvailable = false;
    await assignedDriver.save({validateBeforeSave: false});

    console.log(`Driver ${assignedDriver._id} assigned to booking ${bookingId}`);

    return { success: true, booking: updatedBooking };
  } catch (error) {
    console.error('Error in driver assignment job:', error);
    throw error;
  }
}, { 
  connection: redisConnection,
  concurrency: 5
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
  console.error(err.stack);
});

async function queueDriverAssignment(bookingId, pickupLocation, vehicleType) {
  try {
    const job = await driverQueue.add('assign-driver', {
      bookingId,
      pickupLocation,
      vehicleType
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        // delay: 1000
      }
    });

    console.log(`Driver assignment job ${job.id} added to queue for booking ${bookingId}`);
    return job.id;
  } catch (error) {
    console.error('Error adding job to queue:', error);
    throw error;
  }
}

module.exports = {
  queueDriverAssignment,
  redisConnection,
  driverQueue
};
