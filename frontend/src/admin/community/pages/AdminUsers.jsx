import { useState } from "react";
import { Eye, UserX, UserCheck, Trash2, Plus, Coins } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/community/ui/dialog";
import { useAuth } from "../../../hub/AuthContext";
import { UserActivityChart } from "../../components/UserActivityChart";

const initialUsers = [
  { id: "u1",  name: "Moni Ratha",    handle: "@moni",    year: "Year 3", major: "Computer Science",        role: "User",  status: "Active",    credits: 40,  avatar: "https://i.pravatar.cc/120?img=1",  joined: "Sep 2025" },
  { id: "u2",  name: "Amelia Chen",   handle: "@amelia",  year: "Year 4", major: "Electrical Engineering",  role: "Admin", status: "Active",    credits: 0,   avatar: "https://i.pravatar.cc/120?img=47", joined: "Sep 2024" },
  { id: "u3",  name: "Sora Kim",      handle: "@sora",    year: "Year 2", major: "Computer Science",        role: "User",  status: "Active",    credits: 120, avatar: "https://i.pravatar.cc/120?img=5",  joined: "Jan 2026" },
  { id: "u4",  name: "Dev Patel",     handle: "@devp",    year: "Year 3", major: "Mechatronics",            role: "User",  status: "Suspended", credits: 0,   avatar: "https://i.pravatar.cc/120?img=12", joined: "Sep 2025" },
  { id: "u5",  name: "Lina Torres",   handle: "@lina",    year: "Year 1", major: "Computer Science",        role: "User",  status: "Active",    credits: 15,  avatar: "https://i.pravatar.cc/120?img=9",  joined: "Jan 2026" },
  { id: "u6",  name: "Khai Nguyen",   handle: "@khai",    year: "Year 4", major: "Software Engineering",    role: "Staff", status: "Active",    credits: 0,   avatar: "https://i.pravatar.cc/120?img=15", joined: "Sep 2023" },
  { id: "u7",  name: "Riya Sharma",   handle: "@riya",    year: "Year 2", major: "Electrical Engineering",  role: "User",  status: "Active",    credits: 65,  avatar: "https://i.pravatar.cc/120?img=25", joined: "Sep 2025" },
  { id: "u8",  name: "Leo Baxter",    handle: "@leo",     year: "Year 3", major: "Mechatronics",            role: "User",  status: "Active",    credits: 0,   avatar: "https://i.pravatar.cc/120?img=33", joined: "Jan 2025" },
  { id: "u9",  name: "Nadia Souk",    handle: "@nadia",   year: "Year 1", major: "Computer Science",        role: "User",  status: "Active",    credits: 200, avatar: "https://i.pravatar.cc/120?img=44", joined: "Jan 2026" },
  { id: "u10", name: "Taro Yamada",   handle: "@taro",    year: "Year 4", major: "Software Engineering",    role: "Staff", status: "Active",    credits: 0,   avatar: "https://i.pravatar.cc/120?img=52", joined: "Sep 2023" },
];

const roleColors = {
  Admin: "bg-red-50 text-red-600",
  Staff: "bg-violet-50 text-violet-600",
  User:  "bg-gray-100 text-gray-500",
};

const statusColors = {
  Active:    "bg-emerald-50 text-emerald-600",
  Suspended: "bg-red-50 text-red-500",
};

// Which roles an actor is allowed to hand out when creating a new account.
// Staff can only create plain Users — granting Staff/Admin is Admin-only,
// decided at creation time rather than by editing an existing account.
const CREATABLE_ROLES_BY_ACTOR = {
  Admin: ["User", "Staff", "Admin"],
  Staff: ["User"],
};

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400";

