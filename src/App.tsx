import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Video, 
  Home, 
  Zap, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles, 
  Share2, 
  AlertCircle,
  Upload,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SYSTEM_PROMPT } from './constants';
import { FinalResult } from './types';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDescription, setVideoDescription] = useState('');
  const [roomInfo, setRoomInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FinalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit for demo
        setError('Video quá lớn. Vui lòng chọn file dưới 20MB.');
        return;
      }
      setVideoFile(file);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!roomInfo.trim()) {
      setError('Vui lòng nhập thông tin phòng trọ.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const parts: any[] = [
        { text: SYSTEM_PROMPT },
        { text: `THÔNG TIN PHÒNG TRỌ:\n${roomInfo}` }
      ];

      if (videoFile) {
        const base64Data = await fileToBase64(videoFile);
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: videoFile.type
          }
        });
        parts.push({ text: "Hãy phân tích video này làm video tham khảo." });
      } else if (videoDescription.trim()) {
        parts.push({ text: `MÔ TẢ VIDEO THAM KHẢO:\n${videoDescription}` });
      } else {
        parts.push({ text: "Không có video tham khảo. Hãy tự suy luận kịch bản viral dựa trên kinh nghiệm thực chiến tại Hà Nội." });
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts }],
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      const parsedResult = JSON.parse(text) as FinalResult;
      setResult(parsedResult);
    } catch (err: any) {
      console.error('Error generating content:', err);
      setError('Có lỗi xảy ra khi tạo nội dung. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Viral Real Estate</h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Hanoi Expert Content</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Video size={18} />
                </div>
                <h2 className="font-bold text-lg">Video Tham Khảo</h2>
              </div>

              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    videoFile ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="video/*,image/*"
                  />
                  {videoFile ? (
                    <>
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <Check size={24} />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-sm truncate max-w-[200px]">{videoFile.name}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                          className="text-xs text-red-500 mt-1 hover:underline"
                        >
                          Gỡ bỏ
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <Upload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-sm">Tải video lên</p>
                        <p className="text-xs text-gray-400 mt-1">Dưới 20MB (Video/Ảnh)</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-100"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400 font-medium">Hoặc mô tả video</span>
                  </div>
                </div>

                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Ví dụ: Video review phòng phong cách chill, nhạc lofi, quay cận cảnh nội thất..."
                  className="w-full min-h-[100px] p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
                />
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <Home size={18} />
                </div>
                <h2 className="font-bold text-lg">Thông Tin Phòng Trọ</h2>
              </div>

              <textarea
                value={roomInfo}
                onChange={(e) => setRoomInfo(e.target.value)}
                placeholder="Dán thông tin phòng tại đây (Địa chỉ, nội thất, giá, tiện ích...)"
                className="w-full min-h-[250px] p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
              />
              
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Đang phân tích & tạo kịch bản...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                    <span>TẠO CONTENT VIRAL NGAY</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!result && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border border-dashed border-gray-200"
                >
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-6">
                    <Zap size={40} fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Sẵn sàng bùng nổ?</h3>
                  <p className="text-gray-500 max-w-sm">
                    Nhập thông tin phòng và video tham khảo để nhận kịch bản viral "chốt khách" thần tốc.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-xs font-medium text-gray-500">#PhòngTrọHà Nội</span>
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-xs font-medium text-gray-500">#ContentViral</span>
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-xs font-medium text-gray-500">#SaleThựcChiến</span>
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-[40px]"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                      <Zap size={32} fill="currentColor" />
                    </div>
                  </div>
                  <p className="mt-8 font-bold text-lg animate-pulse">Đang "phù phép" content cho bạn...</p>
                  <p className="text-sm text-gray-400 mt-2">Dựa trên insight thực chiến tại Hà Nội</p>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {/* Step 0: Transcript */}
                  {result.transcript && result.transcript.length > 0 && (
                    <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <FileText size={120} />
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold">00</span>
                          <h2 className="font-bold text-xl">Trích Xuất Lời Thoại</h2>
                        </div>
                        <button 
                          onClick={() => {
                            const transcriptText = result.transcript?.map(t => `${t.timestamp}: ${t.text}`).join('\n') || '';
                            copyToClipboard(transcriptText, 'transcript');
                          }}
                          className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-orange-500"
                        >
                          {copiedSection === 'transcript' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                      </div>

                      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {result.transcript.map((item, i) => (
                          <div key={i} className="flex gap-4 items-start">
                            <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded shrink-0 mt-0.5">
                              {item.timestamp}
                            </span>
                            <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Step 1: Analysis */}
                  <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Video size={120} />
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">01</span>
                        <h2 className="font-bold text-xl">Phân Tích Video Viral</h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Hook</p>
                          <p className="text-sm font-medium italic">"{result.analysis.hook.text}"</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded font-bold uppercase">{result.analysis.hook.type}</span>
                            <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] rounded font-bold uppercase">{result.analysis.hook.emotion}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Insight</p>
                          <p className="text-sm leading-relaxed"><span className="font-bold">Vấn đề:</span> {result.analysis.insight.problem}</p>
                          <p className="text-sm leading-relaxed mt-1"><span className="font-bold">Lý do xem:</span> {result.analysis.insight.reason}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Lý do Viral</p>
                          <ul className="space-y-2">
                            {result.analysis.viralReasons.map((reason, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Step 2: Filtered Info */}
                  <section className="bg-[#151619] text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <Home size={120} />
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">02</span>
                        <h2 className="font-bold text-xl">Thông Tin Phòng Sạch</h2>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(result.filteredRoom.summary, 'room')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                      >
                        {copiedSection === 'room' ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-widest">
                        <Zap size={14} />
                        <span>{result.filteredRoom.address}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Nội thất</p>
                          <div className="flex flex-wrap gap-2">
                            {result.filteredRoom.furniture.map((item, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[11px]">{item}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Tiện ích</p>
                          <div className="flex flex-wrap gap-2">
                            {result.filteredRoom.utilities.map((item, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[11px]">{item}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Điểm cộng</p>
                          <div className="flex flex-wrap gap-2">
                            {result.filteredRoom.plusPoints.map((item, i) => (
                              <span key={i} className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded text-[11px]">{item}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 italic text-sm text-gray-300">
                        {result.filteredRoom.summary}
                      </div>
                    </div>
                  </section>

                  {/* Step 3: Script */}
                  <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">03</span>
                        <h2 className="font-bold text-xl">Kịch Bản Video Viral</h2>
                      </div>
                      <button 
                        onClick={() => {
                          const fullScript = `HOOK: ${result.script.hook}\n\nBODY:\n${result.script.body.join('\n')}\n\nTWIST: ${result.script.twist}\n\nCTA: ${result.script.cta}`;
                          copyToClipboard(fullScript, 'script');
                        }}
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-orange-500"
                      >
                        {copiedSection === 'script' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                    </div>

                    <div className="space-y-8">
                      <div className="relative pl-6 border-l-2 border-orange-500">
                        <span className="absolute -left-2 top-0 w-4 h-4 bg-orange-500 rounded-full border-4 border-white"></span>
                        <p className="text-[10px] uppercase font-bold text-orange-500 tracking-wider mb-1">Hook (Mở đầu cực gắt)</p>
                        <p className="text-lg font-bold leading-tight">{result.script.hook}</p>
                      </div>

                      <div className="relative pl-6 border-l-2 border-blue-500">
                        <span className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></span>
                        <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-2">Body (Dẫn dắt tự nhiên)</p>
                        <div className="space-y-3">
                          {result.script.body.map((line, i) => (
                            <p key={i} className="text-sm text-gray-600 leading-relaxed">{line}</p>
                          ))}
                        </div>
                      </div>

                      <div className="relative pl-6 border-l-2 border-purple-500">
                        <span className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full border-4 border-white"></span>
                        <p className="text-[10px] uppercase font-bold text-purple-500 tracking-wider mb-1">Twist (Bất ngờ)</p>
                        <p className="text-sm font-semibold text-purple-700 italic">{result.script.twist}</p>
                      </div>

                      <div className="relative pl-6 border-l-2 border-green-500">
                        <span className="absolute -left-2 top-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white"></span>
                        <p className="text-[10px] uppercase font-bold text-green-500 tracking-wider mb-1">CTA (Kêu gọi)</p>
                        <p className="text-sm font-medium">{result.script.cta}</p>
                      </div>
                    </div>
                  </section>

                  {/* Step 4: Sales Output */}
                  <section className="bg-orange-50 rounded-[32px] p-8 border border-orange-100">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">04</span>
                      <h2 className="font-bold text-xl">Output Bán Hàng (Ra Khách)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">3 Hook Biến Thể</p>
                            <button onClick={() => copyToClipboard(result.sales.hooks.join('\n'), 'hooks')} className="text-gray-400 hover:text-orange-500">
                              {copiedSection === 'hooks' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <div className="space-y-2">
                            {result.sales.hooks.map((hook, i) => (
                              <div key={i} className="p-3 bg-white rounded-xl border border-orange-100 text-xs font-medium shadow-sm">
                                {hook}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Caption Đăng Bài</p>
                            <button onClick={() => copyToClipboard(result.sales.caption, 'caption')} className="text-gray-400 hover:text-orange-500">
                              {copiedSection === 'caption' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <div className="p-4 bg-white rounded-2xl border border-orange-100 text-xs leading-relaxed whitespace-pre-wrap shadow-sm">
                            {result.sales.caption}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">5 Tiêu Đề Viral</p>
                            <button onClick={() => copyToClipboard(result.sales.titles.join('\n'), 'titles')} className="text-gray-400 hover:text-orange-500">
                              {copiedSection === 'titles' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <div className="space-y-2">
                            {result.sales.titles.map((title, i) => (
                              <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-orange-100 text-xs shadow-sm">
                                <span className="text-orange-500 font-bold">#</span>
                                <span>{title}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Hashtags</p>
                            <button onClick={() => copyToClipboard(result.sales.hashtags.join(' '), 'hashtags')} className="text-gray-400 hover:text-orange-500">
                              {copiedSection === 'hashtags' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {result.sales.hashtags.map((tag, i) => (
                              <span key={i} className="px-3 py-1 bg-white rounded-full border border-orange-100 text-[10px] font-bold text-orange-600 shadow-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Share/Export */}
                  <div className="flex justify-center pt-4">
                    <button className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full font-bold hover:scale-105 transition-transform shadow-xl">
                      <Share2 size={18} />
                      <span>Chia sẻ kết quả</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-400 font-medium">Bản quyền thuộc về Thanh Uyên và đồng đội</p>
        <div className="mt-4 flex justify-center gap-6 text-xs text-gray-400">
          <a 
            href="https://zalo.me/0332761595" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-blue-500 transition-colors"
            title="Zalo"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 5.582 2 10c0 1.954.872 3.74 2.34 5.11L3.5 19.5c-.1.3.1.6.4.5l4.5-2.5c1.1.3 2.3.5 3.6.5 5.523 0 10-3.582 10-8s-4.477-8-10-8z" fill="#0068FF"/>
              <path d="M16 11h-2v-2h-1v2h-2v1h2v2h1v-2h2v-1z" fill="white"/>
            </svg>
            <span className="font-bold">Zalo</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
