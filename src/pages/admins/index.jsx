import React, { useState } from "react";
import { ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "react-toastify";
import { getAdmins, PERMISSIONS, saveAdmins } from "../../data/adminAuth";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "Administrator",
  permissions: [],
};

const Admins = () => {
  const [admins, setAdmins] = useState(getAdmins);
  const [form, setForm] = useState(emptyForm);

  const togglePermission = (permission) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  };

  const addAdmin = (event) => {
    event.preventDefault();
    if (admins.some((admin) => admin.email.toLowerCase() === form.email.toLowerCase())) {
      toast.error("An admin with this email already exists");
      return;
    }
    if (!form.permissions.length) {
      toast.error("Assign at least one access permission");
      return;
    }

    const updated = [
      ...admins,
      { ...form, id: `admin-${Date.now()}`, status: "Active" },
    ];
    saveAdmins(updated);
    setAdmins(updated);
    setForm(emptyForm);
    toast.success("Admin created successfully");
  };

  const removeAdmin = (id) => {
    const updated = admins.filter((admin) => admin.id !== id);
    saveAdmins(updated);
    setAdmins(updated);
    toast.success("Admin removed");
  };

  return (
    <div className="space-y-6 px-6 pb-10 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create administrators and control which parts of the dashboard they can access.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={addAdmin} className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-xl bg-purple-100 p-2.5 text-purple-700"><UserPlus size={20} /></span>
            <h2 className="text-lg font-bold">Add new admin</h2>
          </div>

          <div className="space-y-4">
            {[
              ["name", "Full name", "text"],
              ["email", "Email address", "email"],
              ["password", "Temporary password", "password"],
              ["role", "Role title", "text"],
            ].map(([name, label, type]) => (
              <label className="block" key={name}>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  type={type}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  required
                  minLength={name === "password" ? 8 : undefined}
                />
              </label>
            ))}

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-700">Dashboard access</legend>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSIONS.map((permission) => (
                  <label key={permission.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 hover:bg-purple-50">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(permission.key)}
                      onChange={() => togglePermission(permission.key)}
                      className="accent-purple-600"
                    />
                    {permission.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button className="w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white hover:bg-purple-700" type="submit">
              Create admin
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6">
            <Users className="text-purple-600" size={22} />
            <h2 className="text-lg font-bold">Administrators ({admins.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-6 py-4">Admin</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Access</th><th className="px-6 py-4">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4"><p className="font-semibold text-slate-900">{admin.name}</p><p className="text-xs text-slate-500">{admin.email}</p></td>
                    <td className="px-6 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700"><ShieldCheck size={13} />{admin.role}</span></td>
                    <td className="max-w-xs px-6 py-4 text-xs text-slate-500">{admin.permissions.includes("*") ? "Full access" : admin.permissions.map((key) => PERMISSIONS.find((item) => item.key === key)?.label).filter(Boolean).join(", ")}</td>
                    <td className="px-6 py-4">{admin.id !== "super-admin" && <button onClick={() => removeAdmin(admin.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Remove ${admin.name}`}><Trash2 size={18} /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admins;
