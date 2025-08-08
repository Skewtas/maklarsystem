'use client';

import { useState } from 'react';
import { PushToTalk } from '@/components/voice/PushToTalk';
import { Copy, Check } from 'lucide-react';

export default function VoiceDemoPage() {
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleTranscription = (text: string) => {
    setTranscriptions(prev => [text, ...prev]);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Push to Talk Demo
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Hold the button to record your voice and get instant transcription
          </p>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-8">
            <PushToTalk onTranscription={handleTranscription} className="mb-8" />
          </div>

          {transcriptions.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                Transcription History
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transcriptions.map((text, index) => (
                  <div
                    key={index}
                    className="group relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="text-gray-900 dark:text-gray-100 pr-10">
                      {text}
                    </p>
                    <button
                      onClick={() => copyToClipboard(text, index)}
                      className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}