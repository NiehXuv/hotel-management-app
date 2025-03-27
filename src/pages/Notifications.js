import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

/**
 * Notification Page Component
 *
 * Displays a list of notifications for a specific hotel, including issues and activities.
 *
 * @module Pages/Notification
 */
const Notifications = () => {
  // Define styles object (consistent with PropertyDetails)
  const styles = {
    pageContainer: {
      paddingBottom: "2em",
      padding: "1.3em",
      width: "100vw",
      maxWidth: "480px",
      marginBottom: "4em",
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
      alignItems: "center",
      marginBottom: "8px",
    },
    backButton: {
      marginRight: "1em",
      padding: "0.5empx",
      borderRadius: "1em",
      cursor: "pointer",
      border: "none",
      backgroundColor: "transparent",
    },
    backButtonHover: {
      backgroundColor: "#e5e7eb",
    },
    headerTitle: {
      paddingLeft: "0.8em",
      fontSize: "24px",
      fontWeight: "700",
    },
    notificationCard: {
      borderRadius: "2em",
      padding: "0.3em",
      paddingLeft: "1.5em",
      marginBottom: "1em",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    issueNotification: {
      backgroundColor: "rgba(240, 75, 10, 0.32)", // Orange for issues
    },
    activityNotification: {
      backgroundColor: "rgba(21, 228, 149, 0.27)", // Green for activities
    },
    notificationMessage: {
      fontSize: "14px",
      margin: "0 0 0.1em 0",
      color: "black",
    },
    notificationFooter: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      fontSize: "12px",
      color: "black",
    },
    notificationUser: {
      fontWeight: "500",
    },
    notificationTime: {},
  };

  const { hotelId } = useParams(); // Get hotelId from the route
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications when the component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/notifications`
        );
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
  }, [hotelId]);

  // Format date for display
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <Button variant="outline" onClick={() => navigate(`/properties/${hotelId}`)}>
            Back to Property
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
    </div>
  );
};

export default Notifications;