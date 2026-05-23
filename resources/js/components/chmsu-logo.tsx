import chmsuLogo from '@/assets/images/chmsu-logo.jpg';

export function ChmsuLogo({ className = 'h-10 w-10' }: { className?: string }) {
    return <img src={chmsuLogo} alt="Carlos Hilado Memorial State University" className={className} />;
}
