import { cn } from '@/lib/utils'

interface DashboardWidgetProps {
  title: string
  className?: string
  children: React.ReactNode
}

export default function DashboardWidget({ title, className, children }: DashboardWidgetProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
} 