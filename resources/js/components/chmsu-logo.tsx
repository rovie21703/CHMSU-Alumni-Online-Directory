export function ChmsuLogo({ className = 'h-10 w-10' }: { className?: string }) {
    return (
        <img
            src="/images/chmsu-logo.jpg"
            alt=""
            role="presentation"
            className={`block object-contain ${className}`}
        />
    );
}
