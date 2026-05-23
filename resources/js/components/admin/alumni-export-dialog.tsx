import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { AlumniExportFormState, ExportOptions } from '@/types/export';

const MAROON = '#1A5336';

type AlumniExportDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exportOptions: ExportOptions;
};

function appendArrayParams(params: URLSearchParams, key: string, values: (string | number)[]): void {
    values.forEach((value) => params.append(`${key}[]`, String(value)));
}

export function buildAlumniExportUrl(form: AlumniExportFormState): string {
    const params = new URLSearchParams();

    appendArrayParams(params, 'columns', form.columns);

    if (form.submittedFrom) {
        params.set('submitted_from', form.submittedFrom);
    }
    if (form.submittedTo) {
        params.set('submitted_to', form.submittedTo);
    }
    if (form.yearGraduatedFrom) {
        params.set('year_graduated_from', form.yearGraduatedFrom);
    }
    if (form.yearGraduatedTo) {
        params.set('year_graduated_to', form.yearGraduatedTo);
    }
    if (form.location) {
        params.set('location', form.location);
    }

    appendArrayParams(params, 'school_ids', form.schoolIds);
    appendArrayParams(params, 'program_ids', form.programIds);
    appendArrayParams(params, 'campus_ids', form.campusIds);
    appendArrayParams(params, 'employment_status', form.employmentStatus);
    appendArrayParams(params, 'employment_sector', form.employmentSector);
    appendArrayParams(params, 'present_employment_status', form.presentEmploymentStatus);
    appendArrayParams(params, 'highest_attainment', form.highestAttainment);
    appendArrayParams(params, 'sex', form.sex);
    appendArrayParams(params, 'birth_province_ids', form.birthProvinceIds);

    return `${route('admin.alumni.export')}?${params.toString()}`;
}

function createInitialForm(exportOptions: ExportOptions): AlumniExportFormState {
    return {
        columns: [...exportOptions.defaultColumns],
        submittedFrom: '',
        submittedTo: '',
        yearGraduatedFrom: '',
        yearGraduatedTo: '',
        schoolIds: [],
        programIds: [],
        campusIds: [],
        employmentStatus: [],
        employmentSector: [],
        presentEmploymentStatus: [],
        highestAttainment: [],
        sex: [],
        birthProvinceIds: [],
        location: '',
    };
}

function ChipMultiSelect({
    label,
    values,
    options,
    onChange,
}: {
    label: string;
    values: string[];
    options: string[];
    onChange: (values: string[]) => void;
}) {
    if (options.length === 0) {
        return null;
    }

    const toggle = (option: string) => {
        onChange(values.includes(option) ? values.filter((value) => value !== option) : [...values, option]);
    };

    return (
        <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</legend>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const selected = values.includes(option);
                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => toggle(option)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                selected
                                    ? 'border-[#1A5336] bg-[#1A5336] text-white'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#1A5336]/40'
                            }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}

