// HotelDataContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebaseconfig';

const HotelDataContext = createContext();
const CACHE_KEY = 'hotel_data_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const HotelDataProvider = ({ children }) => {
  const [hotels, setHotels] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date(); // Today
    const start = new Date();
    start.setDate(end.getDate() - 30); // 30 days prior to today
    return {
      start: start.toISOString().split('T')[0], // Format as YYYY-MM-DD
      end: end.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (startDate, endDate) => {
    const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const now = Date.now();

    if (
      cachedData.hotels &&
      cachedData.financialData &&
      cachedData.timestamp &&
      now - cachedData.timestamp < CACHE_DURATION &&
      cachedData.startDate === startDate &&
      cachedData.endDate === endDate
    ) {
      setHotels(cachedData.hotels);
      setFinancialData(cachedData.financialData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const financialResponse = await fetch(
        `http://localhost:5000/financial?startDate=${startDate}&endDate=${endDate}`
      );
      const financialData = await financialResponse.json();
      if (!financialResponse.ok || !financialData.success) {
        throw new Error(financialData.error || 'Failed to fetch financial data');
      }

      const hotelsResponse = await fetch('http://localhost:5000/hotels');
      const hotelsData = await hotelsResponse.json();
      if (!hotelsResponse.ok || !hotelsData.success) {
        throw new Error(hotelsData.error || 'Failed to fetch hotels list');
      }

      const hotelDetailsData = financialData.data.hotelDetails || [];

      setHotels(hotelDetailsData);
      setFinancialData(financialData.data);

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          hotels: hotelDetailsData,
          financialData: financialData.data,
          timestamp: now,
          startDate,
          endDate,
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dateRange.start, dateRange.end);
  }, [dateRange]);

  const updateDateRange = (start, end) => {
    setDateRange({ start, end });
  };

  return (
    <HotelDataContext.Provider
      value={{ hotels, financialData, dateRange, updateDateRange, loading, error }}
    >
      {children}
    </HotelDataContext.Provider>
  );
};

export const useHotelData = () => useContext(HotelDataContext);