'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Activity, Zap, Shield, BookOpen, Send, X, Atom, Sparkles, Cpu, Globe } from 'lucide-react';

// --- 1. 星空特效组件 (已做防崩处理) ---
const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // 粒子参数
    const particles: {x: number, y: number, size: number, speed: number, opacity: number}[] = [];
    const count = 100; // 粒子数量

    // 初始化粒子
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random()
      });
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y -= p.speed; // 向上飘
        if (p.y < 0) p.y = canvas.height; // 循环
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(103, 232, 249, ${p.opacity})`; // 青色星光
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', setSize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />;
};

// --- 2. 主页面组件 ---
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

  useEffect(() => { setMounted(true); }, []);

  // 开始分析
  const startAnalysis = async () => {
    if (!q1.trim() && !q2.trim() && !q3.trim()) {
      alert("⚠️ 请输入内容");
      return;
    }
    setStatus('analyzing');
    const combinedInput = `【现状】：${q1}\n【选项】：${q2}\n【边界】：${q3}`;
    await fetchAnalysis(combinedInput, null);
  };

  // 提交补充
  const submitSupplement = async () => {
    if (!supplement.trim()) return;
    setStatus('analyzing');
    await fetchAnalysis(supplement, `【现状】：${q1}\n【选项】：${q2}\n【边界】：${q3}`);
    setSupplement('');
  };

  // API 请求
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
      alert("⚠️ 网络错误，请检查 API Key");
      setStatus('idle');
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const getProbabilityColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]';
    if (score >= 40) return 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]';
    return 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]';
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* 背景特效 */}
      <Starfield />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-0 pointer-events-none" />

      {/* 顶部 HUD */}
      <div className="absolute top-6 left-6 flex flex-col gap-1 z-10 opacity-70">
         <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-mono tracking-widest border border-cyan-900/50 px-2 py-1 rounded bg-black/50 backdrop-blur">
            <Globe size={10}/> TDFT-SYSTEM v7.0
         </div>
      </div>

      {/* 说明书按钮 */}
      <button 
        onClick={() => setShowManual(true)}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-xs font-bold text-zinc-300 hover:text-white hover:border-cyan-500/50 transition-all backdrop-blur"
      >
        <BookOpen size={14}/> 原理
      </button>

      {/* 说明书弹窗 */}
      <AnimatePresence>
        {showManual && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
            onClick={() => setShowManual(false)}
          >
            <div className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                <h2 className="text-2xl font-black mb-2 text-white tracking-wider">热力学决策场论</h2>
                <p className="text-zinc-500 text-xs font-mono mb-6">THERMODYNAMIC DECISION FIELD THEORY</p>
                <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                    <p>本系统基于非平衡态热力学，将决策过程建模为能量跃迁。</p>
                    <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                        <li><span className="text-cyan-400 font-bold">熵 (Entropy):</span> 系统的混乱程度与迷茫指数。</li>
                        <li><span className="text-purple-400 font-bold">激活能 (Activation):</span> 改变现状所需的能量门槛。</li>
                        <li><span className="text-emerald-400 font-bold">概率 (Probability):</span> 路径坍缩成功的可能性。</li>
                    </ul>
                </div>
                <button onClick={() => setShowManual(false)} className="w-full mt-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold tracking-widest text-xs border border-zinc-800 transition-all">关闭终端</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="z-10 w-full max-w-xl flex flex-col items-center gap-10">
        
        {status === 'idle' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full space-y-8 text-center px-2">
             
             {/* 标题：纯白高亮 + 强发光 */}
             <div className="relative">
                <h1 className="text-5xl md:text-6xl font-black tracking-widest text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.5)]">
                    决策推演
                </h1>
                <div className="mt-4 flex justify-center gap-6 text-[10px] font-bold tracking-[0.4em] text-cyan-400/80 uppercase">
                    <span>Analysis</span>
                    <span className="text-purple-400">Logic</span>
                    <span>Entropy</span>
                </div>
             </div>
              
              <div className="space-y-5 mt-8">
                  {/* 输入框 1: 青色高亮 */}
                  <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg opacity-20 group-focus-within:opacity-100 transition duration-500 blur"></div>
                      <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg p-1">
                          <div className="w-16 h-12 flex items-center justify-center text-cyan-400 border-r border-zinc-800 font-bold text-xs shrink-0 bg-zinc-900/50 rounded-l">
                             现状
                          </div>
                          <input type="text" value={q1} onChange={(e) => setQ1(e.target.value)} placeholder="你现在的困境..." className="w-full bg-transparent p-3 text-white placeholder:text-zinc-600 outline-none font-medium" />
                      </div>
                  </div>

                  {/* 输入框 2: 紫色高亮 */}
                  <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-20 group-focus-within:opacity-100 transition duration-500 blur"></div>
                      <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg p-1">
                          <div className="w-16 h-12 flex items-center justify-center text-purple-400 border-r border-zinc-800 font-bold text-xs shrink-0 bg-zinc-900/50 rounded-l">
                             方案
                          </div>
                          <input type="text" value={q2} onChange={(e) => setQ2(e.target.value)} placeholder="你想怎么做..." className="w-full bg-transparent p-3 text-white placeholder:text-zinc-600 outline-none font-medium" />
                      </div>
                  </div>

                  {/* 输入框 3: 绿色高亮 */}
                  <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg opacity-20 group-focus-within:opacity-100 transition duration-500 blur"></div>
                      <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg p-1">
                          <div className="w-16 h-12 flex items-center justify-center text-emerald-400 border-r border-zinc-800 font-bold text-xs shrink-0 bg-zinc-900/50 rounded-l">
                             约束
                          </div>
                          <input type="text" value={q3} onChange={(e) => setQ3(e.target.value)} placeholder="最坏的结果..." className="w-full bg-transparent p-3 text-white placeholder:text-zinc-600 outline-none font-medium" />
                      </div>
                  </div>
              </div>

              <button onClick={startAnalysis} className="group relative w-full py-5 bg-white text-black font-black text-lg tracking-widest rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                 <div className="flex items-center justify-center gap-3">
                    <Fingerprint className="group-hover:text-purple-600 transition-colors" size={24}/> 
                    启动推演程序
                 </div>
              </button>
          </motion.div>
        )}

        {status === 'analyzing' && (
           <div className="flex flex-col items-center gap-8 py-20">
              <div className="relative w-32 h-32">
                 <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                 <div className="absolute inset-4 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-reverse"></div>
                 <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <Atom className="text-white" size={32}/>
                 </div>
              </div>
              <p className="text-cyan-400 text-xs font-mono tracking-[0.3em] animate-pulse">SYSTEM PROCESSING...</p>
           </div>
        )}

        {status === 'result' && result && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6 pb-20">
              
              {/* 结果卡片：玻璃质感 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 backdrop-blur-md p-8 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={64}/></div>
                 
                 <div className="flex justify-between items-end mb-6">
                    <div>
                        <span className="text-zinc-500 font-bold text-[10px] tracking-widest uppercase block mb-1">Success Probability</span>
                        <span className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{result.probability_score}%</span>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-bold ${result.probability_score > 60 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {result.probability_score > 60 ? 'RECOMMENDED' : 'HIGH RISK'}
                    </div>
                 </div>

                 {/* 进度条 */}
                 <div className="w-full h-3 bg-black rounded-full overflow-hidden mb-6 border border-zinc-800">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${result.probability_score}%` }}
                        className={`h-full ${getProbabilityColor(result.probability_score)}`} 
                    />
                 </div>
                 
                 <div className="space-y-4">
                     <div>
                         <h3 className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase mb-2 flex items-center gap-2"><Activity size={10}/> 诊断结论</h3>
                         <p className="text-lg text-white font-bold leading-relaxed">{result.conclusion}</p>
                     </div>
                     <div className="h-px bg-zinc-800 w-full my-4"></div>
                     <div>
                         <h3 className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase mb-2 flex items-center gap-2"><Zap size={10}/> 优化策略</h3>
                         <p className="text-zinc-300 text-sm leading-7">{result.suggestion}</p>
                     </div>
                 </div>
              </div>

              {/* 继续对话 */}
              <div className="flex gap-0 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
                 <input 
                    type="text" 
                    value={supplement} 
                    onChange={e => setSupplement(e.target.value)} 
                    placeholder="觉得不准？输入补充信息..." 
                    className="flex-grow bg-zinc-900 p-4 text-sm text-white placeholder:text-zinc-600 outline-none" 
                    onKeyDown={(e) => e.key === 'Enter' && submitSupplement()}
                 />
                 <button onClick={submitSupplement} className="bg-white text-black px-6 font-bold hover:bg-zinc-200 transition-colors"><Send size={18}/></button>
              </div>

              <button onClick={() => {setStatus('idle'); setQ1(''); setQ2(''); setQ3('');}} className="w-full py-4 text-zinc-500 text-xs font-bold tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
                 <Cpu size={12}/> 重置系统 (RESET)
              </button>
           </motion.div>
        )}

      </div>

      <style jsx global>{`
        .animate-spin-reverse { animation: spin-reverse 3s linear infinite; }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      `}</style>
    </main>
  );
}