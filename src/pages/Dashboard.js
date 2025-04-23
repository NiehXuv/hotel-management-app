// Dashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useHotelData } from "../contexts/HotelDataContext";
import BossManagerDashboard from "../components/role-specific/BossManager";
import SalesDashboard from "../components/role-specific/Sales";
import ReceptionistDashboard from "../components/role-specific/Receptionist";

const Dashboard = () => {
  const { currentUser, getDashboardAccess } = useAuth();
  const { hotels, financialData, loading, error } = useHotelData();

  const userRole = currentUser?.role || "";
  const dashboardAccess = getDashboardAccess();

  const [statistics, setStatistics] = useState({
    totalProperties: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    activeProperties: 0,
    pendingTasks: 0,
    criticalTasks: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    topProperty: { name: "N/A", revenue: 0 },
    checkinsToday: 0,
    checkoutsToday: 0,
    recentBookings: [],
  });

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const url = new URL("http://localhost:5000/booking/list");
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch booking data: ${response.status} ${response.statusText}`
          );
        }
        const json = await response.json();

        if (!json.bookings) {
          throw new Error("Invalid response structure: bookings field missing");
        }

        const bookings = Object.values(json.bookings);
        setStatistics((prev) => ({
          ...prev,
          recentBookings: bookings,
          checkinsToday: json.checkinsToday || 0,
          checkoutsToday: json.checkoutsToday || 0,
        }));
      } catch (error) {
        console.error("Error fetching booking data:", error.message);
        setStatistics((prev) => ({
          ...prev,
          error: `Failed to load booking data: ${error.message}. Please try again later.`,
        }));
      }
    };

    fetchBookingData();
  }, []);

  useEffect(() => {
    if (hotels && financialData) {
      const totalRooms = hotels.reduce(
        (sum, hotel) => sum + hotel.roomStatistics.totalRooms,
        0
      );
      const occupiedRooms = hotels.reduce(
        (sum, hotel) => sum + hotel.roomStatistics.occupiedRooms,
        0
      );
      const occupancyRate = (totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0).toFixed(2);

      setStatistics((prev) => ({
        ...prev,
        totalProperties: hotels.length,
        totalRooms,
        occupiedRooms,
        occupancyRate,
        activeProperties: hotels.length,
        monthlyRevenue: financialData.totalRevenue || 0,
        topProperty: financialData.topProperty || { name: "N/A", revenue: 0 },
        error: null,
      }));
    }
  }, [hotels, financialData]);

  const renderRoleSpecificDashboard = () => {
    switch (userRole) {
      case "boss":
      case "manager":
        return <BossManagerDashboard statistics={statistics} />;
      case "sales":
        return <SalesDashboard statistics={statistics} />;
      case "receptionist":
        return <ReceptionistDashboard statistics={statistics} />;
      default:
        return <BossManagerDashboard statistics={statistics} />;
    }
  };

  const getContainerStyles = () => {
    const windowWidth = window.innerWidth;
    const isLargeScreen = windowWidth > 480;

    return {
      width: "100vw",
      maxWidth: isLargeScreen ? "480px" : "100%",
      margin: isLargeScreen ? "0 auto" : "0",
      paddingBottom: "70px",
      boxSizing: "border-box",
      minHeight: "100vh",
    };
  };

  return (
    <div className="page-container" style={getContainerStyles()}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-bold">Welcome, {currentUser?.name}!</h1>
            <p className="text-neutral-600">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {renderRoleSpecificDashboard()}
        </>
      )}
    </div>
  );
};

export default Dashboard;