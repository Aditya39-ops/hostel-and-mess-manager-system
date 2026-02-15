
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  Utensils, 
  Users, 
  Home, 
  MessageSquare, 
  Bell, 
  Menu,
  X,
  PlusCircle,
  Star,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingDown,
  Activity
} from 'lucide-react';
import { MaintenanceRequest, MessFeedback, GuestMeal, RequestStatus, RoomOccupancy } from './types';
import { summarizeFeedback, chatWithAssistant } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'maintenance' | 'mess' | 'occupancy' | 'guests'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // States
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([
    { id: '1', studentName: 'Rahul Singh', roomNumber: 'B-204', hostel: 'Mega Hostel', category: 'Electrical', description: 'Fan making loud noise', status: RequestStatus.PENDING, timestamp: new Date().toISOString() },
    { id: '2', studentName: 'Amit Kumar', roomNumber: 'A-102', hostel: 'H-7', category: 'Plumbing', description: 'Leaking tap in washroom', status: RequestStatus.IN_PROGRESS, timestamp: new Date().toISOString() },
  ]);

  const [messFeedbacks, setMessFeedbacks] = useState<MessFeedback[]>([
    { id: '1', mealType: 'Lunch', rating: 4, comment: 'Dal was great today!', timestamp: new Date().toISOString() },
    { id: '2', mealType: 'Breakfast', rating: 2, comment: 'Paratha was undercooked', timestamp: new Date().toISOString() },
  ]);

  const [guestMeals, setGuestMeals] = useState<GuestMeal[]>([
    { id: '1', guestName: 'Sohan Lal', hostStudent: 'Rahul Singh', date: '2023-11-20', meals: ['Lunch', 'Dinner'], status: 'Confirmed' }
  ]);

  const [aiSummary, setAiSummary] = useState<string>("Analyzing recent feedback...");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Form States
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [newMaint, setNewMaint] = useState({ category: 'Electrical', desc: '', room: '' });
  const [newFeedback, setNewFeedback] = useState({ meal: 'Lunch', rating: 5, comment: '' });

  useEffect(() => {
    const fetchSummary = async () => {
      const summary = await summarizeFeedback(messFeedbacks);
      setAiSummary(summary || "No insights available.");
    };
    fetchSummary();
  }, [messFeedbacks]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage("");
    setIsTyping(true);
    
    const context = { maintenanceRequests, messFeedbacks, guestMeals };
    const response = await chatWithAssistant(userMsg, context);
    setIsTyping(false);
    setChatHistory(prev => [...prev, { role: 'ai', text: response || "I'm having trouble connecting to the NITJ server." }]);
  };

  const addMaintenance = () => {
    const req: MaintenanceRequest = {
      id: Math.random().toString(36).substr(2, 9),
      studentName: 'Demo User',
      roomNumber: newMaint.room || 'A-101',
      hostel: 'Mega Hostel',
      category: newMaint.category as any,
      description: newMaint.desc,
      status: RequestStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    setMaintenanceRequests([req, ...maintenanceRequests]);
    setShowMaintForm(false);
    setNewMaint({ category: 'Electrical', desc: '', room: '' });
  };

  const addFeedback = () => {
    const feedback: MessFeedback = {
      id: Date.now().toString(),
      mealType: newFeedback.meal as any,
      rating: newFeedback.rating,
      comment: newFeedback.comment,
      timestamp: new Date().toISOString()
    };
    setMessFeedbacks([feedback, ...messFeedbacks]);
    setNewFeedback({ meal: 'Lunch', rating: 5, comment: '' });
  };

  const NavItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className={`font-medium ${!isSidebarOpen && 'hidden'}`}>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fe]">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-24'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col p-6`}>
        <div className="flex items-center justify-between mb-10">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">NITJ Hub</h1>
            </div>
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto">N</div>
          )}
        </div>
        
        <nav className="flex-1 space-y-4">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="maintenance" icon={Wrench} label="Maintenance" />
          <NavItem id="mess" icon={Utensils} label="Mess Feedback" />
          <NavItem id="occupancy" icon={Home} label="Occupancy" />
          <NavItem id="guests" icon={Users} label="Guest Meals" />
        </nav>

        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mt-auto p-3 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p className="text-slate-400 font-medium">B.R. Ambedkar National Institute of Technology Jalandhar</p>
          </div>
          <div className="flex items-center space-x-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
             <div className="hidden md:block text-right px-2">
               <p className="text-sm font-bold text-slate-700">Abhishek Kumar</p>
               <p className="text-[10px] text-blue-500 font-bold uppercase">Mega Hostel B</p>
             </div>
             <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">AK</div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Latency', value: '14m', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: '-2m from avg', trend: 'down' },
                { label: 'Complaints', value: maintenanceRequests.filter(r=>r.status === RequestStatus.PENDING).length, icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50', sub: '3 urgent today', trend: 'up' },
                { label: 'Mess Rating', value: '4.2', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Last 24 hours', trend: 'up' },
                { label: 'Occupancy', value: '94%', icon: Home, color: 'text-blue-600', bg: 'bg-blue-50', sub: '35 rooms free', trend: 'none' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}><stat.icon size={20} /></div>
                    {stat.trend !== 'none' && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center space-x-1 ${stat.trend === 'down' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {stat.trend === 'down' ? <TrendingDown size={12} /> : <TrendingDown size={12} className="rotate-180" />}
                        <span>{stat.sub}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</h3>
                  <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-bold text-slate-800">AI Quality Insights</h3>
                   <div className="flex space-x-2">
                     <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Analysis</span>
                   </div>
                </div>
                <div className="relative p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    "{aiSummary}"
                  </p>
                  <div className="mt-4 flex items-center space-x-3 text-xs font-bold text-blue-600">
                    <span className="px-3 py-1 bg-blue-100 rounded-full">Suggested: Inspect Mega Mess Breakfast</span>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="text-sm font-bold text-slate-800 mb-4">Communication Latency Tracker</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">STUDENT TO WARDEN RESPONSE</span>
                      <span className="text-blue-600">88% ON TIME</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                       <div className="bg-blue-600 h-full w-[88%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                   <MessageSquare className="text-blue-600" size={20} />
                   <span>Campus Assistant</span>
                </h3>
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 max-h-[300px]">
                  {chatHistory.map((chat, i) => (
                    <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                        chat.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'
                      }`}>
                        {chat.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && <div className="text-xs text-slate-400 animate-pulse font-bold">Assistant is thinking...</div>}
                </div>
                <div className="relative mt-auto">
                   <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about NITJ facilities..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-12 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                   />
                   <button onClick={handleSendMessage} className="absolute right-2 top-1.5 p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                     <ChevronRight size={18} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <div>
                 <h3 className="text-xl font-bold">Maintenance Workflow</h3>
                 <p className="text-sm text-slate-400">Avg. resolution time: 6.4 hours</p>
               </div>
               <button 
                onClick={() => setShowMaintForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95"
               >
                 <PlusCircle size={20} />
                 <span>Raise Issue</span>
               </button>
            </div>

            {showMaintForm && (
              <div className="bg-white p-8 rounded-3xl border-2 border-blue-500 shadow-xl animate-in zoom-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Issue Category</label>
                    <select 
                      value={newMaint.category}
                      onChange={(e) => setNewMaint({...newMaint, category: e.target.value})}
                      className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Electrical</option>
                      <option>Plumbing</option>
                      <option>Carpentry</option>
                      <option>Others</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                    <input 
                      type="text"
                      placeholder="e.g. Broken switch in room 204"
                      value={newMaint.desc}
                      onChange={(e) => setNewMaint({...newMaint, desc: e.target.value})}
                      className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button onClick={() => setShowMaintForm(false)} className="px-6 py-2 text-slate-400 font-bold">Cancel</button>
                  <button onClick={addMaintenance} className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl">Submit Requisition</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">ID</th>
                    <th className="px-8 py-5">Issue & Category</th>
                    <th className="px-8 py-5">Location</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Elapsed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenanceRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-mono text-xs text-slate-400">#{(parseInt(req.id) || 0).toString().padStart(4, '0')}</td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-800">{req.description}</p>
                        <p className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">{req.category}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-700">{req.roomNumber}</p>
                        <p className="text-xs text-slate-400">{req.hostel}</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`flex items-center space-x-2 text-[10px] font-black uppercase ${
                           req.status === RequestStatus.PENDING ? 'text-orange-500' : 'text-emerald-500'
                         }`}>
                           <div className={`w-2 h-2 rounded-full ${req.status === RequestStatus.PENDING ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                           <span>{req.status}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-slate-400 text-xs font-bold">2h 15m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'mess' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                 <h3 className="text-xl font-bold mb-6">Rate Current Meal</h3>
                 <div className="space-y-6">
                   <div className="flex space-x-4">
                     {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(m => (
                       <button 
                        key={m} 
                        onClick={() => setNewFeedback({...newFeedback, meal: m})}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${newFeedback.meal === m ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                       >
                         {m}
                       </button>
                     ))}
                   </div>
                   <div className="flex space-x-2">
                     {[1,2,3,4,5].map(n => (
                       <button 
                        key={n} 
                        onClick={() => setNewFeedback({...newFeedback, rating: n})}
                        className={`p-2 transition-transform hover:scale-110 ${newFeedback.rating >= n ? 'text-amber-400' : 'text-slate-200'}`}
                       >
                         <Star size={32} fill={newFeedback.rating >= n ? 'currentColor' : 'none'} />
                       </button>
                     ))}
                   </div>
                   <textarea 
                    value={newFeedback.comment}
                    onChange={(e) => setNewFeedback({...newFeedback, comment: e.target.value})}
                    placeholder="Tell us about the quality..." 
                    className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                    rows={3}
                   />
                   <button onClick={addFeedback} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100">Submit Quality Report</button>
                 </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-y-auto max-h-[600px]">
               <h3 className="text-xl font-bold mb-6">Recent Reports</h3>
               <div className="space-y-4">
                 {messFeedbacks.map(f => (
                   <div key={f.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group overflow-hidden">
                     <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{f.mealType}</span>
                       <div className="flex text-amber-400">
                         {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < f.rating ? 'currentColor' : 'none'} />)}
                       </div>
                     </div>
                     <p className="text-sm font-bold text-slate-700">"{f.comment}"</p>
                     <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase">{new Date(f.timestamp).toLocaleTimeString()}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {(activeTab === 'occupancy' || activeTab === 'guests') && (
           <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-slate-300" size={40} />
             </div>
             <h3 className="text-2xl font-black text-slate-800">Section Live in 24 Hours</h3>
             <p className="text-slate-400 mt-2 max-w-md mx-auto">This module is being syncronized with the central NITJ server. Occupancy data is updated every morning at 4:00 AM.</p>
             <button onClick={() => setActiveTab('dashboard')} className="mt-8 text-blue-600 font-black uppercase text-xs tracking-widest">Back to Dashboard</button>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
