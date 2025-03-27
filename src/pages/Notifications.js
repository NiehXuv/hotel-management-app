import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

/**
 * Notification Page Component
 *
 * Displays a list of notifications for all hotels, including issues and activities.
 *
 * @module Pages/Notification
 */
const Notifications = () => {
  // Define styles object to match the screenshot
  const styles = {
    pageContainer: {
      padding: "1em",
      width: "100vw",
      maxWidth: "480px",
      marginBottom: "5em", // Space for bottom navigation bar
      backgroundColor: "#fff",
      minHeight: "100vh",
      boxSizing: "border-box",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "48px 0",
    },
    loadingText: {
      color: "#666",
    },
    errorContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "48px 0",
    },
    errorText: {
      color: "#dc2626",
      marginBottom: "16px",
    },
    headerContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    headerTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#000",
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
      color: "#666",
    },
    userAvatar: {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      backgroundColor: "#42A5F5",
      marginLeft: "8px",
    },
    notificationCard: {
      borderRadius: "1em",
      padding: "12px",
      marginBottom: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    issueNotification: {
      backgroundColor: "rgba(240, 75, 10, 0.32)", // Light orange for issues
    },
    activityNotification: {
      backgroundColor: "rgba(21, 228, 149, 0.27)", // Light green for activities
    },
    notificationMessage: {
      fontSize: "14px",
      margin: "0 0 4px 0",
      color: "#000",
    },
    notificationFooter: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      fontSize: "12px",
      color: "#666",
    },
    notificationUser: {
      fontWeight: "500",
    },
    notificationTime: {},
    bottomNav: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: "10px 0",
      boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.1)",
      maxWidth: "480px",
      margin: "0 auto",
    },
    navIcon: {
      fontSize: "24px",
      color: "#666",
      cursor: "pointer",
    },
    navIconActive: {
      color: "#42A5F5",
    },
    navLabel: {
      fontSize: "12px",
      color: "#666",
    },
    navLabelActive: {
      color: "#42A5F5",
    },
  };

  const navigate = useNavigate();
  const { hasPermission, user } = useAuth(); // Assuming useAuth provides user info

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications for all hotels when the component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/notifications`);
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to load notifications");
        }

        setNotifications(result.data);
      } catch (err) {
        setError("Failed to load notifications");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Format date for display (e.g., "Mar 27, 09:28 AM")
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Render loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: "center" }}>
          <p style={styles.loadingText}>Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={{ textAlign: "center" }}>
          <p style={styles.errorText}>{error}</p>
          <Button variant="outline" onClick={() => navigate("/properties")}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.headerContainer}>
        <h1 style={styles.headerTitle}>Notifications</h1>
        <div style={styles.userInfo}>
          <span>{user?.username || "hienvu"} - {user?.role || "Boss"}</span>
          <div style={styles.userAvatar}></div>
        </div>
      </div>

      {/* Notification List */}
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <Card
            key={notification.id}
            style={{
              ...styles.notificationCard,
              ...(notification.type === "Issue"
                ? styles.issueNotification
                : styles.activityNotification),
            }}
          >
            <div>
              <p style={styles.notificationMessage}>{notification.message}</p>
              <div style={styles.notificationFooter}>
                <span style={styles.notificationUser}>{notification.user}</span>
                <span style={styles.notificationTime}>
                  {formatDateTime(notification.timestamp)}
                </span>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <p
          style={{
            textAlign: "center",
            padding: "8px 0",
            color: "#999",
            fontSize: "14px",
          }}
        >
          No notifications available
        </p>
      )}

      {/* Bottom Navigation Bar */}
      <div style={styles.bottomNav}>
        <div style={{ textAlign: "center" }} onClick={() => navigate("/dashboard")}>
          <span style={styles.navIcon}>📊</span>
          <p style={styles.navLabel}>Dashboard</p>
        </div>
        <div style={{ textAlign: "center" }} onClick={() => navigate("/calendar")}>
          <span style={styles.navIcon}>📅</span>
          <p style={styles.navLabel}>Calendar</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <span style={{ ...styles.navIcon, ...styles.navIconActive }}>+</span>
        </div>
        <div style={{ textAlign: "center" }} onClick={() => navigate("/notifications")}>
          <span style={{ ...styles.navIcon, ...styles.navIconActive }}>🔔</span>
          <p style={{ ...styles.navLabel, ...styles.navLabelActive }}>Alerts</p>
        </div>
        <div style={{ textAlign: "center" }} onClick={() => navigate("/menu")}>
          <span style={styles.navIcon}>☰</span>
          <p style={styles.navLabel}>Menu</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;