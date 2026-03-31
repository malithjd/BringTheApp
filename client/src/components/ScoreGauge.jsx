import { useEffect, useState } from 'react';

export default function ScoreGauge({ score, label, vehicle }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 1200;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const color = score >= 70 ? 'var(--color-green)' : score >= 40 ? 'var(--color-amber)' : 'var(--color-red)';
  const bgColor = score >= 70 ? 'rgba(34,197,94,0.1)' : score >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  // SVG arc calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = animatedScore / 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="bg-surface border border-border rounded-xl p-6 text-center animate-fade-up">
      <div className="relative inline-block">
        {/* viewBox expanded by 10 on each side to prevent glow clipping */}
        <svg width="180" height="180" viewBox="-10 -10 120 120" overflow="visible">
          {/* Background circle */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="var(--color-surface2)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
          {/* Score text */}
          <text x="50" y="46" textAnchor="middle" fill={color} fontSize="24" fontWeight="700">
            {animatedScore}
          </text>
          <text x="50" y="60" textAnchor="middle" fill="var(--color-text2)" fontSize="7">
            out of 100
          </text>
        </svg>
      </div>

      <div className="mt-2">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
          style={{ backgroundColor: bgColor, color }}
        >
          {label}
        </span>
      </div>

      {vehicle && (
        <p className="mt-3 text-text2 text-sm">
          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim || ''}
          <span className="ml-2 text-xs bg-surface2 px-2 py-0.5 rounded">
            {vehicle.condition === 'new' ? 'New' : 'Used'}
          </span>
        </p>
      )}
    </div>
  );
}
