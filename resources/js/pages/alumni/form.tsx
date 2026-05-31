import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ConsentModal } from '@/components/alumni/consent-modal';
import { ChmsuLogo } from '@/components/chmsu-logo';
import { SearchableSelect } from '@/components/searchable-select';
import { CAMPUSES, CAMPUS_SCHOOLS } from '@/data/campus-schools';
import { CAMPUS_PROGRAMS } from '@/data/campus-programs';
import { GRADUATION_YEAR_START, graduationYearOptions } from '@/data/graduation-years';
import { PHILIPPINE_LOCATIONS, PHILIPPINE_PROVINCES } from '@/data/philippine-locations';
import { RELIGIONS, SELECT_OTHERS } from '@/data/religions';
import type { SharedData } from '@/types';

import alumniLogo from '@/assets/images/alumni-logo.jfif';

type FormData = {
  name: string;
  sex: string;
  dateOfBirth: string;
  age: string;
  birthProvince: string;
  birthProvinceOther: string;
  birthCity: string;
  birthCityOther: string;
  mobileNo: string;
  address: string;
  civilStatus: string;
  religion: string;
  religionOther: string;
  email: string;
  yearGraduated: string;
  campus: string;
  degree: string;
  highestAttainment: string;
  eligibility: string;
  employmentStatus: string;
  employmentSector: string;
  presentEmploymentStatus: string;
  occupation: string;
  position: string;
  yearEmployed: string;
  company: string;
  companyAddress: string;
  locationOfEmployment: string;
};

const inputClass =
  "w-full min-h-11 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-base sm:text-sm touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#1A5336]/30 focus:border-[#1A5336] transition-all text-gray-800 placeholder-gray-400";
const selectClass =
  "w-full min-h-11 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-base sm:text-sm touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#1A5336]/30 focus:border-[#1A5336] transition-all text-gray-800 appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed";
const labelClass = "block text-sm text-gray-700 mb-1.5";
const errorClass = "text-red-500 text-xs mt-1";

const STEP_1_FIELDS = [
  "name",
  "sex",
  "civilStatus",
  "dateOfBirth",
  "age",
  "birthProvince",
  "birthCity",
  "religion",
  "mobileNo",
  "email",
  "address",
] as const;

