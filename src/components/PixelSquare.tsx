interface PixelSquareProps {
  color: string;
  className?: string;
}

const PixelSquare = ({ color, className = "" }: PixelSquareProps) => (
  <div
    className={`w-4 h-4 shrink-0 border-2 border-current ${className}`}
    style={{ backgroundColor: color, borderColor: color }}
  />
);

export default PixelSquare;
