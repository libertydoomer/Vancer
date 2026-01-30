import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number[];
    onValueChange?: (value: number[]) => void;
    className?: string;
}

export function Slider({ min = 0, max = 100, step = 1, defaultValue = [0], onValueChange, className }: SliderProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onValueChange) {
            onValueChange([Number(e.target.value)]);
        }
    };

    return (
        <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                defaultValue={defaultValue[0]}
                onChange={handleChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
    );
}
