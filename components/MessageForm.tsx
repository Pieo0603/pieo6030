import React, { useState, useRef } from 'react';
import { Camera, Send, Sparkles, User } from 'lucide-react';
import { generateWish } from '../services/geminiService';
import { Message, ThemeConfig } from '../types';

interface MessageFormProps {
  onAddMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  theme: ThemeConfig;
}

const MessageForm: React.FC<MessageFormProps> = ({ onAddMessage, theme }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateWish = async () => {
    setIsGenerating(true);
    const wish = await generateWish();
    setContent(wish);
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await onAddMessage({
        author: isAnonymous ? 'Người bí ẩn' : (name || 'Bạn học'),
        content,
        isAnonymous,
        imageUrl: image,
        avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${isAnonymous ? 'anon' : name}`,
      });

      // Reset form on success
      setContent('');
      setImage(undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert("Gửi lời chúc thành công! 🎉");
    } catch (error: any) {
      console.error("Lỗi gửi tin nhắn:", error);
      if (error.code === 'permission-denied') {
        alert("Lỗi: Bạn chưa mở quyền ghi (Firestore Rules). Vào Firebase Console > Firestore Database > Rules và đổi 'false' thành 'true'.");
      } else if (error.code === 'unavailable') {
        alert("Lỗi: Không có kết nối mạng hoặc sai cấu hình Firebase.");
      } else {
        alert("Lỗi gửi tin: " + error.message + ". Hãy kiểm tra file services/firebase.ts xem đã thay config chưa?");
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-12 mb-16">
      <div className={`glass-panel rounded-2xl p-6 shadow-2xl ${theme.shadow} transition-shadow duration-500`}>
        <h3 className={`text-xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r ${theme.gradientTitle} transition-all duration-500`}>
          Gửi một chút tâm sự nhỏ
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={16} className={`text-gray-400 group-focus-within:${theme.text} transition-colors duration-300`} />
            </div>
            <input
              type="text"
              placeholder="Tên của bạn (để trống nếu muốn ẩn danh)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isAnonymous}
              className={`w-full bg-black/20 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 ${theme.inputFocus} transition-all duration-300 ${isAnonymous ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Message Input */}
          <div className="relative">
            <textarea
              placeholder="Gửi lời tâm sự, lời chúc, động viên đến các bạn thí sinh..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full bg-black/20 border border-gray-700 rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 ${theme.inputFocus} transition-all duration-300 resize-none`}
            />
            {/* AI Generator Button */}
            <button
              type="button"
              onClick={handleGenerateWish}
              disabled={isGenerating}
              className={`absolute bottom-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 ${theme.text} transition-colors flex items-center gap-1 text-xs`}
              title="Nhờ AI viết giúp"
            >
              <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
              {isGenerating ? 'Đang viết...' : 'AI Gợi ý'}
            </button>
          </div>

          {/* File Upload & Options */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
               <label className="cursor-pointer flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-2 w-full sm:w-auto justify-center">
                  <Camera size={16} />
                  <span>{image ? 'Đã chọn ảnh' : 'Thêm ảnh kỷ niệm'}</span>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
               </label>
               {image && (
                 <button 
                  type="button" 
                  onClick={() => {setImage(undefined); if(fileInputRef.current) fileInputRef.current.value = '';}}
                  className="text-red-400 hover:text-red-300 text-xs"
                 >
                   Xóa
                 </button>
               )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className={`w-4 h-4 rounded border-gray-600 ${theme.text} focus:ring-offset-0 bg-gray-800`}
              />
              <span className="text-sm text-gray-300">Gửi ẩn danh</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-gradient-to-r ${theme.buttonGradient} hover:opacity-90 text-white font-bold py-3 rounded-lg shadow-lg ${theme.shadow} transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2`}
          >
            <Send size={18} />
            <span>GỬI LỜI CHÚC</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageForm;