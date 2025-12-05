import React, { useState, useEffect, useRef } from 'react';

import { MODULES } from './data/modules';
import { HIRAGANA_MODULE, KATAKANA_MODULE } from './data/kana';


// --- Styles ---
const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Fredoka:wght@400;600&display=swap');

    .font-fredoka { font-family: 'Fredoka', sans-serif; }
    .font-kanji { font-family: 'Noto Sans JP', sans-serif; }
    
    .stroke-order-svg {
        width: 100%;
        height: 100%;
    }
    .stroke-order-svg path {
        fill: none;
        stroke: #334155;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
    .stroke-order-svg text {
        font-size: 8px;
        fill: #94a3b8;
        font-family: sans-serif;
    }
    
    .pop-in { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

    /* Stroke Order Animation */
    @keyframes drawStroke {
        0% { stroke-dashoffset: 500; opacity: 0; }
        10% { opacity: 1; }
        100% { stroke-dashoffset: 0; opacity: 1; }
    }
    
    .stroke-order-svg path {
        stroke-dasharray: 500;
        stroke-dashoffset: 500;
        animation: drawStroke 1.0s ease-out forwards;
    }
`;

// --- Component: Stroke Order Viewer (KanjiVG) ---
// --- Component: Stroke Order Viewer (KanjiVG) ---
const StrokeOrderViewer = ({ char, className = "" }) => {
    const [svgContent, setSvgContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKanji = async () => {
            setLoading(true);
            try {
                const hex = char.codePointAt(0).toString(16).padStart(5, '0');
                const response = await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`);
                if (response.ok) {
                    let text = await response.text();
                    // Inject animation delays for each path
                    let delay = 0;
                    text = text.replace(/<path/g, () => {
                        const currentDelay = delay;
                        delay += 0.6; // 0.6s delay between strokes (sequential)
                        return `<path style="animation-delay: ${currentDelay}s"`;
                    });
                    setSvgContent(text);
                } else {
                    setSvgContent(null);
                }
            } catch (e) {
                console.error("Failed to load stroke order", e);
                setSvgContent(null);
            } finally {
                setLoading(false);
            }
        };
        fetchKanji();
    }, [char]);

    if (loading) return <div className={`flex items-center justify-center text-slate-400 ${className}`}>Loading...</div>;
    if (!svgContent) return <div className="font-kanji text-9xl text-slate-800">{char}</div>;

    return (
        <div
            className={`border-4 border-slate-100 rounded-3xl bg-white p-4 shadow-inner stroke-order-svg ${className}`}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};

// --- Component: Drawing Pad ---
// --- Component: Drawing Pad ---
const DrawingPad = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [trackpadMode, setTrackpadMode] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Set actual canvas size to match display size * pixel ratio for sharp rendering
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr); // Scale all drawing operations by dpr
        ctx.strokeStyle = '#334155'; // slate-700
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        e.preventDefault(); // Prevent scrolling on touch
        const { x, y } = getPos(e);
        const ctx = canvasRef.current.getContext('2d');

        if (trackpadMode) {
            // Toggle drawing state
            if (!isDrawing) {
                setIsDrawing(true);
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                setIsDrawing(false);
                ctx.closePath();
            }
        } else {
            // Standard drag to draw
            setIsDrawing(true);
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getPos(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!trackpadMode) {
            setIsDrawing(false);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Clear using the scaled dimensions
        ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
        // Note: clearRect uses the coordinate system, so we divide by dpr if we want to clear using logical coords, 
        // OR just clear the whole raw width/height.
        // Easier:
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    };

    return (
        <div className="relative w-full h-48 md:h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 touch-none overflow-hidden group">
            <canvas
                ref={canvasRef}
                className={`w-full h-full ${trackpadMode ? 'cursor-crosshair' : 'cursor-default'}`}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />

            {/* Controls Container */}
            <div className="absolute top-3 right-3 flex gap-2">
                {/* Trackpad Mode Toggle */}
                <button
                    onClick={() => {
                        setTrackpadMode(!trackpadMode);
                        setIsDrawing(false); // Reset drawing state when switching
                    }}
                    className={`p-2 rounded-lg shadow-sm border transition-colors ${trackpadMode ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-white/90 text-slate-400 border-slate-200 hover:text-slate-600'}`}
                    title={trackpadMode ? "Trackpad Mode On (Click to start/stop)" : "Trackpad Mode Off (Drag to draw)"}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                </button>

                {/* Clear Button */}
                <button
                    onClick={clearCanvas}
                    className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-slate-400 hover:text-red-500 transition-colors border border-slate-200"
                    title="Clear"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <div className="absolute bottom-3 left-3 text-xs font-bold text-slate-300 pointer-events-none uppercase tracking-wider flex items-center gap-2">
                <span>Practice Area</span>
                {trackpadMode && <span className="bg-indigo-100 text-indigo-500 px-1.5 py-0.5 rounded text-[10px]">Trackpad Mode</span>}
            </div>
        </div>
    );
};




