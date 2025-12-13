import React, { useEffect, useState } from "react";
import AuthService from "@/services/AuthService";
import { Button } from "@/components/ui/button";

const PAGE_LIMIT = 12;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async (p = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const res = await AuthService.getAllUsers({ page: p, limit: PAGE_LIMIT, searchTerm });
      const data = res || res.data || {};
      setUsers(data.users || []);
      setPage(data.pagination?.page || p);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      alert("Failed to load users: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, "");
  }, []);

  const handleSearch = (ev) => {
    ev.preventDefault();
    load(1, search);
  };

  const toggleBlock = async (user) => {
    const confirmMsg = user.isBlocked ? "Unblock this user?" : "Block this user?";
    if (!confirm(confirmMsg)) return;
    try {
      await AuthService.updateUserByAdmin({ userId: user._id, isBlocked: !user.isBlocked });
      load(page, search);
    } catch (err) {
      alert("Failed to update user: " + (err.message || err));
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete user ${user.email}? This is permanent.`)) return;
    try {
      await AuthService.deleteUser(user._id);
      load(page, search);
    } catch (err) {
      alert("Failed to delete user: " + (err.message || err));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">List users, view details, block/unblock, and delete accounts.</p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="p-2 border rounded-md" />
          <Button type="submit">Search</Button>
          <Button variant="outline" onClick={() => { setSearch(""); load(1, ""); }}>Reset</Button>
        </form>
      </div>

      {loading ? (
        <div className="py-8 text-center">Loading users...</div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Role</th>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b">Joined</th>
                  <th className="p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={6} className="text-center p-6">No users found.</td></tr>
                )}
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{u.firstName} {u.lastName}</td>
                    <td className="p-3 border-b">{u.email}</td>
                    <td className="p-3 border-b">{u.role}</td>
                    <td className="p-3 border-b">{u.isBlocked ? <span className="text-red-600 font-semibold">Blocked</span> : <span className="text-green-600">Active</span>}</td>
                    <td className="p-3 border-b">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="p-3 border-b">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setSelected(u)}>View</Button>
                        <Button variant="outline" size="sm" onClick={() => toggleBlock(u)}>{u.isBlocked ? 'Unblock' : 'Block'}</Button>
                        <Button size="sm" className="bg-red-600 text-white" onClick={() => handleDelete(u)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => load(page - 1, search)}>Prev</Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => load(page + 1, search)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      {/* Details modal */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-md p-6 w-full max-w-md">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">User details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500">Close</button>
            </div>
            <div className="mt-4 space-y-2">
              <div><strong>Name:</strong> {selected.firstName} {selected.lastName}</div>
              <div><strong>Email:</strong> {selected.email}</div>
              <div><strong>Role:</strong> {selected.role}</div>
              <div><strong>Blocked:</strong> {selected.isBlocked ? 'Yes' : 'No'}</div>
              <div><strong>Joined:</strong> {new Date(selected.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              <Button onClick={() => { toggleBlock(selected); setSelected(null); }}>{selected.isBlocked ? 'Unblock' : 'Block'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
