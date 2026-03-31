import React, { useState, useRef } from 'react';
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
      if (file.size > 20 * 1024 * 1024) {
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
        parts.push({ text: "Không có video tham khảo. Hãy tự suy luận." });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: parts,
              },
            ],
          }),
        }
      );

      const data = await response.json();

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      const parsedResult = JSON.parse(text);

      setResult(parsedResult);
    } catch (err: any) {
      console.error('Error generating content:', err);
      setError('Có lỗi xảy ra khi tạo nội dung.');
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
    <div className="min-h-screen flex items-center justify-center">
      <button onClick={handleGenerate}>
        TEST API
      </button>
    </div>
  );
};

export default App;