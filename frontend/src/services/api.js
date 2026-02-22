const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.errors = data.errors;
    error.status = res.status;
    throw error;
  }
  return data;
};

export const expertApi = {
  getExperts: async ({ page = 1, limit = 6, category = '', search = '' } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${BASE_URL}/experts?${params}`);
    return handleResponse(res);
  },

  getExpertById: async (id) => {
    const res = await fetch(`${BASE_URL}/experts/${id}`);
    return handleResponse(res);
  },
};

export const bookingApi = {
  createBooking: async (bookingData) => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return handleResponse(res);
  },

  getBookingsByEmail: async (email) => {
    const res = await fetch(`${BASE_URL}/bookings?email=${encodeURIComponent(email)}`);
    return handleResponse(res);
  },

  updateBookingStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
};
