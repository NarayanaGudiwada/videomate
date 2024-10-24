import React from 'react';

interface CursorProps {
  x: number;
  y: number;
  color: string;
  label: string;
}

const Cursor: React.FC<CursorProps> = ({ x, y, color, label }) => {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        style={{ transform: 'rotate(-45deg)' }}
      >
        <path d="M3 3l7 7v4l2 6l6-2l-4-4h4l-7-7l-8-4z" />
      </svg>
      <div
        className="ml-4 rounded-md px-2 py-1 text-sm"
        style={{ backgroundColor: color, color: '#fff' }}
      >
        {label}
      </div>
    </div>
  );
};

export default Cursor;
