"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-24 md:pt-32 px-6 lg:px-12 overflow-hidden bg-black selection:bg-kast-teal/30">
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-kast-teal/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-24 md:top-32 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 flex-wrap w-full px-6 z-20"
            >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <img src="/arbitrum-logo.png" alt="Arbitrum" className="w-4 h-4 object-contain" />
                    <span className="text-sm text-zinc-300 font-medium">Powered by Arbitrum</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-kast-teal/10 border border-kast-teal/20 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kast-teal opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-kast-teal"></span>
                    </span>
                    <span className="text-sm text-kast-teal font-medium tracking-wide">Live on Sepolia</span>
                </div>
            </motion.div>

            <div className="max-w-8xl grid lg:grid-cols-2 gap-16 items-center w-full mt-16 md:mt-24">
                <div className="flex flex-col gap-6 z-10 -mt-8 md:-mt-20">

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ willChange: "transform, opacity" }}
                        className="text-[36px] md:text-[44px] font-medium tracking-tight leading-[1.2] text-white"
                    >
                        Privacy-First Real-Time
                        <br />
                        <span className="whitespace-nowrap">Payroll Streaming on Arbitrum</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ willChange: "transform, opacity" }}
                        className="text-lg text-gray-400 max-w-2xl leading-relaxed"
                    >
                        Per-second salary streaming with Sablier and Fhenix.
                        <br />
                        <span className="whitespace-nowrap">Complete auditability for you, complete privacy for your team on Arbitrum.</span>
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ willChange: "transform, opacity" }}
                        className="flex flex-wrap items-center gap-4"
                    >
                        <Link href="/dashboard" className="inline-flex px-8 py-3 bg-kast-teal text-black font-bold rounded-full hover:scale-105 transition-transform border-2 border-kast-teal hover:bg-transparent hover:text-kast-teal">
                             Launch App
                        </Link>
                        <a href="#" className="inline-flex px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform border-2 border-white hover:bg-transparent hover:text-white items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z" /></svg>
                            Watch demo
                        </a>
                        <Link href="/claim/dashboard" className="inline-flex px-8 py-3 bg-transparent text-kast-teal font-bold rounded-full hover:scale-105 transition-transform border-2 border-kast-teal hover:bg-kast-teal hover:text-black">
                            Claim Salary
                        </Link>
                    </motion.div>

                </div>
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    style={{ willChange: "transform, opacity" }}
                    className="flex items-center justify-start w-full"
                >
                    <div className="relative w-full max-w-[540px] h-auto z-20 ">
                        <Image
                            src="/phone-screenshot-v2.png"
                            alt="RIAD Finance App"
                            width={632}
                            height={1048}
                            className="w-full h-auto object-contain"
                            priority
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
