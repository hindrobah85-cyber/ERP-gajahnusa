import { Request, Response } from 'express';

export class TrackingController {
  static async trackShipment(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;

      if (!trackingNumber) {
        return res.status(400).json({
          success: false,
          message: 'Tracking number is required'
        });
      }

      // Mock tracking data
      const trackingInfo = {
        trackingNumber,
        status: 'in_transit',
        currentLocation: 'Bandung Distribution Center',
        estimatedDelivery: '2024-01-15T16:00:00Z',
        timeline: [
          {
            timestamp: '2024-01-10T08:00:00Z',
            location: 'Jakarta Warehouse',
            status: 'picked_up',
            description: 'Package picked up from sender'
          },
          {
            timestamp: '2024-01-10T12:30:00Z',
            location: 'Jakarta Sorting Facility',
            status: 'in_facility',
            description: 'Package arrived at sorting facility'
          },
          {
            timestamp: '2024-01-10T18:45:00Z',
            location: 'Jakarta Sorting Facility',
            status: 'departed',
            description: 'Package departed from facility'
          },
          {
            timestamp: '2024-01-11T14:20:00Z',
            location: 'Bandung Distribution Center',
            status: 'in_transit',
            description: 'Package in transit'
          }
        ],
        shipmentDetails: {
          sender: {
            name: 'PT Gajah Nusa ERP',
            address: 'Jakarta, Indonesia'
          },
          recipient: {
            name: 'Customer ABC',
            address: 'Bandung, Indonesia'
          },
          weight: '2.5 kg',
          dimensions: '30x20x15 cm',
          serviceType: 'Regular'
        }
      };

      res.json({
        success: true,
        data: trackingInfo
      });
    } catch (error) {
      console.error('Track shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getTrackingHistory(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;

      // Mock detailed tracking history
      const history = [
        {
          timestamp: '2024-01-10T08:00:00Z',
          location: 'Jakarta Warehouse',
          status: 'picked_up',
          description: 'Package picked up from sender',
          employee: 'Courier J001',
          scanType: 'pickup'
        },
        {
          timestamp: '2024-01-10T12:30:00Z',
          location: 'Jakarta Sorting Facility',
          status: 'in_facility',
          description: 'Package arrived at sorting facility',
          employee: 'Sorter S001',
          scanType: 'arrival'
        },
        {
          timestamp: '2024-01-10T16:15:00Z',
          location: 'Jakarta Sorting Facility',
          status: 'sorted',
          description: 'Package sorted for destination',
          employee: 'Sorter S002',
          scanType: 'processing'
        },
        {
          timestamp: '2024-01-10T18:45:00Z',
          location: 'Jakarta Sorting Facility',
          status: 'departed',
          description: 'Package loaded onto transport vehicle',
          employee: 'Loader L001',
          scanType: 'departure'
        },
        {
          timestamp: '2024-01-11T14:20:00Z',
          location: 'Bandung Distribution Center',
          status: 'in_transit',
          description: 'Package arrived at destination facility',
          employee: 'Receiver R001',
          scanType: 'arrival'
        }
      ];

      res.json({
        success: true,
        data: {
          trackingNumber,
          totalEvents: history.length,
          history
        }
      });
    } catch (error) {
      console.error('Get tracking history error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async bulkTrackShipments(req: Request, res: Response) {
    try {
      const { trackingNumbers } = req.body;

      if (!trackingNumbers || !Array.isArray(trackingNumbers)) {
        return res.status(400).json({
          success: false,
          message: 'Tracking numbers array is required'
        });
      }

      // Mock bulk tracking data
      const trackingResults = trackingNumbers.map((trackingNumber: string, index: number) => ({
        trackingNumber,
        status: index % 3 === 0 ? 'delivered' : index % 2 === 0 ? 'in_transit' : 'picked_up',
        currentLocation: index % 2 === 0 ? 'Bandung' : 'Jakarta',
        lastUpdate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }));

      res.json({
        success: true,
        data: trackingResults,
        total: trackingResults.length
      });
    } catch (error) {
      console.error('Bulk track shipments error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async updateTrackingInfo(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      const { location, status, description, employeeId } = req.body;

      if (!location || !status) {
        return res.status(400).json({
          success: false,
          message: 'Location and status are required'
        });
      }

      const newTrackingEvent = {
        timestamp: new Date().toISOString(),
        location,
        status,
        description: description || `Package ${status} at ${location}`,
        employeeId: employeeId || 'AUTO_SCAN',
        scanType: 'manual_update'
      };

      // In real app, save to database and send notifications
      console.log('Added tracking event:', newTrackingEvent);

      res.json({
        success: true,
        data: newTrackingEvent,
        message: 'Tracking information updated successfully'
      });
    } catch (error) {
      console.error('Update tracking error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getDeliveryProof(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;

      // Mock delivery proof data
      const deliveryProof = {
        trackingNumber,
        deliveredAt: '2024-01-12T14:30:00Z',
        recipient: {
          name: 'Customer ABC',
          signature: 'data:image/base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          relationToCustomer: 'Self'
        },
        deliveryLocation: {
          address: 'Jl. Braga No. 123, Bandung',
          coordinates: {
            latitude: -6.917464,
            longitude: 107.619123
          }
        },
        courier: {
          name: 'Budi Santoso',
          id: 'C001',
          phone: '+62812345678'
        },
        photos: [
          {
            type: 'package_delivered',
            url: 'https://example.com/delivery-photo-1.jpg',
            timestamp: '2024-01-12T14:30:00Z'
          }
        ]
      };

      res.json({
        success: true,
        data: deliveryProof
      });
    } catch (error) {
      console.error('Get delivery proof error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// Export individual functions for route usage
export const trackShipment = TrackingController.trackShipment;
export const getTrackingHistory = TrackingController.getTrackingHistory;
export const bulkTrackShipments = TrackingController.bulkTrackShipments;
export const updateTrackingInfo = TrackingController.updateTrackingInfo;
export const getDeliveryProof = TrackingController.getDeliveryProof;