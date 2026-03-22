import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, RotateCcw, Activity, Download, FileJson, Info, CheckCircle2, XCircle,
    Monitor, Globe, Cloud, Server, Waypoints, Key, ShieldCheck, Timer,
    FileCheck, Route as RouteIcon, Cpu, Database, Send, ChevronRight, Github, Linkedin
} from 'lucide-react';
import { statusConfig } from './data';

const nodesData = [
    { id: 'client', label: 'Client', icon: Monitor, x: 0, y: 0 },
    { id: 'dns', label: 'DNS', icon: Globe, x: 180, y: 0 },
    { id: 'cdn', label: 'CDN / Edge', icon: Cloud, x: 360, y: 0 },
    { id: 'lb', label: 'Load Balancer', icon: Server, x: 540, y: 0 },
    { id: 'gateway', label: 'API Gateway', icon: Waypoints, x: 540, y: 100 },
    { id: 'auth', label: 'Authentication', icon: Key, x: 360, y: 100 },
    { id: 'authz', label: 'Authorization', icon: ShieldCheck, x: 180, y: 100 },
    { id: 'rate', label: 'Rate Limit', icon: Timer, x: 0, y: 100 },
    { id: 'val', label: 'Validation', icon: FileCheck, x: 0, y: 200 },
    { id: 'route', label: 'Routing', icon: RouteIcon, x: 180, y: 200 },
    { id: 'service', label: 'Service', icon: Cpu, x: 360, y: 200 },
    { id: 'db', label: 'DB / Cache', icon: Database, x: 540, y: 200 },
    { id: 'response', label: 'Response', icon: Send, x: 540, y: 300 },
];

