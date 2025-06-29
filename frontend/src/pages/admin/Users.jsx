import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { apiGet } from "../../api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiGet("/users")
      .then((data) => {
        const userList = Array.isArray(data?.data?.users) ? data.data.users : [];
        setUsers(userList);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
        setLoading(false);
      });
  }, []);

  const filteredUsers = users
    .filter((user) => (roleFilter === "Semua" ? true : user.role === roleFilter))
    .filter((user) =>
      [user.name, user.email, user.phone, user.address, user.status]
        .some((field) =>
          field?.toLowerCase().includes(search.toLowerCase())
        )
    );

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
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Cari users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-1 rounded text-sm"
              />
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
            <>
              <div className="md:hidden space-y-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.profile_id} className="bg-white p-4 rounded shadow">
                      <div className="font-semibold">{user.full_name || user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-sm">Role: {user.role}</div>
                      <div className="text-sm">HP: {user.phone}</div>
                      <div className="text-sm">Alamat: {user.address}</div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${user.status === "Aktif" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {user.status}
                        </span>
                        <button
                          onClick={() => toggleStatus(user.profile_id)}
                          className={`text-sm px-3 py-1 rounded ${user.status === "Aktif" ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"}`}
                        >
                          {user.status === "Aktif" ? "Blokir" : "Aktifkan"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">Tidak ada pengguna ditemukan.</div>
                )}
              </div>

              <div className="hidden md:block overflow-x-auto bg-white rounded shadow">
                <table className="w-full min-w-[800px] text-sm">
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
                              className={`px-2 py-1 rounded text-xs font-medium ${user.status === "Aktif"
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
                              className={`text-sm px-3 py-1 rounded ${user.status === "Aktif"
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;
