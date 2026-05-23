import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Briefcase,
  Globe,
  TrendingUp,
  LogOut,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Building,
  Menu,
  X,
  BarChart2,
  List,
  Home,
  Eye,
  Download,
  Award,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import { AlumniExportDialog } from '@/components/admin/alumni-export-dialog';
import { ChmsuLogo } from '@/components/chmsu-logo';
import type { AlumniRecord } from '@/types/alumni';
import type { ExportOptions } from '@/types/export';
import type { SharedData } from '@/types';

import alumniLogo from '@/assets/images/alumni-logo.jfif';

const MAROON = "#1A5336";
const GOLD = "#FFB81C";
const COLORS = ["#1A5336", "#FFB81C", "#2563eb", "#16a34a", "#9333ea", "#ea580c"];
const PAGE_SIZE = 10;

// Defined outside component to avoid recharts duplicate-key warnings on re-renders
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg">
        <p className="text-gray-600 text-xs mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={`tt-${p.dataKey ?? "k"}-${p.name ?? "n"}-${i}`} style={{ color: p.color }} className="text-sm font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

type SortKey = keyof AlumniRecord;
type SortDir = "asc" | "desc";
type Tab = "overview" | "records" | "employment" | "education";

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: color ?? MAROON }}
      >
        <span className="text-white">{icon}</span>
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-gray-900 mt-0.5" style={{ fontSize: "1.75rem", fontWeight: 800 }}>
          {value}
        </p>
        {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function SortIcon({ col, sortKey, dir }: { col: string; sortKey: string; dir: SortDir }) {
  if (col !== sortKey)
    return <ChevronDown size={14} className="text-gray-300 opacity-50 inline ml-1" />;
  return dir === "asc" ? (
    <ChevronUp size={14} className="text-[#1A5336] inline ml-1" />
  ) : (
    <ChevronDown size={14} className="text-[#1A5336] inline ml-1" />
  );
}

// Detail Modal
function AlumniDetailModal({ record, onClose }: { record: AlumniRecord; onClose: () => void }) {
  const schools = record.schoolAttended ? [record.schoolAttended] : [];

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-gray-800 text-sm">{value || "—"}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#1A5336] px-6 py-5 flex items-center gap-4 flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
            {record.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white truncate" style={{ fontWeight: 700 }}>
              {record.name}
            </h3>
            <p className="text-white/70 text-sm">{record.degree}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white ml-auto">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Personal */}
          <div>
            <h4 className="text-[#1A5336] text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#1A5336]/10 flex items-center justify-center">
                <span className="text-[#1A5336] text-[8px]">P</span>
              </div>
              Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <Field label="Sex" value={record.sex} />
              <Field label="Date of Birth" value={record.dateOfBirth} />
              <Field label="Age" value={record.age} />
              <Field label="Civil Status" value={record.civilStatus} />
              <Field label="Religion" value={record.religion} />
              <Field label="Place of Birth" value={record.placeOfBirth} />
              <div className="col-span-2 flex gap-2">
                <Mail size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <Field label="Email" value={record.email} />
              </div>
              <div className="col-span-2 flex gap-2">
                <Phone size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <Field label="Mobile" value={record.mobileNo} />
              </div>
              <div className="col-span-2 flex gap-2">
                <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <Field label="Address" value={record.address} />
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h4 className="text-[#1A5336] text-xs font-bold uppercase tracking-wider mb-3">
              Educational Details
            </h4>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Schools Attended</p>
                <div className="flex flex-wrap gap-2">
                  {schools.length > 0
                    ? schools.map((s) => (
                        <span key={s as string} className="px-2 py-0.5 bg-[#1A5336]/10 text-[#1A5336] text-xs rounded-full font-medium">
                          {s}
                        </span>
                      ))
                    : <span className="text-gray-400 text-sm">—</span>}
                </div>
              </div>
              <Field label="Campus" value={record.campus} />
              <Field label="Year Graduated" value={record.yearGraduated} />
              <div className="col-span-2">
                <Field label="Degree / Course" value={record.degree} />
              </div>
              <Field label="Highest Attainment" value={record.highestAttainment} />
              <Field label="Eligibility" value={record.eligibility} />
            </div>
          </div>

          {/* Employment */}
          <div>
            <h4 className="text-[#1A5336] text-xs font-bold uppercase tracking-wider mb-3">
              Employment Data
            </h4>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <Field label="Employment Status" value={record.employmentStatus} />
              <Field label="Employment Sector" value={record.employmentSector || "—"} />
              <Field label="Present Status" value={record.presentEmploymentStatus || "—"} />
              <Field label="Year Employed" value={record.yearEmployed || "—"} />
              <Field label="Occupation" value={record.occupation || "—"} />
              <Field label="Position" value={record.position || "—"} />
              <div className="col-span-2">
                <Field label="Company / Organization" value={record.company || "—"} />
              </div>
              <div className="col-span-2">
                <Field
                  label="Location"
                  value={
                    record.locationOfEmployment?.toUpperCase().includes("ABROAD")
                      ? "Employed Abroad"
                      : record.locationOfEmployment
                      ? "Employed Locally"
                      : "—"
                  }
                />
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={12} />
            Submitted: {new Date(record.submittedAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface DashboardProps {
  records: AlumniRecord[];
  exportOptions: ExportOptions;
  analytics: {
    total: number;
    employed: number;
    abroad: number;
    businessOwners: number;
    unemployed: number;
    retired: number;
    bySector: { name: string; value: number; _uid: string }[];
    byYear: { year: string; count: number; _uid: string }[];
    byDegree: { name: string; count: number; fullName: string; _uid: string }[];
    byAttainment: { name: string; value: number; _uid: string }[];
    empStatusData: { name: string; value: number; _uid: string }[];
    locationData: { name: string; value: number; _uid: string }[];
    schoolCounts: Record<string, number>;
    employmentRate: number;
    abroadRate: number;
  };
}

export default function AdminDashboard({ records, analytics, exportOptions }: DashboardProps) {
  const { auth } = usePage<SharedData>().props;
  const [tab, setTab] = useState<Tab>("overview");
  const [exportOpen, setExportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AlumniRecord | null>(null);

  // Filters
  const [filterSector, setFilterSector] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const handleLogout = () => {
    router.post(route('logout'));
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  // Filtered + sorted records
  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.degree.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.campus.toLowerCase().includes(q) ||
          r.occupation.toLowerCase().includes(q)
      );
    }

    if (filterSector) {
      result = result.filter((r) =>
        filterSector === "ENTREPRENEURIAL"
          ? r.employmentSector?.toUpperCase().includes("ENTREPRENEURIAL")
          : r.employmentSector === filterSector
      );
    }
    if (filterStatus) result = result.filter((r) => r.employmentStatus === filterStatus);
    if (filterLocation) {
      result = result.filter((r) =>
        filterLocation === "ABROAD"
          ? r.locationOfEmployment?.toUpperCase().includes("ABROAD")
          : r.locationOfEmployment && !r.locationOfEmployment.toUpperCase().includes("ABROAD")
      );
    }

    result.sort((a, b) => {
      const va = String(a[sortKey] ?? "").toLowerCase();
      const vb = String(b[sortKey] ?? "").toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [records, search, sortKey, sortDir, filterSector, filterStatus, filterLocation]);

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const paginatedRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Home size={18} /> },
    { id: "records", label: "Alumni Records", icon: <List size={18} /> },
    { id: "employment", label: "Employment Analytics", icon: <Briefcase size={18} /> },
    { id: "education", label: "Education Analytics", icon: <GraduationCap size={18} /> },
  ];

  return (
    <>
      <Head title="Admin Dashboard" />
    <motion.div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#1A5336] shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Gold top bar */}
        <div className="h-1.5 bg-[#FFB81C]" />

        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 flex-shrink-0">
              <ChmsuLogo className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="w-10 h-10 rounded-full bg-white p-0.5 flex-shrink-0">
              <img src={alumniLogo} alt="Alumni Logo" className="w-full h-full object-contain rounded-full" />
            </div>
          </div>
          <div>
            <p className="text-white text-sm" style={{ fontWeight: 700 }}>
              CHMSU
            </p>
            <p className="text-white/60 text-xs">Alumni Directory</p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                tab === item.id
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
              {tab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-[#FFB81C] rounded-full" />
              )}
            </button>
          ))}
          {auth.user?.isAdmin && (
            <Link
              href={route('admin.staff.index')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              <Shield size={18} />
              <span className="text-sm">Staff Management</span>
            </Link>
          )}
        </nav>

        {/* Stats mini */}
        <div className="mx-3 mb-4 p-4 bg-white/10 rounded-xl border border-white/10">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Quick Stats</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/70 text-xs">Total Alumni</span>
              <span className="text-[#FFB81C] text-xs font-bold">{analytics.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70 text-xs">Employed</span>
              <span className="text-[#FFB81C] text-xs font-bold">{analytics.employed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70 text-xs">Abroad</span>
              <span className="text-[#FFB81C] text-xs font-bold">{analytics.abroad}</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: "1.125rem", fontWeight: 700 }}>
              {navItems.find((n) => n.id === tab)?.label}
            </h1>
            <p className="text-gray-400 text-xs">CHMSU Alumni Online Directory — Admin Portal</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1A5336]/5 rounded-full border border-[#1A5336]/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[#1A5336] text-xs font-medium">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-[#1A5336] text-sm transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* ====== OVERVIEW TAB ====== */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<Users size={22} />}
                  label="Total Alumni"
                  value={analytics.total}
                  sub="Registered records"
                  color="#1A5336"
                />
                <StatCard
                  icon={<Briefcase size={22} />}
                  label="Employed"
                  value={analytics.employed}
                  sub={`${analytics.employmentRate}% employment rate`}
                  color="#FFB81C"
                />
                <StatCard
                  icon={<Globe size={22} />}
                  label="Working Abroad"
                  value={analytics.abroad}
                  sub="International employment"
                  color="#2563eb"
                />
                <StatCard
                  icon={<TrendingUp size={22} />}
                  label="Business Owners"
                  value={analytics.businessOwners}
                  sub="Entrepreneurs"
                  color="#16a34a"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alumni by Year Graduated */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                    Alumni by Graduation Year
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.byYear} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip content={CustomTooltip} />
                      <Bar dataKey="count" name="Alumni" fill={MAROON} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Employment Status */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                    Employment Status
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={analytics.empStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {analytics.empStatusData.map((entry, i) => (
                          <Cell key={`ov-emp-cell-${i}-${entry._uid}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={CustomTooltip} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Registrations */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900" style={{ fontWeight: 700 }}>
                    Recent Registrations
                  </h3>
                  <button
                    onClick={() => setTab("records")}
                    className="text-[#1A5336] text-sm hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 text-gray-500 text-xs font-medium">Name</th>
                        <th className="text-left py-2 px-3 text-gray-500 text-xs font-medium">Degree</th>
                        <th className="text-left py-2 px-3 text-gray-500 text-xs font-medium">Status</th>
                        <th className="text-left py-2 px-3 text-gray-500 text-xs font-medium">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...records]
                        .sort(
                          (a, b) =>
                            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                        )
                        .slice(0, 5)
                        .map((r) => (
                          <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-gray-800">{r.name}</td>
                            <td className="py-2.5 px-3 text-gray-500 text-xs max-w-[180px] truncate">
                              {r.degree}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  r.employmentStatus === "YES"
                                    ? "bg-green-50 text-green-700"
                                    : r.employmentStatus === "NO"
                                    ? "bg-red-50 text-red-700"
                                    : r.employmentStatus === "BUSINESS OWNER"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-gray-50 text-gray-700"
                                }`}
                              >
                                {r.employmentStatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-400 text-xs">
                              {new Date(r.submittedAt).toLocaleDateString("en-PH")}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ====== ALUMNI RECORDS TAB ====== */}
          {tab === "records" && (
            <div className="space-y-5">
              {/* Search & Filters */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search alumni records..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 focus:border-[#1A5336] text-sm"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 text-gray-700"
                  >
                    <option value="">All Statuses</option>
                    {["YES", "NO", "BUSINESS OWNER", "RETIRED"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterSector}
                    onChange={(e) => {
                      setFilterSector(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 text-gray-700"
                  >
                    <option value="">All Sectors</option>
                    <option value="GOVERNMENT">Government</option>
                    <option value="PRIVATE">Private</option>
                    <option value="ENTREPRENEURIAL">Entrepreneurial</option>
                  </select>
                  <select
                    value={filterLocation}
                    onChange={(e) => {
                      setFilterLocation(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 text-gray-700"
                  >
                    <option value="">All Locations</option>
                    <option value="LOCAL">Local</option>
                    <option value="ABROAD">Abroad</option>
                  </select>
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-gray-500 text-sm">
                    Showing{" "}
                    <span className="font-semibold text-gray-800">{filteredRecords.length}</span>{" "}
                    of <span className="font-semibold text-gray-800">{records.length}</span> records
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {(search || filterStatus || filterSector || filterLocation) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setFilterStatus("");
                          setFilterSector("");
                          setFilterLocation("");
                          setPage(1);
                        }}
                        className="text-[#1A5336] text-xs hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExportOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                      style={{ background: MAROON }}
                    >
                      <Download size={16} />
                      Export to Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {[
                          { key: "name", label: "Name" },
                          { key: "degree", label: "Degree / Course" },
                          { key: "yearGraduated", label: "Yr. Graduated" },
                          { key: "campus", label: "Campus" },
                        ].map((col) => (
                          <th
                            key={col.key}
                            className="text-left px-4 py-3 text-gray-600 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-[#1A5336] select-none whitespace-nowrap"
                            onClick={() => handleSort(col.key as SortKey)}
                          >
                            {col.label}
                            <SortIcon col={col.key} sortKey={sortKey} dir={sortDir} />
                          </th>
                        ))}
                        <th className="px-4 py-3 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-400">
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((r) => (
                          <tr key={r.id} className="hover:bg-[#FFF9F5] transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#1A5336]/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[#1A5336] text-xs font-bold">
                                    {r.name.charAt(0)}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-800 whitespace-nowrap">
                                  {r.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 max-w-[200px]">
                              <span className="truncate block" title={r.degree}>
                                {r.degree}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                              {r.yearGraduated}
                            </td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                              {r.campus}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setSelectedRecord(r)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1A5336]/5 text-[#1A5336] hover:bg-[#1A5336]/10 transition-colors text-xs font-medium"
                              >
                                <Eye size={13} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <p className="text-gray-500 text-xs">
                      Page {page} of {totalPages} ({filteredRecords.length} records)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
                      >
                        <ChevronLeft size={14} />
                        Prev
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let p = i + 1;
                        if (totalPages > 5) {
                          if (page <= 3) p = i + 1;
                          else if (page >= totalPages - 2) p = totalPages - 4 + i;
                          else p = page - 2 + i;
                        }
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                              p === page
                                ? "bg-[#1A5336] text-white shadow-sm"
                                : "text-gray-600 hover:bg-white border border-gray-200"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
                      >
                        Next
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ====== EMPLOYMENT ANALYTICS TAB ====== */}
          {tab === "employment" && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<Building size={22} />}
                  label="Government"
                  value={records.filter((r) => r.employmentSector === "GOVERNMENT").length}
                  sub="Public sector employed"
                  color="#2563eb"
                />
                <StatCard
                  icon={<Briefcase size={22} />}
                  label="Private Sector"
                  value={records.filter((r) => r.employmentSector === "PRIVATE").length}
                  sub="Private sector employed"
                  color="#16a34a"
                />
                <StatCard
                  icon={<TrendingUp size={22} />}
                  label="Entrepreneurial"
                  value={
                    records.filter((r) => r.employmentSector?.toUpperCase().includes("ENTREPRENEURIAL")).length
                  }
                  sub="Freelance / Business"
                  color="#FFB81C"
                />
                <StatCard
                  icon={<Globe size={22} />}
                  label="Abroad"
                  value={analytics.abroad}
                  sub="International employment"
                  color="#9333ea"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sector Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 size={18} className="text-[#1A5336]" />
                    <h3 className="text-gray-900" style={{ fontWeight: 700 }}>
                      Employment by Sector
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={analytics.bySector} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip content={CustomTooltip} />
                      <Bar dataKey="value" name="Alumni" radius={[0, 4, 4, 0]}>
                        {analytics.bySector.map((entry, i) => (
                          <Cell key={`emp-sec-cell-${i}-${entry._uid}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Location Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={18} className="text-[#1A5336]" />
                    <h3 className="text-gray-900" style={{ fontWeight: 700 }}>
                      Local vs. Abroad
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={analytics.locationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {analytics.locationData.map((entry, i) => (
                          <Cell key={`emp-loc-cell-${i}-${entry._uid}`} fill={[MAROON, "#9333ea"][i]} />
                        ))}
                      </Pie>
                      <Tooltip content={CustomTooltip} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Employment Status Breakdown */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-gray-900 mb-5" style={{ fontWeight: 700 }}>
                  Employment Status Breakdown
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Regular",
                      count: records.filter((r) => r.presentEmploymentStatus === "REGULAR").length,
                      color: "#16a34a",
                    },
                    {
                      label: "Probationary",
                      count: records.filter((r) => r.presentEmploymentStatus === "PROBATIONARY").length,
                      color: "#FFB81C",
                    },
                    {
                      label: "Casual",
                      count: records.filter((r) => r.presentEmploymentStatus === "CASUAL").length,
                      color: "#ea580c",
                    },
                    {
                      label: "Job Order",
                      count: records.filter((r) => r.presentEmploymentStatus === "JOB ORDER").length,
                      color: "#9333ea",
                    },
                    {
                      label: "Self-employed",
                      count: records.filter((r) => r.presentEmploymentStatus === "SELF-EMPLOYED").length,
                      color: "#2563eb",
                    },
                    {
                      label: "Unemployed",
                      count: analytics.unemployed,
                      color: "#dc2626",
                    },
                    {
                      label: "Retired",
                      count: analytics.retired,
                      color: "#64748b",
                    },
                    {
                      label: "Business Owner",
                      count: analytics.businessOwners,
                      color: "#0891b2",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50"
                    >
                      <div
                        className="w-3 h-8 rounded-full flex-shrink-0"
                        style={{ background: item.color }}
                      />
                      <div>
                        <p className="text-gray-900 font-bold" style={{ fontSize: "1.25rem" }}>
                          {item.count}
                        </p>
                        <p className="text-gray-500 text-xs">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====== EDUCATION ANALYTICS TAB ====== */}
          {tab === "education" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<GraduationCap size={22} />}
                  label="Total Alumni"
                  value={analytics.total}
                  sub="Registered alumni"
                  color={MAROON}
                />
                <StatCard
                  icon={<Award size={22} />}
                  label="With Master's"
                  value={records.filter((r) => r.highestAttainment === "MASTER").length}
                  sub="Graduate degree"
                  color={GOLD}
                />
                <StatCard
                  icon={<Award size={22} />}
                  label="With Doctorate"
                  value={records.filter((r) => r.highestAttainment === "DOCTORATE").length}
                  sub="Doctoral degree"
                  color="#9333ea"
                />
                <StatCard
                  icon={<Building size={22} />}
                  label="CHMSU Grads"
                  value={analytics.schoolCounts.CHMSU ?? 0}
                  sub="From CHMSU"
                  color="#2563eb"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Degree */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap size={18} className="text-[#1A5336]" />
                    <h3 className="text-gray-900" style={{ fontWeight: 700 }}>
                      Top Degree Programs
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={analytics.byDegree} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                      <Tooltip content={CustomTooltip} />
                      <Bar dataKey="count" name="Alumni" radius={[0, 4, 4, 0]}>
                        {analytics.byDegree.map((entry, i) => (
                          <Cell key={`edu-deg-cell-${i}-${entry._uid}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Attainment Pie */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={18} className="text-[#1A5336]" />
                    <h3 className="text-gray-900" style={{ fontWeight: 700 }}>
                      Highest Educational Attainment
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={analytics.byAttainment}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={true}
                      >
                        {analytics.byAttainment.map((entry, i) => (
                          <Cell key={`edu-att-cell-${i}-${entry._uid}`} fill={[MAROON, GOLD, "#9333ea"][i % 3]} />
                        ))}
                      </Pie>
                      <Tooltip content={CustomTooltip} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Schools Attended */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-gray-900 mb-5" style={{ fontWeight: 700 }}>
                  Schools Attended by Alumni
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { school: 'BCNTS', count: analytics.schoolCounts.BCNTS ?? 0, color: '#1A5336' },
                    { school: 'PSC', count: analytics.schoolCounts.PSC ?? 0, color: '#FFB81C' },
                    { school: 'CHMSC', count: analytics.schoolCounts.CHMSC ?? 0, color: '#2563eb' },
                    { school: 'CHMSU', count: analytics.schoolCounts.CHMSU ?? 0, color: '#16a34a' },
                  ].map((item) => (
                    <div
                      key={item.school}
                      className="p-6 rounded-2xl text-center border-2"
                      style={{ borderColor: `${item.color}20`, background: `${item.color}05` }}
                    >
                      <p
                        className="mb-1"
                        style={{ fontSize: "2.25rem", fontWeight: 800, color: item.color }}
                      >
                        {item.count}
                      </p>
                      <p className="text-gray-600 text-sm font-semibold">{item.school}</p>
                      <p className="text-gray-400 text-xs mt-0.5">alumni</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graduation Year Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                  Alumni by Graduation Year
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.byYear} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="count" name="Graduates" fill={GOLD} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <AlumniDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      <AlumniExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        exportOptions={exportOptions}
      />
    </motion.div>
    </>
  );
}