export default function App() {
    const [statusCode, setStatusCode] = useState(200);
    const [simulating, setSimulating] = useState(false);
    const [currentNodeIdx, setCurrentNodeIdx] = useState(-1);
    const [speed, setSpeed] = useState(1);
    const [stepMode, setStepMode] = useState(false);
    const [logs, setLogs] = useState([]);
    const [animationCompleted, setAnimationCompleted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate a premium loading sequence
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const statuses = [200, 401, 403, 404, 422, 429, 500, 502, 503];

    const getTheme = (code) => {
        if (code === 200) return 'green';
        return 'red';
    };

    const statusOptions = statuses.map(s => ({
        code: s,
        text: s === 200 ? 'Success' : s < 500 ? 'Client Err' : 'Server Err',
        theme: getTheme(s)
    }));

    useEffect(() => {
        const hash = window.location.hash.replace('#/', '');
        if (statuses.includes(parseInt(hash))) {
            setStatusCode(parseInt(hash));
        }
    }, []);

    const selectStatus = (code) => {
        setStatusCode(code);
        // Use replaceState instead of location.hash to prevent "jump to anchor" scrolling
        window.history.replaceState(null, '', `/#/${code}`);

        // Comprehensive Reset
        setSimulating(false);
        setCurrentNodeIdx(-1);
        setLogs([]);
        setAnimationCompleted(false);

        // Immediate Restart
        setTimeout(() => {
            setSimulating(true);
            setCurrentNodeIdx(0);
        }, 100);
    };

    const resetSim = () => {
        setSimulating(false);
        setCurrentNodeIdx(-1);
        setLogs([]);
        setAnimationCompleted(false);
    };

    const startSim = () => {
        if (simulating && !stepMode) return;
        if (animationCompleted) resetSim();

        setTimeout(() => {
            setSimulating(true);
            setCurrentNodeIdx(prev => prev === -1 ? 0 : prev);
        }, 100);
    };

    const nextStep = () => {
        if (animationCompleted) return;
        if (currentNodeIdx === -1) {
            startSim();
        } else {
            setCurrentNodeIdx(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (simulating && currentNodeIdx >= 0) {
            const config = statusConfig[statusCode];
            const currentNode = nodesData[currentNodeIdx];

            const newLogs = config.logs.filter(l => l.node === currentNode.id);
            if (newLogs.length > 0) {
                setLogs(prev => [...prev, ...newLogs]);
            }

            if (config.failNode === currentNode.id) {
                setSimulating(false);
                setAnimationCompleted(true);
                return;
            }

            if (currentNodeIdx === nodesData.length - 1) {
                setSimulating(false);
                setAnimationCompleted(true);
                return;
            }

            if (stepMode) return;

            const timer = setTimeout(() => {
                setCurrentNodeIdx(prev => prev + 1);
            }, 800 / speed);

            return () => clearTimeout(timer);
        }
    }, [currentNodeIdx, simulating, statusCode, speed, stepMode]);

    const config = statusConfig[statusCode];
    const failNodeIdx = config.failNode ? nodesData.findIndex(n => n.id === config.failNode) : 999;

    const currentTheme = getTheme(statusCode);

    let packetTheme, glowClass;
    if (!animationCompleted && simulating) {
        packetTheme = 'bg-[#a855f7] text-white border-white';
        glowClass = 'glow-packet-purple';
    } else if (animationCompleted && config.failNode) {
        if (currentTheme === 'yellow') {
            packetTheme = 'bg-[#eab308] text-[#422006] border-[#fef08a]';
            glowClass = 'glow-packet-yellow';
        } else {
            packetTheme = 'bg-[#ef4444] text-white border-[#fecaca]';
            glowClass = 'glow-packet-red';
        }
    } else if (animationCompleted && !config.failNode) {
        packetTheme = 'bg-[#22c55e] text-[#052e16] border-[#bbf7d0]';
        glowClass = 'glow-packet-green';
    }

    const getCenters = () => nodesData.map(node => ({ x: node.x + 70, y: node.y + 25 }));
    const centers = getCenters();

    let pathString = `M ${centers[0].x} ${centers[0].y}`;
    for (let i = 1; i < centers.length; i++) {
        pathString += ` L ${centers[i].x} ${centers[i].y}`;
    }

    const activeCenter = currentNodeIdx >= 0 ? centers[currentNodeIdx] : null;

    return (
        <>
            {/* PRELOADER - uses explicit positioning for full iOS Safari compatibility */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 9999,
                            backgroundColor: '#050505',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        <div className="absolute inset-0 mesh-grid opacity-20 pointer-events-none" />

                        <div className="relative flex flex-col items-center gap-8 px-6">
                            {/* Animated Scanner Ring */}
                            <div className="relative w-24 h-24">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    style={{ position: 'absolute', inset: 0, borderRadius: '9999px', border: '2px solid transparent', borderTopColor: '#a855f7', borderBottomColor: '#27272a' }}
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    style={{ position: 'absolute', inset: '8px', borderRadius: '9999px', border: '1px solid transparent', borderRightColor: 'rgba(168,85,247,0.3)', borderLeftColor: 'rgba(168,85,247,0.3)' }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity className="w-8 h-8 text-[#a855f7] animate-pulse" />
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-xl font-black uppercase tracking-[0.4em] text-white text-center"
                                >
                                    HTTP Visualizer
                                </motion.h1>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-[#a855f7]/30" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Initializing Pipeline</span>
                                    <span className="w-8 h-[1px] bg-[#a855f7]/30" />
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-48 h-[2px] bg-zinc-900 rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a855f7] to-transparent"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            <div className={`flex flex-col h-[100dvh] w-screen premium-bg text-zinc-100 font-sans selection:bg-purple-500/30 overflow-hidden relative ${isMobile ? 'text-[14px]' : ''}`}>
                {/* Layered Background Elements */}
                <div className="absolute inset-0 mesh-grid opacity-[0.15] pointer-events-none z-0" />
                <div className="absolute top-0 left-0 w-[500px] h-[500px] radial-glow opacity-[0.2] pointer-events-none z-0" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] radial-glow opacity-[0.1] pointer-events-none z-0" />

                {/* MOBILE DRAWER (Payload) */}
                <AnimatePresence>
                    {drawerOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setDrawerOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                            />
                            <motion.div
                                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                                className="absolute left-0 top-0 bottom-0 w-[80%] bg-[#0a0a0c] border-r border-[#1f1f25] z-[101] p-6 shadow-2xl flex flex-col"
                            >
                                <h2 className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase mb-6 flex items-center justify-between font-mono">
                                    <span><FileJson className="w-4 h-4 inline mr-2" /> Payload</span>
                                    <button onClick={() => setDrawerOpen(false)} className="p-2 -mr-2 text-zinc-400">✕</button>
                                </h2>
                                <div className="bg-[#050505] border border-[#1f1f25] rounded-xl p-4 font-mono text-xs shadow-inner flex flex-col gap-4">
                                    <div className="flex items-center justify-between border-b border-[#1f1f25] pb-3 mb-1">
                                        <span className="text-[#a855f7] px-1.5 py-0.5 rounded bg-[#a855f7]/10 font-bold font-sans text-[10px] uppercase tracking-wider">POST</span>
                                        <span className="text-zinc-400">/api/v1/resource</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-zinc-600 uppercase tracking-widest text-[8px]">Header Selection</span>
                                            <div className={`p-2 rounded text-[10px] border ${statusCode === 401 ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-[#1f1f25] bg-black/40 text-zinc-400'}`}>
                                                Authorization: {statusCode === 401 ? 'Bearer invalid-tok' : 'Bearer eyJhbGci...'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-zinc-600 uppercase tracking-widest text-[8px]">Body Content</span>
                                            <div className={`p-2 rounded text-[10px] border ${statusCode === 422 ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' : 'border-[#1f1f25] bg-black/40 text-zinc-400'}`}>
                                                {'{ "data": "example" }'}
                                                {statusCode === 422 && <div className="text-[8px] mt-1 text-yellow-600">// Schema error</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Links Section */}
                                <div className="mt-auto pt-6 border-t border-[#1f1f25] flex flex-col gap-3">
                                    {/* LinkedIn Link */}
                                    <a
                                        href="https://www.linkedin.com/in/alluri-abishek-kumar/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        <div className="p-2 rounded-xl bg-[#0a66c2]/10 text-[#0a66c2]">
                                            <Linkedin className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">LinkedIn</span>
                                            <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">alluri-abishek-kumar</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 ml-auto text-zinc-600" />
                                    </a>
                                    {/* Portfolio Link */}
                                    <a
                                        href="https://portfolio-abi.onrender.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        <div className="p-2 rounded-xl bg-[#22c55e]/10 text-[#22c55e]">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">Portfolio</span>
                                            <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">portfolio-abi.onrender.com</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 ml-auto text-zinc-600" />
                                    </a>
                                    {/* Github Link */}
                                    <a
                                        href="https://github.com/ALLURIABISHEK"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        <div className="p-2 rounded-xl bg-[#a855f7]/10 text-[#a855f7]">
                                            <Github className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">GitHub</span>
                                            <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">@ALLURIABISHEK</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 ml-auto text-zinc-600" />
                                    </a>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* HEADER */}
                <header className="relative z-50 glass-effect h-14 shrink-0 flex items-center justify-between px-4 md:px-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                    {isMobile && (
                        <button onClick={() => setDrawerOpen(true)} className="p-2 text-zinc-400 bg-[#1f1f25]/50 rounded-lg">
                            <FileJson className="w-5 h-5" />
                        </button>
                    )}

                    <div className={`flex flex-col ${isMobile ? 'flex-1 items-center' : ''}`}>
                        {!isMobile && <p className="tracking-[0.2em] text-[8px] text-zinc-600 uppercase font-mono mb-0.5">Backend &mdash; Infrastructure</p>}
                        <h1 className={`${isMobile ? 'text-sm' : 'text-2xl'} font-black tracking-tight flex items-center gap-3 relative group`}>
                            <Activity className={`w-6 h-6 text-[#a855f7] ${isMobile ? 'hidden' : ''} drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]`} />
                            <span className="relative overflow-hidden bg-gradient-to-r from-white via-purple-200 to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer py-1 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                API Gateway Simulator
                            </span>
                            <motion.div
                                className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-50"
                                animate={{ scaleX: [0, 1, 0], opacity: [0, 0.5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </h1>
                    </div>

                    {/* Desktop Buttons Row */}
                    {!isMobile && (
                        <div className="flex items-center gap-2">
                            {statuses.map(code => {
                                const theme = getTheme(code);
                                const active = statusCode === code;
                                let btnClass = "border-[#1f1f25] text-zinc-500 hover:text-zinc-300 bg-[#050505]";
                                if (active) {
                                    if (theme === 'green') btnClass = "border-green-500/50 text-green-400 bg-green-500/10 glow-green text-glow-green shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                                    else if (theme === 'yellow') btnClass = "border-yellow-500/50 text-yellow-400 bg-yellow-500/10 glow-yellow text-glow-yellow shadow-[0_0_15px_rgba(234,179,8,0.3)]";
                                    else btnClass = "border-red-500/50 text-red-400 bg-red-500/10 glow-red text-glow-red shadow-[0_0_15px_rgba(239,68,68,0.3)]";
                                }
                                return (
                                    <button
                                        key={code}
                                        onClick={() => selectStatus(code)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold font-mono transition-all border ${btnClass}`}
                                    >
                                        {code}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Right Space for mobile to balance drawer button */}
                    {isMobile ? <div className="w-9" /> : (
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono uppercase tracking-wider cursor-pointer bg-[#050505] border border-[#1f1f25] px-3 py-2 rounded-lg hover:bg-[#1a1a2e]">
                                <input
                                    type="checkbox"
                                    checked={stepMode}
                                    onChange={() => {
                                        setStepMode(!stepMode);
                                        if (simulating) resetSim();
                                    }}
                                    className="w-3 h-3 rounded bg-[#0a0a0c] border-[#1f1f25] text-[#a855f7] focus:ring-[#a855f7] focus:ring-offset-[#050505]"
                                />
                                Step Mode
                            </label>

                            <div className="flex items-center bg-[#050505] border border-[#1f1f25] rounded-lg overflow-hidden">
                                {[1, 2, 3].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSpeed(s)}
                                        disabled={stepMode}
                                        className={`px-3 py-2 text-[10px] font-mono font-bold transition-colors ${speed === s && !stepMode ? 'bg-[#1f1f25] text-white' : 'text-zinc-500 hover:bg-[#1f1f25] hover:text-white'} disabled:opacity-30 disabled:hover:bg-transparent`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>

                            {!stepMode ? (
                                <button
                                    onClick={startSim}
                                    disabled={simulating}
                                    className="flex items-center gap-2 bg-[#22c55e] hover:bg-green-400 text-white px-5 py-2 rounded-lg font-bold font-sans text-sm transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:shadow-none"
                                >
                                    {animationCompleted ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                    {animationCompleted ? 'Reset' : 'Simulate'}
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={resetSim}
                                        className="flex items-center justify-center p-2 rounded-lg border border-[#1f1f25] bg-[#050505] text-zinc-400 hover:text-white hover:bg-[#1f1f25] transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        disabled={animationCompleted}
                                        className="flex items-center gap-2 bg-[#22c55e] hover:bg-green-400 text-white px-5 py-2 rounded-lg font-bold font-sans text-sm transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:shadow-none"
                                    >
                                        Next <Play className="w-4 h-4 ml-0.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </header>

                {/* MID SECTION (Scrollable on mobile) */}
                <div className={`flex-1 flex flex-col md:flex-row ${isMobile ? 'overflow-y-auto no-scrollbar scroll-smooth' : 'overflow-hidden'} relative z-10 w-full max-w-[1600px] mx-auto ${isMobile ? 'pt-4 pb-32' : ''}`}>

                    {/* LEFT PANEL (Hidden on mobile, in drawer) */}
                    {!isMobile && (
                        <aside className="w-[300px] border-r border-[#1f1f25] bg-black/20 backdrop-blur-sm p-5 flex flex-col shrink-0 overflow-y-auto">
                            <h2 className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4 flex items-center gap-2 font-mono">
                                <FileJson className="w-4 h-4" /> Request Payload
                            </h2>
                            <div className="bg-[#050505] border border-[#1f1f25] rounded-xl p-4 font-mono text-xs shadow-inner flex flex-col gap-4 relative overflow-hidden">
                                <div className="flex items-center justify-between border-b border-[#1f1f25] pb-3 mb-1">
                                    <span className="text-[#a855f7] px-1.5 py-0.5 rounded bg-[#a855f7]/10 font-bold font-sans text-[10px] uppercase tracking-wider">POST</span>
                                    <span className="text-zinc-400">/api/v1/resource</span>
                                </div>

                                <div className="flex flex-col gap-1.5 text-zinc-500">
                                    <span className="text-zinc-600 mb-0.5 uppercase tracking-widest text-[9px]">Headers</span>
                                    <div>Host: <span className="text-zinc-300">api.example.com</span></div>
                                    <div className={`transition-all ${statusCode === 401 ? 'text-red-400 bg-red-500/10 px-1.5 -mx-1.5 py-0.5 rounded border border-red-500/20' : ''}`}>
                                        Authorization: {statusCode === 401 ? <span className="text-red-500 font-bold">MISSING_OR_INVALID</span> : <span className="text-zinc-300">Bearer eyJhbGci...</span>}
                                    </div>
                                    <div className="truncate">User-Agent: <span className="text-zinc-300">Visualizer/1.0</span></div>
                                </div>

                                <div className="flex flex-col gap-1.5 text-zinc-500 pt-3 border-t border-[#1f1f25]">
                                    <span className="text-zinc-600 mb-0.5 uppercase tracking-widest text-[9px]">Body</span>
                                    <div className={`${statusCode === 422 ? 'text-yellow-400 bg-yellow-500/10 px-1.5 -mx-1.5 py-1.5 rounded border border-yellow-500/20' : 'text-zinc-300'}`}>
                                        <div className="text-zinc-600">{"{"}</div>
                                        <div className="pl-4">"data": "example payload"</div>
                                        <div className="text-zinc-600">{"}"}</div>
                                        {statusCode === 422 && <div className="text-yellow-500 text-[10px] mt-2 font-bold">// Schema validation err</div>}
                                    </div>
                                </div>
                            </div>

                            {/* Links Section */}
                            <div className="mt-auto pt-4 border-t border-[#1f1f25] flex flex-col gap-2">
                                {/* LinkedIn Link */}
                                <a
                                    href="https://www.linkedin.com/in/alluri-abishek-kumar/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#0a66c2]/30 transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-black/40 text-zinc-400 group-hover:text-[#0a66c2] group-hover:bg-[#0a66c2]/10 transition-colors">
                                        <Linkedin className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">LinkedIn</span>
                                        <span className="text-[8px] text-zinc-600 font-mono">alluri-abishek-kumar</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 ml-auto text-zinc-600 group-hover:text-[#0a66c2] group-hover:translate-x-0.5 transition-all" />
                                </a>
                                {/* Portfolio Link */}
                                <a
                                    href="https://portfolio-abi.onrender.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#22c55e]/30 transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-black/40 text-zinc-400 group-hover:text-[#22c55e] group-hover:bg-[#22c55e]/10 transition-colors">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">Portfolio</span>
                                        <span className="text-[8px] text-zinc-600 font-mono">portfolio-abi.onrender.com</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 ml-auto text-zinc-600 group-hover:text-[#22c55e] group-hover:translate-x-0.5 transition-all" />
                                </a>
                                {/* GitHub Link */}
                                <a
                                    href="https://github.com/ALLURIABISHEK"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#a855f7]/30 transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-black/40 text-zinc-400 group-hover:text-[#a855f7] group-hover:bg-[#a855f7]/10 transition-colors">
                                        <Github className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">GitHub Profile</span>
                                        <span className="text-[8px] text-zinc-600 font-mono">@ALLURIABISHEK</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 ml-auto text-zinc-600 group-hover:text-[#a855f7] group-hover:translate-x-0.5 transition-all" />
                                </a>
                            </div>
                        </aside>
                    )}

                    {/* CENTER PANEL (Animation) */}
                    <main className={`flex-1 relative flex flex-col items-center ${isMobile ? 'justify-start p-4 gap-4 min-h-max' : 'justify-center p-8'}`}>

                        {/* LIVE ANIMATED LOGS (Mobile Only) */}
                        {isMobile && (
                            <div className="w-full flex flex-col items-center gap-6 relative z-[45] mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center px-6"
                                >
                                    <h2 className="text-[12px] font-black tracking-[0.5em] uppercase bg-gradient-to-r from-[#a855f7] via-purple-300 to-[#a855f7] bg-clip-text text-transparent mb-1 drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]">Interactive Education</h2>
                                    <p className="text-sm font-medium text-zinc-300 italic leading-relaxed max-w-[300px]">
                                        "Master the flow of the web. Learn how every request tells a story."
                                    </p>
                                </motion.div>

                                <div className="w-[90%] h-[40px] overflow-hidden bg-[#0a0a0c]/60 border border-[#1f1f25] rounded-full px-5 flex items-center justify-center shadow-lg backdrop-blur-md">
                                    <div className="w-full relative h-[24px]">
                                        <AnimatePresence mode="popLayout">
                                            {(logs.length > 0 ? [logs[logs.length - 1]] : []).map((log, i) => (
                                                <motion.div
                                                    key={log.node + log.msg}
                                                    initial={{ y: 24, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -24, opacity: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="absolute inset-0 flex items-center justify-center gap-3 text-center"
                                                >
                                                    <div className={`flex items-center justify-center p-1.5 rounded-full ${log.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                                        {log.type === 'error' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className={`text-[11px] font-mono font-bold tracking-tight ${log.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                                        <span className="opacity-60 uppercase mr-2">{log.node}:</span> {log.msg}
                                                    </span>
                                                </motion.div>
                                            ))}
                                            {logs.length === 0 && !simulating && (
                                                <div className="flex items-center justify-center h-full text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
                                                    Ready for Simulation
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pipeline Animation Container */}
                        <div className="relative origin-top" style={{
                            width: 680,
                            height: 350,
                            transform: isMobile ? `scale(${(window.innerWidth - 40) / 680})` : 'translateY(-20px)',
                            marginBottom: isMobile ? (350 * ((window.innerWidth - 40) / 680)) - 350 : 0
                        }}>
                            {/* SVG Connecting Paths */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                <path d={pathString} fill="none" stroke="#1f1f25" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <motion.path
                                    d={pathString}
                                    fill="none"
                                    stroke={(simulating || (animationCompleted && !config.failNode)) ? '#a855f7' : '#27272a'}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-40"
                                    strokeDasharray="6,8"
                                    animate={{ strokeDashoffset: [0, -40] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                            </svg>

                            {/* Infrastructure Cluster */}
                            <motion.div
                                className="absolute border border-[#a855f7]/30 bg-[#a855f7]/5 rounded-3xl p-4 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                                style={{ left: -30, top: -30, width: 740, height: 390 }}
                                animate={isMobile ? {} : { borderColor: ["rgba(168,85,247,0.2)", "rgba(168,85,247,0.5)", "rgba(168,85,247,0.2)"] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <div className="absolute -top-3 left-10 bg-[#050505] px-3 text-[#a855f7] font-mono text-[9px] font-black tracking-[0.3em] uppercase">
                                    Backend Infrastructure
                                </div>
                            </motion.div>

                            {/* Nodes */}
                            {nodesData.map((node, i) => {
                                const Icon = node.icon;
                                const isPassed = currentNodeIdx > i || (currentNodeIdx === i && (!config.failNode || config.failNode !== node.id));
                                const isFailed = config.failNode === node.id && (currentNodeIdx === i || animationCompleted);
                                const isActive = currentNodeIdx === i;

                                let classes = "bg-[#0a0a14] border-[#1a1a2e] text-zinc-600 opacity-60";
                                let textGlow = "";
                                if (isFailed) {
                                    classes = currentTheme === 'yellow' ? "bg-yellow-500/20 border-yellow-500 text-yellow-500 z-10 glow-yellow opacity-100" : "bg-red-500/20 border-red-500 text-red-500 z-10 glow-red opacity-100";
                                    textGlow = currentTheme === 'yellow' ? "text-glow-yellow" : "text-glow-red";
                                } else if (isActive) {
                                    classes = "bg-[#a855f7]/30 border-[#a855f7] text-[#e9d5ff] z-10 glow-packet-purple opacity-100";
                                    textGlow = "text-glow-purple";
                                } else if (isPassed) {
                                    classes = "bg-green-500/20 border-green-500 text-green-500 opacity-100 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                                    textGlow = "text-glow-green";
                                }

                                return (
                                    <motion.div
                                        key={node.id}
                                        animate={isActive && !isMobile ? { scale: [1, 1.04, 1] } : {}}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className={`absolute flex items-center gap-3 px-4 py-2 w-[140px] h-[50px] rounded-xl border transition-all duration-300 shadow-xl ${classes}`}
                                        style={{ left: node.x, top: node.y }}>
                                        <Icon className={`w-4 h-4 shrink-0 ${textGlow} filter drop-shadow-[0_0_5px_currentColor]`} />
                                        <span className={`text-[10px] font-bold tracking-widest uppercase font-mono truncate ${textGlow}`}>{node.label}</span>
                                        {isFailed && (
                                            <div className={`absolute -right-2 -top-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#050505] border shadow-lg z-30 ${currentTheme === 'yellow' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}`}>
                                                <XCircle className="w-4 h-4" />
                                            </div>
                                        )}
                                        {isPassed && (
                                            <div className="absolute -right-2 -top-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#050505] border border-green-500 text-green-500 shadow-lg z-30">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}

                            {/* Request Packet */}
                            <AnimatePresence>
                                {(simulating || (animationCompleted && !config.failNode) || (animationCompleted && failNodeIdx !== 999)) && activeCenter && (
                                    <motion.div
                                        initial={{ x: activeCenter.x - 6, y: activeCenter.y - 6, opacity: 0, scale: 0.5 }}
                                        animate={{
                                            x: activeCenter.x - 6,
                                            y: activeCenter.y - 6,
                                            opacity: 1,
                                            scale: 1,
                                        }}
                                        transition={{
                                            x: { type: 'tween', duration: 0.25, ease: 'easeOut' },
                                            y: { type: 'tween', duration: 0.25, ease: 'easeOut' },
                                            opacity: { duration: 0.15 },
                                            scale: { duration: 0.15 },
                                        }}
                                        className={`absolute w-3 h-3 rounded-full border z-20 ${packetTheme} ${glowClass}`}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </main>

                    {/* SUMMARY / REASONS PANEL (Laptop & Mobile) */}
                    {(!isMobile || simulating || animationCompleted) && (
                        <aside className={`${isMobile ? 'w-full px-4 pb-4' : 'w-[320px] border-l border-[#1f1f25] bg-black/20 backdrop-blur-sm p-5'} flex flex-col shrink-0 z-10 overflow-hidden`}>
                            <h2 className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4 flex items-center gap-2 font-mono">
                                <Activity className="w-4 h-4" /> {!animationCompleted ? 'Live Pipeline' : 'Final Status'}
                            </h2>

                            <div className="flex-1 bg-[#050505] border border-[#1f1f25] shadow-inner rounded-xl p-4 font-mono text-xs overflow-y-auto flex flex-col gap-4">
                                {!animationCompleted && !isMobile ? (
                                    <div className="flex flex-col gap-2">
                                        {logs.length > 0 ? (
                                            logs.map((log, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className={`flex flex-col gap-1 p-2 rounded border ${log.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-zinc-900 border-[#1f1f25] text-zinc-300'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] uppercase tracking-widest text-[#a855f7] font-black">{log.node}</span>
                                                        <span className="h-[1px] flex-1 bg-zinc-800" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {log.type === 'error' ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                                        <span className="text-[10px]">{log.msg}</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-30 text-center gap-3">
                                                <Activity className="w-8 h-8" />
                                                <span className="text-[10px] uppercase tracking-[.2em] font-black">Awaiting request...</span>
                                            </div>
                                        )}
                                        {simulating && (
                                            <div className="mt-2 flex items-center gap-2 text-[9px] text-[#a855f7] animate-pulse">
                                                <div className="w-1 h-1 bg-current rounded-full" />
                                                PROCESSING...
                                            </div>
                                        )}
                                    </div>
                                ) : animationCompleted && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className={`text-lg font-black tracking-tight leading-tight ${config.failNode ? (currentTheme === 'yellow' ? 'text-yellow-400' : 'text-red-400') : 'text-green-400'}`}>
                                                {config.explanation.title}
                                            </div>
                                            <div className="text-zinc-400 leading-relaxed text-[11px] italic">
                                                {config.explanation.meaning}
                                            </div>
                                        </div>

                                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-[#1f1f25]">
                                            <span className="text-[9px] text-[#a855f7] block uppercase font-black mb-2 tracking-widest">Real-World Example</span>
                                            <p className="text-[11px] text-zinc-300 leading-relaxed">{config.explanation.example}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 pt-2 border-t border-[#1f1f25]">
                                            <div>
                                                <span className="text-[10px] text-zinc-600 block uppercase mb-2 font-bold tracking-wider">Root Causes</span>
                                                <ul className="space-y-2">
                                                    {config.explanation.reasons.map((r, i) => (
                                                        <li key={i} className={`text-[10px] flex items-start gap-2 ${config.failNode ? (currentTheme === 'yellow' ? 'text-yellow-500/80' : 'text-red-500/80') : 'text-green-500/80'}`}>
                                                            <span className="mt-1 w-1 h-1 bg-current rounded-full shrink-0" /> {r}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <span className="text-[10px] text-zinc-600 block uppercase mb-2 font-bold tracking-wider">Preventive Steps</span>
                                                <ul className="space-y-1.5">
                                                    {config.explanation.fix.map((f, i) => (
                                                        <li key={i} className="text-[10px] text-green-400/80 flex items-start gap-2">
                                                            <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" /> {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </aside>
                    )}

                </div>

                {/* BOTTOM PANEL (Mobile pill buttons only) */}
                {isMobile && (
                    <footer className="relative z-[60] border-t border-[#1f1f25] bg-[#0a0a0c]/98 shrink-0 px-3 flex flex-col justify-center shadow-[0_-20px_40px_rgba(0,0,0,1)]" style={{
                        paddingTop: '1rem',
                        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))'
                    }}>
                        {/* Scroll Hint */}
                        <div className="flex items-center justify-between px-2 mb-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Select Scenario</span>
                            <div className="flex items-center gap-2 opacity-50">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#a855f7]">Scroll</span>
                                <motion.div
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <ChevronRight className="w-3 h-3 text-[#a855f7]" />
                                </motion.div>
                            </div>
                        </div>

                        <div className="flex gap-3 overflow-x-auto px-1 no-scrollbar items-center pb-2">
                            {statusOptions.map(opt => (
                                <button
                                    key={opt.code}
                                    onClick={() => selectStatus(opt.code)}
                                    className={`flex flex-col items-center justify-center min-w-[110px] py-4 rounded-2xl border transition-all duration-300 font-mono shadow-xl ${statusCode === opt.code ? (opt.theme === 'green' ? 'border-green-500 bg-green-500/20 text-green-400' : opt.theme === 'yellow' ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400' : 'border-red-500 bg-red-500/20 text-red-400') : 'border-[#1f1f25] bg-white/5 text-zinc-400'
                                        }`}
                                >
                                    <span className="text-lg font-black">{opt.code}</span>
                                    <span className="text-[10px] uppercase tracking-wider font-bold">{opt.text}</span>
                                </button>
                            ))}
                        </div>

                        {/* Attribution for SEO */}
                        <div className="mt-4 pt-4 border-t border-white/5 text-center">
                            <p className="text-[9px] text-zinc-600 font-bold tracking-[0.2em] uppercase">
                                Designed & Developed by <span className="text-zinc-400">Alluri Abhishek Kumar</span>
                            </p>
                        </div>
                    </footer>
                )}

                {/* Desktop Attribution */}
                {!isMobile && (
                    <div className="absolute bottom-6 left-0 right-0 text-center z-50 pointer-events-none">
                        <p className="text-[10px] text-zinc-700 font-bold tracking-[0.3em] uppercase">
                            Designed & Developed by <span className="text-zinc-500">Alluri Abhishek Kumar</span>
                        </p>
                    </div>
                )}
            </div>
            <Analytics />
        </>
    );
}
