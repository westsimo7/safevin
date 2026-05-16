import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_0_hsl(var(--teal-hover)),0_8px_16px_hsl(var(--primary)/0.3)] hover:shadow-[0_6px_0_hsl(var(--teal-hover)),0_12px_24px_hsl(var(--primary)/0.4)] active:shadow-[0_1px_0_hsl(var(--teal-hover)),0_4px_8px_hsl(var(--primary)/0.2)] -translate-y-1 hover:-translate-y-1.5 active:-translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-110",
        outline:
          "border-[1.5px] border-primary bg-transparent text-primary hover:bg-primary/[0.08]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-muted",
        ghost: "hover:bg-accent/10 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // SAFEViN — primary CTA with physical 3D press
        neon:
          "bg-primary text-primary-foreground font-bold rounded-full -translate-y-1 hover:-translate-y-1.5 active:-translate-y-0 hover:brightness-110 shadow-[0_4px_0_hsl(var(--teal-hover)),0_8px_16px_hsl(var(--primary)/0.3)] hover:shadow-[0_6px_0_hsl(var(--teal-hover)),0_12px_24px_hsl(var(--primary)/0.4)] active:shadow-[0_1px_0_hsl(var(--teal-hover)),0_4px_8px_hsl(var(--primary)/0.2)] transition-all duration-150 ease-out",
        // Secondary — outlined warm
        glass:
          "bg-transparent border-[1.5px] border-primary text-primary hover:bg-primary/[0.08] backdrop-blur-sm",
      },
      size: {
        default: "h-11 px-7 py-2",
        sm: "h-9 rounded-full px-4",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
