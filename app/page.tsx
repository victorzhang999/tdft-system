'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 只保留最基础的图标，防止版本冲突
import { Fingerprint, Activity, Zap, Shield, BookOpen, Send, X, Atom } from 'lucide-react';

export default function EntropyPage() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState<any>(null);
  const [showManual, setShowManual] = useState(false);

  // 输入状态
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [supplement, setSupplement] = useState('');

  // 确保只在客户端渲染
  useEffect(() => { setMounted(true); }, []);

  // 1. 开始分析
  const startAnalysis = async () => {
    if (!q1.trim() && !q2.trim() && !q3.trim()) {
      alert("⚠️ 请输入内容");
      return;
    }
    setStatus('analyzing');
    
    // 模拟上下文构建
    const combinedInput = `【现状】：${q1}\n【选项】：${q2}\n【边界】：${q3}`;

    await fetchAnalysis(combinedInput, null);
  };

  // 2. 提交补充
  const submitSupplement = async () => {
    if (!supplement.trim()) return;
    setStatus('analyzing');
    await fetchAnalysis(supplement, null);
    setSupplement('');
  };

  // 核心请求
  const fetchAnalysis = async (input: string, context: string | null) => {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuestion: input, context: context }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResult(data);
      setStatus('result');
    } catch (error) {
      console.error(error);
      alert("⚠️ 网络连接错误，请检查 API Key");
      setStatus('idle');
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const getProbabilityColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 40) return 'bg-cyan-500';
    return 'bg-red-500';
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* 极简背景，移除 Canvas 避免报错 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900 to-black z-0 pointer-events-none" />

      {/* 右上角 按钮 */}
      <button 
        onClick={() => setShowManual(true)}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300"
      >
        <BookOpen size={14}/> 系统原理
      </button>

      {/* 说明书弹窗 */}
      <AnimatePresence>
        {showManual && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowManual(false)}
          >
            <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-xl max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4">热力学决策场论</h2>
                <p className="text-zinc-400 mb-6">本系统通过计算熵值与激活能来量化决策成功率。</p>
                <button onClick={() => setShowManual(false)} className="w-full py-3 bg-zinc-800 rounded font-bold">关闭</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="z-10 w-full max-w-xl flex flex-col items-center gap-8">
        
        {status === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8 text-center">
             <h1 className="text-5xl font-black tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                决策推演
              </h1>
              
              <div className="space-y-4">
                  <input type="text" value={q1} onChange={(e) => setQ1(e.target.value)} placeholder="当前现状..." className="w-full bg-zinc-900/80 border border-zinc-700 p-4 rounded-lg text-white outline-none focus:border-cyan-500 transition-colors" />
                  <input type="text" value={q2} onChange={(e) => setQ2(e.target.value)} placeholder="可选方案..." className="w-full bg-zinc-900/80 border border-zinc-700 p-4 rounded-lg text-white outline-none focus:border-purple-500 transition-colors" />
                  <input type="text" value={q3} onChange={(e) => setQ3(e.target.value)} placeholder="系统约束..." className="w-full bg-zinc-900/80 border border-zinc-700 p-4 rounded-lg text-white outline-none focus:border-emerald-500 transition-colors" />
              </div>

              <button onClick={startAnalysis} className="w-full py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                 <Fingerprint size={20}/> 启动系统
              </button>
          </motion.div>
        )}

        {status === 'analyzing' && (
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div>
              <p className="text-zinc-500 text-sm font-mono animate-pulse">正在推演路径...</p>
           </div>
        )}

        {status === 'result' && result && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6">
              
              {/* 结果卡片 */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                 <div className="flex justify-between items-end mb-4">
                    <span className="text-zinc-500 font-bold text-xs uppercase">Probability</span>
                    <span className="text-4xl font-bold text-white">{result.probability_score}%</span>
                 </div>
                 <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                    <div className={`h-full ${getProbabilityColor(result.probability_score)}`} style={{width: `${result.probability_score}%`}}></div>
                 </div>
                 <p className="text-zinc-300 leading-relaxed border-l-2 border-white pl-4">
                    {result.conclusion}
                 </p>
              </div>

              {/* 建议 */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
                 <h3 className="text-xs font-bold text-zinc-500 mb-2 uppercase">Strategy</h3>
                 <p className="text-emerald-400 italic">"{result.suggestion}"</p>
              </div>

              <div className="flex gap-2">
                 <input type="text" value={supplement} onChange={e => setSupplement(e.target.value)} placeholder="继续提问..." className="flex-grow bg-zinc-900 border border-zinc-700 p-3 rounded text-sm text-white outline-none" />
                 <button onClick={submitSupplement} className="bg-white text-black px-4 rounded font-bold"><Send size={16}/></button>
              </div>

              <button onClick={() => setStatus('idle')} className="text-zinc-500 text-xs w-full text-center hover:text-white mt-4">重置</button>
           </motion.div>
        )}

      </div>
    </main>
  );
}