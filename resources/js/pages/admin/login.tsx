import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { FormEventHandler, useState } from 'react';

import { BrandLogos } from '@/components/brand-logos';
import InputError from '@/components/input-error';
import { FormProtectionFields } from '@/components/form-protection-fields';
import { useFormProtection } from '@/hooks/use-form-protection';

interface LoginProps {
    status?: string;
}

export default function AdminLogin({ status }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { fields: protectionFields } = useFormProtection();
    const { data, setData, post, processing, errors, reset } = useForm({
        ...protectionFields,
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

  return (
    <>
      <Head title="Admin Login" />
    <div className="flex min-h-screen">
      {/* Left Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1A5336] flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          {[400, 300, 200, 120].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/10"
              style={{
                width: size,
                height: size,
                bottom: -size / 4,
                right: -size / 4,
              }}
            />
          ))}
          {[250, 180, 100].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/10"
              style={{
                width: size,
                height: size,
                top: -size / 4,
                left: -size / 4,
              }}
            />
          ))}
        </div>

        {/* Gold accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FFB81C]" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <BrandLogos size="hero" />
          </div>
          <div className="w-16 h-1 bg-[#FFB81C] mx-auto mb-6 rounded-full" />
          <h1 className="text-white mb-4" style={{ fontSize: "1.75rem", fontWeight: 800 }}>
            CHMSU Alumni
          </h1>
          <h2 className="text-white mb-4" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Online Directory
          </h2>
          <p className="text-white/70 max-w-xs leading-relaxed">
            Carlos Hilado Memorial State University — Administrative Portal for Alumni Records
            Management
          </p>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Carlos Hilado Memorial State University
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex lg:hidden items-center justify-center mb-8">
            <BrandLogos size="lg" />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#1A5336] flex items-center justify-center">
                <Shield className="text-white" size={16} />
              </div>
              <span className="text-[#1A5336] text-sm font-semibold uppercase tracking-wider">
                Admin Portal
              </span>
            </div>
            <h2 className="text-gray-900" style={{ fontSize: "1.75rem", fontWeight: 800 }}>
              Welcome back
            </h2>
            <p className="text-gray-500 mt-1">
              Sign in to access the alumni directory management system.
            </p>
          </div>

          {status && (
            <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>
          )}

          {/* Error */}
          {(errors.email || errors.password) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-red-700"
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              <p className="text-sm">Invalid email or password. Please try again.</p>
            </motion.div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <FormProtectionFields />
            {/* Username */}
            <div>
              <label className="mb-2 block text-sm text-gray-700" htmlFor="email">Email</label>
              <div className="relative">
                <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-11 transition-all focus:border-[#1A5336] focus:ring-2 focus:ring-[#1A5336]/30 focus:outline-none"
                  placeholder="Enter email"
                  required
                  autoFocus
                />
              </div>
              <InputError message={errors.email} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]/30 focus:border-[#1A5336] transition-all"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3.5 bg-[#1A5336] text-white rounded-xl hover:bg-[#134026] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Sign In to Admin Portal
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="h-px bg-gray-200 mb-4" />
            <p className="text-xs text-gray-400">
              This portal is for authorized CHMSU staff only.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}