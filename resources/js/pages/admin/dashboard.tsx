import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { SearchableSelect } from '@/components/searchable-select';
import { CAMPUSES, schoolsForCampus } from '@/data/campus-schools';
import { GRADUATION_YEAR_START } from '@/data/graduation-years';
import { CAMPUS_PROGRAMS } from '@/data/campus-programs';
import { PHILIPPINE_LOCATIONS, PHILIPPINE_PROVINCES } from '@/data/philippine-locations';
import { RELIGIONS, SELECT_OTHERS } from '@/data/religions';
import { useCompactViewport } from '@/hooks/use-compact-viewport';
import { resolveBirthPlaceFields, resolveReligionField } from '@/lib/birth-place-fields';
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
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { AlumniExportDialog } from '@/components/admin/alumni-export-dialog';
import { AlumniRecordCard } from '@/components/admin/alumni-record-card';
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

const panelClass =
  'min-w-0 w-full max-w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6';

const statGridClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4';

function ChartContainer({ height, children }: { height: number; children: ReactNode }) {
  return (
    <div className="min-w-0 w-full max-w-full">
      <div className="w-full" style={{ height }}>
        {children}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-w-0 items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:gap-4 sm:p-5"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12"
        style={{ background: color ?? MAROON }}
      >
        <span className="text-white">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold text-gray-900 sm:text-[1.75rem]">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400 break-words">{sub}</p>}
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
const adminModalShellClass =
    'relative flex w-full min-h-0 flex-col overflow-hidden bg-white shadow-2xl max-h-[100dvh] rounded-t-2xl sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl';

const adminModalOverlayClass =
    'fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4';

const DetailField = ({
  label,
  value,
  icon,
  fullWidth = false,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}) => (
  <div className={`min-w-0 ${fullWidth ? 'sm:col-span-2' : ''}`}>
    {icon ? (
      <div className="flex min-w-0 gap-2.5">
        <span className="mt-0.5 flex-shrink-0 text-gray-400">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-xs uppercase tracking-wider text-gray-400">{label}</p>
          <p className="text-sm break-words text-gray-800 [overflow-wrap:anywhere]">{value || '—'}</p>
        </div>
      </div>
    ) : (
      <>
        <p className="mb-0.5 text-xs uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm break-words text-gray-800 [overflow-wrap:anywhere]">{value || '—'}</p>
      </>
    )}
  </div>
);

function AlumniDetailModal({ record, onClose }: { record: AlumniRecord; onClose: () => void }) {
  const schools = record.schoolAttended ? [record.schoolAttended] : [];
  const locationLabel = record.locationOfEmployment?.toUpperCase().includes('ABROAD')
    ? 'Employed Abroad'
    : record.locationOfEmployment
      ? 'Employed Locally'
      : '—';

  return (
    <div className={adminModalOverlayClass}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${adminModalShellClass} max-w-2xl`}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-[#134026]/30 bg-[#1A5336] px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white sm:h-12 sm:w-12">
            {record.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-white" style={{ fontWeight: 700 }}>
              {record.name}
            </h3>
            <p className="truncate text-sm text-white/70">{record.degree || '—'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:space-y-6 sm:p-6">
          {/* Personal */}
          <section>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A5336]">
              <div className="flex h-4 w-4 items-center justify-center rounded bg-[#1A5336]/10">
                <span className="text-[8px] text-[#1A5336]">P</span>
              </div>
              Personal Information
            </h4>
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
              <DetailField label="Sex" value={record.sex} />
              <DetailField label="Date of Birth" value={record.dateOfBirth} />
              <DetailField label="Age" value={record.age} />
              <DetailField label="Civil Status" value={record.civilStatus} />
              <DetailField label="Religion" value={record.religion} />
              <DetailField label="Place of Birth" value={record.placeOfBirth} fullWidth />
              <DetailField label="Email" value={record.email} icon={<Mail size={14} />} fullWidth />
              <DetailField label="Mobile" value={record.mobileNo} icon={<Phone size={14} />} fullWidth />
              <DetailField label="Address" value={record.address} icon={<MapPin size={14} />} fullWidth />
            </div>
          </section>

          {/* Education */}
          <section>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#1A5336]">
              Educational Details
            </h4>
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="mb-1 text-xs uppercase tracking-wider text-gray-400">Schools Attended</p>
                <div className="flex flex-wrap gap-2">
                  {schools.length > 0
                    ? schools.map((s) => (
                        <span
                          key={s as string}
                          className="rounded-full bg-[#1A5336]/10 px-2.5 py-1 text-xs font-medium text-[#1A5336]"
                        >
                          {s}
                        </span>
                      ))
                    : <span className="text-sm text-gray-400">—</span>}
                </div>
              </div>
              <DetailField label="Campus" value={record.campus} />
              <DetailField label="Year Graduated" value={record.yearGraduated} />
              <DetailField label="Degree / Course" value={record.degree} fullWidth />
              <DetailField label="Highest Attainment" value={record.highestAttainment} />
              <DetailField label="Eligibility" value={record.eligibility} />
            </div>
          </section>

          {/* Employment */}
          <section>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#1A5336]">
              Employment Data
            </h4>
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
              <DetailField label="Employment Status" value={record.employmentStatus} />
              <DetailField label="Employment Sector" value={record.employmentSector || '—'} />
              <DetailField label="Present Status" value={record.presentEmploymentStatus || '—'} />
              <DetailField label="Year Employed" value={record.yearEmployed || '—'} />
              <DetailField label="Occupation" value={record.occupation || '—'} />
              <DetailField label="Position" value={record.position || '—'} />
              <DetailField label="Company / Organization Name" value={record.company || '—'} fullWidth />
              <DetailField
                label="Company / Organization Address"
                value={record.companyAddress || '—'}
                fullWidth
              />
              <DetailField label="Location" value={locationLabel} fullWidth />
            </div>
          </section>

          {/* Meta */}
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <Calendar size={12} className="mt-0.5 flex-shrink-0" />
            <span className="break-words">
              Submitted:{' '}
              {new Date(record.submittedAt).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Footer — easy to reach on mobile */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full touch-manipulation rounded-xl bg-[#1A5336] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#134026]"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Edit modal input style helpers
const editInputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 focus:border-[#1A5336] text-sm";
const editSelectClass = "w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 focus:border-[#1A5336] text-sm appearance-none bg-white";
const editLabelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1";

function EditInputField({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder = '',
  upperCase = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  upperCase?: boolean;
}) {
  return (
    <div>
      <label className={editLabelClass}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(upperCase ? event.target.value.toUpperCase() : event.target.value)
        }
        className={editInputClass}
        placeholder={placeholder}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const EMPLOYMENT_SECTORS = [
  'GOVERNMENT',
  'PRIVATE',
  'ENGAGED IN ENTREPRENEURIAL / FREELANCE WORK',
] as const;

const PRESENT_EMPLOYMENT_STATUSES = [
  'REGULAR',
  'PROBATIONARY',
  'CASUAL',
  'JOB ORDER',
  'SELF-EMPLOYED',
] as const;

const EMPLOYMENT_LOCATIONS = [
  'EMPLOYED LOCALLY, INCLUDING THOSE WITH FOREIGN EMPLOYERS IN THE PHILIPPINES',
  'EMPLOYED ABROAD',
] as const;

const EDIT_YEAR_OPTIONS = Array.from({ length: 60 }, (_, index) => new Date().getFullYear() - index);

interface EditFormData {
  name: string;
  sex: string;
  date_of_birth: string;
  birth_province: string;
  birth_province_custom: string;
  birth_city: string;
  birth_city_custom: string;
  mobile_no: string;
  address: string;
  civil_status: string;
  religion: string;
  religion_other: string;
  email: string;
  campus: string;
  school_attended: string;
  year_graduated: string;
  highest_attainment: string;
  eligibility: string;
  degree: string;
  employment_status: string;
  employment_sector: string;
  present_employment_status: string;
  occupation: string;
  position: string;
  year_employed: string;
  company: string;
  company_address: string;
  location_of_employment: string;
}

function AlumniEditModal({
  record,
  onClose,
}: {
  record: AlumniRecord;
  onClose: () => void;
}) {
  const initialBirth = resolveBirthPlaceFields(record.birthProvince, record.birthCity);
  const initialReligion = resolveReligionField(record.religion);

  const [form, setForm] = useState<EditFormData>({
    name: record.name,
    sex: record.sex,
    date_of_birth: record.dateOfBirth,
    birth_province: initialBirth.birthProvince,
    birth_province_custom: initialBirth.birthProvinceOther,
    birth_city: initialBirth.birthCity,
    birth_city_custom: initialBirth.birthCityOther,
    mobile_no: record.mobileNo,
    address: record.address,
    civil_status: record.civilStatus,
    religion: initialReligion.religion,
    religion_other: initialReligion.religionOther,
    email: record.email,
    campus: record.campus,
    school_attended: record.schoolAttended,
    year_graduated: record.yearGraduated,
    highest_attainment: record.highestAttainment,
    eligibility: record.eligibility,
    degree: record.degree,
    employment_status: record.employmentStatus,
    employment_sector: record.employmentSector,
    present_employment_status: record.presentEmploymentStatus,
    occupation: record.occupation,
    position: record.position,
    year_employed: record.yearEmployed,
    company: record.company,
    company_address: record.companyAddress,
    location_of_employment: record.locationOfEmployment,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showEmploymentDetails =
    form.employment_status === 'YES' || form.employment_status === 'BUSINESS OWNER';
  const isEmployed = form.employment_status === 'YES';

  const provinceIsOthers = form.birth_province === SELECT_OTHERS;
  const cityIsOthers = form.birth_city === SELECT_OTHERS;
  const religionIsOthers = form.religion === SELECT_OTHERS;
  const isChmsu = form.school_attended === 'CHMSU';
  const campusSchools = schoolsForCampus(form.campus);
  const availableCities = form.birth_province && !provinceIsOthers
    ? PHILIPPINE_LOCATIONS[form.birth_province] ?? []
    : [];

  useEffect(() => {
    if (!form.birth_province || provinceIsOthers) {
      return;
    }

    const cities = PHILIPPINE_LOCATIONS[form.birth_province] ?? [];
    if (form.birth_city && form.birth_city !== SELECT_OTHERS && !cities.includes(form.birth_city)) {
      setForm((prev) => ({ ...prev, birth_city: '', birth_city_custom: '' }));
    }
  }, [form.birth_province, form.birth_city, provinceIsOthers]);

  const handleChange = (field: keyof EditFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.birth_city_id;
      return next;
    });
  };

  const handleSave = () => {
    setSaving(true);
    router.put(
      route('admin.alumni.update', { alumnus: record.id }),
      form,
      {
        onSuccess: () => onClose(),
        onError: (errs) => {
          setErrors(errs as Record<string, string>);
          setSaving(false);
        },
        onFinish: () => setSaving(false),
        preserveScroll: true,
      },
    );
  };

  return (
    <div className={adminModalOverlayClass}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${adminModalShellClass} max-w-3xl`}
      >
        {/* Header */}
        <div className="bg-[#1A5336] px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Pencil size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white truncate" style={{ fontWeight: 700 }}>Edit Alumni Record</h3>
            <p className="text-white/70 text-sm">{record.name}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Personal */}
          <div>
            <h4 className="text-[#1A5336] text-xs font-bold uppercase tracking-wider mb-3">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <EditInputField
                  label="Full Name"
                  value={form.name}
                  onChange={(value) => handleChange('name', value)}
                  error={errors.name}
                  placeholder="JUAN DELA CRUZ"
                  upperCase
                />
              </div>
              <div>
                <label className={editLabelClass}>Sex</label>
                <select value={form.sex} onChange={(e) => handleChange("sex", e.target.value)} className={editSelectClass}>
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                </select>
              </div>
              <div>
                <label className={editLabelClass}>Civil Status</label>
                <select value={form.civil_status} onChange={(e) => handleChange("civil_status", e.target.value)} className={editSelectClass}>
                  {["SINGLE", "MARRIED", "WIDOWED", "SEPARATED", "ANNULLED"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <EditInputField
                label="Date of Birth"
                value={form.date_of_birth}
                onChange={(value) => handleChange('date_of_birth', value)}
                error={errors.date_of_birth}
                type="date"
              />
              <div className="md:col-span-2">
                <label className={editLabelClass}>Place of Birth</label>
                <p className="text-xs text-gray-500 mb-2">Select province first to load cities and municipalities.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={editLabelClass}>Province</label>
                    <SearchableSelect
                      value={form.birth_province}
                      onChange={(value) => {
                        handleChange('birth_province', value);
                        handleChange('birth_province_custom', '');
                        if (value === SELECT_OTHERS) {
                          handleChange('birth_city', SELECT_OTHERS);
                        } else {
                          handleChange('birth_city', '');
                        }
                        handleChange('birth_city_custom', '');
                      }}
                      options={PHILIPPINE_PROVINCES}
                      placeholder="SELECT PROVINCE"
                      error={errors.birth_province || errors.birth_city_id}
                      triggerClassName={editSelectClass}
                    />
                    {provinceIsOthers && (
                      <input
                        type="text"
                        value={form.birth_province_custom}
                        onChange={(e) => handleChange('birth_province_custom', e.target.value.toUpperCase())}
                        className={`${editInputClass} mt-2`}
                        placeholder="SPECIFY PROVINCE"
                      />
                    )}
                    {errors.birth_province_custom && (
                      <p className="text-red-500 text-xs mt-1">{errors.birth_province_custom}</p>
                    )}
                  </div>
                  <div>
                    <label className={editLabelClass}>City / Municipality</label>
                    {provinceIsOthers ? (
                      <input
                        type="text"
                        value={form.birth_city_custom}
                        onChange={(e) => {
                          handleChange('birth_city_custom', e.target.value.toUpperCase());
                          handleChange('birth_city', SELECT_OTHERS);
                        }}
                        className={editInputClass}
                        placeholder="SPECIFY CITY / MUNICIPALITY"
                      />
                    ) : (
                      <>
                        <SearchableSelect
                          value={form.birth_city}
                          onChange={(value) => {
                            handleChange('birth_city', value);
                            handleChange('birth_city_custom', '');
                          }}
                          options={availableCities}
                          placeholder={form.birth_province ? 'SELECT CITY / MUNICIPALITY' : 'SELECT PROVINCE FIRST'}
                          disabled={!form.birth_province}
                          error={errors.birth_city}
                          triggerClassName={editSelectClass}
                        />
                        {cityIsOthers && (
                          <input
                            type="text"
                            value={form.birth_city_custom}
                            onChange={(e) => handleChange('birth_city_custom', e.target.value.toUpperCase())}
                            className={`${editInputClass} mt-2`}
                            placeholder="SPECIFY CITY / MUNICIPALITY"
                          />
                        )}
                      </>
                    )}
                    {errors.birth_city_custom && (
                      <p className="text-red-500 text-xs mt-1">{errors.birth_city_custom}</p>
                    )}
                  </div>
                </div>
              </div>
              <EditInputField
                label="Mobile No."
                value={form.mobile_no}
                onChange={(value) => handleChange('mobile_no', value)}
                error={errors.mobile_no}
                placeholder="09xxxxxxxxx"
              />
              <div>
                <label className={editLabelClass}>Religion</label>
                <SearchableSelect
                  value={form.religion}
                  onChange={(value) => {
                    handleChange('religion', value);
                    handleChange('religion_other', '');
                  }}
                  options={RELIGIONS}
                  placeholder="SELECT RELIGION"
                  error={errors.religion}
                  triggerClassName={editSelectClass}
                />
                {religionIsOthers && (
                  <input
                    type="text"
                    value={form.religion_other}
                    onChange={(e) => handleChange('religion_other', e.target.value.toUpperCase())}
                    className={`${editInputClass} mt-2`}
                    placeholder="SPECIFY RELIGION"
                  />
                )}
                {errors.religion_other && (
                  <p className="text-red-500 text-xs mt-1">{errors.religion_other}</p>
                )}
              </div>
              <div>
                <label className={editLabelClass}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={editInputClass}
                  placeholder="your@email.com (optional)"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="md:col-span-2">
                <EditInputField
                  label="Address"
                  value={form.address}
                  onChange={(value) => handleChange('address', value)}
                  error={errors.address}
                  upperCase
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h4 className="text-[#1A5336] text-xs font-bold uppercase tracking-wider mb-3">Educational Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={editLabelClass}>Campus</label>
                <select
                  value={form.campus}
                  onChange={(e) => {
                    const campus = e.target.value;
                    handleChange('campus', campus);
                    if (!schoolsForCampus(campus).includes(form.school_attended)) {
                      handleChange('school_attended', '');
                      handleChange('degree', '');
                    }
                  }}
                  className={editSelectClass}
                >
                  <option value="">SELECT CAMPUS</option>
                  {CAMPUSES.map((campus) => (
                    <option key={campus} value={campus}>
                      {campus}
                    </option>
                  ))}
                </select>
                {errors.campus && <p className="text-red-500 text-xs mt-1">{errors.campus}</p>}
              </div>
              <div>
                <label className={editLabelClass}>Year Graduated</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={GRADUATION_YEAR_START}
                  max={new Date().getFullYear()}
                  value={form.year_graduated}
                  onChange={(e) => handleChange('year_graduated', e.target.value)}
                  className={editInputClass}
                  placeholder="E.G. 2024"
                />
                {errors.year_graduated && (
                  <p className="text-red-500 text-xs mt-1">{errors.year_graduated}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className={editLabelClass}>School Attended</label>
                <select
                  value={form.school_attended}
                  onChange={(e) => {
                    handleChange('school_attended', e.target.value);
                    if (e.target.value !== 'CHMSU') {
                      handleChange('degree', form.degree);
                    } else {
                      handleChange('degree', '');
                    }
                  }}
                  className={editSelectClass}
                  disabled={!form.campus}
                >
                  <option value="">{form.campus ? 'SELECT SCHOOL' : 'SELECT CAMPUS FIRST'}</option>
                  {campusSchools.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
                {(errors.school_attended || errors.school_id) && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.school_attended || errors.school_id}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className={editLabelClass}>Degree / Course</label>
                {isChmsu ? (
                  <select
                    value={form.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    className={editSelectClass}
                    disabled={!form.campus}
                  >
                    <option value="">
                      {form.campus ? 'SELECT DEGREE / COURSE' : 'CAMPUS NOT ON FILE'}
                    </option>
                    {form.campus &&
                      CAMPUS_PROGRAMS[form.campus]?.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.degree}
                    onChange={(e) => handleChange('degree', e.target.value.toUpperCase())}
                    className={editInputClass}
                    placeholder="E.G. BACHELOR OF SCIENCE IN INFORMATION SYSTEMS"
                  />
                )}
                {(errors.degree || errors.program_id) && (
                  <p className="text-red-500 text-xs mt-1">{errors.degree || errors.program_id}</p>
                )}
              </div>
              <div>
                <label className={editLabelClass}>Highest Attainment</label>
                <select value={form.highest_attainment} onChange={(e) => handleChange("highest_attainment", e.target.value)} className={editSelectClass}>
                  {["MASTER", "DOCTORATE", "N/A"].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <EditInputField
                label="Eligibility"
                value={form.eligibility}
                onChange={(value) => handleChange('eligibility', value)}
                error={errors.eligibility}
                upperCase
              />
            </div>
          </div>

          {/* Employment */}
          <div>
            <h4 className="text-[#1A5336] text-xs font-bold uppercase tracking-wider mb-3">Employment Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={editLabelClass}>Are you presently employed?</label>
                <select value={form.employment_status} onChange={(e) => handleChange("employment_status", e.target.value)} className={editSelectClass}>
                  {["YES", "NO", "BUSINESS OWNER", "RETIRED"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {form.employment_status === 'BUSINESS OWNER' && (
                <>
                  <EditInputField
                    label="Company / Business Name"
                    value={form.company}
                    onChange={(value) => handleChange('company', value)}
                    error={errors.company}
                    upperCase
                  />
                  <EditInputField
                    label="Company / Business Address"
                    value={form.company_address}
                    onChange={(value) => handleChange('company_address', value)}
                    error={errors.company_address}
                    upperCase
                  />
                </>
              )}

              {showEmploymentDetails && form.employment_status !== 'BUSINESS OWNER' && (
                <>
                  {isEmployed && (
                    <div className="md:col-span-2">
                      <label className={editLabelClass}>Employment Sector</label>
                      <select
                        value={form.employment_sector}
                        onChange={(e) => handleChange('employment_sector', e.target.value)}
                        className={editSelectClass}
                      >
                        <option value="">SELECT SECTOR</option>
                        {EMPLOYMENT_SECTORS.map((sector) => (
                          <option key={sector} value={sector}>
                            {sector}
                          </option>
                        ))}
                      </select>
                      {errors.employment_sector && (
                        <p className="text-red-500 text-xs mt-1">{errors.employment_sector}</p>
                      )}
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className={editLabelClass}>Present Employment Status</label>
                    <select
                      value={form.present_employment_status}
                      onChange={(e) => handleChange('present_employment_status', e.target.value)}
                      className={editSelectClass}
                    >
                      <option value="">SELECT STATUS</option>
                      {PRESENT_EMPLOYMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {errors.present_employment_status && (
                      <p className="text-red-500 text-xs mt-1">{errors.present_employment_status}</p>
                    )}
                  </div>
                  <EditInputField
                    label="Present Occupation"
                    value={form.occupation}
                    onChange={(value) => handleChange('occupation', value)}
                    error={errors.occupation}
                    upperCase
                  />
                  <EditInputField
                    label="Position / Designation"
                    value={form.position}
                    onChange={(value) => handleChange('position', value)}
                    error={errors.position}
                    upperCase
                  />
                  <div>
                    <label className={editLabelClass}>Year Employed</label>
                    <select
                      value={form.year_employed}
                      onChange={(e) => handleChange('year_employed', e.target.value)}
                      className={editSelectClass}
                    >
                      <option value="">SELECT YEAR</option>
                      {EDIT_YEAR_OPTIONS.map((year) => (
                        <option key={year} value={String(year)}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={editLabelClass}>Location of Employment</label>
                    <select
                      value={form.location_of_employment}
                      onChange={(e) => handleChange('location_of_employment', e.target.value)}
                      className={editSelectClass}
                    >
                      <option value="">SELECT LOCATION</option>
                      {EMPLOYMENT_LOCATIONS.map((location) => (
                        <option key={location} value={location}>
                          {location === 'EMPLOYED ABROAD'
                            ? 'EMPLOYED ABROAD'
                            : 'EMPLOYED LOCALLY (INCL. FOREIGN EMPLOYERS IN PH)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <EditInputField
                      label="Name of Company / Organization"
                      value={form.company}
                      onChange={(value) => handleChange('company', value)}
                      error={errors.company}
                      upperCase
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-4 sm:px-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 flex-shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A5336] text-white hover:bg-[#134026] text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DeleteConfirmModal({
  record,
  onClose,
}: {
  record: AlumniRecord;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    setDeleting(true);
    router.delete(
      route('admin.alumni.destroy', { alumnus: record.id }),
      {
        onSuccess: () => onClose(),
        onFinish: () => setDeleting(false),
        preserveScroll: true,
      },
    );
  };

  return (
    <div className={adminModalOverlayClass}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="p-5 sm:p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h3 className="text-gray-900 mb-2" style={{ fontSize: "1.125rem", fontWeight: 700 }}>
            Delete Alumni Record
          </h3>
          <p className="text-gray-500 text-sm mb-1">
            Are you sure you want to delete the record for:
          </p>
          <p className="text-gray-800 font-semibold mb-4">{record.name}</p>
          <p className="text-red-500 text-xs mb-6">
            This action cannot be undone.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
            >
              <Trash2 size={15} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
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
  const isCompact = useCompactViewport();
  const sectorChartYAxisWidth = isCompact ? 56 : 100;
  const degreeChartYAxisWidth = isCompact ? 72 : 130;
  const pieSliceLabel = isCompact
    ? false
    : ({ name, percent }: { name: string; percent?: number }) =>
        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`;
  const { auth, flash } = usePage<SharedData & { flash?: { success?: string | boolean } }>().props;
  const [tab, setTab] = useState<Tab>("overview");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AlumniRecord | null>(null);
  const [editRecord, setEditRecord] = useState<AlumniRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<AlumniRecord | null>(null);

  // Filters
  const [filterSector, setFilterSector] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    if (!flash?.success) {
      return;
    }

    const message =
      typeof flash.success === 'string'
        ? flash.success
        : 'Changes saved successfully.';

    setSuccessMessage(message);

    const timer = window.setTimeout(() => setSuccessMessage(null), 5000);

    return () => window.clearTimeout(timer);
  }, [flash?.success]);

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
          (r.email ?? '').toLowerCase().includes(q) ||
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

  const navItems: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Home size={18} /> },
    { id: "records", label: "Alumni Records", icon: <List size={18} /> },
    { id: "employment", label: "Employment Analytics", icon: <Briefcase size={18} /> },
    { id: "education", label: "Education Analytics", icon: <GraduationCap size={18} /> },
  ];

  return (
    <>
      <Head title="Admin Dashboard" />
    <motion.div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gray-50">
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
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">CHMSU</p>
            <p className="text-xs text-white/60">Alumni Directory</p>
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
      <div className="flex min-h-screen min-w-0 w-full flex-1 flex-col lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex min-w-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:gap-4 sm:px-6 sm:py-4">
          <button
            type="button"
            className="flex h-10 w-10 flex-shrink-0 touch-manipulation items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-gray-900 sm:text-lg">
              {navItems.find((n) => n.id === tab)?.label}
            </h1>
            <p className="hidden truncate text-xs text-gray-400 sm:block">
              CHMSU Alumni Online Directory — Admin Portal
            </p>
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
        <main className="min-w-0 w-full max-w-full flex-1 space-y-6 overflow-x-hidden p-4 sm:p-6">
          {successMessage && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 shadow-sm"
            >
              <CheckCircle size={18} className="mt-0.5 flex-shrink-0 text-green-600" />
              <p className="flex-1 font-medium">{successMessage}</p>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="rounded-lg p-1 text-green-700 transition-colors hover:bg-green-100"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* ====== OVERVIEW TAB ====== */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className={statGridClass}>
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

              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Alumni by Year Graduated */}
                <div className={panelClass}>
                  <h3 className="mb-4 font-bold text-gray-900">
                    Alumni by Graduation Year
                  </h3>
                  <ChartContainer height={isCompact ? 200 : 220}>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.byYear} margin={{ left: isCompact ? 0 : -20, right: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="year" tick={{ fontSize: isCompact ? 9 : 11 }} />
                      <YAxis tick={{ fontSize: isCompact ? 9 : 11 }} width={isCompact ? 28 : 40} />
                      <Tooltip content={CustomTooltip} />
                      <Bar dataKey="count" name="Alumni" fill={MAROON} radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Employment Status */}
                <div className={panelClass}>
                  <h3 className="mb-4 font-bold text-gray-900">
                    Employment Status
                  </h3>
                  <ChartContainer height={isCompact ? 220 : 240}>
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.empStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={isCompact ? 45 : 55}
                        outerRadius={isCompact ? 72 : 90}
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
                        layout={isCompact ? 'horizontal' : 'horizontal'}
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        formatter={(v) => <span className="text-xs">{v}</span>}
                      />
                    </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              {/* Recent Registrations */}
              <div className={panelClass}>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-bold text-gray-900">
                    Recent Registrations
                  </h3>
                  <button
                    onClick={() => setTab("records")}
                    className="text-[#1A5336] text-sm hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="md:hidden space-y-3">
                  {[...records]
                    .sort(
                      (a, b) =>
                        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                    )
                    .slice(0, 5)
                    .map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRecord(r)}
                        className="w-full rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-left transition-colors hover:bg-gray-50"
                      >
                        <p className="font-semibold text-gray-900 truncate">{r.name}</p>
                        <p className="mt-1 text-xs text-gray-500 truncate">{r.degree || "—"}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
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
                          <span className="text-xs text-gray-400">
                            {new Date(r.submittedAt).toLocaleDateString("en-PH")}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
                <div className="hidden md:block overflow-x-auto">
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
              <div className={panelClass}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-row">
                  <div className="relative sm:col-span-2 lg:col-span-1 lg:flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search alumni records..."
                      className="w-full min-h-11 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 focus:border-[#1A5336] text-base sm:text-sm"
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

              {/* Records: cards on mobile, table on md+ */}
              <div className="space-y-4">
                <div className="md:hidden space-y-3">
                  {paginatedRecords.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center text-sm text-gray-400">
                      No records found.
                    </div>
                  ) : (
                    paginatedRecords.map((r) => (
                      <AlumniRecordCard
                        key={r.id}
                        record={r}
                        onView={() => setSelectedRecord(r)}
                        onEdit={() => setEditRecord(r)}
                        onDelete={() => setDeleteRecord(r)}
                      />
                    ))
                  )}
                </div>

                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedRecord(r)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1A5336]/5 text-[#1A5336] hover:bg-[#1A5336]/10 transition-colors text-xs font-medium"
                                  title="View"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  onClick={() => setEditRecord(r)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
                                  title="Edit"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => setDeleteRecord(r)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-center text-gray-500 text-xs sm:text-left">
                      Page {page} of {totalPages} ({filteredRecords.length} records)
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors touch-manipulation"
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
                            className={`min-h-9 min-w-9 rounded-lg text-xs font-medium transition-colors touch-manipulation ${
                              p === page
                                ? "bg-[#1A5336] text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors touch-manipulation"
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
              <div className={statGridClass}>
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

              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Sector Chart */}
                <div className={panelClass}>
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart2 size={18} className="text-[#1A5336]" />
                    <h3 className="font-bold text-gray-900">
                      Employment by Sector
                    </h3>
                  </div>
                  <ChartContainer height={isCompact ? 220 : 240}>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.bySector} layout="vertical" margin={{ left: 4, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: isCompact ? 9 : 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: isCompact ? 9 : 11 }} width={sectorChartYAxisWidth} />
                      <Tooltip content={CustomTooltip} />
                      <Bar dataKey="value" name="Alumni" radius={[0, 4, 4, 0]}>
                        {analytics.bySector.map((entry, i) => (
                          <Cell key={`emp-sec-cell-${i}-${entry._uid}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Location Chart */}
                <div className={panelClass}>
                  <div className="mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-[#1A5336]" />
                    <h3 className="font-bold text-gray-900">
                      Local vs. Abroad
                    </h3>
                  </div>
                  <ChartContainer height={isCompact ? 220 : 240}>
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.locationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={isCompact ? 50 : 65}
                        outerRadius={isCompact ? 78 : 100}
                        paddingAngle={4}
                        dataKey="value"
                        label={pieSliceLabel}
                        labelLine={!isCompact}
                      >
                        {analytics.locationData.map((entry, i) => (
                          <Cell key={`emp-loc-cell-${i}-${entry._uid}`} fill={[MAROON, "#9333ea"][i]} />
                        ))}
                      </Pie>
                      <Tooltip content={CustomTooltip} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        formatter={(v) => <span className="text-xs">{v}</span>}
                      />
                    </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              {/* Employment Status Breakdown */}
              <div className={panelClass}>
                <h3 className="mb-5 font-bold text-gray-900">
                  Employment Status Breakdown
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4"
                    >
                      <div
                        className="h-8 w-3 flex-shrink-0 rounded-full"
                        style={{ background: item.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                          {item.count}
                        </p>
                        <p className="text-xs text-gray-500 break-words">{item.label}</p>
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
              <div className={statGridClass}>
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

              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {/* By Degree */}
                <div className={panelClass}>
                  <div className="mb-4 flex items-center gap-2">
                    <GraduationCap size={18} className="text-[#1A5336]" />
                    <h3 className="font-bold text-gray-900">
                      Top Degree Programs
                    </h3>
                  </div>
                  <ChartContainer height={isCompact ? 240 : 260}>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.byDegree} layout="vertical" margin={{ left: 4, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: isCompact ? 9 : 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: isCompact ? 8 : 10 }} width={degreeChartYAxisWidth} />
                      <Tooltip content={CustomTooltip} />
                      <Bar dataKey="count" name="Alumni" radius={[0, 4, 4, 0]}>
                        {analytics.byDegree.map((entry, i) => (
                          <Cell key={`edu-deg-cell-${i}-${entry._uid}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Attainment Pie */}
                <div className={panelClass}>
                  <div className="mb-4 flex items-center gap-2">
                    <Award size={18} className="text-[#1A5336]" />
                    <h3 className="font-bold text-gray-900">
                      Highest Educational Attainment
                    </h3>
                  </div>
                  <ChartContainer height={isCompact ? 240 : 260}>
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.byAttainment}
                        cx="50%"
                        cy="50%"
                        innerRadius={isCompact ? 50 : 65}
                        outerRadius={isCompact ? 78 : 100}
                        paddingAngle={4}
                        dataKey="value"
                        label={pieSliceLabel}
                        labelLine={!isCompact}
                      >
                        {analytics.byAttainment.map((entry, i) => (
                          <Cell key={`edu-att-cell-${i}-${entry._uid}`} fill={[MAROON, GOLD, "#9333ea"][i % 3]} />
                        ))}
                      </Pie>
                      <Tooltip content={CustomTooltip} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        formatter={(v) => <span className="text-xs">{v}</span>}
                      />
                    </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              {/* Schools Attended */}
              <div className={panelClass}>
                <h3 className="mb-5 font-bold text-gray-900">
                  Schools Attended by Alumni
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {[
                    { school: 'BCNTS', count: analytics.schoolCounts.BCNTS ?? 0, color: '#1A5336' },
                    { school: 'PSC', count: analytics.schoolCounts.PSC ?? 0, color: '#FFB81C' },
                    { school: 'CHMSC', count: analytics.schoolCounts.CHMSC ?? 0, color: '#2563eb' },
                    { school: 'CHMSU', count: analytics.schoolCounts.CHMSU ?? 0, color: '#16a34a' },
                    { school: 'NOCAT', count: analytics.schoolCounts.NOCAT ?? 0, color: '#9333ea' },
                    { school: 'NOSAT', count: analytics.schoolCounts.NOSAT ?? 0, color: '#ea580c' },
                    { school: 'NOPCC', count: analytics.schoolCounts.NOPCC ?? 0, color: '#0891b2' },
                    { school: 'NOSOF', count: analytics.schoolCounts.NOSOF ?? 0, color: '#4f46e5' },
                  ].map((item) => (
                    <div
                      key={item.school}
                      className="min-w-0 rounded-2xl border-2 p-4 text-center sm:p-6"
                      style={{ borderColor: `${item.color}20`, background: `${item.color}05` }}
                    >
                      <p
                        className="mb-1 text-3xl font-extrabold sm:text-4xl"
                        style={{ color: item.color }}
                      >
                        {item.count}
                      </p>
                      <p className="text-xs font-semibold text-gray-600 sm:text-sm">{item.school}</p>
                      <p className="mt-0.5 text-xs text-gray-400">alumni</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graduation Year Chart */}
              <div className={panelClass}>
                <h3 className="mb-4 font-bold text-gray-900">
                  Alumni by Graduation Year
                </h3>
                <ChartContainer height={isCompact ? 200 : 220}>
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byYear} margin={{ left: isCompact ? 0 : -20, right: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: isCompact ? 9 : 11 }} />
                    <YAxis tick={{ fontSize: isCompact ? 9 : 11 }} width={isCompact ? 28 : 40} />
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="count" name="Graduates" fill={GOLD} radius={[4, 4, 0, 0]} />
                  </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
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

      {/* Edit Modal */}
      {editRecord && (
        <AlumniEditModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteRecord && (
        <DeleteConfirmModal
          record={deleteRecord}
          onClose={() => setDeleteRecord(null)}
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