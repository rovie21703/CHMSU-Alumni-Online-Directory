interface AlumniLogoProps {
    className?: string;
}

export function AlumniLogo({ className = 'size-full' }: AlumniLogoProps) {
    return (
        <img
            src="/images/alumni-logo.jpg"
            alt="Federation of Alumni Associations of CHMSC"
            className={`block size-full object-contain ${className}`}
        />
    );
}