function IdCheckboxList({
    label,
    values,
    options,
    onChange,
}: {
    label: string;
    values: number[];
    options: { id: number; label: string }[];
    onChange: (values: number[]) => void;
}) {
    if (options.length === 0) {
        return null;
    }

    const toggle = (id: number) => {
        onChange(values.includes(id) ? values.filter((value) => value !== id) : [...values, id]);
    };

    return (
        <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</legend>
            <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-gray-100 p-2">
                {options.map((option) => {
                    const selected = values.includes(option.id);
                    return (
                        <label
                            key={option.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                                selected ? 'bg-[#1A5336]/10 text-[#1A5336]' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Checkbox checked={selected} onCheckedChange={() => toggle(option.id)} />
                            <span className="truncate">{option.label}</span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}

export function AlumniExportDialog({ open, onOpenChange, exportOptions }: AlumniExportDialogProps) {
    const [form, setForm] = useState<AlumniExportFormState>(() => createInitialForm(exportOptions));
    const [error, setError] = useState<string | null>(null);

    const columnsByGroup = useMemo(() => {
        const groups: Record<string, typeof exportOptions.columns> = {};
        exportOptions.columns.forEach((column) => {
            groups[column.group] ??= [];
            groups[column.group].push(column);
        });
        return groups;
    }, [exportOptions.columns]);

    const programOptions = useMemo(() => {
        const selectedCampuses =
            form.campusIds.length > 0
                ? exportOptions.campuses.filter((campus) => form.campusIds.includes(campus.id))
                : exportOptions.campuses;

        return selectedCampuses.flatMap((campus) =>
            campus.programs.map((program) => ({
                id: program.id,
                label: `${program.name} (${campus.name})`,
            })),
        );
    }, [exportOptions.campuses, form.campusIds]);

    const updateForm = <K extends keyof AlumniExportFormState>(key: K, value: AlumniExportFormState[K]) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const toggleColumn = (key: string) => {
        updateForm(
            'columns',
            form.columns.includes(key) ? form.columns.filter((column) => column !== key) : [...form.columns, key],
        );
    };

    const toggleGroupColumns = (group: string, selectAll: boolean) => {
        const groupKeys = exportOptions.columns.filter((column) => column.group === group).map((column) => column.key);
        if (selectAll) {
            updateForm('columns', [...new Set([...form.columns, ...groupKeys])]);
            return;
        }
        updateForm(
            'columns',
            form.columns.filter((column) => !groupKeys.includes(column)),
        );
    };

    const handleExport = () => {
        if (form.columns.length === 0) {
            setError('Select at least one column to export.');
            return;
        }

        setError(null);
        window.location.href = buildAlumniExportUrl(form);
        onOpenChange(false);
    };

    const resetForm = () => {
        setForm(createInitialForm(exportOptions));
        setError(null);
    };

    const { filterValues } = exportOptions;

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    resetForm();
                }
                onOpenChange(nextOpen);
            }}
        >
            <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
                <DialogHeader className="border-b border-gray-100 px-6 py-4 text-left">
                    <DialogTitle className="text-[#1A5336]">Export Alumni Records</DialogTitle>
                    <DialogDescription>
                        Choose filters and columns for your Excel export. Leave filters empty to include all records.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-800">Filter records</h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="submitted_from" className="text-xs text-gray-500">
                                    Submitted from
                                </Label>
                                <input
                                    id="submitted_from"
                                    type="date"
                                    min={filterValues.submittedAt.min ?? undefined}
                                    max={filterValues.submittedAt.max ?? undefined}
                                    value={form.submittedFrom}
                                    onChange={(event) => updateForm('submittedFrom', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                                />
                            </div>
                            <div>
                                <Label htmlFor="submitted_to" className="text-xs text-gray-500">
                                    Submitted to
                                </Label>
                                <input
                                    id="submitted_to"
                                    type="date"
                                    min={form.submittedFrom || filterValues.submittedAt.min || undefined}
                                    max={filterValues.submittedAt.max ?? undefined}
                                    value={form.submittedTo}
                                    onChange={(event) => updateForm('submittedTo', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                                />
                            </div>
                            <div>
                                <Label htmlFor="year_from" className="text-xs text-gray-500">
                                    Year graduated from
                                </Label>
                                <input
                                    id="year_from"
                                    type="number"
                                    min={filterValues.yearGraduated.min}
                                    max={filterValues.yearGraduated.max}
                                    value={form.yearGraduatedFrom}
                                    onChange={(event) => updateForm('yearGraduatedFrom', event.target.value)}
                                    placeholder={String(filterValues.yearGraduated.min)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                                />
                            </div>
                            <div>
                                <Label htmlFor="year_to" className="text-xs text-gray-500">
                                    Year graduated to
                                </Label>
                                <input
                                    id="year_to"
                                    type="number"
                                    min={form.yearGraduatedFrom || filterValues.yearGraduated.min}
                                    max={filterValues.yearGraduated.max}
                                    value={form.yearGraduatedTo}
                                    onChange={(event) => updateForm('yearGraduatedTo', event.target.value)}
                                    placeholder={String(filterValues.yearGraduated.max)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                                />
                            </div>
                        </div>

                        <IdCheckboxList
                            label="School attended"
                            values={form.schoolIds}
                            options={exportOptions.schools.map((school) => ({
                                id: school.id,
                                label: `${school.code} — ${school.name}`,
                            }))}
                            onChange={(schoolIds) => updateForm('schoolIds', schoolIds)}
                        />

                        <IdCheckboxList
                            label="Campus"
                            values={form.campusIds}
                            options={exportOptions.campuses.map((campus) => ({ id: campus.id, label: campus.name }))}
                            onChange={(campusIds) => {
                                updateForm('campusIds', campusIds);
                                if (form.programIds.length > 0) {
                                    const allowedProgramIds = exportOptions.campuses
                                        .filter((campus) => campusIds.includes(campus.id))
                                        .flatMap((campus) => campus.programs.map((program) => program.id));
                                    updateForm(
                                        'programIds',
                                        campusIds.length === 0
                                            ? form.programIds
                                            : form.programIds.filter((id) => allowedProgramIds.includes(id)),
                                    );
                                }
                            }}
                        />

                        <IdCheckboxList
                            label="Degree / course"
                            values={form.programIds}
                            options={programOptions}
                            onChange={(programIds) => updateForm('programIds', programIds)}
                        />

                        <ChipMultiSelect
                            label="Sex"
                            values={form.sex}
                            options={filterValues.sexOptions}
                            onChange={(sex) => updateForm('sex', sex)}
                        />

                        <IdCheckboxList
                            label="Birth province"
                            values={form.birthProvinceIds}
                            options={exportOptions.provinces.map((province) => ({
                                id: province.id,
                                label: province.name,
                            }))}
                            onChange={(birthProvinceIds) => updateForm('birthProvinceIds', birthProvinceIds)}
                        />

                        <fieldset>
                            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Employment location
                            </legend>
                            <select
                                value={form.location}
                                onChange={(event) => updateForm('location', event.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                            >
                                <option value="">All locations</option>
                                {filterValues.locationOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        <ChipMultiSelect
                            label="Employment status"
                            values={form.employmentStatus}
                            options={filterValues.employmentStatuses}
                            onChange={(employmentStatus) => updateForm('employmentStatus', employmentStatus)}
                        />

                        <ChipMultiSelect
                            label="Employment sector"
                            values={form.employmentSector}
                            options={filterValues.employmentSectors}
                            onChange={(employmentSector) => updateForm('employmentSector', employmentSector)}
                        />

                        <ChipMultiSelect
                            label="Present employment status"
                            values={form.presentEmploymentStatus}
                            options={filterValues.presentEmploymentStatuses}
                            onChange={(presentEmploymentStatus) =>
                                updateForm('presentEmploymentStatus', presentEmploymentStatus)
                            }
                        />

                        <ChipMultiSelect
                            label="Highest educational attainment"
                            values={form.highestAttainment}
                            options={filterValues.highestAttainments}
                            onChange={(highestAttainment) => updateForm('highestAttainment', highestAttainment)}
                        />
                    </section>

                    <section className="space-y-4 border-t border-gray-100 pt-5">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-gray-800">Columns to include</h3>
                            <button
                                type="button"
                                onClick={() => updateForm('columns', [...exportOptions.defaultColumns])}
                                className="text-xs font-medium text-[#1A5336] hover:underline"
                            >
                                Select all
                            </button>
                        </div>

                        {Object.entries(columnsByGroup).map(([group, columns]) => {
                            const allSelected = columns.every((column) => form.columns.includes(column.key));
                            return (
                                <fieldset key={group} className="rounded-xl border border-gray-100 p-4">
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <legend className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            {exportOptions.columnGroups[group] ?? group}
                                        </legend>
                                        <button
                                            type="button"
                                            onClick={() => toggleGroupColumns(group, !allSelected)}
                                            className="text-xs text-[#1A5336] hover:underline"
                                        >
                                            {allSelected ? 'Clear' : 'Select all'}
                                        </button>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {columns.map((column) => (
                                            <label
                                                key={column.key}
                                                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Checkbox
                                                    checked={form.columns.includes(column.key)}
                                                    onCheckedChange={() => toggleColumn(column.key)}
                                                />
                                                <span>{column.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            );
                        })}
                    </section>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <DialogFooter className="border-t border-gray-100 px-6 py-4">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                        style={{ background: MAROON }}
                    >
                        <Download size={16} />
                        Download Excel
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

