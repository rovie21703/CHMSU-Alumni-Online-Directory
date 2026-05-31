import { ChmsuLogo } from '@/components/chmsu-logo';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-[#1A5336] p-0.5">
                <ChmsuLogo className="size-full" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">CHMSU Alumni</span>
                <span className="truncate text-xs text-muted-foreground">Online Directory</span>
            </div>
        </>
    );
}
