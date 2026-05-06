"use client"

import { Download, Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DownloadButtonProps {
    downloadStatus: "idle" | "downloading" | "downloaded" | "complete"
    progress: number
    onClick: () => void
    className?: string
}

export default function DownloadButton({ downloadStatus, progress, onClick, className }: DownloadButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={downloadStatus !== "idle"}
            className={cn(
                "relative overflow-hidden select-none flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs border border-border bg-secondary text-foreground hover:bg-accent transition-colors rounded disabled:pointer-events-none",
                downloadStatus === "downloading" && "opacity-70",
                className,
            )}
        >
            {downloadStatus === "idle" && (
                <>
                    <Download className="h-3 w-3 flex-shrink-0" />
                    <span className="hidden sm:inline">Download</span>
                </>
            )}
            {downloadStatus === "downloading" && (
                <div className="z-[5] flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>{progress}%</span>
                </div>
            )}
            {(downloadStatus === "downloaded" || downloadStatus === "complete") && (
                <>
                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                    <span className="hidden sm:inline">Done</span>
                </>
            )}
            {downloadStatus === "downloading" && (
                <div
                    className="absolute bottom-0 z-[3] h-full left-0 bg-foreground/10 inset-0 transition-all duration-200 ease-in-out"
                    style={{ width: `${progress}%` }}
                />
            )}
        </button>
    )
}
