import { Button } from '@/components/ui/button';
import { Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={className} {...props}>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md" disabled aria-label="Light mode (fixed)">
                <Sun className="h-5 w-5" />
                <span className="sr-only">Light mode</span>
            </Button>
        </div>
    );
}
