// admin-panel.jsx
// GR Educational Platform — Admin Panel
// Pairs with cet-mock-test.jsx (student-facing test runner)
//
// Setup:
//   npm i @supabase/supabase-js lucide-react recharts
//   Tailwind must be configured in the host project.
//
// Env vars (Vite shown; swap to process.env.* for CRA/Next):
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
//
// Expected Supabase tables (see bottom of file for SQL):
//   tests, questions, students, attempts, notices, admins

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, FileText, Users, Megaphone, BarChart3,
  LogOut, Plus, Pencil, Trash2, Search, X, Check, AlertCircle,
  TrendingUp, Award, Clock, BookOpen, Filter, ChevronRight, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase client
// ─────────────────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? "";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const CHART_COLORS = ["#4f46e5", "#059669", "#dc2626", "#d97706", "#7c3aed"];

// ─────────────────────────────────────────────────────────────────────────────
// Reusable UI primitives
// ─────────────────────────────────────────────────────────────────────────────
function Button({ variant = "primary", size = "md", className, children, ...props }) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5" };
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed",
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm",
        "placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100",
        className
      )}
      {...props}
    />
  );
}

function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm",
        "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm",
        "placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100",
        className
      )}
      {...props}
    />
  );
}

function Badge({ tone = "slate", children }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className={cn("w-full rounded-xl bg-white shadow-2xl", sizes[size])}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-3 text-slate-400"><Icon size={24} /></div>
      <h3 className="mb-1 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-slate-500">{description}</p>
      {action}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
    </div>
  );
}

