import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSelector } from 'react-redux';

const OnlineUsersBar = ({ users }) => {
    const { usere } = useSelector((state) => state.auth);
    if (!users || users.length === 0) return null;

    return (
        <div className="bg-indigo-700/30 dark:bg-indigo-900/40 backdrop-blur-md border-b border-white/10 py-2.5 px-4 shrink-0 transition-colors">
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-indigo-200 dark:text-indigo-300 uppercase tracking-widest shrink-0">
                    Online Now
                </span>
                <ScrollArea className="flex-1 whitespace-nowrap overflow-hidden">
                    <div className="flex gap-2 pb-1">
                        <TooltipProvider>
                            {users.map((user) => (
                                <Tooltip key={user._id}>
                                    <TooltipTrigger asChild>
                                        <div className="relative cursor-pointer hover:scale-105 transition-transform group shrink-0">
                                            <Avatar className="w-8 h-8 border-2 border-indigo-500/50 group-hover:border-indigo-400 transition-colors">
                                                {user.picture && !usere?.blockedUsers?.includes(user._id) && (
                                                    <AvatarImage src={user.picture} alt={user.fullname} />
                                                )}
                                                <AvatarFallback className="bg-indigo-600 text-white text-[10px]">
                                                    {user.fullname?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-indigo-900 rounded-full shadow-lg" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="bg-slate-900 text-white border-slate-800">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-xs font-bold text-slate-100">{user.fullname}</p>
                                            <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    </div>
                    <ScrollBar orientation="horizontal" className="h-1 bg-white/5" />
                </ScrollArea>
                {users.length > 0 && (
                    <div className="shrink-0 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30 ml-2">
                        {users.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnlineUsersBar;
