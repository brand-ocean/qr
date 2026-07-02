import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  DashboardIcon,
  GridIcon,
  QrIcon,
  ReloadIcon,
} from '../components/icons';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatWhen } from '../lib/format';
import { STATUS_META, type Status } from '../lib/status';
import { youtubeThumb } from '../lib/youtube';

type IconType = typeof DashboardIcon;

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: IconType;
  label: string;
  value: string | number;
  tint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-lg ${
            tint ??
            'bg-accent-50 text-accent-600 dark:bg-accent-400/10 dark:text-accent-400'
          }`}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 tabular-nums dark:text-gray-50">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

function formatDay(day: string): string {
  const [, m, d] = day.split('-');
  return `${Number(d)}/${Number(m)}`;
}

const BREAKDOWN_ORDER: Status[] = [
  'ok',
  'broken',
  'allowlisted',
  'error',
  'unknown',
];

export function Dashboard({ onOpenCards }: { onOpenCards: () => void }) {
  const stats = useQuery(api.stats.dashboard);

  if (stats === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <ReloadIcon className="text-accent-500 size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-50">
            Dashboard
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="size-4" />
            Laatst gecheckt: {formatWhen(stats.lastCheckedAt)}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onOpenCards}>
          <GridIcon className="size-4" /> Naar kaarten
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={DashboardIcon}
          label="Kaarten"
          value={stats.totalCards}
        />
        <StatCard
          icon={CheckIcon}
          label="Werken"
          value={stats.statusCounts.ok}
          tint="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
        />
        <StatCard
          icon={AlertIcon}
          label="Kapot"
          value={stats.statusCounts.broken}
          tint="bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400"
        />
        <StatCard icon={QrIcon} label="Scans totaal" value={stats.totalScans} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-gray-900 dark:text-gray-50">
              Scans (laatste 30 dagen)
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stats.totalScans} totaal · {stats.scannedCards} kaarten gescand
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.trend}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tickFormatter={formatDay}
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  className="text-gray-400"
                  interval={4}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  className="text-gray-400"
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                  formatter={(value: number) => [`${value} scans`, '']}
                  labelFormatter={(day: string) => formatDay(day)}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.1)',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#scanFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-medium text-gray-900 dark:text-gray-50">
            Beschikbaarheid
          </h2>
          <div className="flex flex-col gap-3">
            {BREAKDOWN_ORDER.map((status) => {
              const count = stats.statusCounts[status];
              const meta = STATUS_META[status];
              const pct = stats.totalCards
                ? Math.round((count / stats.totalCards) * 100)
                : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <span className={`size-2 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                    <span className="text-gray-500 tabular-nums dark:text-gray-400">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full ${meta.dot}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <h2 className="font-medium text-gray-900 dark:text-gray-50">
            Meest gescande kaarten
          </h2>
        </div>
        {stats.topCards.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Nog geen scans geregistreerd.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {stats.topCards.map((card, i) => (
              <li
                key={card.cardId}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <span className="w-5 text-center text-sm font-medium text-gray-400 tabular-nums">
                  {i + 1}
                </span>
                {card.videoId === 'ERROR' ? (
                  <div className="h-9 w-16 shrink-0 rounded bg-gray-100 dark:bg-gray-800" />
                ) : (
                  <img
                    src={youtubeThumb(card.videoId)}
                    alt=""
                    className="h-9 w-16 shrink-0 rounded object-cover"
                    loading="lazy"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                    {card.quote}
                  </p>
                  <p className="text-xs text-gray-400">{card.cardId}</p>
                </div>
                <Badge variant={STATUS_META[card.status].variant}>
                  {STATUS_META[card.status].label}
                </Badge>
                <span className="w-16 text-right font-semibold text-gray-900 tabular-nums dark:text-gray-50">
                  {card.scanCount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
