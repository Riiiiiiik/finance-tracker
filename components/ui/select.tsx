import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps {
    value?: string
    onValueChange?: (value: string) => void
    children?: React.ReactNode
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
    const [open, setOpen] = React.useState(false)

    return (
        <div className="relative">
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        value,
                        onValueChange,
                        open,
                        setOpen,
                    })
                }
                return child
            })}
        </div>
    )
}

const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        value?: string
        open?: boolean
        setOpen?: (open: boolean) => void
    }
>(({ className, children, value, open, setOpen, ...props }, ref) => (
    <button
        ref={ref}
        type="button"
        className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        onClick={() => setOpen?.(!open)}
        {...props}
    >
        {children}
    </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, value }: { placeholder?: string, value?: string }) => (
    <span className={cn(!value && "text-muted-foreground")}>
        {value || placeholder}
    </span>
)

const SelectContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        open?: boolean
        setOpen?: (open: boolean) => void
        onValueChange?: (value: string) => void
    }
>(({ className, children, open, setOpen, onValueChange, ...props }, ref) => {
    if (!open) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen?.(false)}
            />
            <div
                ref={ref}
                className={cn(
                    "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/20 glass-effect shadow-lg animate-scale-in",
                    className
                )}
                {...props}
            >
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child as React.ReactElement<any>, {
                            onValueChange,
                            setOpen,
                        })
                    }
                    return child
                })}
            </div>
        </>
    )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value: string
        onValueChange?: (value: string) => void
        setOpen?: (open: boolean) => void
    }
>(({ className, children, value, onValueChange, setOpen, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        onClick={() => {
            onValueChange?.(value)
            setOpen?.(false)
        }}
        {...props}
    >
        {children}
    </div>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
