import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, Clock, CreditCard, Car, Calendar, DollarSign } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

const Dashboard = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [nearbyLots, setNearbyLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalSpent: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, lotsRes] = await Promise.all([
        axios.get('/api/booking/my-bookings'),
        axios.get('/api/parking/lots')
      ])

      const userBookings = bookingsRes.data
      setBookings(userBookings.slice(0, 5)) // Show latest 5 bookings
      setNearbyLots(lotsRes.data.slice(0, 4)) // Show 4 nearby lots

      // Calculate stats
      const totalSpent = userBookings
        .filter(booking => booking.paymentStatus === 'paid')
        .reduce((sum, booking) => sum + booking.totalAmount, 0)

      setStats({
        totalBookings: userBookings.length,
        activeBookings: userBookings.filter(b => b.status === 'active').length,
        totalSpent
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge-warning',
      active: 'badge-success',
      completed: 'badge-primary',
      cancelled: 'badge-error'
    }
    return statusClasses[status] || 'badge-primary'
  }

  const getPaymentStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge-warning',
      paid: 'badge-success',
      failed: 'badge-error'
    }
    return statusClasses[status] || 'badge-warning'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your parking bookings and discover nearby parking lots.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-lg">
                <Car className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
              <Link
                to="/bookings"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bookings yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start by finding a parking lot nearby
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {booking.parkingLot?.name}
                      </h3>
                      <div className="flex space-x-2">
                        <span className={`badge ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                        <span className={`badge ${getPaymentStatusBadge(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{booking.parkingLot?.address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {format(new Date(booking.startTime), 'MMM dd, HH:mm')} - 
                          {format(new Date(booking.endTime), 'HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-900 font-medium">
                        <CreditCard className="h-4 w-4 mr-1" />
                        <span>${booking.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nearby Parking Lots */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Nearby Parking</h2>
              <Link
                to="/map"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View Map
              </Link>
            </div>

            <div className="space-y-4">
              {nearbyLots.map((lot) => (
                <div key={lot._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{lot.name}</h3>
                    <span className="text-lg font-bold text-primary-600">
                      ${lot.currentPrice}/hr
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{lot.address}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600">
                        Available: <span className="font-medium text-success-600">
                          {lot.availableSpots}/{lot.totalSpots}
                        </span>
                      </span>
                      <span className="text-gray-600">
                        Occupancy: <span className="font-medium">
                          {lot.occupancyRate}%
                        </span>
                      </span>
                    </div>
                    
                    <Link
                      to={`/booking/${lot._id}`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/map"
              className="card hover:shadow-lg transition-shadow text-center"
            >
              <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Find Parking</h3>
              <p className="text-sm text-gray-600">Locate nearby parking lots</p>
            </Link>
            
            <Link
              to="/bookings"
              className="card hover:shadow-lg transition-shadow text-center"
            >
              <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">My Bookings</h3>
              <p className="text-sm text-gray-600">View all your reservations</p>
            </Link>
            
            <Link
              to="/payments"
              className="card hover:shadow-lg transition-shadow text-center"
            >
              <CreditCard className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Payment History</h3>
              <p className="text-sm text-gray-600">View transaction history</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard