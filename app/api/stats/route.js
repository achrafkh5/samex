import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/app/lib/adminAuth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET /api/stats
 * Fetch dashboard statistics (authenticated admins only)
 */
export async function GET(request) {
  try {
    // Check authentication
    const authAdmin = await getAuthAdmin(request);
    
    if (!authAdmin) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('dreamcars');

    // Fetch all statistics in parallel
    const [
      carsStats,
      clientsCount,
      ordersStats,
      documentsStats,
      categoriesCount,
      recentActivities,
      topSellingCars
    ] = await Promise.all([
      // Cars statistics
      db.collection('cars').aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            available: [
              { $match: { availability: 'available' } },
              { $count: 'count' }
            ],
            sold: [
              { $match: { availability: 'sold' } },
              { $count: 'count' }
            ]
          }
        }
      ]).toArray(),

      // Total clients
      db.collection('clients').countDocuments(),

      // Orders statistics
      db.collection('orders').aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            pending: [
              { $match: { status: 'pending' } },
              { $count: 'count' }
            ],
            completed: [
              { $match: { status: 'delivered' } },
              { $count: 'count' }
            ],
            totalRevenue: [
              { $match: { status: 'delivered' } },
              { $group: { _id: null, total: { $sum: { $toDouble: '$paymentAmount' } } } }
            ]
          }
        }
      ]).toArray(),

      // Documents statistics (tracking)
      db.collection('documents').aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            recent: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 }
            ]
          }
        }
      ]).toArray(),

      // Categories count
      db.collection('brands').countDocuments(),

      // Recent activities - orders and documents
      db.collection('orders').aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $addFields: {
            clientIdObj: { $toObjectId: '$clientId' },
            carIdObj: { $toObjectId: '$selectedCarId' }
          }
        },
        {
          $lookup: {
            from: 'clients',
            localField: 'clientIdObj',
            foreignField: '_id',
            as: 'client'
          }
        },
        {
          $lookup: {
            from: 'cars',
            localField: 'carIdObj',
            foreignField: '_id',
            as: 'car'
          }
        },
        { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } }
      ]).toArray(),

      // Top selling cars
      db.collection('orders').aggregate([
        { $match: { status: 'delivered', selectedCarId: { $exists: true, $ne: null } } },
        {
          $addFields: {
            carIdObj: { $toObjectId: '$selectedCarId' }
          }
        },
        {
          $group: {
            _id: '$carIdObj',
            sales: { $sum: 1 },
            revenue: { $sum: { $toDouble: '$paymentAmount' } }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'cars',
            localField: '_id',
            foreignField: '_id',
            as: 'car'
          }
        },
        { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } }
      ]).toArray()
    ]);

    // Process cars statistics
    const totalCars = carsStats[0].total[0]?.count || 0;
    const availableCars = carsStats[0].available[0]?.count || 0;
    const soldCars = carsStats[0].sold[0]?.count || 0;

    // Process orders statistics
    const totalOrders = ordersStats[0].total[0]?.count || 0;
    const pendingOrders = ordersStats[0].pending[0]?.count || 0;
    const completedOrders = ordersStats[0].completed[0]?.count || 0;
    const totalRevenue = ordersStats[0].totalRevenue[0]?.total || 0;

    // Process documents
    const totalDocuments = documentsStats[0].total[0]?.count || 0;

    // Format recent activities
    const formattedActivities = recentActivities.slice(0, 5).map(order => {
      const timeAgo = getTimeAgo(order.createdAt);
      const clientName = order.client?.fullName || 'Unknown Client';
      const carName = order.car ? `${order.car.brand} ${order.car.model}` : 'Unknown Car';
      
      let message, icon, type;
      
      if (order.status === 'delivered') {
        message = `Car sold: ${carName} to ${clientName}`;
        icon = '🚗';
        type = 'sale';
      } else if (order.status === 'pending') {
        message = `New order: ${carName} by ${clientName}`;
        icon = '📋';
        type = 'order';
      } else {
        message = `Order update: ${carName} - ${order.status}`;
        icon = '🔄';
        type = 'update';
      }

      return {
        id: order._id.toString(),
        type,
        message,
        time: timeAgo,
        icon
      };
    });

    // Format top selling cars
    const formattedTopCars = topSellingCars.map(item => ({
      id: item._id?.toString() || 'unknown',
      name: item.car ? `${item.car.brand} ${item.car.model}` : 'Unknown Car',
      sales: item.sales,
      revenue: item.revenue
    }));

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyRevenueResult = await db.collection('orders').aggregate([
      {
        $match: {
          status: 'delivered',
          $expr: { $gte: [ { $toDate: "$createdAt" }, thirtyDaysAgo ] } 
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$paymentAmount' } }
        }
      }
    ]).toArray();

    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    // Return statistics
    return NextResponse.json({
      stats: {
        totalCars,
        availableCars,
        soldCars,
        totalUsers: clientsCount,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        monthlyRevenue,
        categories: categoriesCount,
        activeTracking: totalDocuments
      },
      recentActivities: formattedActivities,
      topSellingCars: formattedTopCars
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
