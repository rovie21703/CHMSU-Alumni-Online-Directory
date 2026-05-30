import { Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={className} {...props}>
            <p className="text-sm text-muted-foreground">
                This application always uses light mode and does not follow your device&apos;s dark mode setting.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-3.5 py-2 text-sm text-neutral-700">
                <Sun className="h-4 w-4" />
                Light mode
            </div>
        </div>
    );
}
