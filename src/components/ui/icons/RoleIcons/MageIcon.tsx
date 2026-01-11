import React from 'react';

interface RoleIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const MageIcon: React.FC<RoleIconProps> = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 71 71"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    {...props}
  >
    <path d="M2 7.38182L12.8065 13.0182V4L32.7541 12.6111V51.3455L12.8065 43.4068V20.9091L8.59016 18.1864V47.0847L35.5 57.5932L62.5161 47.0847V18.1864L58.1936 20.9091V43.4068L37.6967 51.3455V12.6111L58.1936 4V13.0182L69 7.38182V51.3455L35.5 66L2 51.3455V7.38182Z" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
