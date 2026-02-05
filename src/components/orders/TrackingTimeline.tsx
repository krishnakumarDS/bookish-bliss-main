import { cn } from "@/lib/utils";

interface TimelineStep {
    label: string;
    description: string;
    completed: boolean;
    current?: boolean;
}

interface TrackingTimelineProps {
    status: string;
    className?: string;
}

const TrackingTimeline = ({ status, className }: TrackingTimelineProps) => {
    const s = status.toLowerCase();

    const steps: TimelineStep[] = [
        {
            label: 'Order Confirmed',
            description: 'We have received your acquisition request.',
            completed: ['pending', 'confirmed', 'shipped', 'delivered'].includes(s),
            current: s === 'pending' || s === 'confirmed'
        },
        {
            label: 'Dispatched',
            description: 'Your package has left our secure facility.',
            completed: ['shipped', 'delivered'].includes(s),
            current: s === 'shipped'
        },
        {
            label: 'In Transit',
            description: 'En route to your specified coordinates.',
            completed: ['delivered'].includes(s),
            current: false
        },
        {
            label: 'Delivered',
            description: 'Package successfully handed over.',
            completed: s === 'delivered',
            current: s === 'delivered'
        },
    ];

    return (
        <div className={cn("relative pl-4 space-y-0", className)}>
            {/* Connecting Line */}
            <div className="absolute left-[11px] top-2 bottom-8 w-[2px] bg-slate-100" />

            {steps.map((step, index) => (
                <div key={index} className="relative pl-10 pb-10 last:pb-0 group">
                    {/* Node */}
                    <div
                        className={cn(
                            "absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm transition-all duration-500 z-10",
                            step.completed
                                ? "bg-slate-900 ring-2 ring-slate-900/10"
                                : "bg-slate-200"
                        )}
                    >
                        {step.completed && (
                            <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1">
                        <span className={cn(
                            "text-xs font-black uppercase tracking-[0.2em] transition-colors",
                            step.completed ? "text-slate-900" : "text-slate-400"
                        )}>
                            {step.label}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                            {step.description}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrackingTimeline;
