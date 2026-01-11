import React from 'react';

interface RoleIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const AllIcon: React.FC<RoleIconProps> = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 71 71"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    {...props}
  >
    <path d="M57.7599 11V51.1258H71.0001L70.1665 60.3911H49.7178V11H57.7599Z" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M38.0671 11V51.1258H48.5829L47.7493 60.3911H30.0249V11H38.0671Z" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M21.7237 60.3911L19.9583 49.7716H10.0527L8.3364 60.3911H0L10.2489 11H20.0073L30.2562 60.3911H21.7237ZM11.4258 41.2903H18.5853L15.0055 19.4813L11.4258 41.2903Z" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
