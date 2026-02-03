import { Shield, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface TrustScoreCardProps {
  score: number;
  label: string;
  icon?: 'shield' | 'alert' | 'check' | 'trending';
}

export function TrustScoreCard({ score, label, icon = 'shield' }: TrustScoreCardProps) {
  const percentage = Math.round(score * 100);

  const getColor = (score: number) => {
    if (score >= 0.8) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', ring: 'stroke-green-600' };
    if (score >= 0.6) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', ring: 'stroke-blue-600' };
    if (score >= 0.4) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', ring: 'stroke-yellow-600' };
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', ring: 'stroke-red-600' };
  };

  const colors = getColor(score);

  const icons = {
    shield: Shield,
    alert: AlertCircle,
    check: CheckCircle,
    trending: TrendingUp,
  };

  const Icon = icons[icon];

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colors.text}`} />
          <span className={`font-medium ${colors.text}`}>{label}</span>
        </div>
        <span className={`text-2xl font-bold ${colors.text}`}>{percentage}%</span>
      </div>
      <div className="w-full bg-white rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${colors.text.replace('text-', 'bg-')} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
