const baseURL = import.meta.env.VITE_API_BASE_URL;

// Header hanya dikirim kalau token valid
const getHeaders = (withAuth = true) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (withAuth && token && token !== "null" && token !== "undefined") {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// GET request (opsi withAuth = false jika tidak perlu token)
export const apiGet = async (endpoint, withAuth = true) => {
    console.log("🔍 Memanggil endpoint:", endpoint, "| withAuth =", withAuth);

    const response = await fetch(`${baseURL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(withAuth),
    });

    if (!response.ok) {
      throw new Error("Gagal ambil data");
    }

    return await response.json();
  };

  // POST request
  export const apiPost = async (endpoint, body, withAuth = true) => {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(withAuth),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Gagal kirim data");
    }

    return await response.json();
  };

// PUT request
export const apiPut = async (endpoint, body, withAuth = true) => {
  const response = await fetch(`${baseURL}${endpoint}`, {
    method: "PUT",
    headers: getHeaders(withAuth),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Gagal update data");
  }
  return await response.json();
};

// DELETE request
export const apiDelete = async (endpoint, withAuth = true) => {
  const response = await fetch(`${baseURL}${endpoint}`, {
    method: "DELETE",
    headers: getHeaders(withAuth),
  });
  if (!response.ok) {
    throw new Error("Gagal hapus data");
  }
  return await response.json();
};

  export const backendURL = import.meta.env.VITE_BACKEND_URL;