function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  const styles = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-slate-800",
  };
  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white shadow-xl", styles[type])}>
      {type === "success" && <Check size={16} />}
      {type === "error" && <AlertCircle size={16} />}
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [view, setView] = useState("dashboard");
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!session) return <SignInScreen onError={(m) => notify(m, "error")} />;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tests", label: "Tests & Questions", icon: FileText },
    { id: "students", label: "Students", icon: Users },
    { id: "notices", label: "Notices", icon: Megaphone },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-slate-900 text-slate-200">
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">GR</div>
            <div>
              <div className="text-sm font-semibold text-white">GR Educational</div>
              <div className="text-xs text-slate-400">Admin Console</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 px-3 py-3">
          <div className="mb-2 px-3 text-xs text-slate-400">{session.user?.email}</div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {view === "dashboard" && <DashboardView notify={notify} />}
        {view === "tests" && <TestsView notify={notify} />}
        {view === "students" && <StudentsView notify={notify} />}
        {view === "notices" && <NoticesView notify={notify} />}
        {view === "analytics" && <AnalyticsView notify={notify} />}
      </main>

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sign-in
// ─────────────────────────────────────────────────────────────────────────────
function SignInScreen({ onError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) onError(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">GR</div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">GR Educational</h1>
            <p className="text-xs text-slate-500">Admin Console</p>
          </div>
        </div>
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Sign in to continue</h2>
        <form onSubmit={signIn} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          Admin access only. Contact ops if locked out.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
function DashboardView({ notify }) {
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, t, a, ra] = await Promise.all([
          supabase.from("students").select("id, is_active", { count: "exact" }),
          supabase.from("tests").select("id, is_active", { count: "exact" }),
          supabase.from("attempts").select("id, score, total", { count: "exact" }),
          supabase
            .from("attempts")
            .select("id, score, total, completed_at, students(full_name), tests(title)")
            .order("completed_at", { ascending: false })
            .limit(8),
        ]);
        const activeStudents = (s.data || []).filter((x) => x.is_active).length;
        const activeTests = (t.data || []).filter((x) => x.is_active).length;
        const avgScore = a.data?.length
          ? (a.data.reduce((sum, x) => sum + (x.score / x.total) * 100, 0) / a.data.length).toFixed(1)
          : "0";
        setStats({
          students: s.count ?? 0,
          activeStudents,
          tests: t.count ?? 0,
          activeTests,
          attempts: a.count ?? 0,
          avgScore,
        });
        setRecentAttempts(ra.data || []);
      } catch (e) {
        notify("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [notify]);

  if (loading) return <div className="p-8"><LoadingState /></div>;

  const cards = [
    { label: "Total Students", value: stats.students, sub: `${stats.activeStudents} active`, icon: Users, tone: "text-indigo-600 bg-indigo-50" },
    { label: "Active Tests", value: stats.activeTests, sub: `of ${stats.tests} total`, icon: FileText, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Total Attempts", value: stats.attempts, sub: "all time", icon: TrendingUp, tone: "text-amber-600 bg-amber-50" },
    { label: "Average Score", value: `${stats.avgScore}%`, sub: "across attempts", icon: Award, tone: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="px-8 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">An overview of platform activity</p>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{c.label}</span>
              <div className={cn("rounded-lg p-2", c.tone)}><c.icon size={16} /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{c.value}</div>
            <div className="mt-1 text-xs text-slate-500">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Recent Attempts</h2>
        </div>
        {recentAttempts.length === 0 ? (
          <EmptyState icon={Clock} title="No attempts yet" description="Once students start taking tests, they'll appear here." />
        ) : (
          <div className="divide-y divide-slate-100">
            {recentAttempts.map((a) => {
              const pct = ((a.score / a.total) * 100).toFixed(0);
              return (
                <div key={a.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{a.students?.full_name || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{a.tests?.title} · {fmtDateTime(a.completed_at)}</div>
                  </div>
                  <Badge tone={pct >= 75 ? "green" : pct >= 50 ? "amber" : "red"}>
                    {a.score}/{a.total} · {pct}%
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests & Questions
// ─────────────────────────────────────────────────────────────────────────────
function TestsView({ notify }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingTest, setEditingTest] = useState(null);
  const [managingTest, setManagingTest] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tests")
      .select("*, questions(id)")
      .order("created_at", { ascending: false });
    if (error) notify("Failed to load tests", "error");
    else setTests(data || []);
    setLoading(false);
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => tests.filter((t) => t.title?.toLowerCase().includes(search.toLowerCase())),
    [tests, search]
  );

  const deleteTest = async (id) => {
    if (!confirm("Delete this test and all its questions?")) return;
    const { error } = await supabase.from("tests").delete().eq("id", id);
    if (error) notify(error.message, "error");
    else { notify("Test deleted"); load(); }
  };

  return (
    <div className="px-8 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tests & Questions</h1>
          <p className="text-sm text-slate-500">Create and manage mock tests</p>
        </div>
        <Button onClick={() => setEditingTest({})}>
          <Plus size={16} /> New Test
        </Button>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No tests yet"
            description="Create your first mock test to start adding questions."
            action={<Button onClick={() => setEditingTest({})}><Plus size={16} /> New Test</Button>}
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Subject</th>
                <th className="px-6 py-3 font-medium">Duration</th>
                <th className="px-6 py-3 font-medium">Marks</th>
                <th className="px-6 py-3 font-medium">Questions</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{t.title}</td>
                  <td className="px-6 py-3 text-slate-600">{t.subject || "—"}</td>
                  <td className="px-6 py-3 text-slate-600">{t.duration_minutes} min</td>
                  <td className="px-6 py-3 text-slate-600">{t.total_marks}</td>
                  <td className="px-6 py-3 text-slate-600">{t.questions?.length ?? 0}</td>
                  <td className="px-6 py-3">
                    <Badge tone={t.is_active ? "green" : "slate"}>{t.is_active ? "Active" : "Draft"}</Badge>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setManagingTest(t)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                        title="Manage questions"
                      >
                        <BookOpen size={15} />
                      </button>
                      <button
                        onClick={() => setEditingTest(t)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteTest(t.id)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingTest && (
        <TestForm
          test={editingTest}
          onClose={() => setEditingTest(null)}
          onSaved={() => { setEditingTest(null); load(); notify("Test saved"); }}
          notify={notify}
        />
      )}
      {managingTest && (
        <QuestionsManager
          test={managingTest}
          onClose={() => { setManagingTest(null); load(); }}
          notify={notify}
        />
      )}
    </div>
  );
}

function TestForm({ test, onClose, onSaved, notify }) {
  const [form, setForm] = useState({
    title: test.title || "",
    subject: test.subject || SUBJECTS[0],
    duration_minutes: test.duration_minutes || 60,
    total_marks: test.total_marks || 100,
    description: test.description || "",
    is_active: test.is_active ?? false,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload = { ...form };
    const op = test.id
      ? supabase.from("tests").update(payload).eq("id", test.id)
      : supabase.from("tests").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) notify(error.message, "error");
    else onSaved();
  };

  return (
    <Modal open onClose={onClose} title={test.id ? "Edit Test" : "Create Test"}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
            <Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              <option>All Subjects</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Duration (minutes)</label>
            <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Total Marks</label>
            <Input type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: +e.target.value })} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Publish (visible to students)
            </label>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.title}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function QuestionsManager({ test, onClose, notify }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("test_id", test.id)
      .order("created_at", { ascending: true });
    if (error) notify("Failed to load questions", "error");
    else setQuestions(data || []);
    setLoading(false);
  }, [test.id, notify]);

  useEffect(() => { load(); }, [load]);

  const del = async (id) => {
    if (!confirm("Delete this question?")) return;
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) notify(error.message, "error");
    else { notify("Question deleted"); load(); }
  };

  return (
    <Modal open onClose={onClose} title={`Questions — ${test.title}`} size="lg">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{questions.length} question{questions.length === 1 ? "" : "s"}</p>
        <Button size="sm" onClick={() => setEditing({})}><Plus size={14} /> Add Question</Button>
      </div>
      {loading ? <LoadingState /> : questions.length === 0 ? (
        <EmptyState icon={BookOpen} title="No questions yet" description="Add questions to this test." />
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Q{i + 1}</span>
                    <Badge tone="indigo">{q.subject}</Badge>
                    <Badge tone={q.difficulty === "Hard" ? "red" : q.difficulty === "Medium" ? "amber" : "green"}>
                      {q.difficulty}
                    </Badge>
                    <Badge>{q.marks} mark{q.marks === 1 ? "" : "s"}</Badge>
                  </div>
                  <p className="text-sm text-slate-800">{q.question_text}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(q)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => del(q.id)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {["a", "b", "c", "d"].map((k) => (
                  <div
                    key={k}
                    className={cn(
                      "rounded px-2 py-1",
                      q.correct_option === k ? "bg-emerald-50 text-emerald-700 font-medium" : "bg-slate-50 text-slate-600"
                    )}
                  >
                    <span className="font-semibold">{k.toUpperCase()}.</span> {q[`option_${k}`]}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <QuestionForm
          testId={test.id}
          question={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); notify("Question saved"); }}
          notify={notify}
        />
      )}
    </Modal>
  );
}

function QuestionForm({ testId, question, onClose, onSaved, notify }) {
  const [form, setForm] = useState({
    question_text: question.question_text || "",
    option_a: question.option_a || "",
    option_b: question.option_b || "",
    option_c: question.option_c || "",
    option_d: question.option_d || "",
    correct_option: question.correct_option || "a",
    marks: question.marks || 1,
    subject: question.subject || SUBJECTS[0],
    difficulty: question.difficulty || "Medium",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload = { ...form, test_id: testId };
    const op = question.id
      ? supabase.from("questions").update(payload).eq("id", question.id)
      : supabase.from("questions").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) notify(error.message, "error");
    else onSaved();
  };

  return (
    <Modal open onClose={onClose} title={question.id ? "Edit Question" : "Add Question"}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Question</label>
          <Textarea rows={3} value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} />
        </div>
        {["a", "b", "c", "d"].map((k) => (
          <div key={k}>
            <label className="mb-1 block text-sm font-medium text-slate-700">Option {k.toUpperCase()}</label>
            <Input value={form[`option_${k}`]} onChange={(e) => setForm({ ...form, [`option_${k}`]: e.target.value })} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Correct Option</label>
            <Select value={form.correct_option} onChange={(e) => setForm({ ...form, correct_option: e.target.value })}>
              <option value="a">A</option><option value="b">B</option>
              <option value="c">C</option><option value="d">D</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Marks</label>
            <Input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: +e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
            <Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Difficulty</label>
            <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.question_text}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Students
// ─────────────────────────────────────────────────────────────────────────────
function StudentsView({ notify }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*, attempts(id, score, total)")
      .order("created_at", { ascending: false });
    if (error) notify("Failed to load students", "error");
    else setStudents(data || []);
    setLoading(false);
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q);
      const matchesActive =
        filterActive === "all" ||
        (filterActive === "active" && s.is_active) ||
        (filterActive === "inactive" && !s.is_active);
      return matchesSearch && matchesActive;
    });
  }, [students, search, filterActive]);

  const toggleActive = async (s) => {
    const { error } = await supabase
      .from("students")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    if (error) notify(error.message, "error");
    else { notify(`Student ${s.is_active ? "deactivated" : "activated"}`); load(); }
  };

  return (
    <div className="px-8 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Students</h1>
        <p className="text-sm text-slate-500">{students.length} total · {students.filter(s => s.is_active).length} active</p>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone…"
            className="pl-9"
          />
        </div>
        <Select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="w-40">
          <option value="all">All students</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No students" description="No students match your filters." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Class</th>
                <th className="px-6 py-3 font-medium">Attempts</th>
                <th className="px-6 py-3 font-medium">Avg %</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const att = s.attempts || [];
                const avg = att.length
                  ? (att.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / att.length).toFixed(0)
                  : "—";
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{s.full_name}</td>
                    <td className="px-6 py-3 text-slate-600">
                      <div className="text-xs">{s.email}</div>
                      <div className="text-xs text-slate-400">{s.phone}</div>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{s.class || "—"}</td>
                    <td className="px-6 py-3 text-slate-600">{att.length}</td>
                    <td className="px-6 py-3 text-slate-600">{avg === "—" ? "—" : `${avg}%`}</td>
                    <td className="px-6 py-3 text-slate-600">{fmtDate(s.created_at)}</td>
                    <td className="px-6 py-3">
                      <Badge tone={s.is_active ? "green" : "slate"}>{s.is_active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Button size="sm" variant="secondary" onClick={() => toggleActive(s)}>
                        {s.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notices
// ─────────────────────────────────────────────────────────────────────────────
function NoticesView({ notify }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) notify("Failed to load notices", "error");
    else setNotices(data || []);
    setLoading(false);
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const togglePublish = async (n) => {
    const update = {
      is_published: !n.is_published,
      published_at: !n.is_published ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("notices").update(update).eq("id", n.id);
    if (error) notify(error.message, "error");
    else { notify(n.is_published ? "Unpublished" : "Published"); load(); }
  };

  const del = async (id) => {
    if (!confirm("Delete this notice?")) return;
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) notify(error.message, "error");
    else { notify("Notice deleted"); load(); }
  };

  return (
    <div className="px-8 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notices</h1>
          <p className="text-sm text-slate-500">Announcements visible to students</p>
        </div>
        <Button onClick={() => setEditing({})}><Plus size={16} /> New Notice</Button>
      </header>

      {loading ? <LoadingState /> : notices.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            icon={Megaphone}
            title="No notices yet"
            description="Post announcements like exam schedules, holidays, or updates."
            action={<Button onClick={() => setEditing({})}><Plus size={16} /> New Notice</Button>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <div key={n.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{n.title}</h3>
                    <Badge tone={n.priority === "High" ? "red" : n.priority === "Medium" ? "amber" : "slate"}>
                      {n.priority}
                    </Badge>
                    <Badge tone={n.is_published ? "green" : "slate"}>
                      {n.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{n.content}</p>
                  <div className="mt-2 text-xs text-slate-400">
                    Created {fmtDateTime(n.created_at)}
                    {n.published_at && ` · Published ${fmtDateTime(n.published_at)}`}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => togglePublish(n)}>
                    {n.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  <button onClick={() => setEditing(n)} className="rounded p-2 text-slate-500 hover:bg-slate-100">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => del(n.id)} className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <NoticeForm
          notice={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); notify("Notice saved"); }}
          notify={notify}
        />
      )}
    </div>
  );
}

function NoticeForm({ notice, onClose, onSaved, notify }) {
  const [form, setForm] = useState({
    title: notice.title || "",
    content: notice.content || "",
    priority: notice.priority || "Medium",
    is_published: notice.is_published ?? false,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload = {
      ...form,
      published_at: form.is_published ? (notice.published_at || new Date().toISOString()) : null,
    };
    const op = notice.id
      ? supabase.from("notices").update(payload).eq("id", notice.id)
      : supabase.from("notices").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) notify(error.message, "error");
    else onSaved();
  };

  return (
    <Modal open onClose={onClose} title={notice.id ? "Edit Notice" : "New Notice"}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Content</label>
          <Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Low</option><option>Medium</option><option>High</option>
            </Select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Publish immediately
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.title || !form.content}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────────────────────
function AnalyticsView({ notify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - Number(range) * 86400000).toISOString();
      const { data: attempts, error } = await supabase
        .from("attempts")
        .select("score, total, completed_at, time_taken_seconds, tests(subject, title)")
        .gte("completed_at", since);
      if (error) { notify("Failed to load analytics", "error"); setLoading(false); return; }

      // attempts per day
      const byDay = {};
      (attempts || []).forEach((a) => {
        const d = new Date(a.completed_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        byDay[d] = (byDay[d] || 0) + 1;
      });
      const daily = Object.entries(byDay).map(([date, count]) => ({ date, count }));

      // subject breakdown
      const bySubject = {};
      (attempts || []).forEach((a) => {
        const s = a.tests?.subject || "Other";
        if (!bySubject[s]) bySubject[s] = { subject: s, count: 0, totalPct: 0 };
        bySubject[s].count++;
        bySubject[s].totalPct += (a.score / a.total) * 100;
      });
      const subjectData = Object.values(bySubject).map((s) => ({
        subject: s.subject,
        attempts: s.count,
        avgScore: +(s.totalPct / s.count).toFixed(1),
      }));

      // score distribution
      const buckets = { "0–25%": 0, "25–50%": 0, "50–75%": 0, "75–100%": 0 };
      (attempts || []).forEach((a) => {
        const pct = (a.score / a.total) * 100;
        if (pct < 25) buckets["0–25%"]++;
        else if (pct < 50) buckets["25–50%"]++;
        else if (pct < 75) buckets["50–75%"]++;
        else buckets["75–100%"]++;
      });
      const distribution = Object.entries(buckets).map(([range, count]) => ({ range, count }));

      setData({ daily, subjectData, distribution, total: attempts?.length || 0 });
      setLoading(false);
    })();
  }, [range, notify]);

  if (loading) return <div className="p-8"><LoadingState /></div>;

  return (
    <div className="px-8 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500">{data.total} attempts in the last {range} days</p>
        </div>
        <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-40">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </Select>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Attempts Over Time">
          {data.daily.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No data" description="No attempts in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Score Distribution">
          {data.total === 0 ? (
            <EmptyState icon={BarChart3} title="No data" description="No attempts in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.distribution}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {data.distribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Performance by Subject" className="lg:col-span-2">
          {data.subjectData.length === 0 ? (
            <EmptyState icon={BookOpen} title="No data" description="No attempts in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend />
                <Bar dataKey="attempts" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avgScore" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, className, children }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5", className)}>
      <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

/*
─────────────────────────────────────────────────────────────────────────────
Supabase schema (run once in SQL Editor)
─────────────────────────────────────────────────────────────────────────────

create table tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text,
  description text,
  duration_minutes int default 60,
  total_marks int default 100,
  is_active boolean default false,
  created_at timestamptz default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id) on delete cascade,
  question_text text not null,
  option_a text, option_b text, option_c text, option_d text,
  correct_option text check (correct_option in ('a','b','c','d')),
  marks int default 1,
  subject text,
  difficulty text default 'Medium',
  created_at timestamptz default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique,
  phone text,
  class text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  test_id uuid references tests(id) on delete cascade,
  score int not null,
  total int not null,
  time_taken_seconds int,
  completed_at timestamptz default now()
);

create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  priority text default 'Medium',
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- RLS: enable, then add admin-only policies. Example:
-- alter table tests enable row level security;
-- create policy admin_all on tests for all using (
--   exists (select 1 from admins where admins.email = auth.email())
-- );

create table admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text default 'admin',
  created_at timestamptz default now()
);

*/
