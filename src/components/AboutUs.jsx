import React from 'react';

function AboutUs({ onReturnHome }) {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-subtle bg-background-dark px-6 py-4 lg:px-10 z-10">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl">spa</span>
                    <h2 className="text-lg font-bold leading-tight tracking-tight text-white">The 900</h2>
                </div>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center p-4 py-12 sm:px-8 z-10 animate-fade-in-fast">
                <div className="flex w-full max-w-[640px] flex-col gap-8">

                    <div className="flex flex-col items-center gap-4 text-center">
                        <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>info</span>
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">Why "The 900"?</h1>
                    </div>

                    <div className="rounded-xl border border-border-subtle bg-surface-dark p-6 sm:p-8 shadow-xl text-text-muted space-y-6">
                        <p className="text-lg leading-relaxed">
                            There are 86,400 seconds in a day. We believe everyone deserves to reclaim at least 900 of them—just 15 minutes—entirely for themselves.
                        </p>
                        <p className="leading-relaxed">
                            <strong>The 900</strong> is dedicated to the simple yet profound act of pausing. In our hyper-connected, always-on world, taking a quarter of an hour to check in with your mind and body isn't a luxury; it's a necessity for mental well-being.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            onClick={onReturnHome}
                            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-surface-lighter border border-border-subtle px-6 text-white font-bold transition-all hover:bg-surface-dark active:scale-[0.99]"
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>home</span>
                            Return Home
                        </button>
                    </div>

                </div>
            </main>

            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-[10%] -left-[10%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]"></div>
                <div className="absolute bottom-[10%] -right-[10%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]"></div>
            </div>
        </div>
    );
}

export default AboutUs;
