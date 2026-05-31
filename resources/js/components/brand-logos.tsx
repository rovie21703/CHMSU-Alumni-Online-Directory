import { AlumniLogo } from '@/components/alumni-logo';
import { ChmsuLogo } from '@/components/chmsu-logo';

type BrandLogosSize = 'sm' | 'md' | 'lg' | 'hero';

const sizeStyles: Record<
    BrandLogosSize,
    {
        gap: string;
        shell: string;
        pad: string;
    }
> = {
    sm: {
        gap: 'gap-1.5',
        shell: 'size-10',
        pad: 'p-0.5',
    },
    md: {
        gap: 'gap-2',
        shell: 'size-12',
        pad: 'p-1',
    },
    lg: {
        gap: 'gap-3',
        shell: 'size-20',
        pad: 'p-1',
    },
    hero: {
        gap: 'gap-3',
        shell: 'size-32',
        pad: 'p-2',
    },
};

interface BrandLogosProps {
    size?: BrandLogosSize;
    className?: string;
}

export function BrandLogos({ size = 'sm', className = '' }: BrandLogosProps) {
    const styles = sizeStyles[size];

    return (
        <div className={`flex flex-shrink-0 items-center ${styles.gap} ${className}`}>
            <div
                className={`${styles.shell} ${styles.pad} flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm`}
            >
                <ChmsuLogo className="size-full" />
            </div>
            <div
                className={`${styles.shell} ${styles.pad} flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm`}
            >
                <AlumniLogo className="size-full" />
            </div>
        </div>
    );
}

interface BrandLogoStackProps {
    className?: string;
}

export function BrandLogoStack({ className = '' }: BrandLogoStackProps) {
    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div className="flex items-center justify-center gap-4">
                <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-white p-2 shadow-sm">
                    <ChmsuLogo className="size-full" />
                </div>
                <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-white p-2 shadow-sm">
                    <AlumniLogo className="size-full" />
                </div>
            </div>
        </div>
    );
}
