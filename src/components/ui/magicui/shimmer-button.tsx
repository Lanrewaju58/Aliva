"use client";

import React, { CSSProperties, ComponentPropsWithoutRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends HTMLMotionProps<"button"> {
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    className?: string;
    children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
    (
        {
            shimmerColor = "#ffffff",
            shimmerSize = "0.05em",
            shimmerDuration = "3s",
            borderRadius = "100px",
            background = "rgba(0, 0, 0, 1)",
            className,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <motion.button
                ref={ref}
                style={
                    {
                        "--spread": "90deg",
                        "--shimmer-color": shimmerColor,
                        "--radius": borderRadius,
                        "--speed": shimmerDuration,
                        "--cut": shimmerSize,
                        "--bg": background,
                    } as CSSProperties
                }
                className={cn(
                    "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)]",
                    "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
                    className
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...props}
            >
                {/* shine effect */}
                <div
                    className={cn(
                        "-z-30 blur-[2px]",
                        "absolute inset-0 overflow-visible [container-type:size]"
                    )}
                >
                    <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
                        <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
                    </div>
                </div>
                {children}

                {/* Backdrop */}
                <div
                    className={cn(
                        "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]"
                    )}
                />
            </motion.button>
        );
    }
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
