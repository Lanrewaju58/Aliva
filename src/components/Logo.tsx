import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-auto" }) => {
    return (
        <svg
            viewBox="0 0 200 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="20" cy="20" r="20" fill="url(#logo_gradient)" />
            <path d="M20 8L28 28H24.5L22.5 23H17.5L15.5 28H12L20 8Z" fill="white" fillRule="evenodd" />
            <path d="M18.5 19H21.5L20 15.5L18.5 19Z" fill="white" fillRule="evenodd" />
            <circle cx="26" cy="14" r="2" fill="white" fillOpacity="0.8" />
            <circle cx="29" cy="11" r="1.5" fill="white" fillOpacity="0.6" />
            <circle cx="31" cy="8" r="1" fill="white" fillOpacity="0.4" />
            <text
                x="52"
                y="26"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600, fontSize: '20px' }}
                className="fill-foreground transition-colors duration-300"
            >
                Aliva
            </text>
            <defs>
                <linearGradient id="logo_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default Logo;