function Actions({ user, onAddCredits, onToggleStatus }) {
  const suspended = user.status === "Suspended";
  return (
    <div className="flex items-center gap-1">
      <button onClick={onAddCredits}
        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Add credits">
        <Coins className="h-3.5 w-3.5" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View">
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button onClick={onToggleStatus}
        className={`p-1.5 rounded-md transition-colors ${
          suspended
            ? "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
            : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
        }`}
        title={suspended ? "Reactivate" : "Suspend"}>
        {suspended ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
      </button>
      <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Credits are only ever topped up in person at the front desk (cash/card),
// so this is the only "purchase" flow that exists — staff key in the amount
// after taking payment, there's no online checkout to wire up.
function AddCreditsDialog({ user, onOpenChange, onConfirm }) {
  const [amount, setAmount] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    onConfirm(value);
    setAmount("");
  };

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add credits</DialogTitle>
            <DialogDescription>
              {user?.name} — current balance: {user?.credits ?? 0} credits. Enter the amount paid for at the front desk.
            </DialogDescription>
          </DialogHeader>
          <input
            type="number" min="1" autoFocus value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100"
            className={`${inputCls} mt-4`}
          />
          <DialogFooter className="mt-4">
            <button type="button" onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
              Add credits
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddUserDialog({ open, onOpenChange, onCreate, actorRole }) {
  const options = CREATABLE_ROLES_BY_ACTOR[actorRole] ?? ["User"];
  const [form, setForm] = useState({ name: "", handle: "", year: "", major: "", role: options[0] });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreate({
      name: form.name.trim(),
      handle: form.handle.trim() || `@${form.name.trim().toLowerCase().replace(/\s+/g, "")}`,
      year: form.year.trim() || "Year 1",
      major: form.major.trim() || "Undeclared",
      role: form.role,
    });
    setForm({ name: "", handle: "", year: "", major: "", role: options[0] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>Create a new account and assign its role directly.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <input placeholder="Full name" value={form.name} onChange={set("name")} className={inputCls} autoFocus />
            <input placeholder="Handle (e.g. @jane)" value={form.handle} onChange={set("handle")} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Year (e.g. Year 2)" value={form.year} onChange={set("year")} className={inputCls} />
              <input placeholder="Major" value={form.major} onChange={set("major")} className={inputCls} />
            </div>
            <select value={form.role} onChange={set("role")} className={inputCls}>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <DialogFooter className="mt-4">
            <button type="button" onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors">
              Create user
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UsersTable({ title, subtitle, users, onAddCredits, onToggleStatus }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <span className="text-xs font-medium text-gray-400">{users.length}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Year</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Major</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">No accounts here.</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">{user.year}</td>
                  <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell truncate max-w-[160px]">{user.major}</td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium tabular-nums">{user.credits}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs hidden sm:table-cell">{user.joined}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <Actions
                        user={user}
                        onAddCredits={() => onAddCredits(user)}
                        onToggleStatus={() => onToggleStatus(user.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(initialUsers);
  const [creditTarget, setCreditTarget] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);

  const confirmAddCredits = (amount) => {
    setUsers(prev => prev.map(u => u.id === creditTarget.id ? { ...u, credits: u.credits + amount } : u));
    setCreditTarget(null);
  };

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Suspended" ? "Active" : "Suspended" } : u));
  };

  const createUser = (data) => {
    setUsers(prev => [
      ...prev,
      {
        id: `u${Date.now()}`,
        status: "Active",
        credits: 0,
        avatar: `https://i.pravatar.cc/120?img=${Math.floor(Math.random() * 70) + 1}`,
        joined: "Just now",
        ...data,
      },
    ]);
    setAddUserOpen(false);
  };

  const teamUsers    = users.filter(u => u.role !== "User");
  const regularUsers = users.filter(u => u.role === "User");

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">{users.length} registered accounts</p>
        </div>
        <button onClick={() => setAddUserOpen(true)}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="mb-8">
        <UserActivityChart />
      </div>

      <div className="mb-8">
        <UsersTable
          title="Team"
          subtitle="Admins & staff with admin panel access"
          users={teamUsers}
          onAddCredits={setCreditTarget}
          onToggleStatus={toggleStatus}
        />
      </div>

      <UsersTable
        title="Users"
        subtitle="Registered makerspace members"
        users={regularUsers}
        onAddCredits={setCreditTarget}
        onToggleStatus={toggleStatus}
      />

      <AddCreditsDialog
        user={creditTarget}
        onOpenChange={(open) => !open && setCreditTarget(null)}
        onConfirm={confirmAddCredits}
      />

      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onCreate={createUser}
        actorRole={currentUser?.role}
      />
    </div>
  );
}
