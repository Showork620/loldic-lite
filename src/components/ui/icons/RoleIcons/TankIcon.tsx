import React from 'react';

interface RoleIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const TankIcon: React.FC<RoleIconProps> = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 71 71"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    {...props}
  >
    <path d="M6 13.5238L20.1584 7.88889L32.5469 0L34.3167 39.4444L37.2664 1.69048L50.8348 7.88889L64.4032 13.5238L59.0939 31.5556L50.8348 51.8413L34.3167 71L20.1584 51.8413L11.8993 31.5556L6 13.5238Z" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
