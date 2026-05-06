import { cn } from "@/lib/utils";

interface AiLoaderProps {
    className?: string;
}

export const AiLoader = ({ className }: AiLoaderProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8", className)}>
            <div className="loader-wrapper">
                <span className="loader-letter">G</span>
                <span className="loader-letter">e</span>
                <span className="loader-letter">n</span>
                <span className="loader-letter">e</span>
                <span className="loader-letter">r</span>
                <span className="loader-letter">a</span>
                <span className="loader-letter">t</span>
                <span className="loader-letter">i</span>
                <span className="loader-letter">n</span>
                <span className="loader-letter">g</span>
                <div className="loader"></div>
            </div>
        </div>
    );
};
