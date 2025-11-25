import React, { useState, useEffect, useRef } from 'react';

// --- Data: N5 Kanji Modules ---
const MODULES = [
    {
        id: 1,
        title: "N5 Basics: Nature & People",
        kanji: [
            { char: "日", on: "にち", kun: "ひ", meaning: "Day / Sun", description: "The sun radical. Represents the sun or a day." },
            { char: "木", on: "もく", kun: "き", meaning: "Tree", description: "Looks like a tree with branches and roots." },
            { char: "人", on: "じん", kun: "ひと", meaning: "Person", description: "A person walking, viewed from the side." },
            { char: "水", on: "すい", kun: "みず", meaning: "Water", description: "Ripples of water flowing in a stream." },
            { char: "火", on: "か", kun: "ひ", meaning: "Fire", description: "Flames reaching upwards." },
            { char: "山", on: "さん", kun: "やま", meaning: "Mountain", description: "Three peaks of a mountain range." },
            { char: "川", on: "せん", kun: "かわ", meaning: "River", description: "Lines representing the flow of a river." },
            { char: "田", on: "でん", kun: "た", meaning: "Rice Field", description: "A field divided into four sections for irrigation." },
            { char: "口", on: "こう", kun: "くち", meaning: "Mouth", description: "An open mouth." },
            { char: "目", on: "もく", kun: "め", meaning: "Eye", description: "An eye with the pupil in the center." }
        ]
    },
    {
        id: 2,
        title: "N5 Basics: Numbers 1-10",
        kanji: [
            { char: "一", on: "いち", kun: "ひと", meaning: "One", description: "One horizontal line." },
            { char: "二", on: "に", kun: "ふた", meaning: "Two", description: "Two horizontal lines." },
            { char: "三", on: "さん", kun: "み", meaning: "Three", description: "Three horizontal lines." },
            { char: "四", on: "し", kun: "よん", meaning: "Four", description: "A box with legs inside." },
            { char: "五", on: "ご", kun: "いつ", meaning: "Five", description: "Number 5." },
            { char: "六", on: "ろく", kun: "む", meaning: "Six", description: "A lid over legs." },
            { char: "七", on: "しち", kun: "なな", meaning: "Seven", description: "Number 7, looks like an upside down 7 with a slash." },
            { char: "八", on: "はち", kun: "や", meaning: "Eight", description: "Two lines parting ways." },
            { char: "九", on: "きゅう", kun: "ここの", meaning: "Nine", description: "Number 9." },
            { char: "十", on: "じゅう", kun: "とお", meaning: "Ten", description: "A cross shape." }
        ]
    },
    {
        id: 3,
        title: "N5 Basics: Directions & Concepts",
        kanji: [
            { char: "上", on: "じょう", kun: "うえ", meaning: "Up / Above", description: "A line indicating a position above the ground." },
            { char: "下", on: "か", kun: "した", meaning: "Down / Below", description: "A line indicating a position below the ground." },
            { char: "左", on: "さ", kun: "ひだり", meaning: "Left", description: "A hand holding a tool (work)." },
            { char: "右", on: "う", kun: "みぎ", meaning: "Right", description: "A hand holding a mouth (eating)." },
            { char: "中", on: "ちゅう", kun: "なか", meaning: "Middle / Inside", description: "A line cutting through the center of a rectangle." },
            { char: "大", on: "だい", kun: "おお", meaning: "Big", description: "A person stretching their arms out wide." },
            { char: "小", on: "しょう", kun: "ちい", meaning: "Small", description: "Something small or split." },
            { char: "本", on: "ほん", kun: "もと", meaning: "Book / Origin", description: "A tree with a mark at the root." },
            { char: "円", on: "えん", kun: "まる", meaning: "Yen / Circle", description: "A round object or currency." },
            { char: "年", on: "ねん", kun: "とし", meaning: "Year", description: "Harvest of rice." }
        ]
    },
    {
        id: 4,
        title: "N5 Basics: Time & Space",
        kanji: [
            { char: "時", on: "じ", kun: "とき", meaning: "Time / Hour", description: "Sun + Temple/Government office (standard)." },
            { char: "分", on: "ふん", kun: "わ", meaning: "Minute / Part", description: "To split/divide something with a knife." },
            { char: "半", on: "はん", kun: "なか", meaning: "Half", description: "Three lines divided down the middle." },
            { char: "今", on: "こん", kun: "いま", meaning: "Now", description: "A roof with a clock pendulum (conceptually)." },
            { char: "先", on: "せん", kun: "さき", meaning: "Before / Ahead", description: "A person moving ahead of others." },
            { char: "間", on: "かん", kun: "あいだ", meaning: "Interval / Between", description: "Sun shining through the gates." },
            { char: "午", on: "ご", kun: "うま", meaning: "Noon", description: "Derived from the pestle radical." },
            { char: "前", on: "ぜん", kun: "まえ", meaning: "Before / Front", description: "To cut hair/trim before a ceremony." },
            { char: "後", on: "ご", kun: "あと", meaning: "After / Behind", description: "Moving slowly on a road." },
            { char: "何", on: "か", kun: "なに", meaning: "What", description: "A person carrying a burden, asking 'what is it?'" }
        ]
    },
    {
        id: 5,
        title: "N5 Basics: Actions & Adjectives",
        kanji: [
            { char: "行", on: "こう", kun: "い", meaning: "Go", description: "An intersection of roads." },
            { char: "来", on: "らい", kun: "く", meaning: "Come", description: "A wheat plant (ancient meaning related to coming)." },
            { char: "食", on: "しょく", kun: "た", meaning: "Eat", description: "A mouth under a roof collecting food." },
            { char: "飲", on: "いん", kun: "の", meaning: "Drink", description: "Food + Yawning (mouth open)." },
            { char: "見", on: "けん", kun: "み", meaning: "See", description: "An eye on top of legs." },
            { char: "聞", on: "ぶん", kun: "き", meaning: "Hear", description: "An ear inside a gate." },
            { char: "高", on: "こう", kun: "たか", meaning: "Tall / Expensive", description: "A tall tower or building." },
            { char: "安", on: "あん", kun: "やす", meaning: "Cheap / Safe", description: "A woman under a roof (peaceful)." },
            { char: "新", on: "しん", kun: "あたら", meaning: "New", description: "Standing up a tree with an axe (freshly cut)." },
            { char: "古", on: "こ", kun: "ふる", meaning: "Old", description: "Ten mouths (stories passed down generations)." }
        ]
    },
    {
        id: 6,
        title: "N5 Basics: School & Study",
        kanji: [
            { char: "学", on: "がく", kun: "まな", meaning: "Study / Learn", description: "A child under a roof studying." },
            { char: "校", on: "こう", kun: "-", meaning: "School", description: "Tree + Intercourse/Association (place to gather)." },
            { char: "生", on: "せい", kun: "い", meaning: "Life / Student", description: "A plant growing out of the ground." },
            { char: "文", on: "ぶん", kun: "ふみ", meaning: "Sentence / Writing", description: "A pattern or lines crossing." },
            { char: "字", on: "じ", kun: "あざ", meaning: "Character / Letter", description: "A child under a roof (learning characters)." },
            { char: "語", on: "ご", kun: "かた", meaning: "Language / Word", description: "Words (speech) + I/Myself (five mouths)." },
            { char: "読", on: "どく", kun: "よ", meaning: "Read", description: "Words + Sell (reading aloud)." },
            { char: "書", on: "しょ", kun: "か", meaning: "Write", description: "A hand holding a brush." },
            { char: "名", on: "めい", kun: "な", meaning: "Name", description: "Evening + Mouth (saying name in the dark)." },
            { char: "友", on: "ゆう", kun: "とも", meaning: "Friend", description: "Two hands helping each other." }
        ]
    },
    {
        id: 7,
        title: "N5 Basics: Time & Nature",
        kanji: [
            { char: "月", on: "げつ", kun: "つき", meaning: "Moon / Month", description: "A crescent moon." },
            { char: "金", on: "きん", kun: "かね", meaning: "Gold / Money", description: "Metal/Gold buried in the earth." },
            { char: "土", on: "ど", kun: "つち", meaning: "Earth / Soil", description: "A sprout growing from the ground." },
            { char: "週", on: "しゅう", kun: "-", meaning: "Week", description: "Road + Circumference (cycle of days)." },
            { char: "毎", on: "まい", kun: "-", meaning: "Every", description: "Person + Mother (concept of frequency)." },
            { char: "夕", on: "せき", kun: "ゆう", meaning: "Evening", description: "A crescent moon (early evening)." },
            { char: "空", on: "くう", kun: "そら", meaning: "Sky / Empty", description: "Roof + Legs (space under roof)." },
            { char: "雨", on: "う", kun: "あめ", meaning: "Rain", description: "Water drops falling from a cloud." },
            { char: "天", on: "てん", kun: "あま", meaning: "Heaven", description: "A person with a line above (sky)." },
            { char: "気", on: "き", kun: "-", meaning: "Spirit / Air", description: "Steam rising from rice." }
        ]
    },
    {
        id: 8,
        title: "N5 Basics: Family & People",
        kanji: [
            { char: "父", on: "ふ", kun: "ちち", meaning: "Father", description: "Hand holding a stone axe (authority)." },
            { char: "母", on: "ぼ", kun: "はは", meaning: "Mother", description: "Woman with breasts (nursing)." },
            { char: "子", on: "し", kun: "こ", meaning: "Child", description: "A baby with a large head." },
            { char: "男", on: "だん", kun: "おとこ", meaning: "Man", description: "Rice field + Power (working in fields)." },
            { char: "女", on: "じょ", kun: "おんな", meaning: "Woman", description: "A kneeling woman." },
            { char: "兄", on: "きょう", kun: "あに", meaning: "Older Brother", description: "Mouth + Legs (speaking for the family)." },
            { char: "弟", on: "だい", kun: "おとうと", meaning: "Younger Brother", description: "A stick wrapped with string (order)." },
            { char: "姉", on: "し", kun: "あね", meaning: "Older Sister", description: "Woman + Market (city)." },
            { char: "妹", on: "まい", kun: "いもうと", meaning: "Younger Sister", description: "Woman + Not yet (immature)." },
            { char: "自", on: "じ", kun: "みずか", meaning: "Self", description: "A nose (pointing to oneself)." }
        ]
    },
    {
        id: 9,
        title: "N5 Basics: Adjectives & Colors",
        kanji: [
            { char: "白", on: "はく", kun: "しろ", meaning: "White", description: "A sun rising (white light)." },
            { char: "黒", on: "こく", kun: "くろ", meaning: "Black", description: "Soot from a fire." },
            { char: "赤", on: "せき", kun: "あか", meaning: "Red", description: "Big + Fire (raging fire)." },
            { char: "青", on: "せい", kun: "あお", meaning: "Blue", description: "Plant growing from a well (fresh color)." },
            { char: "多", on: "た", kun: "おお", meaning: "Many", description: "Two moons (many nights)." },
            { char: "少", on: "しょう", kun: "すく", meaning: "Few", description: "Small + Slash (whittled down)." },
            { char: "長", on: "ちょう", kun: "なが", meaning: "Long", description: "Hair growing long." },
            { char: "広", on: "こう", kun: "ひろ", meaning: "Wide", description: "A building on a cliff (spacious)." },
            { char: "早", on: "そう", kun: "はや", meaning: "Early", description: "Sun + Ten (morning time)." },
            { char: "近", on: "きん", kun: "ちか", meaning: "Near", description: "Road + Axe (cutting distance)." }
        ]
    },
    {
        id: 10,
        title: "N5 Basics: Verbs & Actions",
        kanji: [
            { char: "買", on: "ばい", kun: "か", meaning: "Buy", description: "Net + Shell (money)." },
            { char: "言", on: "げん", kun: "い", meaning: "Say", description: "Words coming from a mouth." },
            { char: "話", on: "わ", kun: "はな", meaning: "Speak", description: "Words + Tongue." },
            { char: "立", on: "りつ", kun: "た", meaning: "Stand", description: "A person standing on the ground." },
            { char: "休", on: "きゅう", kun: "やす", meaning: "Rest", description: "Person leaning on a tree." },
            { char: "会", on: "かい", kun: "あ", meaning: "Meet", description: "People gathering under a roof." },
            { char: "出", on: "しゅつ", kun: "で", meaning: "Exit", description: "A plant growing out of the ground." },
            { char: "入", on: "にゅう", kun: "はい", meaning: "Enter", description: "Roots entering the ground." },
            { char: "売", on: "ばい", kun: "う", meaning: "Sell", description: "Samurai + Legs (merchant)." },
            { char: "待", on: "たい", kun: "ま", meaning: "Wait", description: "Road + Temple (waiting at temple)." }
        ]
    }
];

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
        animation: drawStroke 1.5s ease-out forwards;
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
                        delay += 0.5; // 0.5s delay between strokes
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
const DrawingPad = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        // Set actual canvas size to match display size for sharp rendering
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const ctx = canvas.getContext('2d');
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
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
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
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div className="relative w-full h-48 md:h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 touch-none overflow-hidden group">
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <button
                onClick={clearCanvas}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-slate-400 hover:text-red-500 transition-colors border border-slate-200"
                title="Clear"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <div className="absolute bottom-3 left-3 text-xs font-bold text-slate-300 pointer-events-none uppercase tracking-wider">Practice Area</div>
        </div>
    );
};