const STEP_2_FIELDS = [
  "campus",
  "yearGraduated",
  "degree",
  "highestAttainment",
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = graduationYearOptions();

function SectionHeader({
  icon,
  title,
  subtitle,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  index: number;
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-2xl bg-[#1A5336] flex items-center justify-center text-white shadow-sm flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#FFB81C] uppercase tracking-wider">
            Section {index}
          </span>
        </div>
        <h2 className="text-gray-900" style={{ fontSize: "1.125rem", fontWeight: 700 }}>
          {title}
        </h2>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

function RadioOption({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${checked
        ? "border-[#1A5336] bg-[#E8F0EC] text-[#1A5336]"
        : "border-gray-200 bg-white text-gray-700 hover:border-[#1A5336]/40"
        }`}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-[#1A5336]" : "border-gray-300"
          }`}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-[#1A5336]" />}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${checked
        ? "border-[#1A5336] bg-[#E8F0EC] text-[#1A5336]"
        : "border-gray-200 bg-white text-gray-700 hover:border-[#1A5336]/40"
        }`}
    >
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-[#1A5336] bg-[#1A5336]" : "border-gray-300"
          }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

export default function AlumniForm() {
  const { flash } = usePage<SharedData & { flash: { success?: boolean } }>().props;
  const [currentStep, setCurrentStep] = useState(1);
  const [showConsent, setShowConsent] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const [submitted, setSubmitted] = useState(Boolean(flash?.success));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [schoolAttended, setSchoolAttended] = useState<string>('');
  const [schoolError, setSchoolError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<FormData>();

  const employmentStatus = watch("employmentStatus");
  const dateOfBirth = watch("dateOfBirth");
  const selectedCampus = watch("campus");
  const birthProvince = watch("birthProvince");
  const birthCity = watch("birthCity");
  const religion = watch("religion");
  const provinceIsOthers = birthProvince === SELECT_OTHERS;
  const cityIsOthers = birthCity === SELECT_OTHERS;
  const religionIsOthers = religion === SELECT_OTHERS;
  const availableCities = birthProvince && !provinceIsOthers
    ? PHILIPPINE_LOCATIONS[birthProvince] ?? []
    : [];

  useEffect(() => {
    if (dateOfBirth) {
      const today = new Date();
      const birth = new Date(dateOfBirth);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      setValue("age", String(age));
    }
  }, [dateOfBirth, setValue]);

  useEffect(() => {
    if (!birthProvince || provinceIsOthers) {
      if (!provinceIsOthers) {
        setValue("birthCity", "");
        setValue("birthCityOther", "");
      }
      return;
    }

    const cities = PHILIPPINE_LOCATIONS[birthProvince] ?? [];
    if (birthCity && birthCity !== SELECT_OTHERS && !cities.includes(birthCity)) {
      setValue("birthCity", "");
      setValue("birthCityOther", "");
    }
  }, [birthProvince, birthCity, provinceIsOthers, setValue]);

  const isEmployed = employmentStatus === "YES";
  const showEmploymentDetails =
    employmentStatus === "YES" || employmentStatus === "BUSINESS OWNER";

  const handleNextStep1 = async () => {
    const fields: Array<keyof FormData> = [...STEP_1_FIELDS];

    if (provinceIsOthers) {
      fields.push('birthProvinceOther', 'birthCityOther');
    } else if (cityIsOthers) {
      fields.push('birthCityOther');
    }

    if (religionIsOthers) {
      fields.push('religionOther');
    }

    const valid = await trigger(fields);
    if (valid) {
      setCurrentStep(2);
    }
  };

  const handleNextStep2 = async () => {
    // Only require school if a campus is selected (it will be, as campus is required)
    if (selectedCampus && !schoolAttended) {
      setSchoolError("School attended is required");
      return;
    }

    setSchoolError("");
    const valid = await trigger([...STEP_2_FIELDS]);
    if (valid) {
      setCurrentStep(3);
    }
  };

  const onSubmit = (data: FormData) => {
    setPendingData(data);
    setShowConsent(true);
  };

  const handleAccept = () => {
    if (!pendingData) {
      return;
    }

    setIsSubmitting(true);
    router.post(
      route('alumni.store'),
      {
        ...pendingData,
        schoolAttended,
        consentGiven: true,
      },
      {
        onSuccess: () => {
          setShowConsent(false);
          setSubmitted(true);
          reset();
          setSchoolAttended('');
          setSchoolError('');
          setCurrentStep(1);
        },
        onFinish: () => setIsSubmitting(false),
      },
    );
  };

  const handleDisagree = () => {
    setShowConsent(false);
  };

  if (submitted) {
    return (
      <>
        <Head title="Registration Successful" />
        <motion.div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-[#1A5336] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle className="text-white" size={36} />
            </div>
            <div className="w-16 h-1 bg-[#FFB81C] rounded-full mx-auto mb-6" />
            <h2 className="text-gray-900 mb-3" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              Registration Successful!
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Thank you for registering in the CHMSU Alumni Online Directory. Your information has
              been recorded successfully.
            </p>
            <div className="mx-auto mb-4 flex justify-center gap-3">
              <ChmsuLogo className="w-20 h-20 object-contain rounded-full" />
              <img src={alumniLogo} alt="Alumni Logo" className="w-20 h-20 object-contain rounded-full" />
            </div>
            <p className="text-[#1A5336] text-sm font-semibold">
              Carlos Hilado Memorial State University
            </p>
            <button
              onClick={() => {
                reset();
                setCurrentStep(1);
                setSchoolAttended("");
                setSchoolError("");
                setSubmitted(false);
                setPendingData(null);
              }}
              className="mt-6 px-8 py-3 bg-[#1A5336] text-white rounded-xl hover:bg-[#134026] transition-colors shadow-sm"
            >
              Register Another Alumni
            </button>
          </motion.div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <Head title="Alumni Registration" />
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-[#1A5336] border-b-4 border-[#FFB81C]" style={{ boxShadow: "inset 0 -8px 0 -4px #0033A0" }}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 min-w-0">
            <div className="flex flex-shrink-0 items-center gap-2">
              <ChmsuLogo className="w-10 h-10 object-contain rounded-full bg-white p-0.5" />
              <img src={alumniLogo} alt="Alumni Logo" className="w-10 h-10 object-contain rounded-full bg-white p-0.5" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold leading-tight truncate">CHMSU Alumni Online Directory</p>
              <p className="text-white/70 text-xs leading-tight truncate">Carlos Hilado Memorial State University</p>
            </div>
          </div>
        </nav>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* ======= PERSONAL INFORMATION ======= */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8"
              >
                <SectionHeader
                  icon={<User size={22} />}
                  title="Personal Information"
                  subtitle="Provide your personal and contact details"
                  index={1}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <User size={13} className="text-[#1A5336]" />
                        Full Name <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      {...register("name", {
                        required: "Full name is required",
                        pattern: {
                          value: /^[A-Za-z\s.,-]+$/,
                          message: "Name should contain letters only"
                        }
                      })}
                      className={inputClass}
                      placeholder="E.G. JUAN DELA CRUZ"
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                        setValue("name", e.target.value);
                      }}
                    />
                    {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                  </div>

                  {/* Sex */}
                  <div>
                    <label className={labelClass}>
                      Sex <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {["MALE", "FEMALE"].map((s) => (
                        <RadioOption
                          key={s}
                          name="sex"
                          value={s}
                          label={s}
                          checked={watch("sex") === s}
                          onChange={() => setValue("sex", s)}
                        />
                      ))}
                    </div>
                    <input type="hidden" {...register("sex", { required: "Sex is required" })} />
                    {errors.sex && <p className={errorClass}>{errors.sex.message}</p>}
                  </div>

                  {/* Civil Status */}
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        Civil Status <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        {...register("civilStatus", { required: "Civil status is required" })}
                        className={selectClass}
                      >
                        <option value="">SELECT CIVIL STATUS</option>
                        {["SINGLE", "MARRIED", "WIDOWED", "SEPARATED", "ANNULLED"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                    {errors.civilStatus && <p className={errorClass}>{errors.civilStatus.message}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#1A5336]" />
                        Date of Birth <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      type="date"
                      {...register("dateOfBirth", { required: "Date of birth is required" })}
                      className={inputClass}
                    />
                    {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth.message}</p>}
                  </div>

                  {/* Age */}
                  <div>
                    <label className={labelClass}>Age</label>
                    <input
                      type="number"
                      {...register("age", { required: "Age is required" })}
                      className={`${inputClass} bg-gray-50`}
                      placeholder="Auto-calculated"
                      readOnly
                    />
                    {errors.age && <p className={errorClass}>{errors.age.message}</p>}
                  </div>

                  {/* Place of Birth */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#1A5336]" />
                        Place of Birth <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mb-3">Select province first to load cities and municipalities.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>
                          1. Province <span className="text-red-500">*</span>
                        </label>
                        <input type="hidden" {...register("birthProvince", { required: "Province is required" })} />
                        <SearchableSelect
                          value={birthProvince}
                          onChange={(value) => {
                            setValue("birthProvince", value, { shouldValidate: true });
                            if (value === SELECT_OTHERS) {
                              setValue("birthCity", SELECT_OTHERS);
                            } else {
                              setValue("birthCity", "");
                            }
                            setValue("birthCityOther", "");
                            setValue("birthProvinceOther", "");
                          }}
                          options={PHILIPPINE_PROVINCES}
                          placeholder="SELECT PROVINCE"
                          error={errors.birthProvince?.message}
                          triggerClassName={selectClass.replace('appearance-none cursor-pointer', '')}
                        />
                        {provinceIsOthers && (
                          <input
                            {...register("birthProvinceOther", {
                              required: "Please specify your province",
                            })}
                            className={`${inputClass} mt-2`}
                            placeholder="SPECIFY PROVINCE"
                            onChange={(e) => {
                              e.target.value = e.target.value.toUpperCase();
                              setValue("birthProvinceOther", e.target.value, { shouldValidate: true });
                            }}
                          />
                        )}
                        {errors.birthProvinceOther && (
                          <p className={errorClass}>{errors.birthProvinceOther.message}</p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          2. City / Municipality <span className="text-red-500">*</span>
                        </label>
                        <input type="hidden" {...register("birthCity", { required: "City / municipality is required" })} />
                        {provinceIsOthers ? (
                          <input
                            {...register("birthCityOther", {
                              required: "Please specify your city / municipality",
                            })}
                            className={inputClass}
                            placeholder="SPECIFY CITY / MUNICIPALITY"
                            onChange={(e) => {
                              e.target.value = e.target.value.toUpperCase();
                              setValue("birthCityOther", e.target.value, { shouldValidate: true });
                              setValue("birthCity", SELECT_OTHERS);
                            }}
                          />
                        ) : (
                          <>
                            <SearchableSelect
                              value={birthCity}
                              onChange={(value) => {
                                setValue("birthCity", value, { shouldValidate: true });
                                setValue("birthCityOther", "");
                              }}
                              options={availableCities}
                              placeholder={birthProvince ? "SELECT CITY / MUNICIPALITY" : "SELECT PROVINCE FIRST"}
                              disabled={!birthProvince}
                              error={errors.birthCity?.message}
                              triggerClassName={selectClass.replace('appearance-none cursor-pointer', '')}
                            />
                            {cityIsOthers && (
                              <input
                                {...register("birthCityOther", {
                                  required: "Please specify your city / municipality",
                                })}
                                className={`${inputClass} mt-2`}
                                placeholder="SPECIFY CITY / MUNICIPALITY"
                                onChange={(e) => {
                                  e.target.value = e.target.value.toUpperCase();
                                  setValue("birthCityOther", e.target.value, { shouldValidate: true });
                                }}
                              />
                            )}
                          </>
                        )}
                        {errors.birthCityOther && (
                          <p className={errorClass}>{errors.birthCityOther.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile No */}
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-[#1A5336]" />
                        Mobile No. <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      type="tel"
                      {...register("mobileNo", {
                        required: "Mobile number is required",
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Mobile number should contain numbers only"
                        },
                        maxLength: {
                          value: 12,
                          message: "Mobile number should not exceed 12 digits"
                        }
                      })}
                      className={inputClass}
                      placeholder="E.G. 09xxxxxxxxx"
                      maxLength={12}
                      onChange={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        setValue("mobileNo", e.target.value);
                      }}
                    />
                    {errors.mobileNo && <p className={errorClass}>{errors.mobileNo.message}</p>}
                  </div>

                  {/* Religion */}
                  <div>
                    <label className={labelClass}>
                      Religion <span className="text-red-500">*</span>
                    </label>
                    <input type="hidden" {...register("religion", { required: "Religion is required" })} />
                    <SearchableSelect
                      value={religion}
                      onChange={(value) => {
                        setValue("religion", value, { shouldValidate: true });
                        setValue("religionOther", "");
                      }}
                      options={RELIGIONS}
                      placeholder="SELECT RELIGION"
                      error={errors.religion?.message}
                      triggerClassName={selectClass.replace('appearance-none cursor-pointer', '')}
                    />
                    {religionIsOthers && (
                      <input
                        {...register("religionOther", {
                          required: "Please specify your religion",
                        })}
                        className={`${inputClass} mt-2`}
                        placeholder="SPECIFY RELIGION"
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                          setValue("religionOther", e.target.value, { shouldValidate: true });
                        }}
                      />
                    )}
                    {errors.religionOther && (
                      <p className={errorClass}>{errors.religionOther.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} className="text-[#1A5336]" />
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        validate: (value) =>
                          !value || /^\S+@\S+$/i.test(value) || "Invalid email",
                      })}
                      className={inputClass}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#1A5336]" />
                        Present Address <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <textarea
                      {...register("address", { required: "Address is required" })}
                      className={`${inputClass} resize-none`}
                      rows={2}
                      placeholder="STREET, BARANGAY, CITY/MUNICIPALITY, PROVINCE"
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                        setValue("address", e.target.value);
                      }}
                    />
                    {errors.address && <p className={errorClass}>{errors.address.message}</p>}
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    className="w-full sm:w-auto px-8 py-3 bg-[#1A5336] text-white rounded-xl hover:bg-[#134026] transition-colors shadow-sm font-medium"
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======= EDUCATIONAL DETAILS ======= */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8"
              >
                <SectionHeader
                  icon={<GraduationCap size={22} />}
                  title="Educational Details"
                  subtitle="Provide your academic background and qualifications"
                  index={2}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Campus */}
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-[#1A5336]" />
                        Campus <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        {...register("campus", { required: "Campus is required" })}
                        className={selectClass}
                        onChange={(e) => {
                          setValue("campus", e.target.value);
                          setSchoolAttended("");
                          setValue("degree", "");
                        }}
                      >
                        <option value="">SELECT CAMPUS</option>
                        {CAMPUSES.map((campus) => (
                          <option key={campus} value={campus}>
                            {campus}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                    {errors.campus && <p className={errorClass}>{errors.campus.message}</p>}
                  </div>

                  {/* Year Graduated */}
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#1A5336]" />
                        Year Graduated <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={GRADUATION_YEAR_START}
                      max={CURRENT_YEAR}
                      {...register("yearGraduated", {
                        required: "Year graduated is required",
                        min: {
                          value: GRADUATION_YEAR_START,
                          message: `Year must be ${GRADUATION_YEAR_START} or later`,
                        },
                        max: {
                          value: CURRENT_YEAR,
                          message: `Year cannot be later than ${CURRENT_YEAR}`,
                        },
                        validate: (value) =>
                          /^\d{4}$/.test(String(value)) || "Enter a 4-digit year",
                      })}
                      className={inputClass}
                      placeholder="E.G. 2024"
                    />
                    {errors.yearGraduated && (
                      <p className={errorClass}>{errors.yearGraduated.message}</p>
                    )}
                  </div>
                </div>

                {/* School Attended */}
                {selectedCampus && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      School Attended <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {(CAMPUS_SCHOOLS[selectedCampus] ?? []).map((s) => (
                          <RadioOption
                            key={s}
                            name="schoolAttended"
                            value={s}
                            label={s}
                            checked={schoolAttended === s}
                            onChange={() => {
                              setSchoolAttended(s);
                              setSchoolError("");
                              setValue("degree", "");
                            }}
                          />
                        ))}
                    </div>
                    {schoolError && <p className={`${errorClass} mt-2`}>{schoolError}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Replaced by above */}

                  {/* Degree */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Degree / Course <span className="text-red-500">*</span>
                    </label>
                    {schoolAttended === "CHMSU" ? (
                      <div className="relative">
                        <select
                          {...register("degree", { required: "Degree is required" })}
                          className={selectClass}
                          disabled={!selectedCampus}
                        >
                          <option value="">
                            {selectedCampus ? "SELECT DEGREE / COURSE" : "PLEASE SELECT A CAMPUS FIRST"}
                          </option>
                          {selectedCampus &&
                            CAMPUS_PROGRAMS[selectedCampus]?.map((program) => (
                              <option key={program} value={program}>
                                {program}
                              </option>
                            ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    ) : (
                      <input
                        {...register("degree", { required: "Degree is required" })}
                        className={inputClass}
                        placeholder="E.G. BACHELOR OF SCIENCE IN INFORMATION SYSTEMS"
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                          setValue("degree", e.target.value);
                        }}
                      />
                    )}
                    {errors.degree && <p className={errorClass}>{errors.degree.message}</p>}
                  </div>

                  {/* Highest Educational Attainment */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <Award size={13} className="text-[#1A5336]" />
                        Highest Educational Attainment <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["MASTER", "DOCTORATE", "N/A"].map((a) => (
                        <RadioOption
                          key={a}
                          name="highestAttainment"
                          value={a}
                          label={a}
                          checked={watch("highestAttainment") === a}
                          onChange={() => setValue("highestAttainment", a)}
                        />
                      ))}
                    </div>
                    <input
                      type="hidden"
                      {...register("highestAttainment", {
                        required: "Highest attainment is required",
                      })}
                    />
                    {errors.highestAttainment && (
                      <p className={errorClass}>{errors.highestAttainment.message}</p>
                    )}
                  </div>

                  {/* Eligibility */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Eligibility / Licensure Examination</label>
                    <input
                      {...register("eligibility")}
                      className={inputClass}
                      placeholder="E.G. PRC BOARD PASSER, CSC CAREER SERVICE PROFESSIONAL, N/A"
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                        setValue("eligibility", e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors shadow-sm font-medium"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep2}
                    className="w-full sm:w-auto px-8 py-3 bg-[#1A5336] text-white rounded-xl hover:bg-[#134026] transition-colors shadow-sm font-medium"
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======= EMPLOYMENT DATA ======= */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8"
              >
                <SectionHeader
                  icon={<Briefcase size={22} />}
                  title="Employment Data"
                  subtitle="Provide your current employment status and details"
                  index={3}
                />

                {/* Employment Status */}
                <div className="mb-6">
                  <label className={labelClass}>
                    Are you presently employed? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["YES", "NO", "BUSINESS OWNER", "RETIRED"].map((s) => (
                      <RadioOption
                        key={s}
                        name="employmentStatus"
                        value={s}
                        label={s}
                        checked={watch("employmentStatus") === s}
                        onChange={() => setValue("employmentStatus", s)}
                      />
                    ))}
                  </div>
                  <input
                    type="hidden"
                    {...register("employmentStatus", { required: "Employment status is required" })}
                  />
                  {errors.employmentStatus && (
                    <p className={errorClass}>{errors.employmentStatus.message}</p>
                  )}
                </div>

                {/* Conditional Employment Fields */}
                {showEmploymentDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {employmentStatus === "BUSINESS OWNER" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Business Owner simplified fields */}
                        <div>
                          <label className={labelClass}>Company / Business Name <span className="text-red-500">*</span></label>
                          <input
                            {...register("company", { required: "Company name is required" })}
                            className={inputClass}
                            placeholder="E.G. DELA CRUZ ENTERPRISES"
                            onChange={(e) => {
                              e.target.value = e.target.value.toUpperCase();
                              setValue("company", e.target.value);
                            }}
                          />
                          {errors.company && <p className={errorClass}>{errors.company.message}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Company / Business Address <span className="text-red-500">*</span></label>
                          <input
                            {...register("companyAddress", { required: "Company address is required" })}
                            className={inputClass}
                            placeholder="E.G. 123 BUSINESS ST., BACOLOD CITY"
                            onChange={(e) => {
                              e.target.value = e.target.value.toUpperCase();
                              setValue("companyAddress", e.target.value);
                            }}
                          />
                          {errors.companyAddress && <p className={errorClass}>{errors.companyAddress.message}</p>}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Employment Sector */}
                        {isEmployed && (
                          <div>
                            <label className={labelClass}>
                              Employment Sector <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                              {[
                                "GOVERNMENT",
                                "PRIVATE",
                                "ENGAGED IN ENTREPRENEURIAL / FREELANCE WORK",
                              ].map((s) => (
                                <RadioOption
                                  key={s}
                                  name="employmentSector"
                                  value={s}
                                  label={s}
                                  checked={watch("employmentSector") === s}
                                  onChange={() => setValue("employmentSector", s)}
                                />
                              ))}
                            </div>
                            <input
                              type="hidden"
                              {...register("employmentSector", {
                                required: isEmployed ? "Employment sector is required" : false,
                              })}
                            />
                            {errors.employmentSector && (
                              <p className={errorClass}>{errors.employmentSector.message}</p>
                            )}
                          </div>
                        )}

                        {/* Present Employment Status */}
                        <div>
                          <label className={labelClass}>
                            Present Employment Status <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-wrap gap-3">
                            {["REGULAR", "PROBATIONARY", "CASUAL", "JOB ORDER", "SELF-EMPLOYED"].map(
                              (s) => (
                                <RadioOption
                                  key={s}
                                  name="presentEmploymentStatus"
                                  value={s}
                                  label={s}
                                  checked={watch("presentEmploymentStatus") === s}
                                  onChange={() => setValue("presentEmploymentStatus", s)}
                                />
                              )
                            )}
                          </div>
                          <input
                            type="hidden"
                            {...register("presentEmploymentStatus", {
                              required: showEmploymentDetails ? "Employment status is required" : false,
                            })}
                          />
                          {errors.presentEmploymentStatus && (
                            <p className={errorClass}>{errors.presentEmploymentStatus.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Present Occupation */}
                          <div>
                            <label className={labelClass}>Present Occupation</label>
                            <input
                              {...register("occupation")}
                              className={inputClass}
                              placeholder="E.G. NURSE, TEACHER, ENGINEER"
                              onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                                setValue("occupation", e.target.value);
                              }}
                            />
                          </div>

                          {/* Position */}
                          <div>
                            <label className={labelClass}>Position / Designation</label>
                            <input
                              {...register("position")}
                              className={inputClass}
                              placeholder="E.G. STAFF NURSE, TEACHER I"
                              onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                                setValue("position", e.target.value);
                              }}
                            />
                          </div>

                          {/* Year Employed */}
                          <div>
                            <label className={labelClass}>Year Employed</label>
                            <div className="relative">
                              <select {...register("yearEmployed")} className={selectClass}>
                                <option value="">SELECT YEAR</option>
                                {YEAR_OPTIONS.map((y) => (
                                  <option key={y} value={String(y)}>
                                    {y}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={16}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                              />
                            </div>
                          </div>

                          {/* Location of Employment */}
                          <div>
                            <label className={labelClass}>Location of Employment</label>
                            <div className="flex flex-col gap-2">
                              {[
                                "EMPLOYED LOCALLY, INCLUDING THOSE WITH FOREIGN EMPLOYERS IN THE PHILIPPINES",
                                "EMPLOYED ABROAD",
                              ].map((loc) => (
                                <RadioOption
                                  key={loc}
                                  name="locationOfEmployment"
                                  value={loc}
                                  label={
                                    loc === "EMPLOYED ABROAD"
                                      ? "EMPLOYED ABROAD"
                                      : "EMPLOYED LOCALLY (INCL. FOREIGN EMPLOYERS IN PH)"
                                  }
                                  checked={watch("locationOfEmployment") === loc}
                                  onChange={() => setValue("locationOfEmployment", loc)}
                                />
                              ))}
                            </div>
                            <input type="hidden" {...register("locationOfEmployment")} />
                          </div>

                          {/* Company */}
                          <div className="md:col-span-2">
                            <label className={labelClass}>Name of Company / Organization</label>
                            <input
                              {...register("company")}
                              className={inputClass}
                              placeholder="COMPANY NAME"
                              onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                                setValue("company", e.target.value);
                              }}
                            />
                          </div>

                          {/* Company Address */}
                          <div className="md:col-span-2">
                            <label className={labelClass}>Company / Organization Address</label>
                            <textarea
                              {...register("companyAddress")}
                              className={`${inputClass} resize-none`}
                              rows={2}
                              placeholder="COMPLETE ADDRESS"
                              onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                                setValue("companyAddress", e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors shadow-sm font-medium w-full sm:w-auto"
                  >
                    ← Previous
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3 bg-[#1A5336] text-white rounded-xl hover:bg-[#134026] transition-colors shadow-sm flex items-center gap-3 w-full sm:w-auto justify-center"
                  >
                    <CheckCircle size={20} />
                    Submit Registration
                  </button>
                </div>
                <p className="text-gray-500 text-xs text-center mt-4">
                  By clicking Submit, a data privacy consent form will appear for your review.
                </p>
              </motion.div>
            )}
          </form>

          {/* Footer */}
          <div className="text-center mt-12 pb-8">
            <div className="w-16 h-px bg-[#FFB81C] mx-auto mb-4" />
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Carlos Hilado Memorial State University. All rights
              reserved.
            </p>
          </div>
        </div>

        {/* Consent Modal */}
        {showConsent && (
          <ConsentModal onAccept={handleAccept} onDisagree={handleDisagree} isSubmitting={isSubmitting} />
        )}
      </div>
    </>
  );
}