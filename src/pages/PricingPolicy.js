import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/pricingpolicy.css";

const PricingPolicy = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();

  // State for hotel selection
  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState(null);

  // Existing state for pricing policy
  const [scope, setScope] = useState("global");
  const [roomId, setRoomId] = useState("");
  const [policy, setPolicy] = useState({
    defaultCheckInTime: "14:00",
    defaultCheckOutTime: "12:00",
    earlyCheckInFee: { type: "hourly", amount: "", before: "14:00" },
    lateCheckOutFee: { type: "hourly", amount: "", after: "12:00" },
    minStayRequirement: { minNights: "", penaltyFee: "" },
    specialRates: [],
    minStayDiscount: { minNights: "", discountPercentage: "" },
    seasonalAdjustment: [],
    extraFees: [],
  });
  const [policyExists, setPolicyExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [newSpecialRate, setNewSpecialRate] = useState({
    type: "weekend",
    days: [],
    multiplier: "",
    startDate: "",
    endDate: "",
  });
  const [newSeasonalAdjustment, setNewSeasonalAdjustment] = useState({
    startDate: "",
    endDate: "",
    multiplier: "",
  });
  const [newExtraFee, setNewExtraFee] = useState({
    type: "",
    amount: "",
    per: "booking",
    after: "",
  });

  // Fetch hotels if no hotelId is provided
  useEffect(() => {
    if (!hotelId) {
      const fetchHotels = async () => {
        setHotelsLoading(true);
        setHotelsError(null);
        try {
          const response = await fetch("http://localhost:5000/hotels");
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          const result = await response.json();
          if (result.success) {
            setHotels(result.data || []);
          } else {
            setHotelsError(result.error || "Failed to load hotels");
          }
        } catch (err) {
          setHotelsError(`Failed to fetch hotels: ${err.message}`);
        } finally {
          setHotelsLoading(false);
        }
      };
      fetchHotels();
    }
  }, [hotelId]);

  // Validate the minStayRequirement fields
  const validateMinStayRequirement = () => {
    const errors = {};
    const { minNights, penaltyFee } = policy.minStayRequirement;

    const parsedMinNights = minNights === "" ? 0 : Number(minNights);
    const parsedPenaltyFee = penaltyFee === "" ? 0 : Number(penaltyFee);

    if (isNaN(parsedMinNights) || parsedMinNights < 0) {
      errors.minNights = "Minimum nights must be a number greater than or equal to 0";
    }
    if (isNaN(parsedPenaltyFee) || parsedPenaltyFee < 0) {
      errors.penaltyFee = "Penalty fee must be a number greater than or equal to 0";
    }

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // Validate the minStayDiscount fields
  const validateMinStayDiscount = () => {
    const errors = {};
    const { minNights, discountPercentage } = policy.minStayDiscount;

    const parsedMinNights = minNights === "" ? 0 : Number(minNights);
    const parsedDiscountPercentage = discountPercentage === "" ? 0 : Number(discountPercentage);

    if (isNaN(parsedMinNights) || parsedMinNights < 0) {
      errors.minStayDiscountMinNights = "Minimum nights must be a number greater than or equal to 0";
    }
    if (isNaN(parsedDiscountPercentage) || parsedDiscountPercentage < 0 || parsedDiscountPercentage > 100) {
      errors.minStayDiscountPercentage = "Discount percentage must be a number between 0 and 100";
    }
    if (parsedMinNights > 0 && parsedDiscountPercentage === 0) {
      errors.minStayDiscountPercentage = "Discount percentage must be greater than 0 if a minimum stay is specified";
    }

    setFormErrors((prev) => {
      const updatedErrors = { ...prev, ...errors };
      if (!(parsedMinNights > 0 && parsedDiscountPercentage === 0)) {
        delete updatedErrors.minStayDiscountPercentage;
      }
      return updatedErrors;
    });

    return Object.keys(errors).filter((key) => errors[key]).length === 0;
  };

  // Validate the extraFees fields
  const validateExtraFees = () => {
    const errors = {};
    const type = newExtraFee.type;

    const parsedAmount = newExtraFee.amount === "" ? 0 : Number(newExtraFee.amount);

    if (type === "" && parsedAmount === 0 && newExtraFee.per === "booking" && newExtraFee.after === "") {
      setFormErrors((prev) => ({ ...prev, extraFeeType: "", extraFeeAmount: "", extraFeeAfter: "" }));
      return true;
    }

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      errors.extraFeeAmount = "Amount must be a number greater than or equal to 0";
    } else {
      errors.extraFeeAmount = "";
    }

    if (!type) {
      errors.extraFeeType = "Type is required";
    } else {
      errors.extraFeeType = "";
    }

    if (newExtraFee.per === "hour" && !newExtraFee.after) {
      errors.extraFeeAfter = "After time is required for hourly fees";
    } else {
      errors.extraFeeAfter = "";
    }

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).filter((key) => errors[key]).length === 0;
  };

  useEffect(() => {
    console.log("PricingPolicy: Current user:", currentUser);
    const canManagePricing = hasPermission("canManagePricing");
    console.log("PricingPolicy: canManagePricing permission:", canManagePricing);
    if (!canManagePricing) {
      setError("You do not have permission to manage pricing policies.");
    }
  }, [hasPermission]);

  useEffect(() => {
  const fetchPolicy = async () => {
    if (!hotelId || !scope) return;

    setLoading(true);
    setError(null);
    setPolicyExists(false);

    try {
      const query = new URLSearchParams({
        hotelId,
        scope,
        ...(scope === "room" && roomId ? { roomId } : {}),
      }).toString();
      const url = `http://localhost:5000/pricingpolicy?${query}`;
      console.log(`Fetching pricing policy from: ${url}`);

      const response = await fetch(url);
      console.log(`Fetch response status: ${response.status}, statusText: ${response.statusText}`);

      if (!response.ok) {
        const text = await response.text();
        console.log(`Fetch response body: ${text}`);
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
      }

      const result = await response.json();
      console.log("Fetch result:", result);

      if (result.success) {
        if (Object.keys(result.data).length === 0) {
          setPolicyExists(false);
        } else {
          setPolicyExists(true);
          const fetchedPolicy = {
            defaultCheckInTime: result.data.defaultCheckInTime || "14:00",
            defaultCheckOutTime: result.data.defaultCheckOutTime || "12:00",
            earlyCheckInFee: result.data.earlyCheckInFee || { type: "hourly", amount: "", before: "14:00" },
            lateCheckOutFee: result.data.lateCheckOutFee || { type: "hourly", amount: "", after: "12:00" },
            minStayRequirement: result.data.minStayRequirement || { minNights: "", penaltyFee: "" },
            specialRates: result.data.specialRates || [],
            minStayDiscount: {
              minNights: result.data.minStayDiscount?.minNights ?? "",
              discountPercentage: result.data.minStayDiscount?.discountPercentage ?? "",
            },
            seasonalAdjustment: result.data.seasonalAdjustment || [],
            extraFees: result.data.extraFees || [], // Use fetched extraFees directly
          };
          setPolicy(fetchedPolicy); // Replace the entire policy state
          validateMinStayRequirement();
          validateMinStayDiscount();
        }
      } else {
        setError(result.error || "Failed to load pricing policy");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Failed to fetch pricing policy: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  fetchPolicy();
}, [hotelId, scope, roomId]);

  const handlePolicyChange = (field, value) => {
    setPolicy((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (field, subField, value) => {
    setPolicy((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value,
      },
    }));
    if (field === "minStayRequirement") {
      validateMinStayRequirement();
    } else if (field === "minStayDiscount") {
      validateMinStayDiscount();
    }
  };

  const addSpecialRate = () => {
    if (newSpecialRate.type === "weekend" && newSpecialRate.days.length === 0) {
      setError("Please select at least one day for weekend rates");
      return;
    }
    if (newSpecialRate.type === "holiday" && (!newSpecialRate.startDate || !newSpecialRate.endDate)) {
      setError("Please specify start and end dates for holiday rates");
      return;
    }
    const multiplier = Number(newSpecialRate.multiplier);
    if (isNaN(multiplier) || multiplier <= 0) {
      setError("Multiplier must be a number greater than 0");
      return;
    }

    setPolicy((prev) => {
      const updatedPolicy = {
        ...prev,
        specialRates: [...prev.specialRates, { ...newSpecialRate, multiplier: multiplier.toString() }],
      };
      console.log("Added Special Rate, updated policy:", updatedPolicy);
      return updatedPolicy;
    });
    setNewSpecialRate({ type: "weekend", days: [], multiplier: "", startDate: "", endDate: "" });
  };

  const removeSpecialRate = (index) => {
    setPolicy((prev) => ({
      ...prev,
      specialRates: prev.specialRates.filter((_, i) => i !== index),
    }));
  };

  const addSeasonalAdjustment = () => {
    if (!newSeasonalAdjustment.startDate || !newSeasonalAdjustment.endDate) {
      setError("Please specify start and end dates for seasonal adjustment");
      return;
    }
    const multiplier = Number(newSeasonalAdjustment.multiplier);
    if (isNaN(multiplier) || multiplier <= 0) {
      setError("Multiplier must be a number greater than 0");
      return;
    }

    setPolicy((prev) => {
      const updatedPolicy = {
        ...prev,
        seasonalAdjustment: [...prev.seasonalAdjustment, { ...newSeasonalAdjustment, multiplier: multiplier.toString() }],
      };
      console.log("Added Seasonal Adjustment, updated policy:", updatedPolicy);
      return updatedPolicy;
    });
    setNewSeasonalAdjustment({ startDate: "", endDate: "", multiplier: "" });
  };

  const removeSeasonalAdjustment = (index) => {
    setPolicy((prev) => ({
      ...prev,
      seasonalAdjustment: prev.seasonalAdjustment.filter((_, i) => i !== index),
    }));
  };

  const addExtraFee = () => {
    const type = newExtraFee.type;
    const amount = newExtraFee.amount;
    const per = newExtraFee.per;
    const after = newExtraFee.after;

    let errors = {};

    if (type === "" && amount === "" && per === "booking" && after === "") {
      setFormErrors((prev) => ({ ...prev, extraFeeType: "", extraFeeAmount: "", extraFeeAfter: "" }));
      return;
    }

    if (!type) {
      errors.extraFeeType = "Type is required";
    }

    if (amount === "" || isNaN(Number(amount)) || Number(amount) < 0) {
      errors.extraFeeAmount = "Amount must be a number >= 0";
    }

    if (per === "hour" && !after) {
      errors.extraFeeAfter = "After time is required for hourly fees";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors((prev) => ({ ...prev, ...errors }));
      setError("Please fix the validation errors in Extra Fees before adding.");
      return;
    }

    setPolicy((prev) => ({
      ...prev,
      extraFees: [...prev.extraFees, { type, amount: Number(amount), per, after }],
    }));
    setNewExtraFee({ type: "", amount: "", per: "booking", after: "" });
    setFormErrors((prev) => ({ ...prev, extraFeeType: "", extraFeeAmount: "", extraFeeAfter: "" }));
  };

  const removeExtraFee = (index) => {
    setPolicy((prev) => {
      const updatedPolicy = {
        ...prev,
        extraFees: prev.extraFees.filter((_, i) => i !== index),
      };
      console.log("Removed Extra Fee, updated policy:", updatedPolicy);
      return updatedPolicy;
    });
    setFormErrors((prev) => ({ ...prev, extraFeeType: "", extraFeeAmount: "", extraFeeAfter: "" }));
  };

  const handleSave = async () => {
    const isMinStayRequirementValid = validateMinStayRequirement();
    const isMinStayDiscountValid = validateMinStayDiscount();
    if (!isMinStayRequirementValid || !isMinStayDiscountValid) {
      setError("Please fix the validation errors before saving.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const policyData = {
        scope,
        ...(scope === "room" ? { roomId } : {}),
        defaultCheckInTime: policy.defaultCheckInTime,
        defaultCheckOutTime: policy.defaultCheckOutTime,
        earlyCheckInFee: {
          type: policy.earlyCheckInFee.type,
          amount: Number(policy.earlyCheckInFee.amount) || 0,
          before: policy.earlyCheckInFee.before,
        },
        lateCheckOutFee: {
          type: policy.lateCheckOutFee.type,
          amount: Number(policy.lateCheckOutFee.amount) || 0,
          after: policy.lateCheckOutFee.after,
        },
        minStayRequirement: {
          minNights: Number(policy.minStayRequirement.minNights) || 0,
          penaltyFee: Number(policy.minStayRequirement.penaltyFee) || 0,
        },
        specialRates: policy.specialRates.map((rate) => ({
          ...rate,
          multiplier: Number(rate.multiplier) || 0,
        })),
        minStayDiscount: {
          minNights: Number(policy.minStayDiscount.minNights) || 0,
          discountPercentage: Number(policy.minStayDiscount.discountPercentage) || 0,
        },
        seasonalAdjustment: policy.seasonalAdjustment.map((adj) => ({
          ...adj,
          multiplier: Number(adj.multiplier) || 0,
        })),
        extraFees: policy.extraFees.map((fee) => ({
          ...fee,
          amount: Number(fee.amount) || 0,
        })),
      };

      const url = `http://localhost:5000/pricingpolicy/${hotelId}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policyData),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setSuccessMessage("Pricing policy saved successfully!");
        setPolicyExists(true);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || "Failed to save pricing policy");
      }
    } catch (err) {
      setError(`Failed to save pricing policy: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle hotel selection
  const handleHotelSelect = (selectedHotelId) => {
    navigate(`/pricingpolicy/${selectedHotelId}`);
  };

  // Render hotel selection if no hotelId is provided
  if (!hotelId) {
    return (
      <div className="page-container">
        <div className="header-container">
          <h1 className="header-title">Select Hotel</h1>
        </div>

        {hotelsError && <div className="error-text">{hotelsError}</div>}

        {hotelsLoading ? (
          <div className="error-text">Loading hotels...</div>
        ) : hotels.length === 0 ? (
          <div className="info-text">No hotels found.</div>
        ) : (
          <div className="hotel-list">
            {hotels.map((hotel) => (
              <div
                key={hotel.hotelId}
                className="hotel-item"
                onClick={() => handleHotelSelect(hotel.hotelId)}
              >
                <span>{hotel.Name || `Hotel ${hotel.hotelId}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Existing permission and error checks
  if (!hasPermission("canManagePricing")) {
    return (
      <div className="page-container">
        <div className="error-text">You do not have permission to manage pricing policies.</div>
        <button className="button" onClick={() => navigate("/properties")}>
          Back to Properties
        </button>
      </div>
    );
  }

  if (error && error.includes("Hotel with ID")) {
    return (
      <div className="page-container">
        <div className="header-container">
       
          <h1 className="header-title">Manage Pricing Policy</h1>
        </div>
        <div className="error-text">{error}</div>
        <button className="button" onClick={() => navigate("/properties")}>
          Back to Properties
        </button>
      </div>
    );
  }

  // Existing pricing policy form
  return (
    <div className="page-container">
      <div className="header-container">
        <h1 className="header-title">Manage Pricing Policy</h1>
      </div>

      {error && <div className="error-text">{error}</div>}
      {successMessage && <div className="success-text">{successMessage}</div>}

      {loading ? (
        <div className="error-text">Loading...</div>
      ) : (
        <div className="card">
          {!policyExists && (
            <div className="info-text">
              No pricing policy exists for this scope yet. You can create one below.
            </div>
          )}
          <div className="form-container">
            <div>
              <label className="label">Scope</label>
              <select
                className="select"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="global">Global (Hotel-wide)</option>
                <option value="room">Room-specific</option>
              </select>
            </div>

            {scope === "room" && (
              <div>
                <label className="label">Room ID</label>
                <input
                  className="input"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter Room ID"
                />
              </div>
            )}

            <div className="grid-container">
              <div>
                <label className="label">Default Check-In Time</label>
                <input
                  className="input"
                  type="time"
                  value={policy.defaultCheckInTime}
                  onChange={(e) =>
                    handlePolicyChange("defaultCheckInTime", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="label">Default Check-Out Time</label>
                <input
                  className="input"
                  type="time"
                  value={policy.defaultCheckOutTime}
                  onChange={(e) =>
                    handlePolicyChange("defaultCheckOutTime", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <h3 className="section-title">Early Check-In Fee</h3>
              <div className="grid-container">
                <div>
                  <label className="label">Type</label>
                  <select
                    className="select"
                    value={policy.earlyCheckInFee.type}
                    onChange={(e) =>
                      handleNestedChange("earlyCheckInFee", "type", e.target.value)
                    }
                  >
                    <option value="hourly">Hourly</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>
                <div>
                  <label className="label">Amount ($)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={policy.earlyCheckInFee.amount}
                    onChange={(e) =>
                      handleNestedChange("earlyCheckInFee", "amount", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="label">Before Time</label>
                  <input
                    className="input"
                    type="time"
                    value={policy.earlyCheckInFee.before}
                    onChange={(e) =>
                      handleNestedChange("earlyCheckInFee", "before", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="section-title">Late Check-Out Fee</h3>
              <div className="grid-container">
                <div>
                  <label className="label">Type</label>
                  <select
                    className="select"
                    value={policy.lateCheckOutFee.type}
                    onChange={(e) =>
                      handleNestedChange("lateCheckOutFee", "type", e.target.value)
                    }
                  >
                    <option value="hourly">Hourly</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>
                <div>
                  <label className="label">Amount ($)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={policy.lateCheckOutFee.amount}
                    onChange={(e) =>
                      handleNestedChange("lateCheckOutFee", "amount", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="label">After Time</label>
                  <input
                    className="input"
                    type="time"
                    value={policy.lateCheckOutFee.after}
                    onChange={(e) =>
                      handleNestedChange("lateCheckOutFee", "after", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="section-title">Minimum Stay Requirement</h3>
              <div className="grid-container">
                <div>
                  <label className="label">Minimum Nights (0 for hourly stays)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={policy.minStayRequirement.minNights}
                    onChange={(e) =>
                      handleNestedChange("minStayRequirement", "minNights", e.target.value)
                    }
                  />
                  {formErrors.minNights && (
                    <div className="validation-error">{formErrors.minNights}</div>
                  )}
                </div>
                <div>
                  <label className="label">Penalty Fee ($)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={policy.minStayRequirement.penaltyFee}
                    onChange={(e) =>
                      handleNestedChange("minStayRequirement", "penaltyFee", e.target.value)
                    }
                  />
                  {formErrors.penaltyFee && (
                    <div className="validation-error">{formErrors.penaltyFee}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="section-title">Special Rates</h3>
              {policy.specialRates.map((rate, index) => (
                <div key={index} className="list-item">
                  <div className="grid-container">
                    <div>
                      <label className="label">Type</label>
                      <select
                        className="select"
                        value={rate.type}
                        onChange={(e) => {
                          const newRates = [...policy.specialRates];
                          newRates[index].type = e.target.value;
                          setPolicy((prev) => ({ ...prev, specialRates: newRates }));
                        }}
                      >
                        <option value="weekend">Weekend</option>
                        <option value="holiday">Holiday</option>
                      </select>
                    </div>
                    {rate.type === "weekend" ? (
                      <div>
                        <label className="label">Days</label>
                        <select
                          className="select"
                          multiple
                          value={rate.days}
                          onChange={(e) => {
                            const selectedDays = Array.from(e.target.selectedOptions, (option) => option.value);
                            const newRates = [...policy.specialRates];
                            newRates[index].days = selectedDays;
                            setPolicy((prev) => ({ ...prev, specialRates: newRates }));
                          }}
                        >
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="label">Start Date</label>
                          <input
                            className="input"
                            type="date"
                            value={rate.startDate}
                            onChange={(e) => {
                              const newRates = [...policy.specialRates];
                              newRates[index].startDate = e.target.value;
                              setPolicy((prev) => ({ ...prev, specialRates: newRates }));
                            }}
                          />
                        </div>
                        <div>
                          <label className="label">End Date</label>
                          <input
                            className="input"
                            type="date"
                            value={rate.endDate}
                            onChange={(e) => {
                              const newRates = [...policy.specialRates];
                              newRates[index].endDate = e.target.value;
                              setPolicy((prev) => ({ ...prev, specialRates: newRates }));
                            }}
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="label">Multiplier</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.1"
                        value={rate.multiplier}
                        onChange={(e) => {
                          const newRates = [...policy.specialRates];
                          newRates[index].multiplier = e.target.value;
                          setPolicy((prev) => ({ ...prev, specialRates: newRates }));
                        }}
                      />
                    </div>
                  </div>
                  <button className="remove-button" onClick={() => removeSpecialRate(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <div>
                <h4 className="label">Add Special Rate</h4>
                <div className="grid-container">
                  <div>
                    <label className="label">Type</label>
                    <select
                      className="select"
                      value={newSpecialRate.type}
                      onChange={(e) =>
                        setNewSpecialRate((prev) => ({ ...prev, type: e.target.value }))
                      }
                    >
                      <option value="weekend">Weekend</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                  {newSpecialRate.type === "weekend" ? (
                    <div>
                      <label className="label">Days</label>
                      <select
                        className="select"
                        multiple
                        value={newSpecialRate.days}
                        onChange={(e) => {
                          const selectedDays = Array.from(e.target.selectedOptions, (option) => option.value);
                          setNewSpecialRate((prev) => ({ ...prev, days: selectedDays }));
                        }}
                      >
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="label">Start Date</label>
                        <input
                          className="input"
                          type="date"
                          value={newSpecialRate.startDate}
                          onChange={(e) =>
                            setNewSpecialRate((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="label">End Date</label>
                        <input
                          className="input"
                          type="date"
                          value={newSpecialRate.endDate}
                          onChange={(e) =>
                            setNewSpecialRate((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="label">Multiplier</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.1"
                      value={newSpecialRate.multiplier}
                      onChange={(e) =>
                        setNewSpecialRate((prev) => ({ ...prev, multiplier: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <button className="add-button" onClick={addSpecialRate}>
                  Add Special Rate
                </button>
              </div>
            </div>

            <div>
              <h3 className="section-title">Minimum Stay Discount</h3>
              <div className="grid-container">
                <div>
                  <label className="label">Minimum Nights (0 for any stay)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={policy.minStayDiscount.minNights}
                    onChange={(e) => {
                      handleNestedChange("minStayDiscount", "minNights", e.target.value);
                      validateMinStayDiscount();
                    }}
                  />
                  {formErrors.minStayDiscountMinNights && (
                    <div className="validation-error">{formErrors.minStayDiscountMinNights}</div>
                  )}
                </div>
                <div>
                  <label className="label">Discount Percentage (%)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max="100"
                    value={policy.minStayDiscount.discountPercentage}
                    onChange={(e) => {
                      handleNestedChange("minStayDiscount", "discountPercentage", e.target.value);
                      validateMinStayDiscount();
                    }}
                  />
                  {formErrors.minStayDiscountPercentage && (
                    <div className="validation-error">{formErrors.minStayDiscountPercentage}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="section-title">Seasonal Adjustment</h3>
              {policy.seasonalAdjustment.map((adjustment, index) => (
                <div key={index} className="list-item">
                  <div className="grid-container">
                    <div>
                      <label className="label">Start Date</label>
                      <input
                        className="input"
                        type="date"
                        value={adjustment.startDate}
                        onChange={(e) => {
                          const newAdjustments = [...policy.seasonalAdjustment];
                          newAdjustments[index].startDate = e.target.value;
                          setPolicy((prev) => ({ ...prev, seasonalAdjustment: newAdjustments }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="label">End Date</label>
                      <input
                        className="input"
                        type="date"
                        value={adjustment.endDate}
                        onChange={(e) => {
                          const newAdjustments = [...policy.seasonalAdjustment];
                          newAdjustments[index].endDate = e.target.value;
                          setPolicy((prev) => ({ ...prev, seasonalAdjustment: newAdjustments }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="label">Multiplier</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.1"
                        value={adjustment.multiplier}
                        onChange={(e) => {
                          const newAdjustments = [...policy.seasonalAdjustment];
                          newAdjustments[index].multiplier = e.target.value;
                          setPolicy((prev) => ({ ...prev, seasonalAdjustment: newAdjustments }));
                        }}
                      />
                    </div>
                  </div>
                  <button className="remove-button" onClick={() => removeSeasonalAdjustment(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <div>
                <h4 className="label">Add Seasonal Adjustment</h4>
                <div className="grid-container">
                  <div>
                    <label className="label">Start Date</label>
                    <input
                      className="input"
                      type="date"
                      value={newSeasonalAdjustment.startDate}
                      onChange={(e) =>
                        setNewSeasonalAdjustment((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input
                      className="input"
                      type="date"
                      value={newSeasonalAdjustment.endDate}
                      onChange={(e) =>
                        setNewSeasonalAdjustment((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Multiplier</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.1"
                      value={newSeasonalAdjustment.multiplier}
                      onChange={(e) =>
                        setNewSeasonalAdjustment((prev) => ({ ...prev, multiplier: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <button className="add-button" onClick={addSeasonalAdjustment}>
                  Add Seasonal Adjustment
                </button>
              </div>
            </div>

            <div>
              <h3 className="section-title">Extra Fees</h3>
              {policy.extraFees.map((fee, index) => (
                <div key={index} className="list-item">
                  <div className="grid-container">
                    <div>
                      <label className="label">Type</label>
                      <input
                        className="input"
                        type="text"
                        value={fee.type}
                        onChange={(e) => {
                          const newFees = [...policy.extraFees];
                          newFees[index].type = e.target.value;
                          setPolicy((prev) => ({ ...prev, extraFees: newFees }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="label">Amount ($)</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        value={fee.amount}
                        onChange={(e) => {
                          const newFees = [...policy.extraFees];
                          newFees[index].amount = e.target.value;
                          setPolicy((prev) => ({ ...prev, extraFees: newFees }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="label">Per</label>
                      <select
                        className="select"
                        value={fee.per}
                        onChange={(e) => {
                          const newFees = [...policy.extraFees];
                          newFees[index].per = e.target.value;
                          setPolicy((prev) => ({ ...prev, extraFees: newFees }));
                        }}
                      >
                        <option value="booking">Per Booking</option>
                        <option value="night">Per Night</option>
                        <option value="hour">Per Hour</option>
                      </select>
                    </div>
                    {fee.per === "hour" && (
                      <div>
                        <label className="label">After</label>
                        <input
                          className="input"
                          type="time"
                          value={fee.after}
                          onChange={(e) => {
                            const newFees = [...policy.extraFees];
                            newFees[index].after = e.target.value;
                            setPolicy((prev) => ({ ...prev, extraFees: newFees }));
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <button className="remove-button" onClick={() => removeExtraFee(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <div>
                <h4 className="label">Add Extra Fee</h4>
                <div className="grid-container">
                  <div>
                    <label className="label">Type</label>
                    <input
                      className="input"
                      type="text"
                      value={newExtraFee.type}
                      onChange={(e) => {
                        setNewExtraFee((prev) => ({ ...prev, type: e.target.value }));
                        validateExtraFees();
                      }}
                      placeholder="[e.g., Cleaning Fee]"
                    />
                    {formErrors.extraFeeType && (
                      <div className="validation-error">{formErrors.extraFeeType}</div>
                    )}
                  </div>
                  <div>
                    <label className="label">Amount ($)</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={newExtraFee.amount}
                      onChange={(e) => {
                        setNewExtraFee((prev) => ({ ...prev, amount: e.target.value }));
                        validateExtraFees();
                      }}
                    />
                    {formErrors.extraFeeAmount && (
                      <div className="validation-error">{formErrors.extraFeeAmount}</div>
                    )}
                  </div>
                  <div>
                    <label className="label">Per</label>
                    <select
                      className="select"
                      value={newExtraFee.per}
                      onChange={(e) => {
                        setNewExtraFee((prev) => ({ ...prev, per: e.target.value }));
                        validateExtraFees();
                      }}
                    >
                      <option value="booking">Per Booking</option>
                      <option value="night">Per Night</option>
                      <option value="hour">Per Hour</option>
                    </select>
                  </div>
                  {newExtraFee.per === "hour" && (
                    <div>
                      <label className="label">After</label>
                      <input
                        className="input"
                        type="time"
                        value={newExtraFee.after}
                        onChange={(e) => {
                          setNewExtraFee((prev) => ({ ...prev, after: e.target.value }));
                          validateExtraFees();
                        }}
                      />
                      {formErrors.extraFeeAfter && (
                        <div className="validation-error">{formErrors.extraFeeAfter}</div>
                      )}
                    </div>
                  )}
                </div>
                <button className="add-button" onClick={addExtraFee}>
                  Add Extra Fee
                </button>
              </div>
            </div>

            {Object.keys(formErrors).filter((key) => formErrors[key]).length > 0 && (
              <div className="validation-error">Please fix the validation errors before saving.</div>
            )}
            <button
              className="button"
              onClick={handleSave}
              disabled={loading || Object.keys(formErrors).filter((key) => formErrors[key]).length > 0}
            >
              {loading ? "Saving..." : "Save Pricing Policy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPolicy;