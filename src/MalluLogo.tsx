export const MalluLogo = ({ size = 24, glow = true }: { size?: number, glow?: boolean }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
            filter: glow ? 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.5))' : 'none',
            display: 'inline-block',
            verticalAlign: 'middle'
        }}
    >
        <circle cx="50" cy="50" r="50" fill="url(#paint_logo_common)" />
        <path d="M25 42.5C25 32.835 32.835 25 42.5 25H57.5C67.165 25 75 32.835 75 42.5V57.5C75 67.165 67.165 75 57.5 75H40L25 85V65.8C25 65.8 25 65.8 25 42.5Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M37 42L49 54L61 42V60H65V35H61L50 47L39 35H35V60H39V42Z" fill="white" />
        <defs>
            <linearGradient id="paint_logo_common" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4ade80" />
                <stop offset="1" stopColor="#065f46" />
            </linearGradient>
        </defs>
    </svg>
);
