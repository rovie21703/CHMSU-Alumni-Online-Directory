import { Head, Link } from '@inertiajs/react';

type ErrorPageProps = {
    status: number;
    message: string;
};

export default function ErrorPage({ status, message }: ErrorPageProps) {
    return (
        <>
            <Head title={`Error ${status}`} />
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-5xl font-bold text-[#1A5336]">{status}</p>
                    <h1 className="mt-3 text-xl font-bold text-gray-900">We hit a snag</h1>
                    <p className="mt-2 text-sm text-gray-600">{message}</p>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="rounded-xl bg-[#1A5336] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                        >
                            Try again
                        </button>
                        <Link
                            href={route('admin.dashboard')}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Go to dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
