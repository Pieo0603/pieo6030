import React, { useState, useMemo } from 'react';
import { Message, ThemeConfig } from '../types';
import { X, Trash2, CheckSquare, Square, Search, Download, Filter, LogOut, Wrench, Lock, Lightbulb } from 'lucide-react';

interface AdminDashboardProps {
  messages: Message[];
  onDeleteMessages: (ids: string[]) => void; // Changed interface
  onClose: () => void;
  theme: ThemeConfig;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ messages, onDeleteMessages, onClose, theme }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Filter and Sort
  const filteredMessages = useMemo(() => {
    let result = [...messages];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (msg) =>
          msg.content.toLowerCase().includes(lowerTerm) ||
          msg.author.toLowerCase().includes(lowerTerm)
      );
    }

    result.sort((a, b) => {
      if (sortOrder === 'newest') return b.timestamp - a.timestamp;
      return a.timestamp - b.timestamp;
    });

    return result;
  }, [messages, searchTerm, sortOrder]);

  // Handlers
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    const allIds = filteredMessages.map((m) => m.id);
    setSelectedIds(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const initiateDelete = () => {
    if (selectedIds.size === 0) return;
    setIsDeleteModalOpen(true);
    setPasswordInput('');
    setPasswordError(false);
  };

  const confirmDelete = () => {
    if (passwordInput === 'admin') {
      // Call the prop to delete from DB
      onDeleteMessages(Array.from(selectedIds));
      
      setSelectedIds(new Set());
      setIsDeleteModalOpen(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "wishes_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1a2e] text-white overflow-hidden flex flex-col font-sans">
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-[#1e1b2e] rounded-2xl border border-pink-500/20 shadow-2xl w-full max-w-md overflow-hidden transform scale-100">
              <div className="p-6 md:p-8 flex flex-col items-center text-center">
                  <div className="mb-4 text-orange-400">
                     <Lock size={32} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-red-500 mb-2">Xác nhận xóa với mật khẩu</h3>
                  <p className="text-gray-300 text-sm mb-6">
                    Bạn có chắc chắn muốn xóa <span className="font-bold text-white">{selectedIds.size}</span> lời chúc đã chọn?
                    <br/>
                    <span className="italic opacity-80">Hành động này không thể hoàn tác!</span>
                  </p>

                  <div className="w-full text-left mb-6">
                    <label className="block text-xs font-semibold text-gray-400 mb-2 ml-1">Nhập mật khẩu để xác nhận:</label>
                    <input 
                      type="password" 
                      value={passwordInput}
                      onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                      placeholder="Đố biết nè____."
                      className={`w-full bg-[#2a2438] border ${passwordError ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors`}
                      autoFocus
                    />
                    {passwordError && <p className="text-red-500 text-xs mt-1 ml-1">Mật khẩu không đúng!</p>}
                    <p className="flex items-center gap-1.5 text-[11px] text-pink-400 mt-3">
                       <Lightbulb size={12} />
                       Liên hệ admin nếu bạn muốn biết mật khẩu =)))
                    </p>
                  </div>

                  <div className="flex gap-3 w-full">
                     <button 
                       onClick={() => setIsDeleteModalOpen(false)}
                       className="flex-1 py-2.5 rounded-lg border border-pink-500/30 text-pink-300 hover:bg-pink-500/10 transition-colors flex items-center justify-center gap-2 font-medium"
                     >
                       <X size={16} /> Bỏ cuộc
                     </button>
                     <button 
                       onClick={confirmDelete}
                       className="flex-1 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-white shadow-lg transition-colors flex items-center justify-center gap-2 font-medium"
                     >
                       <Trash2 size={16} /> Xóa ngay
                     </button>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#16213e] border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 flex items-center gap-2">
                <Wrench size={24} className="text-pink-400" />
                Bảng điều khiển quản lý
            </h2>
        </div>
        
        <div className="flex items-center gap-4">
             <span className="text-sm text-gray-400">Tổng: {messages.length} lời chúc</span>
             <button
                onClick={onClose}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold shadow-lg shadow-pink-500/20"
                >
                <LogOut size={16} />
                Thoát quản lý
            </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-6 space-y-4">
        {/* Actions Row */}
        <div className="flex flex-wrap gap-3 items-center bg-[#1f2937]/50 p-3 rounded-xl border border-gray-700">
            <button onClick={selectAll} className="flex items-center gap-2 px-3 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-lg border border-emerald-600/30 text-xs font-semibold transition-all">
                <CheckSquare size={14} /> Chọn tất cả
            </button>
            <button onClick={deselectAll} className="flex items-center gap-2 px-3 py-2 bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 rounded-lg border border-gray-600/30 text-xs font-semibold transition-all">
                <X size={14} /> Bỏ chọn tất cả
            </button>
            <div className="h-6 w-px bg-gray-700 mx-2"></div>
            <button 
                onClick={initiateDelete} 
                disabled={selectedIds.size === 0}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${selectedIds.size > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 cursor-pointer' : 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'}`}
            >
                <Trash2 size={14} /> Xóa đã chọn ({selectedIds.size})
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 rounded-lg border border-cyan-600/30 text-xs font-semibold transition-all ml-auto">
                <Download size={14} /> Xuất đã chọn ({selectedIds.size > 0 ? selectedIds.size : messages.length})
            </button>
        </div>

        {/* Filter Row */}
        <div className="flex gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm lời chúc..." 
                    className="w-full bg-[#111827] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="relative min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select 
                    className="w-full bg-[#111827] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none focus:border-purple-500 appearance-none cursor-pointer"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                </select>
            </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-grow overflow-y-auto px-6 pb-20 custom-scrollbar">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMessages.map(msg => (
                <div 
                    key={msg.id}
                    onClick={() => toggleSelect(msg.id)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${selectedIds.has(msg.id) ? 'bg-purple-900/20 border-purple-500 shadow-lg shadow-purple-500/10' : 'bg-[#1f2937] border-gray-800 hover:border-gray-600'}`}
                >
                    {/* Checkbox Overlay */}
                    <div className="absolute top-3 left-3 z-10">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.has(msg.id) ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-500 bg-black/40 group-hover:border-gray-300'}`}>
                            {selectedIds.has(msg.id) && <CheckSquare size={14} />}
                        </div>
                    </div>

                    <div className="flex justify-between items-start pl-8 mb-2">
                         <div className="flex flex-col">
                             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider line-clamp-1">{msg.author}</span>
                             <span className="text-[10px] text-gray-600">{formatDate(msg.timestamp)}</span>
                         </div>
                         {msg.imageUrl && (
                             <img src={msg.imageUrl} alt="thumb" className="w-10 h-10 object-cover rounded border border-gray-700" />
                         )}
                    </div>

                    <div className="pl-8">
                         <p className="text-sm text-gray-300 italic line-clamp-3">"{msg.content}"</p>
                    </div>

                    {/* Footer strip for ID (optional debug) or actions */}
                    <div className="mt-3 pt-2 border-t border-gray-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] text-gray-600 font-mono">ID: {msg.id.slice(-4)}</span>
                         <span className="text-[10px] text-pink-400">Nhấp để chọn</span>
                    </div>
                </div>
            ))}

            {filteredMessages.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-500">
                    Không tìm thấy tin nhắn nào khớp với yêu cầu.
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