// --- Components ---

import * as wanakana from 'wanakana';

const MenuScreen = ({ modules, activeModule, setActiveModule, startStudy }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [lookupChar, setLookupChar] = useState(null);
    const [notFound, setNotFound] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        const term = searchTerm.trim();
        if (!term) return;

        setNotFound(false);

        // 1. Check if input is a single Kanji/Japanese character (direct lookup)
        if (wanakana.isJapanese(term) && term.length === 1) {
            setLookupChar(term);
            return;
        }

        // 2. Search in Modules (Romaji -> Kana, or English Meaning)
        const kana = wanakana.toKana(term);
        const lowerTerm = term.toLowerCase();

        const found = modules.flatMap(m => m.kanji).find(k =>
            k.meaning.toLowerCase().includes(lowerTerm) ||
            k.on.includes(kana) ||
            k.kun.includes(kana)
        );

        if (found) {
            setLookupChar(found.char);
        } else {
            // If not found in modules, and it looks like a Kanji (but maybe user typed multiple?), try the first char?
            // Or just show not found.
            if (wanakana.isKanji(term[0])) {
                setLookupChar(term[0]);
            } else {
                setNotFound(true);
                setTimeout(() => setNotFound(false), 2000);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-6 space-y-8 pop-in w-full h-full overflow-hidden">
            <div className="text-center space-y-2 flex-shrink-0">
                <h1 className="text-4xl font-bold text-slate-800">Kanji Quest</h1>
                <p className="text-slate-500">Pen & Paper Mastery</p>
            </div>

            {/* Quick Lookup */}
            <form onSubmit={handleSearch} className="w-full max-w-sm flex flex-col gap-2 flex-shrink-0 relative">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Lookup (e.g. 猫, neko, water)"
                        className={`flex-1 p-3 rounded-xl border-2 outline-none transition-colors font-kanji text-lg ${notFound ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-indigo-500'}`}
                    />
                    <button type="submit" className="p-3 bg-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                </div>
                {notFound && <div className="absolute -bottom-6 left-0 text-xs text-red-500 font-bold ml-2">Not found in modules</div>}
            </form>

            {/* Lookup Modal */}
            {lookupChar && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setLookupChar(null)}>
                    <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 pop-in w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setLookupChar(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-2xl font-bold text-slate-800">Stroke Order</h3>
                        <div className="bg-slate-50 rounded-2xl border-2 border-slate-100 p-4">
                            <StrokeOrderViewer char={lookupChar} className="w-48 h-48" />
                        </div>
                        <div className="text-center">
                            <div className="text-6xl font-kanji text-slate-800 mb-2">{lookupChar}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 max-w-sm md:max-w-5xl mx-auto">
                    {modules.map(mod => (
                        <button
                            key={mod.id}
                            onClick={() => setActiveModule(mod)}
                            className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-32 ${activeModule.id === mod.id ? 'border-indigo-500 bg-indigo-50 shadow-indigo-100 shadow-lg' : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md'}`}
                        >
                            <div className="flex justify-between items-center mb-2 w-full">
                                <span className="font-bold text-indigo-900 uppercase tracking-wider text-xs">Module {mod.id}</span>
                                <span className="bg-indigo-200 text-indigo-800 text-xs px-2 py-1 rounded-full font-bold">{mod.kanji.length} Kanji</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 truncate w-full">{mod.title}</h3>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 w-full flex-shrink-0">
                <button
                    onClick={startStudy}
                    className="w-full max-w-sm py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <span>Start Module</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
                <div className="text-slate-400 text-xs font-bold">
                    (C) Simon Danielsson, 2025
                </div>
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
                        <h2 className="text-3xl font-bold text-indigo-900">{currentItem.meaning}</h2>
                        <p className="text-indigo-600/60 text-base">{currentItem.description}</p>
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

                {/* Details Grid */}
                <div className="w-full grid grid-cols-2 gap-4 mb-6 px-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <span className="text-xs text-slate-400 font-bold block mb-1">音読み (Onyomi)</span>
                        <span className="font-bold text-slate-700 text-xl">{currentItem.on}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <span className="text-xs text-slate-400 font-bold block mb-1">訓読み (Kunyomi)</span>
                        <span className="font-bold text-slate-700 text-xl">{currentItem.kun}</span>
                    </div>
                </div>

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
    const [testPromptType, setTestPromptType] = useState('meaning'); // 'meaning' or 'reading'

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

    // --- Game Logic ---

    const startStudy = () => {
        setPhase('study');
        setCurrentIndex(0);
        setRevealAnswer(false);
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

    const exitToMenu = () => {
        setPhase('menu');
        setCurrentIndex(0);
        setResults([]);
        setScore(0);
    };

    const currentItem = activeModule.kanji[currentIndex];
    const progress = ((currentIndex) / activeModule.kanji.length) * 100;

    // --- Main UI Router ---
    return (
        <div className="min-h-screen w-full bg-slate-50 font-fredoka text-slate-800 flex justify-center items-center md:p-8">
            <style>{styles}</style>
            <div className="w-full max-w-md md:max-w-7xl md:h-[85vh] md:rounded-3xl bg-white shadow-2xl min-h-screen md:min-h-0 flex flex-col relative overflow-hidden transition-all duration-500">
                {phase === 'menu' && (
                    <MenuScreen
                        modules={MODULES}
                        activeModule={activeModule}
                        setActiveModule={setActiveModule}
                        startStudy={startStudy}
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