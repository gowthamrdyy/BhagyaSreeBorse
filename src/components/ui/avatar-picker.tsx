"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { presetAvatars, AvatarItem } from "@/lib/avatars";
import { useAvatarStore } from "@/hooks/use-avatar-store";

interface ExtendedAvatar extends AvatarItem {
    isCustom?: boolean;
    imageUrl?: string;
}

const mainAvatarVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.2 } },
};

const pickerVariants = {
    container: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } },
    item: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } } },
};

export function AvatarPicker({ onComplete }: { onComplete?: () => void }) {
    const { setAvatar, avatarId, customImage } = useAvatarStore();
    const [selectedAvatar, setSelectedAvatar] = useState<ExtendedAvatar>(presetAvatars[0]);
    const [rotationCount, setRotationCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize from store on mount
    useEffect(() => {
        if (avatarId === 999 && customImage) {
            setSelectedAvatar({
                id: 999,
                alt: "Custom Upload",
                svg: <img src={customImage} alt="Custom" className="w-full h-full object-cover rounded-full" />,
                imageUrl: customImage,
                isCustom: true
            })
        } else if (avatarId) {
            const found = presetAvatars.find(a => a.id === avatarId);
            if (found) setSelectedAvatar(found);
        }
    }, [avatarId, customImage]);

    const handleAvatarSelect = (avatar: ExtendedAvatar) => {
        setRotationCount((prev) => prev + 360);
        setSelectedAvatar(avatar);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Convert to Base64 for local storage persistence
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const customAvatar: ExtendedAvatar = {
                    id: 999,
                    alt: "Custom Upload",
                    isCustom: true,
                    imageUrl: base64String,
                    svg: <img src={base64String} alt="Custom" className="w-full h-full object-cover rounded-full" />
                };
                handleAvatarSelect(customAvatar);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveAndClose = () => {
        if (selectedAvatar.isCustom && selectedAvatar.imageUrl) {
            setAvatar(999, selectedAvatar.imageUrl);
        } else {
            setAvatar(selectedAvatar.id, null);
        }
        if (onComplete) onComplete();
    };

    return (
        <motion.div initial="initial" animate="animate" className="w-full">
            <Card className="w-full border-none bg-transparent shadow-none">
                <CardContent className="p-0">
                    <div className="flex flex-col items-center">
                        {/* Main avatar display */}
                        <motion.div
                            className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 flex items-center justify-center bg-black/50"
                            variants={mainAvatarVariants}
                            key={selectedAvatar.id}
                        >
                            <motion.div
                                className="w-full h-full flex items-center justify-center"
                                animate={{ rotate: rotationCount }}
                                transition={{ duration: 0.8, ease: "backOut" }}
                            >
                                {selectedAvatar.isCustom ? (
                                    <img src={selectedAvatar.imageUrl} className="w-full h-full object-cover" alt="Selected" />
                                ) : (
                                    <div className="scale-[2.5]">
                                        {selectedAvatar.svg}
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>

                        <motion.h2 className="text-xl font-bold mt-4 text-white" variants={pickerVariants.item}>
                            {selectedAvatar.alt === "Custom Upload" ? "My Photo" : "Choose Avatar"}
                        </motion.h2>

                        {/* Avatar selection grid */}
                        <motion.div className="mt-6 w-full" variants={pickerVariants.container}>
                            <div className="flex flex-wrap justify-center gap-3">
                                {presetAvatars.map((avatar) => (
                                    <motion.button
                                        key={avatar.id}
                                        onClick={() => handleAvatarSelect(avatar)}
                                        className={cn(
                                            "relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300",
                                            selectedAvatar.id === avatar.id ? "border-primary ring-2 ring-primary/50" : "border-white/20 hover:border-white/50"
                                        )}
                                        variants={pickerVariants.item}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                            {avatar.svg}
                                        </div>
                                    </motion.button>
                                ))}

                                {/* Upload Button */}
                                <motion.button
                                    className={cn(
                                        "relative w-12 h-12 rounded-full overflow-hidden border-2 border-dashed border-white/30 hover:border-white/60 flex items-center justify-center bg-white/5",
                                        selectedAvatar.id === 999 && "border-solid border-primary ring-2 ring-primary/50"
                                    )}
                                    onClick={() => fileInputRef.current?.click()}
                                    variants={pickerVariants.item}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Upload your own"
                                >
                                    <Upload className="w-5 h-5 text-white/70" />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                </motion.button>
                            </div>
                        </motion.div>

                        <div className="mt-6 w-full">
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold" onClick={saveAndClose}>
                                Confirm Selection
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
