import React, { useState } from 'react';

const mockChats = [
  { id: 1, name: "Sarah Jenkins", role: "Weekend Barista", lastMsg: "Thank you for the update!", time: "10:30 AM", unread: true },
  { id: 2, name: "David Miller", role: "Customer Support", lastMsg: "Here is my updated availability.", time: "Yesterday", unread: false },
  { id: 3, name: "Emily Chen", role: "Warehouse Picker", lastMsg: "Sounds great, see you then.", time: "Oct 24", unread: false }
];

export default function EmployerMessages() {
  const [activeChat, setActiveChat] = useState(mockChats[0].id);

  return (
    <div className="flex h-[calc(100vh-72px)] bg-white font-sans text-slate-900 border-t border-slate-200">
      
      {/* Sidebar */}
      <aside className="w-full md:w-[350px] border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Applicant Inbox</h2>
          <input type="text" placeholder="Search applicants..." className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockChats.map(chat => (
            <div key={chat.id} onClick={() => setActiveChat(chat.id)} className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex gap-3 ${activeChat === chat.id ? 'bg-indigo-50/50' : 'hover:bg-slate-100'}`}>
              <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">
                {chat.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className={`text-sm truncate ${chat.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{chat.name}</h4>
                  <span className="text-xs text-slate-400">{chat.time}</span>
                </div>
                <p className="text-xs text-indigo-600 font-semibold truncate mb-1">{chat.role}</p>
                <p className={`text-sm truncate ${chat.unread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Window */}
      <section className="flex-1 flex flex-col bg-slate-50/50 hidden md:flex">
        <header className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">Sarah Jenkins</h3>
            <span className="text-xs text-slate-500">Applicant for Weekend Barista</span>
          </div>
          <button className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100">View Full Profile</button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="flex justify-center"><span className="text-xs text-slate-400 font-bold uppercase">Today</span></div>
          <div className="flex justify-end">
            <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none text-sm max-w-[70%]">
              Hi Sarah, we reviewed your application and would love to schedule a quick interview.
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-800 p-3 rounded-2xl rounded-bl-none text-sm max-w-[70%]">
              Thank you for the update! I am available any time Thursday or Friday.
            </div>
          </div>
        </div>
        <footer className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <input type="text" placeholder="Type a message..." className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
          <button className="bg-indigo-600 text-white px-6 font-bold rounded-xl hover:bg-indigo-700">Send</button>
        </footer>
      </section>
    </div>
  );
}