import React, { useState, useEffect } from 'react';

function GuidedBreathing({ suggestedActivity, onComplete }) {
    const TOTAL_SECONDS = 300; // 5 minutes

    const [isPaused, setIsPaused] = useState(false);

    const [displayState, setDisplayState] = useState({
        timeRemaining: TOTAL_SECONDS,
        breathState: 'Exhale',
        breathTimer: 4
    });

    const startTimeRef = React.useRef(Date.now());
    const totalPausedTimeRef = React.useRef(0);
    const pausedAtRef = React.useRef(null);
    const orbRef = React.useRef(null);

    const togglePause = () => {
        if (isPaused) {
            const pausedDuration = Date.now() - pausedAtRef.current;
            totalPausedTimeRef.current += pausedDuration;
            pausedAtRef.current = null;
            setIsPaused(false);
        } else {
            pausedAtRef.current = Date.now();
            setIsPaused(true);
        }
    };

    useEffect(() => {
        let rafId;
        let lastSeconds = -1;

        const loop = () => {
            if (isPaused) {
                rafId = requestAnimationFrame(loop);
                return;
            }

            const now = Date.now();
            const elapsedMs = now - startTimeRef.current - totalPausedTimeRef.current;

            // 8-second cycle: 0-4000ms Exhale (Shrink 1.5->1.0), 4000-8000ms Inhale (Grow 1.0->1.5)
            const cycleMs = elapsedMs % 8000;
            const isExhale = cycleMs < 4000;

            let scale;
            if (isExhale) {
                scale = 1.5 - 0.5 * (cycleMs / 4000);
            } else {
                scale = 1.0 + 0.5 * ((cycleMs - 4000) / 4000);
            }

            if (orbRef.current) {
                orbRef.current.style.transform = `scale(${scale})`;
            }

            const elapsedWholeSec = Math.floor(elapsedMs / 1000);
            const currentSeconds = Math.max(0, TOTAL_SECONDS - elapsedWholeSec);

            if (currentSeconds !== lastSeconds) {
                lastSeconds = currentSeconds;

                const currentBreathTimer = 4 - (elapsedWholeSec % 4);

                setDisplayState({
                    timeRemaining: currentSeconds,
                    breathState: isExhale ? 'Exhale' : 'Inhale',
                    breathTimer: currentBreathTimer
                });

                if (currentSeconds <= 0) {
                    onComplete();
                    return;
                } // Stop RAF by not requesting next frame
            }

            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [isPaused, onComplete]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative w-full px-4 h-full min-h-0">
            <header className="flex items-center justify-between px-4 md:px-8 py-4 w-full max-w-7xl mx-auto flex-shrink-0 relative z-20">
                <div className="flex items-center gap-3 group cursor-pointer text-slate-900 dark:text-white">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors duration-300">
                        <span className="material-symbols-outlined text-xl">spa</span>
                    </div>
                    <h1 className="font-bold text-lg tracking-tight">The 900</h1>
                </div>
                <div className="hidden md:flex flex-col items-center gap-2 absolute left-1/2 -translate-x-1/2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Step 3 of 3</span>
                    <div className="flex gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-primary shadow-[0_0_10px_rgba(19,236,91,0.4)]"></div>
                        <div className="h-1.5 w-12 rounded-full bg-primary shadow-[0_0_10px_rgba(19,236,91,0.4)]"></div>
                        <div className="h-1.5 w-12 rounded-full bg-primary shadow-[0_0_10px_rgba(19,236,91,0.4)]"></div>
                    </div>
                </div>
                <div className="flex items-center justify-end w-32">
                    <button
                        onClick={onComplete}
                        className="group hidden md:flex h-9 px-4 items-center justify-center rounded-lg bg-slate-200 dark:bg-surface-dark text-sm font-bold hover:bg-slate-300 dark:hover:bg-[#25382b] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md text-slate-900 dark:text-white"
                    >
                        Exit
                    </button>
                </div>
            </header>

            {/* Background orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Removed the misaligned mid-screen progress bar */}

            <div className="relative flex flex-col flex-1 items-center justify-center z-10 w-full max-w-3xl mb-20 min-h-0">
                <div className="mb-4 flex flex-col items-center flex-shrink-0 relative z-20">
                    <div className="text-4xl md:text-5xl font-light tracking-tighter tabular-nums text-slate-900 dark:text-white drop-shadow-md">
                        {formatTime(displayState.timeRemaining)}
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                        Remaining
                    </div>
                </div>

                <div className="relative flex items-center justify-center w-[200px] h-[200px] md:w-[250px] md:h-[250px] flex-shrink-0 my-4 z-0">
                    <div className="absolute inset-0 rounded-full border border-primary/20 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationPlayState: isPaused ? 'paused' : 'running' }}></div>
                    <div
                        ref={orbRef}
                        className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full backdrop-blur-sm border border-primary/30 flex items-center justify-center breathing-orb"
                        style={{ opacity: isPaused ? 0.8 : 1, boxShadow: isPaused ? '0 0 40px -10px rgba(19, 236, 91, 0.3)' : undefined }}
                    >
                        <div className="flex flex-col items-center justify-center text-center p-6 z-10 relative">
                            <span className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight drop-shadow-lg" style={{ transform: 'scale(1)', zIndex: 30 }}>
                                {isPaused ? 'Paused' : displayState.breathState}
                            </span>
                            {!isPaused && (
                                <span className="text-xs font-medium text-primary mt-2 uppercase tracking-widest opacity-80 block !static" style={{ transform: 'scale(1)' }}>
                                    {displayState.breathTimer} Seconds
                                </span>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            <div className="absolute bottom-6 w-full flex justify-center z-10 px-4">
                <div className="flex gap-4">
                    <button
                        onClick={onComplete}
                        className="group h-12 px-8 rounded-full border-2 border-surface-dark bg-transparent text-red-500 hover:bg-red-500/10 transition-all duration-300 font-bold text-sm flex items-center gap-2 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(239,68,68,0.15)]"
                    >
                        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">close</span>
                        <span>End</span>
                    </button>

                    <button
                        onClick={togglePause}
                        className="group h-12 px-8 rounded-full bg-neon-green hover:bg-neon-green/90 text-background-dark font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.2)] hover:shadow-[0_0_30px_rgba(0,255,102,0.4)] hover:-translate-y-1 transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-[18px] font-bold group-hover:scale-110 transition-transform">{isPaused ? 'play_arrow' : 'pause'}</span>
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                </div>
            </div>

            <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-60 z-0"></div>
        </div>
    );
}

export default GuidedBreathing;
