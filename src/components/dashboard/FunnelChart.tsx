'use client'

interface FunnelData {
  label: string
  value: number
  color: string
}

interface FunnelChartProps {
  data: FunnelData[]
}

export default function FunnelChart({ data }: FunnelChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const widthPercentage = (item.value / maxValue) * 100
        
        return (
          <div key={index} className="relative">
            <div
              className="h-12 flex items-center justify-center text-white font-medium rounded transition-all duration-300 hover:opacity-90"
              style={{
                backgroundColor: item.color,
                width: `${widthPercentage}%`,
                marginLeft: `${(100 - widthPercentage) / 2}%`
              }}
            >
              <span className="text-sm">{item.label}</span>
              <span className="ml-2 text-sm font-bold">{item.value}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
} 