// --- Components ---

import * as wanakana from 'wanakana';

// --- Component: Module Overview (Landing Page) ---
const ModuleOverview = ({ module, onStart, onBack }) => {
    return (
        <div className="flex-1 flex flex-col h-full pop-in overflow-hidden relative">
            {/* Header */}
            <div className="p-6 pb-2 flex items-center gap-4 border-b border-slate-100 bg-white/50 backdrop-blur z-10">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-slate-800 truncate flex-1">{module.title}</h2>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Module Contents</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {module.kanji.map((k, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center gap-1">
                                    <div className="text-4xl font-kanji text-slate-800 mb-1">{k.char}</div>
                                    <div className="text-xs font-bold text-indigo-600 text-center line-clamp-1">{k.on}</div>
                                    <div className="text-xs font-bold text-slate-500 text-center line-clamp-1">{k.kun}</div>
                                    <div className="text-[10px] font-bold text-slate-400 text-center line-clamp-1 mt-1 border-t border-slate-100 pt-1 w-full">{k.meaning}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-white z-10 flex justify-center">
                <button
                    onClick={() => onStart(module)}
                    className="w-full max-w-sm py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <span>Start Module</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
            </div>
        </div>
    );
};

// --- Component: Custom Test Modal ---
const CustomTestModal = ({ modules, onClose, onStart }) => {
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleStart = () => {
        if (selectedIds.length === 0) return;
        onStart(selectedIds);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] pop-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-slate-800">Create Custom Test</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-slate-500 mb-4">Select modules to include in your test:</p>
                    <div className="space-y-3">
                        {modules.map(mod => (
                            <label key={mod.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(mod.id)}
                                    onChange={() => toggleSelection(mod.id)}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                />
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800">{mod.title}</div>
                                    <div className="text-xs text-slate-400">{mod.kanji.length} Kanji</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-between items-center">
                    <div className="text-sm font-bold text-slate-500">
                        {selectedIds.length} Selected
                    </div>
                    <button
                        onClick={handleStart}
                        disabled={selectedIds.length === 0}
                        className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${selectedIds.length > 0 ? 'bg-indigo-600 text-white shadow-indigo-200 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        Start Test
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Component: Statistics Modal ---
const StatsModal = ({ stats, onClose }) => {
    const accuracy = stats.totalReviews > 0 ? Math.round((stats.correctReviews / stats.totalReviews) * 100) : 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl pop-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-slate-800">Your Statistics</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                        <div className="text-4xl font-bold text-indigo-600">{stats.totalReviews}</div>
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Total Reviews</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                        <div className="text-4xl font-bold text-green-600">{accuracy}%</div>
                        <div className="text-xs font-bold text-green-400 uppercase tracking-wider">Accuracy</div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 col-span-2">
                        <div className="text-4xl font-bold text-amber-600">{stats.modulesCompleted}</div>
                        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Modules Completed</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component: Settings Modal ---
const SettingsModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl pop-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-slate-800">Settings</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2">About App</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            KanjiCraft is designed to help you master Japanese handwriting through spaced repetition and stroke order practice.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Credits</h4>
                        <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-2">
                            <p>
                                <strong>Stroke Order Data:</strong><br />
                                This application uses data from the <a href="https://kanjivg.tagaini.net/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">KanjiVG</a> project.
                            </p>
                            <p className="italic">
                                "Kanji strokes data is provided by generic KanjiVG project under Creative Commons Attribution-Share Alike 3.0 license."
                            </p>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-300 font-mono pt-4 border-t border-slate-100">
                        v1.0.0 • Build 2025.12
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component: Menu Screen ---
const MenuScreen = ({ modules, launchModule, onViewModule, onStartCustom, userStats }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKanaSelect = (module) => {
        setShowDropdown(false);
        onViewModule(module);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const term = searchTerm.trim();
        if (!term) return;

        setNotFound(false);
        const lowerTerm = term.toLowerCase();
        // Convert to Hiragana to ensure Katakana inputs (e.g. "ニチ") match module readings (e.g. "にち")
        const kana = wanakana.toHiragana(term);

        // 1. Search in Modules
        let foundInModule = null;
        for (const mod of modules) {
            const index = mod.kanji.findIndex(k =>
                k.char === term ||
                k.meaning.toLowerCase().includes(lowerTerm) ||
                k.on.includes(kana) ||
                k.kun.includes(kana)
            );
            if (index !== -1) {
                foundInModule = { char: mod.kanji[index].char, module: mod, index };
                break;
            }
        }

        if (foundInModule) {
            setLookupResult(foundInModule);
            return;
        }

        // 2. If not in module, check if it's a valid Japanese character
        if (wanakana.isJapanese(term)) {
            // If it's a Kanji or single char, show it without module link
            if (term.length === 1) {
                setLookupResult({ char: term, module: null, index: null });
                return;
            }
        }

        setNotFound(true);
        setTimeout(() => setNotFound(false), 2000);
    };

    return (
        <div className="flex-1 flex flex-col items-center p-6 space-y-8 pop-in w-full h-full overflow-hidden relative">
            {/* Top Right Menu */}
            <div className="absolute top-6 right-6 z-20" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden pop-in origin-top-right">
                        <div className="p-2 space-y-1">
                            {/* Search Search */}
                            <form onSubmit={(e) => { handleSearch(e); setShowDropdown(false); }} className="px-2 pt-2 pb-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 transition-all focus:bg-white"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </form>

                            <div className="h-px bg-slate-100 my-1"></div>

                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    setShowCustomModal(true);
                                }}
                                className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                Custom Test
                            </button>
                            <button
                                onClick={() => handleKanaSelect(HIRAGANA_MODULE)}
                                className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-sm flex items-center gap-2"
                            >
                                <span className="w-4 text-center font-serif">あ</span>
                                Hiragana Guide
                            </button>
                            <button
                                onClick={() => handleKanaSelect(KATAKANA_MODULE)}
                                className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-sm flex items-center gap-2"
                            >
                                <span className="w-4 text-center font-serif">ア</span>
                                Katakana Guide
                            </button>

                            <div className="h-px bg-slate-100 my-1"></div>

                            <button
                                onClick={() => { setShowDropdown(false); setShowStatsModal(true); }}
                                className="w-full text-left px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 font-bold text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Statistics
                            </button>
                            <button
                                onClick={() => { setShowDropdown(false); setShowSettingsModal(true); }}
                                className="w-full text-left px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 font-bold text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Settings
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Test Modal */}
            {showCustomModal && (
                <CustomTestModal
                    modules={modules}
                    onClose={() => setShowCustomModal(false)}
                    onStart={(selectedIds) => {
                        setShowCustomModal(false);
                        onStartCustom(selectedIds);
                    }}
                />
            )}

            {showStatsModal && <StatsModal stats={userStats} onClose={() => setShowStatsModal(false)} />}
            {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}

            <div className="text-center space-y-2 flex-shrink-0 mt-8">
                <h1 className="text-4xl font-bold text-slate-800">KanjiCraft</h1>
                <p className="text-slate-500">Learn to write Japanese characters by hand!</p>
            </div>

            {/* Hero / Daily Goal Section */}
            <div className="w-full max-w-sm bg-indigo-500 text-white p-6 rounded-3xl shadow-lg shadow-indigo-200 mb-2 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-default">
                <div className="relative z-10">
                    <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Reviews</div>
                    <div className="text-3xl font-bold">{userStats.totalReviews}</div>
                    <div className="text-indigo-100 text-sm font-medium">Accuracy: {userStats.totalReviews > 0 ? Math.round((userStats.correctReviews / userStats.totalReviews) * 100) : 0}%</div>
                </div>
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <span className="text-xl font-bold">0%</span>
                </div>
                {/* Decorative Circles */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-400/50 rounded-full blur-xl"></div>
            </div>

            {/* Search error toast */}
            {notFound && (
                <div className="absolute top-24 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm pop-in">
                    Kanji not found in modules
                </div>
            )}

            {/* Lookup Modal */}
            {lookupResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setLookupResult(null)}>
                    <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 pop-in w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setLookupResult(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-2xl font-bold text-slate-800">Stroke Order</h3>
                        <div className="bg-slate-50 rounded-2xl border-2 border-slate-100 p-4">
                            <StrokeOrderViewer char={lookupResult.char} className="w-48 h-48" />
                        </div>
                        <div className="text-center">
                            <div className="text-6xl font-kanji text-slate-800 mb-2">{lookupResult.char}</div>
                            {lookupResult.module && (
                                <button
                                    onClick={() => launchModule(lookupResult.module, lookupResult.index)}
                                    className="mt-4 px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold hover:bg-indigo-200 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <span>View in Module</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 max-w-sm md:max-w-5xl mx-auto pb-6">
                    {modules.map(mod => (
                        <button
                            key={mod.id}
                            onClick={() => onViewModule(mod)}
                            className="p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between h-32 text-left group"
                        >
                            <div className="flex justify-between items-center mb-2 w-full">
                                <span className="font-bold text-indigo-900 uppercase tracking-wider text-xs">Module {mod.id}</span>
                                <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full font-bold group-hover:bg-indigo-100 transition-colors">{mod.kanji.length} Kanji</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 truncate w-full">{mod.title}</h3>
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-slate-400 text-xs font-bold flex-shrink-0">
                (C) Simon Danielsson, 2025
            </div>
        </div>
    );
};

const SummaryScreen = ({ score, total, results, onRetry, onMenu }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 pop-in">
        <div className="text-6xl mb-4">{score === total ? '🏆' : '📝'}</div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Module Complete!</h2>
        <p className="text-slate-500 mb-8">You scored {score} / {total}</p>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="grid grid-cols-5 gap-px bg-slate-100">
                {results.map((r, i) => (
                    <div key={i} className={`p-3 flex items-center justify-center font-kanji text-lg ${r.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {r.char}
                    </div>
                ))}
            </div>
        </div>

        <div className="flex gap-4 w-full max-w-sm">
            <button
                onClick={onMenu}
                className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold active:scale-95 transition-transform"
            >
                Menu
            </button>
            <button
                onClick={onRetry}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
            >
                Retry
            </button>
        </div>
    </div>
);

const StudyCard = ({ activeModule, currentIndex, currentItem, revealAnswer, setRevealAnswer, prevCard, nextCard, startTest, exitToMenu }) => {
    const [animationKey, setAnimationKey] = useState(0);

    const replayAnimation = () => {
        setAnimationKey(prev => prev + 1);
    };

    return (
        <div className="flex-1 w-full flex flex-col md:flex-row items-center md:justify-center pop-in max-w-md md:max-w-6xl mx-auto md:gap-12 md:px-8 h-full">
            {/* Desktop Left: Stroke Order */}
            <div className="hidden md:flex flex-col items-center justify-center w-1/2 h-full bg-slate-50 rounded-3xl border-2 border-slate-100 p-8 relative">
                <div className="relative group">
                    <StrokeOrderViewer key={animationKey} char={currentItem.char} />
                    <button
                        onClick={replayAnimation}
                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-indigo-500 hover:text-indigo-700 font-bold text-sm uppercase tracking-wider transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Replay
                    </button>
                </div>
            </div>

            {/* Right / Mobile Container */}
            <div className="w-full md:w-1/2 flex flex-col h-full justify-center overflow-y-auto py-4">
                {/* Header Controls */}
                <div className="w-full flex justify-between items-center px-4 mb-4">
                    <button onClick={exitToMenu} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <span className="text-xs font-bold uppercase">Exit</span>
                    </button>
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Study Mode</div>
                    <button onClick={startTest} className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
                        <span className="text-xs font-bold uppercase">Test Now</span>
                    </button>
                </div>

                <div className="w-full bg-indigo-50 p-6 rounded-3xl mb-6 relative mx-4 w-[calc(100%-2rem)]">
                    {/* Index Indicator */}
                    <div className="absolute top-4 right-4 text-xs font-bold text-indigo-300">
                        {currentIndex + 1} / {activeModule.kanji.length}
                    </div>

                    <div className="text-center space-y-2 mt-2">
                        <div className="flex flex-col items-center gap-1 mb-2">
                            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Readings</span>
                            <div className="flex flex-col gap-1">
                                <div className="text-2xl font-bold text-indigo-900">{currentItem.on}</div>
                                <div className="text-2xl font-bold text-indigo-900">{currentItem.kun}</div>
                            </div>
                        </div>
                        <div className="w-16 h-0.5 bg-indigo-100 mx-auto my-2"></div>
                        <h2 className="text-lg font-bold text-indigo-600/80">{currentItem.meaning}</h2>
                        <p className="text-sm text-indigo-400">{currentItem.description}</p>
                    </div>
                </div>

                {/* Mobile Stroke Order (Hidden on Desktop) */}
                <div className="mb-6 relative group md:hidden flex flex-col items-center justify-center gap-4">
                    <StrokeOrderViewer key={`mobile-${animationKey}`} char={currentItem.char} />
                    <button
                        onClick={replayAnimation}
                        className="flex items-center gap-2 text-indigo-500 hover:text-indigo-700 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Replay
                    </button>
                </div>

                {/* Details Grid - Removed as readings are now main focus */}
                {/* <div className="w-full grid grid-cols-2 gap-4 mb-6 px-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <span className="text-xs text-slate-400 font-bold block mb-1">音読み (Onyomi)</span>
                        <span className="font-bold text-slate-700 text-xl">{currentItem.on}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <span className="text-xs text-slate-400 font-bold block mb-1">訓読み (Kunyomi)</span>
                        <span className="font-bold text-slate-700 text-xl">{currentItem.kun}</span>
                    </div>
                </div> */}

                {/* Drawing Pad */}
                <div className="px-4 mb-6 w-full">
                    <DrawingPad key={currentItem.char} />
                </div>

                <div className="mt-auto w-full px-4 pb-2 flex gap-4">
                    <button
                        onClick={prevCard}
                        disabled={currentIndex === 0}
                        className={`flex-1 py-4 rounded-xl font-bold transition-all ${currentIndex === 0 ? 'bg-slate-100 text-slate-300' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 active:scale-95'}`}
                    >
                        Back
                    </button>
                    <button
                        onClick={nextCard}
                        className="flex-[2] py-4 bg-slate-800 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

const TestCard = ({ activeModule, currentIndex, currentItem, progress, revealAnswer, setRevealAnswer, handleSelfGrade, exitToMenu }) => {
    const [testPromptType, setTestPromptType] = useState('reading'); // 'meaning' or 'reading'

    return (
        <div className="flex-1 w-full flex flex-col items-center pop-in max-w-md mx-auto">
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 relative">
                <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            {/* Exit Control for Test Mode */}
            <div className="w-full flex justify-start p-4">
                <button onClick={exitToMenu} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <span className="text-xs font-bold uppercase">Exit Test</span>
                </button>
            </div>

            <div className="w-full flex-1 flex flex-col p-6 pt-0">
                <div className="flex justify-center mb-6">
                    <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-bold">
                        <button
                            onClick={() => setTestPromptType('meaning')}
                            className={`px-4 py-2 rounded-md transition-all ${testPromptType === 'meaning' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setTestPromptType('reading')}
                            className={`px-4 py-2 rounded-md transition-all ${testPromptType === 'reading' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
                        >
                            Readings
                        </button>
                    </div>
                </div>

                <div className="text-center mb-12 mt-4">
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Test Mode</span>

                    {testPromptType === 'meaning' ? (
                        <>
                            <h2 className="text-4xl font-bold text-slate-800 mb-4">{currentItem.meaning}</h2>
                            <p className="text-slate-400">Write the Kanji for this meaning</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold text-slate-800 mb-4">{currentItem.on} / {currentItem.kun}</h2>
                            <p className="text-slate-400">Write the Kanji for these readings</p>
                        </>
                    )}
                </div>

                {/* Reveal Area */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                    {revealAnswer ? (
                        <div className="flex flex-col items-center pop-in">
                            <StrokeOrderViewer char={currentItem.char} className="w-40 h-40 md:w-56 md:h-56 mb-4" />

                            {/* Show the info that wasn't in the prompt */}
                            {testPromptType === 'meaning' ? (
                                <div className="flex gap-4 text-sm text-slate-500">
                                    <span>{currentItem.on}</span>
                                    <span className="text-slate-300">|</span>
                                    <span>{currentItem.kun}</span>
                                </div>
                            ) : (
                                <div className="text-xl font-bold text-slate-700">
                                    {currentItem.meaning}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-40 h-40 border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center bg-slate-50">
                            <span className="text-4xl text-slate-300">?</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto space-y-4">
                    {!revealAnswer ? (
                        <button
                            onClick={() => setRevealAnswer(true)}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
                        >
                            Reveal Answer
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSelfGrade(false)}
                                className="py-4 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <span>Incorrect</span>
                                <span className="text-lg">✕</span>
                            </button>
                            <button
                                onClick={() => handleSelfGrade(true)}
                                className="py-4 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <span>Correct</span>
                                <span className="text-lg">✓</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Application Component ---
export default function App() {
    const [activeModule, setActiveModule] = useState(MODULES[0]);

    const [phase, setPhase] = useState('menu'); // 'menu', 'study', 'test', 'summary'
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealAnswer, setRevealAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [results, setResults] = useState([]);
    const [viewingModule, setViewingModule] = useState(null); // New state for landing page

    // --- Game Logic ---



    const launchModule = (module, index) => {
        setActiveModule(module);
        setCurrentIndex(index);
        setPhase('study');
        setRevealAnswer(false);
        setViewingModule(null);
    };

    const startTest = () => {
        setPhase('test');
        setCurrentIndex(0);
        setScore(0);
        setResults([]);
        setRevealAnswer(false);
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(c => c - 1);
            setRevealAnswer(false);
        }
    };

    const nextCard = () => {
        if (currentIndex < activeModule.kanji.length - 1) {
            setCurrentIndex(c => c + 1);
            setRevealAnswer(false);
        } else {
            if (phase === 'study') {
                startTest();
            } else {
                setPhase('summary');
            }
        }
    };

    const handleSelfGrade = (correct) => {
        const currentKanji = activeModule.kanji[currentIndex];
        setResults(prev => [...prev, { char: currentKanji.char, correct }]);
        if (correct) setScore(s => s + 1);
        nextCard();
    };

    const [userStats, setUserStats] = useState(() => {
        const saved = localStorage.getItem('kanjiQuestStats');
        return saved ? JSON.parse(saved) : { totalReviews: 0, correctReviews: 0, modulesCompleted: 0 };
    });

    useEffect(() => {
        localStorage.setItem('kanjiQuestStats', JSON.stringify(userStats));
    }, [userStats]);

    // Handle Module Completion & Stats Update
    const finishModule = () => {
        const score = results.filter(r => r.correct).length;
        const total = activeModule.kanji.length;

        // Update stats
        setUserStats(prev => ({
            totalReviews: prev.totalReviews + total,
            correctReviews: prev.correctReviews + score,
            modulesCompleted: prev.modulesCompleted + 1
        }));

        setPhase('summary');
    };

    const exitToMenu = () => {
        setPhase('menu');
        setCurrentIndex(0);
        setResults([]);
        setScore(0);
        setViewingModule(null);
    };

    const startCustomTest = (ids) => {
        const selectedModules = MODULES.filter(m => ids.includes(m.id));
        const combinedKanji = selectedModules.flatMap(m => m.kanji);

        const combinedModule = {
            id: 'custom',
            title: `Custom Test (${selectedModules.length} Modules)`,
            kanji: combinedKanji
        };

        setActiveModule(combinedModule);
        setPhase('study');
        setCurrentIndex(0);
        setResults([]);
        setScore(0);
        setRevealAnswer(false);
        setViewingModule(null);
    };

    const startStudy = () => {
        setPhase('study');
        setCurrentIndex(0);
        setResults([]);
        setScore(0);
        setRevealAnswer(false);
    };



    // Calculate Progress
    const progress = activeModule ? Math.round(((currentIndex) / activeModule.kanji.length) * 100) : 0;
    const currentItem = activeModule ? activeModule.kanji[currentIndex] : null;

    // --- Main UI Router ---
    return (
        <div className="h-screen w-screen bg-white overflow-hidden font-fredoka text-slate-800">
            <style>{styles}</style>
            <div className="w-full h-full flex flex-col relative overflow-hidden transition-all duration-500">
                {phase === 'menu' && !viewingModule && (
                    <MenuScreen
                        modules={MODULES}
                        launchModule={launchModule}
                        onViewModule={setViewingModule}
                        onStartCustom={startCustomTest}
                        userStats={userStats}
                    />
                )}
                {phase === 'menu' && viewingModule && (
                    <ModuleOverview
                        module={viewingModule}
                        onStart={(m) => launchModule(m, 0)}
                        onBack={() => setViewingModule(null)}
                    />
                )}
                {phase === 'study' && (
                    <StudyCard
                        activeModule={activeModule}
                        currentIndex={currentIndex}
                        currentItem={currentItem}
                        revealAnswer={revealAnswer}
                        setRevealAnswer={setRevealAnswer}
                        prevCard={prevCard}
                        nextCard={nextCard}
                        startTest={startTest}
                        exitToMenu={exitToMenu}
                    />
                )}
                {phase === 'test' && (
                    <TestCard
                        activeModule={activeModule}
                        currentIndex={currentIndex}
                        currentItem={currentItem}
                        progress={progress}
                        revealAnswer={revealAnswer}
                        setRevealAnswer={setRevealAnswer}
                        handleSelfGrade={handleSelfGrade}
                        exitToMenu={exitToMenu}
                    />
                )}
                {phase === 'summary' && (
                    <SummaryScreen
                        score={score}
                        total={activeModule.kanji.length}
                        results={results}
                        onRetry={startStudy}
                        onMenu={exitToMenu}
                    />
                )}
            </div>
        </div>
    );
}