import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card"; // Assuming this is your Card component
import { FaHotel, FaCog, FaUser, FaCalendar, FaChartLine, FaKey, FaQuestionCircle, FaComment } from "react-icons/fa"; // Added icons for Support
import { IoChevronForward } from "react-icons/io5"; // Chevron icon
import "../styles/menu.css"; // Import the separate CSS file

const Menu = () => {
  // Define menu items for "Setting Menu"
  const settingMenuItems = [
    { label: "Properties Setting", path: "/properties", icon: <FaHotel /> },
    { label: "Customer Setting", path: "/customer", icon: <FaUser /> },
    { label: "Booking Setting", path: "/booking", icon: <FaCalendar /> },
    { label: "Financial Report", path: "/reports", icon: <FaChartLine /> },
    { label: "Pricing Policy Setting", path: "/pricingpolicy", icon: <FaCog /> }, // New option
  ];

  // Define menu items for "Support"
  const supportMenuItems = [
    { label: "Send Confirmation Code", path: "/send-confirmation", icon: <FaKey /> },
    { label: "Need Supports", path: "/support", icon: <FaQuestionCircle /> },
    { label: "Send Us Your Feedback", path: "/feedback", icon: <FaComment /> },
  ];

  return (
    <div className="menu-container">
      {/* Setting Menu Card */}
      <div>
        <h2 className="section-title">Setting Menu</h2>
        <Card className="menu-card">
          {settingMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="menu-item"
            >
              <div className="menu-item-content">
                <span className="menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <IoChevronForward className="chevron-icon" />
            </Link>
          ))}
        </Card>
      </div>

      {/* Support Card */}
      <div>
        <h2 className="section-title">Support</h2>
        <Card className="menu-card">
          {supportMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="menu-item"
            >
              <div className="menu-item-content">
                <span className="menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <IoChevronForward className="chevron-icon" />
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default Menu;