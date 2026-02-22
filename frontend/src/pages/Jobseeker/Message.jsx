import React, { useState, useEffect, useRef } from 'react';

// ── Mock Data ──────────────────────────────────────────────────────────
const initialConversations = {
    tc: {
        id: "tc",
        name: "TechCorp HR",
        initials: "TC",
        gradient: "linear-gradient(135deg,#4f46e5,#7c3aed)",
        role: "Customer Support Representative",
        status: "Active now",
        online: true,
        unread: 0,
        messages: [
            { id: 1, type: "received", text: "Hi there! 👋 Thank you for applying for the <strong>Customer Support Representative</strong> role at TechCorp. We were really impressed with your profile.", time: "10:30 AM" },
            { id: 2, type: "sent", text: "Hello! Thank you so much for reaching out. I'm really excited about the opportunity to join TechCorp. It's a company I've admired for a long time.", time: "10:35 AM" },
            { id: 3, type: "received", text: "That's wonderful to hear! We'd love to schedule a quick 30-minute interview this <strong>Thursday</strong>. Would 10:00 AM or 2:00 PM work better for you?", time: "10:42 AM" }
        ]
    },
    dg: {
        id: "dg",
        name: "Daily Grind Coffee",
        initials: "DG",
        gradient: "linear-gradient(135deg,#0891b2,#06b6d4)",
        role: "Barista",
        status: "Active 2 hrs ago",
        online: false,
        unread: 1,
        messages: [
            { id: 1, type: "received", text: "Hey! Thanks so much for applying to our <strong>Barista</strong> opening at Daily Grind Coffee ☕", time: "Yesterday 3:10 PM" },
            { id: 2, type: "received", text: "Could you send us your availability for the coming week? We'd love to get you in for a trial shift.", time: "Yesterday 3:11 PM" }
        ]
    },
    rh: {
        id: "rh",
        name: "RetailHub",
        initials: "RH",
        gradient: "linear-gradient(135deg,#059669,#10b981)",
        role: "Sales Associate",
        status: "Active yesterday",
        online: false,
        unread: 0,
        messages: [
            { id: 1, type: "received", text: "Your application for the <strong>Sales Associate</strong> role has been received. We will be in touch within 3–5 business days.", time: "Tuesday 9:00 AM" }
        ]
    },
    sw: {
        id: "sw",
        name: "SwiftLogix",
        initials: "SW",
        gradient: "linear-gradient(135deg,#d97706,#f59e0b)",
        role: "Warehouse Picker",
        status: "Active 3 days ago",
        online: false,
        unread: 0,
        messages: [
            { id: 1, type: "received", text: "Hi! We reviewed your application for the <strong>Warehouse Picker</strong> role and we're impressed with your experience.", time: "Monday 11:00 AM" },
            { id: 2, type: "sent", text: "Thank you! I'm very interested and available to start immediately.", time: "Monday 11:20 AM" },
            { id: 3, type: "received", text: "Great! We'll send over the formal offer letter by end of week. 🎉", time: "Monday 2:05 PM" }
        ]
    }
};

const emojiData = {
    smileys: ["😀", "😂", "🥲", "😊", "😎", "🤩", "😍", "🥳", "😅", "😭", "😤", "🤔", "😬", "😴", "🤗", "😇", "🙄", "😏", "🤭", "🫡"],
    work: ["💼", "📄", "📋", "📅", "✅", "🔔", "📧", "🎯", "🏆", "⏰", "💡", "🔑", "📊", "🚀", "🤝", "👔", "🖥️", "⌨️", "📱", "🗂️"],
    hands: ["👋", "👍", "👎", "👏", "🙌", "🤞", "✌️", "🤙", "💪", "🫶", "🖐️", "🤲", "👐", "🙏", "✍️", "🫰", "🤜", "🤛", "👊", "☝️"],
    symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❗", "❓", "⭐", "🔥", "✨", "💯", "🎉", "🎊", "🌟", "💎", "🏅"]
};

