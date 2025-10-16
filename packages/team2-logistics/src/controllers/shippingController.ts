import { Request, Response } from 'express';

export class ShippingController {
  static async getShipments(req: Request, res: Response) {
    try {
      // Mock shipment data
      const shipments = [
        {
          id: 'SH001',
          orderId: 'ORD001',
          trackingNumber: 'TN123456789',
          status: 'in_transit',
          origin: 'Jakarta',
          destination: 'Surabaya',
          carrier: 'JNE Express',
          estimatedDelivery: '2024-01-15',
          items: [
            { productId: 'P001', quantity: 2, name: 'Product A' },
            { productId: 'P002', quantity: 1, name: 'Product B' }
          ]
        },
        {
          id: 'SH002',
          orderId: 'ORD002', 
          trackingNumber: 'TN987654321',
          status: 'delivered',
          origin: 'Surabaya',
          destination: 'Bandung',
          carrier: 'TIKI',
          estimatedDelivery: '2024-01-12',
          deliveredAt: '2024-01-12T14:30:00Z',
          items: [
            { productId: 'P003', quantity: 5, name: 'Product C' }
          ]
        }
      ];

      const { status, carrier } = req.query;
      let filteredShipments = shipments;

      if (status) {
        filteredShipments = filteredShipments.filter(s => s.status === status);
      }

      if (carrier) {
        filteredShipments = filteredShipments.filter(s => 
          s.carrier.toLowerCase().includes((carrier as string).toLowerCase())
        );
      }

      res.json({
        success: true,
        data: filteredShipments,
        total: filteredShipments.length
      });
    } catch (error) {
      console.error('Get shipments error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async createShipment(req: Request, res: Response) {
    try {
      const { orderId, origin, destination, carrier, items } = req.body;

      // Validate required fields
      if (!orderId || !origin || !destination || !carrier || !items) {
        return res.status(400).json({
          success: false,
          message: 'Order ID, origin, destination, carrier, and items are required'
        });
      }

      // Generate tracking number
      const trackingNumber = `TN${Date.now().toString()}`;
      
      const newShipment = {
        id: `SH${Date.now().toString().slice(-3).padStart(3, '0')}`,
        orderId,
        trackingNumber,
        status: 'preparing',
        origin,
        destination,
        carrier,
        items,
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      // In real app, save to database and integrate with carrier API
      console.log('Created shipment:', newShipment);

      res.status(201).json({
        success: true,
        data: newShipment,
        message: 'Shipment created successfully'
      });
    } catch (error) {
      console.error('Create shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getShipmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Mock detailed shipment data
      const shipment = {
        id,
        orderId: 'ORD001',
        trackingNumber: `TN${id}123`,
        status: 'in_transit',
        origin: 'Jakarta',
        destination: 'Surabaya',
        carrier: 'JNE Express',
        estimatedDelivery: '2024-01-15',
        items: [
          { productId: 'P001', quantity: 2, name: 'Product A', weight: 1.5 },
          { productId: 'P002', quantity: 1, name: 'Product B', weight: 0.8 }
        ],
        timeline: [
          { 
            status: 'created', 
            timestamp: '2024-01-10T08:00:00Z',
            location: 'Jakarta Warehouse',
            description: 'Shipment created'
          },
          {
            status: 'picked_up',
            timestamp: '2024-01-10T14:00:00Z',
            location: 'Jakarta Warehouse',
            description: 'Package picked up by carrier'
          },
          {
            status: 'in_transit',
            timestamp: '2024-01-11T09:00:00Z',
            location: 'Jakarta Distribution Center',
            description: 'In transit to destination'
          }
        ]
      };

      res.json({
        success: true,
        data: shipment
      });
    } catch (error) {
      console.error('Get shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async updateShipmentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, location, description } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      // In real app, update in database
      const updatedShipment = {
        id,
        status,
        updatedAt: new Date().toISOString(),
        lastLocation: location,
        lastUpdate: description
      };

      console.log('Updated shipment status:', updatedShipment);

      res.json({
        success: true,
        data: updatedShipment,
        message: 'Shipment status updated successfully'
      });
    } catch (error) {
      console.error('Update shipment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async cancelShipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // In real app, update status and notify carrier
      console.log(`Cancelled shipment ${id}:`, reason);

      res.json({
        success: true,
        message: 'Shipment cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getShipmentsByOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      
      // Mock shipments for specific order
      const shipments = [
        {
          id: 'SH001',
          orderId,
          trackingNumber: 'TN123456789',
          status: 'in_transit',
          carrier: 'JNE Express',
          createdAt: '2024-01-10T08:00:00Z'
        }
      ];

      res.json({
        success: true,
        data: shipments,
        total: shipments.length
      });
    } catch (error) {
      console.error('Get shipments by order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async generateShippingLabel(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Mock shipping label generation
      const label = {
        shipmentId: id,
        trackingNumber: `TN${id}123`,
        labelUrl: `https://api.example.com/labels/${id}.pdf`,
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`,
        generatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: label,
        message: 'Shipping label generated successfully'
      });
    } catch (error) {
      console.error('Generate shipping label error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// Export individual functions for route usage
export const getShipments = ShippingController.getShipments;
export const createShipment = ShippingController.createShipment;
export const getShipment = ShippingController.getShipmentById;
export const updateShipmentStatus = ShippingController.updateShipmentStatus;
export const cancelShipment = ShippingController.cancelShipment;
export const getShipmentsByOrder = ShippingController.getShipmentsByOrder;
export const generateShippingLabel = ShippingController.generateShippingLabel;