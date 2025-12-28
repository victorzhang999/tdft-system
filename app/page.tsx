'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, RotateCcw, Activity, Zap, Shield, GitGraph, BookOpen, Send, X, Atom, Microscope, Globe, Search, Cpu } from 'lucide-react';
// 修复：补全 PolarRadiusAxis，移除重复的 Radar
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

// --- 组件：高亮粒子星空 ---
const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles: {x: number, y: number, vx: number, vy: number, size: number, alpha: number}[] = [];
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(103, 232, 249, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-90" />;
};

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
  // 修复：保留 historyContext 供后续扩展，或暂时移除未使用警告
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [historyContext, setHistoryContext] = useState('');

  useEffect(() => { setMounted(true); }, []);

  // 1. 开始分析
  const startAnalysis = async () => {
    if (!q1.trim() && !q2.trim() && !q3.trim()) {
      alert("⚠️ 错误：系统未检测到有效输入。请至少输入一个维度的参数。");
      return;
    }
    setStatus('analyzing');
    
    const input1 = q1.trim() || "（用户未输入，请在建议中主动询问）";
    const input2 = q2.trim() || "（用户未输入，请在建议中主动询问）";
    const input3 = q3.trim() || "（用户未输入，请在建议中主动询问）";

    const combinedInput = `【现状】：${input1}\n【选项】：${input2}\n【边界】：${input3}`;
    setHistoryContext(combinedInput);

    await fetchAnalysis(combinedInput, null);
  };

  // 2. 提交补充
  const submitSupplement = async () => {
    if (!supplement.trim()) return;
    setStatus('analyzing');
    // 简化处理，直接使用当前输入作为上下文
    await fetchAnalysis(supplement, `【现状】：${q1}\n【选项】：${q2}\n【边界】：${q3}`);
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
      alert("⚠️ 连接中断：请检查网络或 API Key。");
      setStatus('idle');
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const chartData = result ? [
    { subject: '熵值', A: result.entropy, fullMark: 100 },
    { subject: '激活能', A: result.activation, fullMark: 100 },
    { subject: '稳定性', A: result.stability, fullMark: 100 },
  ] : [];

  const getProbabilityColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]';
    if (score >= 40) return 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]';
    return 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]';
  };

  return (
    <main className="min-h-screen bg-[#030303] text-cyan-500 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500/30">
      
      {/* --- 特效层 --- */}
      <Starfield />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-0 pointer-events-none opacity-60" />
      
      {/* 左上角 HUD */}
      <div className="absolute top-6 left-8 text-[10px] text-cyan-800 flex flex-col gap-2 z-0 pointer-events-none select-none hidden md:flex font-mono font-bold tracking-widest">
        <span className="flex items-center gap-2"><Globe size={12}/> TDFT-SYSTEM v6.0 FIXED</span>
        <span className="flex items-center gap-2"><Cpu size={12}/> CORE: ONLINE</span>
      </div>

      {/* 右上角 按钮 */}
      <button 
        onClick={() => setShowManual(true)}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-900/50 border border-zinc-700/50 hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all text-xs font-bold tracking-widest text-zinc-400 hover:text-cyan-200 backdrop-blur-md shadow-lg"
      >
        <BookOpen size={14}/> 系统原理
      </button>

      {/* --- 理论说明书弹窗 (精简稳定版) --- */}
      <AnimatePresence>
        {showManual && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setShowManual(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#080808] border border-cyan-900/30 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-[0_0_60px_rgba(6,182,212,0.15)] custom-scrollbar flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-[#080808]/95 backdrop-blur border-b border-white/5 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white tracking-widest">TDFT 技术白皮书</h2>
                <button onClick={() => setShowManual(false)}><X className="text-zinc-500" size={24}/></button>
              </div>
              <div className="p-8 text-gray-300 font-sans space-y-8">
                <h1 className="text-2xl font-bold text-white">热力学决策场论 (TDFT)</h1>
                <p className="text-base text-gray-400">
                    本系统基于非平衡态热力学，将决策过程建模为能量跃迁。通过计算熵值(Entropy)、激活能(Activation Energy)和鲁棒性(Robustness)，量化决策成功率。
                </p>
                <div className="border-t border-zinc-800 pt-6">
                    <button onClick={() => setShowManual(false)} className="w-full py-3 bg-cyan-900/30 text-cyan-200 rounded font-bold border border-cyan-700/30">关闭 (CLOSE)</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode='wait'>
        {/* ==================== 1. 输入态 ==================== */}
        {status === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            className="z-10 w-full max-w-4xl flex flex-col items-center gap-12 py-12 px-2"
          >
            <div className="text-center space-y-6 relative">
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
              
              {/* 标题强制高亮 */}
              <h1 className="text-5xl md:text-7xl font-black tracking-widest text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.6)] font-sans px-2 leading-tight">
                热力学决策场论
              </h1>
              <div className="flex items-center justify-center gap-4 text-sm md:text-base tracking-[0.3em] text-cyan-300 font-bold uppercase">
                 <span>复杂系统</span>
                 <span className="w-1.5 h-1.5 bg-cyan-200 rounded-full animate-pulse"></span>
                 <span>动力学推演</span>
              </div>
            </div>

            <div className="w-full space-y-6 px-4 md:px-0">
              
              {/* 输入框 1 */}
              <div className="relative group w-full">
                <div className="relative bg-[#080808]/90 border border-zinc-700 p-0 flex items-center h-14 rounded-lg overflow-hidden transition-all duration-300 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                    <div className="h-full w-20 md:w-32 bg-zinc-900 border-r border-zinc-700 flex items-center justify-center text-xs md:text-sm font-bold text-cyan-300 tracking-wider shrink-0">
                        初始状态
                    </div>
                    <input
                      type="text"
                      value={q1} onChange={(e) => setQ1(e.target.value)}
                      placeholder="你的困境或现状..."
                      className="flex-grow bg-transparent px-4 text-base text-white placeholder:text-zinc-500 outline-none font-sans h-full tracking-wide min-w-0"
                    />
                </div>
              </div>

              {/* 输入框 2 */}
              <div className="relative group w-full">
                <div className="relative bg-[#080808]/90 border border-zinc-700 p-0 flex items-center h-14 rounded-lg overflow-hidden transition-all duration-300 focus-within:border-purple-400 focus-within:shadow-[0_0_20px_rgba(192,132,252,0.5)]">
                    <div className="h-full w-20 md:w-32 bg-zinc-900 border-r border-zinc-700 flex items-center justify-center text-xs md:text-sm font-bold text-purple-300 tracking-wider shrink-0">
                        决策变量
                    </div>
                    <input
                      type="text"
                      value={q2} onChange={(e) => setQ2(e.target.value)}
                      placeholder="方案A、方案B..."
                      className="flex-grow bg-transparent px-4 text-base text-white placeholder:text-zinc-500 outline-none font-sans h-full tracking-wide min-w-0"
                    />
                </div>
              </div>

              {/* 输入框 3 */}
              <div className="relative group w-full">
                <div className="relative bg-[#080808]/90 border border-zinc-700 p-0 flex items-center h-14 rounded-lg overflow-hidden transition-all duration-300 focus-within:border-emerald-400 focus-within:shadow-[0_0_20px_rgba(52,211,153,0.5)]">
                    <div className="h-full w-20 md:w-32 bg-zinc-900 border-r border-zinc-700 flex items-center justify-center text-xs md:text-sm font-bold text-emerald-300 tracking-wider shrink-0">
                        系统约束
                    </div>
                    <input
                      type="text"
                      value={q3} onChange={(e) => setQ3(e.target.value)}
                      placeholder="底线、最坏打算..."
                      className="flex-grow bg-transparent px-4 text-base text-white placeholder:text-zinc-500 outline-none font-sans h-full tracking-wide min-w-0"
                    />
                </div>
              </div>
            </div>

            <button 
              onClick={startAnalysis}
              className="group relative w-full md:w-3/4 h-16 mt-8 overflow-hidden bg-cyan-900/50 border border-cyan-400/50 hover:bg-cyan-800 hover:border-cyan-300 transition-all duration-300 rounded-lg shadow-[0_0_25px_rgba(6,182,212,0.3)]"
            >
              <div className="flex items-center justify-center gap-3 h-full relative z-10">
                <Fingerprint className="text-cyan-300 animate-pulse" size={24}/>
                <span className="text-lg font-bold tracking-[0.3em] text-white">
                  启动推演
                </span>
              </div>
            </button>
          </motion.div>
        )}

        {/* ==================== 2. 计算态 ==================== */}
        {status === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="z-10 text-center flex flex-col items-center justify-center h-full px-4"
          >
             <div className="relative w-48 h-48">
              <div className="absolute inset-0 border border-cyan-900/50 rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-r-2 border-purple-500 rounded-full animate-spin-reverse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Atom className="w-16 h-16 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="mt-10 font-mono text-xs text-cyan-500 space-y-3 tracking-widest">
              <p className="animate-pulse">&gt; 正在解析相空间矢量...</p>
              <p className="animate-pulse delay-100">&gt; 正在计算局部熵减解...</p>
              <p className="animate-pulse delay-200">&gt; 模拟 14,000,605 种未来可能性...</p>
            </div>
          </motion.div>
        )}

        {/* ==================== 3. 结果态 ==================== */}
        {status === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10 px-4"
          >
            {/* 左侧：数据可视化 (占4列) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-black/60 border border-zinc-800 p-4 relative backdrop-blur-md rounded-lg">
                <div className="text-[10px] text-zinc-500 font-bold mb-4 tracking-widest border-b border-zinc-800 pb-2">图表 01 // 系统指纹</div>
                <div className="h-64 relative">
                   <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#06b6d4', fontSize: 12, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Metrics" dataKey="A" stroke="#06b6d4" strokeWidth={3} fill="#06b6d4" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 推荐指数卡片 */}
              <div className="bg-black/60 border border-zinc-800 p-6 backdrop-blur-md rounded-lg">
                 <div className="flex justify-between items-end mb-4">
                    <span className="text-xs text-gray-400 tracking-widest font-bold">成功率 (Probability)</span>
                    <span className={`text-4xl font-bold ${result.probability_score >= 50 ? 'text-emerald-400' : 'text-red-500'}`}>
                      {result.probability_score}%
                    </span>
                 </div>
                 <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${result.probability_score}%` }} 
                      className={`h-full ${getProbabilityColor(result.probability_score)}`}
                    />
                 </div>
                 
                 <div className="flex justify-between text-xs text-zinc-400 mb-4 font-mono tracking-wider">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500 shadow-red-500/50 shadow-sm"/> 0-40% 劝退</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500 shadow-cyan-500/50 shadow-sm"/> 40-75% 观望</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-emerald-500/50 shadow-sm"/> 75%+ 推荐</span>
                 </div>

                 <p className="text-sm text-cyan-100/90 leading-relaxed border-l-4 border-cyan-700 pl-3">
                   "{result.probability_desc}"
                 </p>
              </div>
            </div>

            {/* 右侧：分析报告 (占8列) */}
            <div className="lg:col-span-8 space-y-4 flex flex-col">
              
              <div className="bg-gradient-to-r from-cyan-950/30 to-transparent border-l-4 border-cyan-500 p-6 backdrop-blur-md rounded-lg">
                 <h3 className="text-xs text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2 font-bold">
                    <Activity size={14}/> 模型诊断结论
                 </h3>
                 <p className="text-lg md:text-2xl text-white font-bold tracking-wide leading-relaxed">
                   {result.conclusion}
                 </p>
              </div>

              <div className="bg-black/60 border border-zinc-800 p-8 flex-grow relative overflow-hidden backdrop-blur-sm rounded-lg">
                 <div className="absolute top-4 right-4 opacity-10"><Microscope size={48}/></div>
                 <h3 className="text-xs text-purple-400 uppercase tracking-widest mb-4 font-bold">
                    推演依据 (Theoretical Basis)
                 </h3>
                 <p className="text-base text-gray-300 leading-7 text-justify">
                   {result.theory_support}
                 </p>
              </div>

              <div className="bg-emerald-950/10 border border-emerald-900/30 p-6 relative backdrop-blur-sm rounded-lg">
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l"></div>
                 <h3 className="text-xs text-emerald-400 uppercase tracking-widest mb-3 font-bold">
                    优化策略 (Strategy)
                 </h3>
                 <p className="text-base text-emerald-100/90 italic font-medium leading-relaxed">
                   "{result.suggestion}"
                 </p>
              </div>

              {/* 互动修正 */}
              <div className="border-t border-dashed border-zinc-800 pt-6 mt-2">
                <div className="flex gap-0 bg-black/80 border border-zinc-700 rounded-lg overflow-hidden group focus-within:border-cyan-500/50 transition-colors">
                  <div className="flex items-center px-4 bg-zinc-900/50 border-r border-zinc-700 text-zinc-500 group-focus-within:text-cyan-500 transition-colors">
                    <Search size={16}/>
                  </div>
                  <input 
                    type="text" 
                    value={supplement}
                    onChange={(e) => setSupplement(e.target.value)}
                    placeholder="输入修正参数..."
                    className="flex-grow bg-transparent p-4 text-sm text-white outline-none font-mono placeholder:text-zinc-600"
                    onKeyDown={(e) => e.key === 'Enter' && submitSupplement()}
                  />
                  <button 
                    onClick={submitSupplement}
                    className="bg-zinc-900 hover:bg-cyan-900/50 text-cyan-500 px-6 border-l border-zinc-700 transition-colors"
                  >
                    <Send size={18}/>
                  </button>
                </div>
              </div>

              <button
                onClick={() => { setStatus('idle'); setQ1(''); setQ2(''); setQ3(''); setSupplement(''); }}
                className="self-start text-[10px] text-zinc-500 hover:text-cyan-400 flex items-center gap-2 mt-4 transition-colors uppercase tracking-widest font-bold"
              >
                <RotateCcw size={12} /> 重置观测序列
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
        .animate-spin-slow { animation: spin 12s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 5s linear infinite; }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      `}</style>
    </main>
  );
}