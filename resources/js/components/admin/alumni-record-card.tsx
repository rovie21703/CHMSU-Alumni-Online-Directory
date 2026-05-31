import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

type AlumniRecordListItem = {
    id: string;
    name: string;
    degree: string;
    yearGraduated: string;
    campus: string;
    employmentStatus: string;
    schoolAttended?: string;
};

type AlumniRecordCardProps = {
    record: AlumniRecordListItem;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

function RecordActionButton({
    label,
    onClick,
    className,
    icon,
}: {
    label: string;
    onClick: () => void;
    className: string;
    icon: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${className}`}
        >
            {icon}
            {label}
        </button>
    );
}

export function AlumniRecordCard({ record, onView, onEdit, onDelete }: AlumniRecordCardProps) {
    return (
        <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#1A5336]/10">
                    <span className="text-sm font-bold text-[#1A5336]">{record.name.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold text-gray-900">{record.name}</h4>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                        {record.schoolAttended || 'School not set'}
                        {record.campus ? ` · ${record.campus}` : ''}
                    </p>
                </div>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
                <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Degree / Course</dt>
                    <dd className="mt-0.5 text-gray-700">{record.degree || '—'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Year Graduated</dt>
                        <dd className="mt-0.5 text-gray-700">{record.yearGraduated || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Employment</dt>
                        <dd className="mt-0.5 text-gray-700">{record.employmentStatus || '—'}</dd>
                    </div>
                </div>
            </dl>

            <div className="mt-4 grid grid-cols-3 gap-2">
                <RecordActionButton
                    label="View"
                    onClick={onView}
                    className="bg-[#1A5336]/5 text-[#1A5336] hover:bg-[#1A5336]/10"
                    icon={<Eye size={14} />}
                />
                <RecordActionButton
                    label="Edit"
                    onClick={onEdit}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                    icon={<Pencil size={14} />}
                />
                <RecordActionButton
                    label="Delete"
                    onClick={onDelete}
                    className="bg-red-50 text-red-600 hover:bg-red-100"
                    icon={<Trash2 size={14} />}
                />
            </div>
        </article>
    );
}
