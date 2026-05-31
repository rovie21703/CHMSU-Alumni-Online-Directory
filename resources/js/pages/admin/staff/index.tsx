import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Shield, Trash2, UserCog } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { FormProtectionFields } from '@/components/form-protection-fields';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useFormProtection } from '@/hooks/use-form-protection';
import type { SharedData } from '@/types';

const MAROON = '#1A5336';

type StaffMember = {
    id: number;
    name: string;
    email: string;
    campusId: number | null;
    campusName: string | null;
    createdAt: string | null;
};

type CampusOption = {
    id: number;
    name: string;
};

type StaffIndexProps = {
    staff: StaffMember[];
    campuses: CampusOption[];
};

type StaffFormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    campus_id: string;
};

const emptyForm: StaffFormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    campus_id: '',
};

export default function StaffIndex({ staff, campuses }: StaffIndexProps) {
    const { flash } = usePage<SharedData & { flash?: { success?: string } }>().props;
    const { fields: protectionFields, merge: mergeFormProtection } = useFormProtection();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

    const form = useForm<StaffFormData>({ ...protectionFields, ...emptyForm });

    const openCreate = () => {
        setEditingStaff(null);
        form.clearErrors();
        form.setData(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (member: StaffMember) => {
        setEditingStaff(member);
        form.clearErrors();
        form.setData({
            name: member.name,
            email: member.email,
            password: '',
            password_confirmation: '',
            campus_id: member.campusId ? String(member.campusId) : '',
        });
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingStaff(null);
        form.reset();
        form.clearErrors();
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        const payload = mergeFormProtection({
            ...form.data,
            campus_id: Number(form.data.campus_id),
        });

        if (editingStaff) {
            router.put(route('admin.staff.update', editingStaff.id), payload, {
                preserveScroll: true,
                onSuccess: () => closeDialog(),
            });
            return;
        }

        router.post(route('admin.staff.store'), payload, {
            preserveScroll: true,
            onSuccess: () => closeDialog(),
        });
    };

    const confirmDelete = () => {
        if (!deletingStaff) {
            return;
        }

        router.delete(route('admin.staff.destroy', deletingStaff.id), {
            data: mergeFormProtection({}),
            preserveScroll: true,
            onSuccess: () => setDeletingStaff(null),
        });
    };

    return (
        <>
            <Head title="Staff Management" />
            <div className="min-h-screen bg-gray-50">
                <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                    <div className="mx-auto flex max-w-6xl items-center gap-4">
                        <Link
                            href={route('admin.dashboard')}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#1A5336]"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </Link>
                        <div className="ml-auto flex items-center gap-2 rounded-full border border-[#1A5336]/20 bg-[#1A5336]/5 px-3 py-1.5">
                            <Shield size={14} className="text-[#1A5336]" />
                            <span className="text-xs font-medium text-[#1A5336]">Admin Only</span>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl space-y-6 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                                <UserCog className="text-[#1A5336]" size={24} />
                                Staff Management
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Create and manage staff accounts assigned to a campus.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                            style={{ background: MAROON }}
                        >
                            <Plus size={16} />
                            Add Staff
                        </button>
                    </div>

                    {flash?.success && (
                        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            Campus
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {staff.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                                                No staff members yet. Add your first staff account.
                                            </td>
                                        </tr>
                                    ) : (
                                        staff.map((member) => (
                                            <tr key={member.id} className="hover:bg-[#FFF9F5]">
                                                <td className="px-4 py-3 font-medium text-gray-800">{member.name}</td>
                                                <td className="px-4 py-3 text-gray-600">{member.email}</td>
                                                <td className="px-4 py-3 text-gray-600">{member.campusName ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(member)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-[#1A5336]/5 px-3 py-1.5 text-xs font-medium text-[#1A5336] hover:bg-[#1A5336]/10"
                                                        >
                                                            <Pencil size={13} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingStaff(member)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                                                        >
                                                            <Trash2 size={13} />
                                                            Delete
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
                </main>

                <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
                            <DialogDescription>
                                {editingStaff
                                    ? 'Update account details. Leave password blank to keep the current password.'
                                    : 'Create a new staff account with email, password, and campus assignment.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={submit} className="space-y-4">
                            <FormProtectionFields />
                            <div>
                                <Label htmlFor="name">Full name</Label>
                                <input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                                    required
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                                    required
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div>
                                <Label htmlFor="campus_id">Campus</Label>
                                <select
                                    id="campus_id"
                                    value={form.data.campus_id}
                                    onChange={(event) => form.setData('campus_id', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                                    required
                                >
                                    <option value="">Select campus</option>
                                    {campuses.map((campus) => (
                                        <option key={campus.id} value={campus.id}>
                                            {campus.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.campus_id} />
                            </div>

                            <div>
                                <Label htmlFor="password">
                                    Password{editingStaff ? ' (optional)' : ''}
                                </Label>
                                <input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(event) => form.setData('password', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                                    required={!editingStaff}
                                />
                                <InputError message={form.errors.password} />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(event) => form.setData('password_confirmation', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                                    required={!editingStaff || form.data.password.length > 0}
                                />
                                <InputError message={form.errors.password_confirmation} />
                            </div>

                            <DialogFooter>
                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                                    style={{ background: MAROON }}
                                >
                                    {editingStaff ? 'Save changes' : 'Create staff'}
                                </button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={deletingStaff !== null} onOpenChange={(open) => !open && setDeletingStaff(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete staff member</DialogTitle>
                            <DialogDescription>
                                Remove <strong>{deletingStaff?.name}</strong>? This cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setDeletingStaff(null)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

