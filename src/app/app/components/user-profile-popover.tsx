"use client";
import React, { useState, useEffect } from 'react';
import {
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
    PopoverFooter,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserInfo } from '@/hooks/query';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { useAvatarStore } from '@/hooks/use-avatar-store';
import { presetAvatars } from '@/lib/avatars';

export default function UserProfilePopover() {
    const { data: userInfo, isLoading } = useUserInfo();
    const { avatarId, customImage } = useAvatarStore();
    const [open, setOpen] = useState(false);

    // Initial for avatar fallback
    const initial = userInfo?.name ? userInfo.name[0] : "S";

    // Computed Avatar Content
    const renderAvatar = () => {
        if (avatarId === 999 && customImage) {
            return <AvatarImage src={customImage} className="object-cover" />;
        }
        if (avatarId) {
            const found = presetAvatars.find(a => a.id === avatarId);
            if (found) {
                return <div className="w-full h-full flex items-center justify-center bg-black/50 p-0.5">{found.svg}</div>;
            }
        }
        return (
            <>
                <AvatarImage src="" />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-foreground font-bold">
                    {isLoading ? "..." : initial}
                </AvatarFallback>
            </>
        );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-none p-0 border border-border hover:bg-accent transition-colors overflow-hidden">
                    <Avatar className="h-full w-full rounded-none">
                        {renderAvatar()}
                    </Avatar>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-background border-border text-foreground p-0 rounded-none shadow-none border">
                {/* Header */}
                <div className="border-b border-border px-4 py-3">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-xs font-black text-foreground truncate leading-snug">{userInfo?.name || "Student"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{userInfo?.regNumber || "—"}</p>
                </div>

                {/* Actions */}
                <div className="border-b border-border">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left border-b border-border">
                                <User className="h-3.5 w-3.5 flex-shrink-0" />
                                Pick Avatar
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-border text-foreground max-w-sm rounded-none">
                            <DialogHeader>
                                <DialogTitle className="text-sm font-black uppercase tracking-wider">Customize Profile</DialogTitle>
                            </DialogHeader>
                            <AvatarPicker onComplete={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Sign out */}
                <div className="px-4 py-3">
                    <Link href="/auth/logout" className="w-full">
                        <button className="w-full flex items-center gap-3 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors px-3 py-2 border border-destructive/20 hover:border-destructive/40">
                            <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
                            Sign Out
                        </button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
