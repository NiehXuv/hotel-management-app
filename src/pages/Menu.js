import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card"; // Assuming this is your Card component
import { FaHotel, FaCog, FaUser, FaCalendar, FaChartLine, FaKey, FaQuestionCircle, FaComment } from "react-icons/fa"; // Added icons for Support
import { IoChevronForward } from "react-icons/io5"; // Chevron icon

const Menu = () => {
  // Define menu items for "Setting Menu"
  const settingMenuItems = [
    { label: "Properties Setting", path: "/properties", icon: <FaHotel /> },
    { label: "Customer Setting", path: "/customer", icon: <FaUser /> },
    { label: "Booking Setting", path: "/booking", icon: <FaCalendar /> },
    { label: "User Setting", path: "/user", icon: <FaCog /> },
    { label: "Financial Report", path: "/financial", icon: <FaChartLine /> },
  ];

  // Define menu items for "Support"
  const supportMenuItems = [
    { label: "Send Confirmation Code", path: "/send-confirmation", icon: <FaKey /> },
    { label: "Need Supports", path: "/support", icon: <FaQuestionCircle /> },
    { label: "Send Us Your Feedback", path: "/feedback", icon: <FaComment /> },
  ];

  // Styles to match the screenshot
  const styles = {
    container: {
      width: "100vw",
      maxWidth: "480px",
      margin: "0 auto",
      padding: "1rem",
      paddingBottom: "calc(1rem + 60px)", // Space for bottom navigation
      minHeight: "100vh",
      backgroundColor: "white",
      boxSizing: "border-box",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
    },
    headerTitle: {
      fontSize: "16px",
      fontWeight: "400",
      color: "#42A5F5", // Blue color for "Heart of Hoan Kiem"
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
    sectionTitle: {
      paddingLeft: '0.5em',
      fontSize: "22px",
      fontWeight: "600",
      color: "#000",
      marginBottom: "0.5rem",
    },
    card: {
      borderRadius: "2em",
      marginBottom: "1rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      backgroundColor: "transparent",
      color: "black",
      textDecoration: "none",
      fontSize: "16px",
      fontWeight: "400",
    },
    icon: {
      marginRight: "12px",
      color: "#06D7A0", // Blue icon color
      fontSize: "20px",
    },
    chevron: {
      color: "#B0BEC5", // Grayish chevron
      fontSize: "20px",
    },
  };

  return (
    <div style={styles.container}>
      

      {/* Setting Menu Card */}
      <div>
        <h2 style={styles.sectionTitle}>Setting Menu</h2>
        <Card style={styles.card}>
          {settingMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={styles.menuItem}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <IoChevronForward style={styles.chevron} />
            </Link>
          ))}
        </Card>
      </div>

      {/* Support Card */}
      <div>
        <h2 style={styles.sectionTitle}>Support</h2>
        <Card style={styles.card}>
          {supportMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={styles.menuItem}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <IoChevronForward style={styles.chevron} />
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default Menu;