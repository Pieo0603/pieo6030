import React, { useState } from 'react';
import { Message, ThemeConfig } from '../types';
import { Quote, Maximize2, X, Download, ZoomIn } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  theme: ThemeConfig;
}

const MessageList: React.FC<MessageListProps> = ({ messages, theme }) => {
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10 font-medium">
        <p>Chưa có lời nhắn nào. Hãy là người đầu tiên!</p>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleDownload = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation(); // Ngăn chặn việc đóng modal khi click nút download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `kyniem_thpt2026_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 pb-32">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight drop-shadow-md">
            Lời Nhắn Từ Mọi Người
          </h2>
          <span className="text-2xl animate-bounce">🥰</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {messages.map((msg) => {
             const { date, time } = formatDate(msg.timestamp);
             return (
              <div 
                key={msg.id} 
                className="hover-shine bg-[#111111]/60 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between h-full border border-white/5 hover:border-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl group hover:-translate-y-1"
              >
                 {/* Body: Content & Image */}
                 <div className="flex justify-between items-start gap-3 mb-4 flex-grow relative">
                   {/* Quote & Text */}
                   <div className="flex-1 min-w-0 z-10">
                     <Quote size={16} className={`${theme.textDim} opacity-60 mb-2 rotate-180`} />
                     <p className="text-white/90 text-[15px] font-medium leading-relaxed font-sans pl-1 break-words tracking-wide">
                       {msg.content}
                     </p>
                   </div>

                   {/* Thumbnail Image (Polaroid style) with Zoom Trigger */}
                   {msg.imageUrl && (
                     <div 
                        className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-white/10 bg-black overflow-hidden shadow-lg transform rotate-2 group-hover:rotate-0 transition-all duration-500 cursor-zoom-in group/image"
                        onClick={() => setViewingImage(msg.imageUrl)}
                     >
                       <img 
                        src={msg.imageUrl} 
                        alt="attachment" 
                        className="w-full h-full object-cover"
                       />
                       {/* Hover Overlay */}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 size={20} className="text-white drop-shadow-lg" />
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Footer: Divider, Author, Date */}
                 <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${msg.isAnonymous ? 'text-gray-400' : 'text-gray-200'} line-clamp-1`}>
                        {msg.author}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-end text-[10px] text-gray-500 font-medium leading-tight">
                      <span>{date}</span>
                      <span>{time}</span>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Modal / Lightbox */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
            onClick={() => setViewingImage(null)}
          >
            <X size={24} />
          </button>

          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            {/* Main Image */}
            <img 
              src={viewingImage} 
              alt="Full view" 
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-white/10 object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking the image
            />

            {/* Toolbar */}
            <div className="mt-4 flex gap-4" onClick={(e) => e.stopPropagation()}>
               <button 
                  onClick={(e) => handleDownload(e, viewingImage)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r ${theme.buttonGradient} text-white font-semibold shadow-lg hover:scale-105 transition-transform`}
               >
                  <Download size={18} />
                  <span>Lưu ảnh về máy</span>
               </button>
            </div>
            
            <p className="mt-4 text-gray-400 text-sm">Nhấn ra ngoài hoặc bấm ESC để đóng</p>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageList;