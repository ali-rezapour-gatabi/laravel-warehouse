import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({ className, size = "default", ...props }: SwitchPrimitive.Root.Props & { size?: "sm" | "default" }) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            data-size={size}
            className={cn(
                "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 transition-colors duration-200 outline-none",
                "after:absolute after:-inset-x-3 after:-inset-y-2",
                "data-[size=default]:h-6 data-[size=default]:w-11",
                "data-[size=sm]:h-5 data-[size=sm]:w-9",
                "data-checked:bg-emerald-500 data-unchecked:bg-slate-300",
                "dark:data-checked:bg-emerald-500 dark:data-unchecked:bg-slate-600",
                "focus-visible:ring-3 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-1",
                "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
                "data-disabled:cursor-not-allowed data-disabled:opacity-50",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    "pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
                    "group-data-[size=default]/switch:size-5",
                    "group-data-[size=sm]/switch:size-4",
                    "data-unchecked:translate-x-0 rtl:data-unchecked:translate-x-0",
                    "group-data-[size=default]/switch:data-checked:translate-x-5",
                    "group-data-[size=sm]/switch:data-checked:translate-x-4",
                    "group-data-[size=default]/switch:rtl:data-checked:-translate-x-5",
                    "group-data-[size=sm]/switch:rtl:data-checked:-translate-x-4"
                )}
            />
        </SwitchPrimitive.Root>
    )
}

export { Switch }
