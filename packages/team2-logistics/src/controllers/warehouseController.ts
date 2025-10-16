import { Request, Response } from 'express';

export class WarehouseController {
  static async getWarehouses(req: Request, res: Response) {
    try {
      // Mock data - replace with real database query
      const warehouses = [
        {
          id: 'WH001',
          name: 'Warehouse Central Jakarta',
          location: 'Jakarta Pusat',
          capacity: 10000,
          currentStock: 7500,
          manager: 'John Doe'
        },
        {
          id: 'WH002', 
          name: 'Warehouse Surabaya',
          location: 'Surabaya',
          capacity: 8000,
          currentStock: 6200,
          manager: 'Jane Smith'
        }
      ];

      res.json({
        success: true,
        data: warehouses,
        total: warehouses.length
      });
    } catch (error) {
      console.error('Get warehouses error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async createWarehouse(req: Request, res: Response) {
    try {
      const { name, location, capacity, manager } = req.body;

      // Validate required fields
      if (!name || !location || !capacity) {
        return res.status(400).json({
          success: false,
          message: 'Name, location, and capacity are required'
        });
      }

      // Generate new warehouse ID
      const newWarehouse = {
        id: `WH${Date.now().toString().slice(-3).padStart(3, '0')}`,
        name,
        location,
        capacity: parseInt(capacity),
        currentStock: 0,
        manager: manager || 'Unassigned',
        createdAt: new Date().toISOString()
      };

      // In real app, save to database
      console.log('Created warehouse:', newWarehouse);

      res.status(201).json({
        success: true,
        data: newWarehouse,
        message: 'Warehouse created successfully'
      });
    } catch (error) {
      console.error('Create warehouse error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getWarehouseById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Mock warehouse data
      const warehouse = {
        id,
        name: `Warehouse ${id}`,
        location: 'Jakarta',
        capacity: 10000,
        currentStock: 7500,
        manager: 'John Doe',
        sections: [
          { id: 'A1', name: 'Section A1', capacity: 2500, occupied: 2000 },
          { id: 'B1', name: 'Section B1', capacity: 2500, occupied: 1800 },
          { id: 'C1', name: 'Section C1', capacity: 2500, occupied: 1900 }
        ]
      };

      res.json({
        success: true,
        data: warehouse
      });
    } catch (error) {
      console.error('Get warehouse error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async updateWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // In real app, update in database
      const updatedWarehouse = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      console.log('Updated warehouse:', updatedWarehouse);

      res.json({
        success: true,
        data: updatedWarehouse,
        message: 'Warehouse updated successfully'
      });
    } catch (error) {
      console.error('Update warehouse error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async deleteWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // In real app, delete from database
      console.log('Deleted warehouse:', id);

      res.json({
        success: true,
        message: 'Warehouse deleted successfully'
      });
    } catch (error) {
      console.error('Delete warehouse error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getWarehouseInventory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock inventory data
      const inventory = [
        {
          productId: 'P001',
          name: 'Product A',
          sku: 'SKU001',
          quantity: 150,
          location: 'A1-01',
          lastUpdated: '2024-01-10T14:30:00Z'
        },
        {
          productId: 'P002',
          name: 'Product B',
          sku: 'SKU002',
          quantity: 89,
          location: 'B2-15',
          lastUpdated: '2024-01-10T16:45:00Z'
        }
      ];

      res.json({
        success: true,
        data: {
          warehouseId: id,
          totalItems: inventory.length,
          inventory
        }
      });
    } catch (error) {
      console.error('Get warehouse inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async optimizeWarehouseLayout(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Mock optimization result
      const optimization = {
        warehouseId: id,
        currentEfficiency: 78.5,
        optimizedEfficiency: 91.2,
        improvements: [
          'Move fast-moving items closer to shipping area',
          'Reorganize sections A and B for better flow',
          'Add automated picking system to Zone C'
        ],
        estimatedSavings: 156000
      };

      res.json({
        success: true,
        data: optimization,
        message: 'Layout optimization completed'
      });
    } catch (error) {
      console.error('Optimize warehouse layout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// Export individual functions for route usage
export const getWarehouses = WarehouseController.getWarehouses;
export const getWarehouse = WarehouseController.getWarehouseById;
export const createWarehouse = WarehouseController.createWarehouse;
export const updateWarehouse = WarehouseController.updateWarehouse;
export const deleteWarehouse = WarehouseController.deleteWarehouse;
export const getWarehouseInventory = WarehouseController.getWarehouseInventory;
export const optimizeWarehouseLayout = WarehouseController.optimizeWarehouseLayout;