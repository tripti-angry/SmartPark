const mqtt = require('mqtt');
const ParkingSpot = require('../models/ParkingSpot');
const logger = require('../utils/logger');

class IoTSimulator {
  constructor(io) {
    this.io = io;
    this.client = null;
    this.sensors = new Map();
    this.simulationInterval = null;
    
    this.initializeMQTT();
    this.startSimulation();
  }

  initializeMQTT() {
    try {
      // Use public MQTT broker for demo (in production, use private broker)
      this.client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883');
      
      this.client.on('connect', () => {
        logger.info('Connected to MQTT broker');
        this.client.subscribe('parking/+/sensor/+');
      });

      this.client.on('message', (topic, message) => {
        this.handleSensorData(topic, message.toString());
      });

      this.client.on('error', (error) => {
        logger.error('MQTT connection error:', error);
      });
    } catch (error) {
      logger.error('MQTT initialization error:', error);
    }
  }

  async handleSensorData(topic, message) {
    try {
      const topicParts = topic.split('/');
      const parkingLotId = topicParts[1];
      const sensorId = topicParts[3];
      
      const data = JSON.parse(message);
      
      // Update parking spot status based on sensor data
      const spot = await ParkingSpot.findOne({ sensorId });
      if (spot) {
        const newStatus = data.occupied ? 'occupied' : 'available';
        
        if (spot.status !== newStatus) {
          spot.status = newStatus;
          spot.lastUpdated = new Date();
          await spot.save();

          // Emit real-time update to connected clients
          this.io.to(`parking-lot-${parkingLotId}`).emit('spot-update', {
            spotId: spot._id,
            status: newStatus,
            timestamp: new Date()
          });

          logger.info(`Spot ${spot.spotNumber} status updated to ${newStatus}`);
        }
      }
    } catch (error) {
      logger.error('Handle sensor data error:', error);
    }
  }

  startSimulation() {
    // Simulate sensor data every 30 seconds
    this.simulationInterval = setInterval(() => {
      this.simulateRandomSensorData();
    }, 30000);

    logger.info('IoT simulation started');
  }

  async simulateRandomSensorData() {
    try {
      const spots = await ParkingSpot.find({ sensorId: { $exists: true } })
        .populate('parkingLot');

      for (const spot of spots) {
        // Random chance of status change (10% probability)
        if (Math.random() < 0.1) {
          const isOccupied = Math.random() < 0.6; // 60% chance of being occupied
          
          const sensorData = {
            sensorId: spot.sensorId,
            occupied: isOccupied,
            timestamp: new Date().toISOString(),
            batteryLevel: Math.floor(Math.random() * 100),
            temperature: Math.floor(Math.random() * 40) + 10
          };

          // Publish to MQTT
          const topic = `parking/${spot.parkingLot._id}/sensor/${spot.sensorId}`;
          this.client.publish(topic, JSON.stringify(sensorData));
        }
      }
    } catch (error) {
      logger.error('Simulate sensor data error:', error);
    }
  }

  // Simulate entry/exit events
  async simulateVehicleEntry(spotId) {
    try {
      const spot = await ParkingSpot.findById(spotId).populate('parkingLot');
      if (spot && spot.sensorId) {
        const sensorData = {
          sensorId: spot.sensorId,
          occupied: true,
          event: 'vehicle_entry',
          timestamp: new Date().toISOString()
        };

        const topic = `parking/${spot.parkingLot._id}/sensor/${spot.sensorId}`;
        this.client.publish(topic, JSON.stringify(sensorData));
      }
    } catch (error) {
      logger.error('Simulate vehicle entry error:', error);
    }
  }

  async simulateVehicleExit(spotId) {
    try {
      const spot = await ParkingSpot.findById(spotId).populate('parkingLot');
      if (spot && spot.sensorId) {
        const sensorData = {
          sensorId: spot.sensorId,
          occupied: false,
          event: 'vehicle_exit',
          timestamp: new Date().toISOString()
        };

        const topic = `parking/${spot.parkingLot._id}/sensor/${spot.sensorId}`;
        this.client.publish(topic, JSON.stringify(sensorData));
      }
    } catch (error) {
      logger.error('Simulate vehicle exit error:', error);
    }
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    if (this.client) {
      this.client.end();
    }
    
    logger.info('IoT simulation stopped');
  }
}

module.exports = IoTSimulator;