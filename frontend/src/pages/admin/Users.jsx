import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token yang dikirim:", token); // Debug log

    if (!token) {
      setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8081/api/v1/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.meta?.message || "Gagal mengambil data pengguna.");
        }
        return res.json();
      })
      .then((data) => {
        console.log("User list dari API:", data.data.users);
        const userList = Array.isArray(data?.data?.users)
          ? data.data.users
          : [];

        setUsers(userList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
        setLoading(false);
      });
  }, []);

  const filteredUsers =
    roleFilter === "Semua"
      ? users
      : users.filter((user) => user.role === roleFilter);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.profile_id === id
          ? {
              ...user,
              status: user.status === "Aktif" ? "Nonaktif" : "Aktif",
            }
          : user
      )
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold">👤 Kelola Pengguna</h1>
            <div className="flex gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 px-3 py-1 rounded text-sm"
              >
                <option value="Semua">Semua Role</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-600">Memuat data pengguna...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Nama</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Nomor HP</th>
                    <th className="px-4 py-3 text-left">Alamat</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.profile_id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{user.full_name || user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.role || "-"}</td>
                        <td className="px-4 py-2">{user.phone || "-"}</td>
                        <td className="px-4 py-2">{user.address || "-"}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.status === "Aktif"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {user.status || "Aktif"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => toggleStatus(user.profile_id)}
                            className={`text-sm px-3 py-1 rounded ${
                              user.status === "Aktif"
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          >
                            {user.status === "Aktif" ? "Blokir" : "Aktifkan"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center px-4 py-6 text-gray-500">
                        Tidak ada pengguna ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;