export default function Messages() {
    const [activeId, setActiveId] = useState('tc');
    const [extraMessages, setExtraMessages] = useState({ tc: [], dg: [], rh: [], sw: [] });
    const [inputText, setInputText] = useState("");
    const [filterTab, setFilterTab] = useState("all"); // 'all' or 'unread'

    // Emoji state
    const [showEmojiPanel, setShowEmojiPanel] = useState(false);
    const [activeEmojiCat, setActiveEmojiCat] = useState("smileys");

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPanelRef = useRef(null);
    const emojiBtnRef = useRef(null);
    const isMountedRef = useRef(false); // tracks whether initial mount is done

    // Close emoji panel on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                emojiPanelRef.current &&
                !emojiPanelRef.current.contains(event.target) &&
                emojiBtnRef.current &&
                !emojiBtnRef.current.contains(event.target)
            ) {
                setShowEmojiPanel(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-scroll to bottom — skip on first page load/refresh
    useEffect(() => {
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            return; // don't scroll on initial mount
        }
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeId, extraMessages]);

    const activeConv = initialConversations[activeId];
    const allMessages = [...activeConv.messages, ...extraMessages[activeId]];

    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const newMessage = { id: Date.now(), type: "sent", text: inputText.trim(), time: now };

        setExtraMessages(prev => ({
            ...prev,
            [activeId]: [...prev[activeId], newMessage]
        }));
        setInputText("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleEmojiClick = (emoji) => {
        setInputText(prev => prev + emoji);
    };

    // Mock file attachment logic
    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(1) + " MB";
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split(".").pop().toLowerCase();
        const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
        const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (isImage) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const fileMsg = {
                    id: Date.now(),
                    type: "sent",
                    isFile: true,
                    isImage: true,
                    fileName: file.name,
                    fileSize: formatSize(file.size),
                    src: ev.target.result,
                    time: now
                };
                setExtraMessages(prev => ({ ...prev, [activeId]: [...prev[activeId], fileMsg] }));
            };
            reader.readAsDataURL(file);
        } else {
            const fileMsg = {
                id: Date.now(),
                type: "sent",
                isFile: true,
                isImage: false,
                fileName: file.name,
                fileSize: formatSize(file.size),
                time: now
            };
            setExtraMessages(prev => ({ ...prev, [activeId]: [...prev[activeId], fileMsg] }));
        }
        e.target.value = ""; // reset input
    };

    const unreadCount = Object.values(initialConversations).filter(c => c.unread > 0).length;

    return (
        <div className="flex flex-1 bg-white font-sans text-slate-900 overflow-hidden">

            {/* ── Left Sidebar (Conversations List) ─────────────────────────── */}
            <aside className="w-full md:w-[340px] border-r border-slate-200 flex flex-col bg-slate-50 flex-shrink-0">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Messages</h2>
                            <span className="text-sm text-slate-500">{Object.keys(initialConversations).length} conversations</span>
                        </div>
                        <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-2.5 text-slate-400">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setFilterTab('all')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${filterTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterTab('unread')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${filterTab === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Unread
                            {unreadCount > 0 && <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {Object.values(initialConversations)
                        .filter(conv => filterTab === 'all' || conv.unread > 0)
                        .map(conv => {
                            const isActive = activeId === conv.id;
                            const hasUnread = conv.unread > 0 && !isActive;

                            // Get last message text for preview
                            const msgs = [...conv.messages, ...extraMessages[conv.id]];
                            const lastMsg = msgs[msgs.length - 1];
                            let previewText = lastMsg.text ? lastMsg.text.replace(/<[^>]+>/g, '') : (lastMsg.isFile ? `📎 ${lastMsg.fileName}` : "");

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setActiveId(conv.id)}
                                    className={`flex items-start gap-3 p-4 border-b border-slate-100 cursor-pointer transition-colors ${isActive ? 'bg-indigo-50/60' : 'hover:bg-slate-100'} ${hasUnread ? 'bg-white' : ''}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: conv.gradient }}>
                                            {conv.initials}
                                        </div>
                                        {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>{conv.name}</h4>
                                            <span className={`text-xs flex-shrink-0 ${hasUnread ? 'font-bold text-indigo-600' : 'text-slate-400'}`}>{lastMsg.time.split(' ')[0]}</span>
                                        </div>
                                        <p className={`text-sm truncate mb-1.5 ${hasUnread ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                                            {previewText}
                                        </p>
                                        <span className="inline-block px-2 py-0.5 bg-slate-200/60 text-slate-600 text-[10px] font-bold tracking-wide uppercase rounded-md truncate max-w-full">
                                            {conv.role}
                                        </span>
                                    </div>
                                    {hasUnread && (
                                        <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-2">
                                            {conv.unread}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </aside>

            {/* ── Right Chat Window ───────────────────────────────────────────── */}
            <section className="flex-1 flex flex-col bg-slate-50/50 min-w-0">

                {/* Chat Header */}
                <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: activeConv.gradient }}>
                            {activeConv.initials}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 leading-tight">{activeConv.name}</h3>
                            <div className="flex items-center text-xs text-slate-500 gap-1.5 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${activeConv.online ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                <span>{activeConv.status}</span>
                                <span>·</span>
                                <span className="truncate max-w-[200px] hidden sm:inline-block">{activeConv.role}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                        </button>
                        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold text-sm rounded-lg hover:bg-indigo-100 transition-colors ml-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            View Application
                        </button>
                    </div>
                </header>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
                    <div className="flex justify-center mb-2">
                        <span className="px-3 py-1 bg-slate-200/60 text-slate-500 text-xs font-semibold rounded-full">Today</span>
                    </div>

                    {allMessages.map((msg) => {
                        const isReceived = msg.type === "received";

                        return (
                            <div key={msg.id} className={`flex ${isReceived ? 'justify-start' : 'justify-end'}`}>
                                {isReceived && (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-auto" style={{ background: activeConv.gradient }}>
                                        {activeConv.initials}
                                    </div>
                                )}
                                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isReceived ? 'items-start' : 'items-end'}`}>

                                    {/* File Message Handling */}
                                    {msg.isFile ? (
                                        <div className={`p-3 rounded-2xl ${isReceived ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-none' : 'bg-indigo-600 text-white rounded-br-none'}`}>
                                            {msg.isImage ? (
                                                <div className="flex flex-col gap-2">
                                                    <img src={msg.src} alt={msg.fileName} className="max-w-full rounded-lg border border-black/10 max-h-48 object-cover" />
                                                    <span className="text-sm font-medium opacity-90">{msg.fileName} • {msg.fileSize}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg text-xl ${isReceived ? 'bg-slate-100' : 'bg-indigo-500'}`}>📎</div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">{msg.fileName}</span>
                                                        <span className={`text-xs ${isReceived ? 'text-slate-500' : 'text-indigo-200'}`}>{msg.fileSize}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Standard Text Message */
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed ${isReceived ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-none' : 'bg-indigo-600 text-white rounded-br-none'}`}
                                            dangerouslySetInnerHTML={{ __html: msg.text }}
                                        />
                                    )}

                                    <span className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                                        {msg.time} {msg.type === 'sent' && <span className="text-indigo-500">✓✓</span>}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <footer className="relative bg-white border-t border-slate-200 p-3 sm:p-4 flex items-end gap-2">

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                    />

                    {/* Toolbar (Attach & Emoji) */}
                    <div className="flex items-center gap-1 mb-1">
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Attach file">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        </button>
                        <button ref={emojiBtnRef} onClick={() => setShowEmojiPanel(!showEmojiPanel)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Emoji">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                        </button>
                    </div>

                    {/* Emoji Popover */}
                    {showEmojiPanel && (
                        <div ref={emojiPanelRef} className="absolute bottom-full left-4 mb-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden z-50">
                            <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Reactions</span>
                                <button onClick={() => setShowEmojiPanel(false)} className="text-slate-400 hover:text-slate-800">✕</button>
                            </div>
                            <div className="flex border-b border-slate-100">
                                {[
                                    { id: 'smileys', icon: '😀' },
                                    { id: 'work', icon: '💼' },
                                    { id: 'hands', icon: '👋' },
                                    { id: 'symbols', icon: '❤️' }
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveEmojiCat(cat.id)}
                                        className={`flex-1 py-2 text-xl hover:bg-slate-50 transition-colors ${activeEmojiCat === cat.id ? 'bg-slate-100 border-b-2 border-indigo-500' : ''}`}
                                    >
                                        {cat.icon}
                                    </button>
                                ))}
                            </div>
                            <div className="p-2 grid grid-cols-5 gap-1 max-h-48 overflow-y-auto">
                                {emojiData[activeEmojiCat].map((em, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleEmojiClick(em)}
                                        className="text-2xl p-1.5 hover:bg-slate-100 rounded-lg transition-transform hover:scale-110"
                                    >
                                        {em}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a message..."
                        className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all min-w-0"
                    />
                    <button
                        onClick={handleSendMessage}
                        className={`hidden sm:flex items-center gap-2 px-6 py-3 font-semibold rounded-2xl transition-all mb-[1px] ${inputText.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        Send
                    </button>

                    {/* Mobile Send Icon */}
                    <button
                        onClick={handleSendMessage}
                        className={`sm:hidden p-3 rounded-full flex items-center justify-center transition-colors mb-[1px] ${inputText.trim() ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </footer>
            </section>
        </div>
    );
}