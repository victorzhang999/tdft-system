'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, RotateCcw, Activity, Zap, Shield, GitGraph, BookOpen, Send, X, Atom, Microscope, Layers, Cpu, Globe, Database, Search, ChevronRight, FileText, Sigma, Hash } from 'lucide-react';
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
    await fetchAnalysis(supplement, historyContext);
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
      alert("⚠️ 连接中断：无法连接至推演中枢。");
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
        <span className="flex items-center gap-2"><Globe size={12}/> TDFT-SYSTEM v5.6 MOBILE-OPTIMIZED</span>
        <span className="flex items-center gap-2"><Cpu size={12}/> CORE: ONLINE</span>
      </div>

      {/* 右上角 按钮 */}
      <button 
        onClick={() => setShowManual(true)}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-900/50 border border-zinc-700/50 hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all text-xs font-bold tracking-widest text-zinc-400 hover:text-cyan-200 backdrop-blur-md shadow-lg"
      >
        <BookOpen size={14}/> 系统原理
      </button>

      {/* --- 理论说明书弹窗 --- */}
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
              <div className="sticky top-0 z-10 bg-[#080808]/95 backdrop-blur border-b border-white/5 p-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-900/20 rounded border border-cyan-500/30">
                        <FileText className="text-cyan-400" size={24}/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-widest font-sans">
                        热力学决策场论 (TDFT)
                        </h2>
                        <p className="text-xs text-zinc-500 font-mono tracking-wider mt-1">DOC. REF: TDFT-2025-WP-ALPHA</p>
                    </div>
                </div>
                <button onClick={() => setShowManual(false)} className="text-zinc-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"><X size={24}/></button>
              </div>
              
              <div className="p-10 md:p-16 text-gray-300 font-sans selection:bg-cyan-500/30">
                <div className="text-center mb-16 border-b border-white/5 pb-10">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                        不确定性环境下人类战略决策的<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">非平衡相变模型</span>
                    </h1>
                    <p className="text-lg text-zinc-500 font-serif italic mt-6">
                        Thermodynamic Decision Field Theory: A Non-Equilibrium Phase Transition Model
                    </p>
                </div>

                <div className="bg-zinc-900/40 border-l-4 border-cyan-500 p-8 rounded-r-xl mb-16">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Hash size={14}/> Abstract // 摘要
                    </h3>
                    <p className="text-lg text-gray-300 leading-9 text-justify">
                        传统决策模型（如期望效用理论、SWOT分析）通常基于线性假设和静态环境，难以有效处理高熵环境下的非线性动态博弈。本文提出了一种基于复杂系统科学的新型决策框架——<strong>热力学决策场论（TDFT）</strong>。该理论建立在物理学与决策科学的同构性之上，将决策过程建模为相空间中的能量跃迁过程。通过引入<strong>信息熵 (S)</strong>、<strong>激活能 (Ea)</strong> 和 <strong>鲁棒性 (R)</strong> 三个核心序参量，定量描述决策系统的混乱度、势能壁垒及抗扰动能力。模型推演表明，最优决策路径实际上是在多维势能面上寻找局部熵减解与吉布斯自由能最小化的过程。
                    </p>
                </div>

                <div className="space-y-16 max-w-4xl mx-auto">
                    <section>
                        <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-cyan-500/50 font-mono">01.</span> 引言 (Introduction)
                        </h3>
                        <p className="text-lg text-gray-400 leading-8 text-justify">
                            在后现代社会的复杂环境中，个体与组织面临的决策环境呈现出高度的随机性（Stochasticity）和非线性（Non-linearity）。传统的理性人假设（Rational Agent）在面对“黑天鹅”事件和信息过载时往往失效。西蒙（Herbert Simon）的有限理性理论虽然指出了认知局限，但缺乏定量的动力学描述。
                            <br/><br/>
                            近年来，经济物理学的发展为理解社会行为提供了新的视角。本文提出的 TDFT 旨在利用统计力学和耗散结构理论的数学工具，构建一个能够量化“迷茫”、“阻力”与“风险”的动态模型，从而辅助决策者在混沌系统中锁定大概率成功路径（Attractor）。
                        </p>
                    </section>

                    <section>
                        <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="text-cyan-500/50 font-mono">02.</span> 理论框架 (Theoretical Framework)
                        </h3>
                        
                        <div className="mb-10">
                            <h4 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                                <GitGraph size={20}/> 第一定律：决策熵与信息不确定性
                            </h4>
                            <div className="bg-black/40 border border-zinc-800 p-6 rounded-lg mb-4">
                                <p className="text-sm font-mono text-cyan-200 mb-2 opacity-80">玻尔兹曼方程 (Boltzmann Equation)</p>
                                <p className="text-2xl font-serif text-white tracking-wider">S = k<sub>B</sub> · lnΩ</p>
                            </div>
                            <p className="text-lg text-gray-400 leading-8 text-justify">
                                在决策场中，我们将 Ω 定义为<strong>“未来可能演化路径的微观状态总数”</strong>。当决策者面临的变量越多、约束条件越少、信息越模糊时，Ω 趋向无穷大，导致系统熵值 S 激增。
                                <br/>
                                <strong className="text-white">高熵态 (High Entropy)</strong>：系统处于布朗运动状态，决策向量随机震荡。此时系统的首要任务并非“位移”（行动），而是“降温”（获取信息以降低 Ω）。
                            </p>
                        </div>

                        <div className="mb-10">
                            <h4 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                                <Zap size={20}/> 第二定律：激活能与势能壁垒
                            </h4>
                            <div className="bg-black/40 border border-zinc-800 p-6 rounded-lg mb-4">
                                <p className="text-sm font-mono text-yellow-200 mb-2 opacity-80">阿伦尼乌斯方程 (Arrhenius Equation)</p>
                                <p className="text-2xl font-serif text-white tracking-wider">P ∝ A · e<sup>(-E<sub>a</sub> / kT)</sup></p>
                            </div>
                            <p className="text-lg text-gray-400 leading-8 text-justify">
                                借鉴化学反应动力学，任何社会状态的改变（如创业、转型）都可视为一次“化学反应”。<strong>E<sub>a</sub> (Activation Energy)</strong> 代表打破旧有平衡所需的最小能量阈值，包括资金成本、认知重构成本、社会关系重组成本等。若势能壁垒远高于能量储备，反应不仅无法发生，强行跃迁还将导致系统耗散崩溃。
                            </p>
                        </div>

                        <div className="mb-10">
                            <h4 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                <Shield size={20}/> 第三定律：鲁棒性与李雅普诺夫稳定性
                            </h4>
                            <div className="bg-black/40 border border-zinc-800 p-6 rounded-lg mb-4">
                                <p className="text-sm font-mono text-emerald-200 mb-2 opacity-80">稳定性判据 (Stability Criterion)</p>
                                <p className="text-xl font-serif text-white tracking-wider">||x(t) - x<sub>e</sub>|| &lt; ε, ∀t ≥ 0</p>
                            </div>
                            <p className="text-lg text-gray-400 leading-8 text-justify">
                                决策不仅是追求收益最大化，更是追求生存概率最大化。<strong>鲁棒性 (Robustness)</strong> 度量的是系统能够承受的最大外部扰动而不发生结构性坍塌的能力。低鲁棒性系统处于<strong>“亚稳态” (Metastable State)</strong>——看似平衡，但微小的扰动（如资金链断裂）即可引发灾难性的相变。
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-cyan-500/50 font-mono">03.</span> 映射机制 (Mapping Mechanism)
                        </h3>
                        <p className="text-lg text-gray-400 leading-8 text-justify mb-6">
                            基于上述理论，本系统构建了一个从自然语言输入到高维向量空间的映射机制：
                        </p>
                        <ul className="space-y-4 text-lg text-gray-400 list-disc pl-6">
                            <li><strong className="text-white">输入解析 (Parsing)</strong>：利用语义编码器将自然语言分解为三组特征向量：现状向量、路径向量、边界向量。</li>
                            <li><strong className="text-white">蒙特卡洛模拟 (Simulation)</strong>：在相空间中进行 N 次 ($N \ge 10^4$) 随机游走模拟。每一次模拟引入随机扰动项，模拟未来可能的演化轨迹。</li>
                            <li><strong className="text-white">成功率坍缩 (Collapse)</strong>：最终的推荐指数并非简单的加权平均，而是基于木桶效应的非线性函数。当任一指标处于极端劣势时，整体成功率将迅速坍缩至低值。</li>
                        </ul>
                    </section>

                    <div className="border-t border-zinc-800 pt-10 mt-10">
                        <h4 className="text-sm text-zinc-500 uppercase tracking-widest mb-4">Conclusion // 结论</h4>
                        <p className="text-xl text-gray-200 font-medium leading-9">
                            "TDFT 模型的创新之处在于它打破了社会科学与自然科学的界限。它不再依赖主观的经验主义判断，而是提供了一套客观的、可量化的物理标尺，引导决策者寻找‘低熵-低能耗-高稳态’的最优解。"
                        </p>
                    </div>

                </div>
              </div>
              
              <div className="sticky bottom-0 bg-[#050505]/95 backdrop-blur p-6 border-t border-white/10 text-center">
                <button onClick={() => setShowManual(false)} className="px-16 py-4 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-200 rounded-lg font-bold transition-all text-sm tracking-[0.2em] border border-cyan-700/30 hover:border-cyan-500/50 shadow-lg">
                  关闭档案 (CLOSE)
                </button>
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
              
              {/* 标题优化：
                  1. text-4xl (手机) -> md:text-7xl (电脑) 避免换行
                  2. 渐变色 to-cyan-500 (提亮)
                  3. drop-shadow 增强，解决背景不清问题
              */}
              <h1 className="text-4xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500 drop-shadow-[0_0_25px_rgba(6,182,212,0.6)] font-sans px-2 leading-tight">
                热力学决策场论
              </h1>
              <div className="flex items-center justify-center gap-4 md:gap-6 text-xs md:text-base tracking-[0.5em] text-cyan-500 font-bold uppercase opacity-90">
                 <span>复杂系统</span>
                 <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                 <span>动力学推演</span>
              </div>
            </div>

            <div className="w-full space-y-6 px-4 md:px-0">
              
              {/* 输入框 1 (青色呼吸) */}
              <div className="relative group w-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg opacity-0 group-focus-within:opacity-75 transition duration-1000 blur-md group-focus-within:animate-pulse"></div>
                <div className="relative bg-[#080808]/90 border border-zinc-800 p-0 flex items-center h-14 rounded-lg overflow-hidden transition-all duration-300 group-hover:border-cyan-500/30 group-focus-within:border-cyan-400 group-focus-within:bg-cyan-950/20">
                    {/* 标签宽度适配：手机 w-20，电脑 w-40 */}
                    <div className="h-full w-20 md:w-40 bg-zinc-900/50 border-r border-zinc-800 flex items-center justify-center text-xs md:text-sm font-bold text-cyan-500 tracking-wider group-focus-within:text-cyan-400 transition-colors shrink-0">
                        初始状态
                    </div>
                    <input
                      type="text"
                      value={q1} onChange={(e) => setQ1(e.target.value)}
                      placeholder="困境、焦虑或现状..."
                      className="flex-grow bg-transparent px-4 md:px-6 text-sm md:text-base text-white placeholder:text-zinc-600 outline-none font-sans h-full tracking-wide min-w-0"
                    />
                    <div className="pr-4 text-cyan-800 opacity-30 group-focus-within:opacity-100 group-focus-within:text-cyan-400 transition-all hidden md:block">
                        <Layers size={20}/>
                    </div>
                </div>
              </div>

              {/* 输入框 2 (紫色呼吸) */}
              <div className="relative group w-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-0 group-focus-within:opacity-75 transition duration-1000 blur-md group-focus-within:animate-pulse"></div>
                <div className="relative bg-[#080808]/90 border border-zinc-800 p-0 flex items-center h-14 rounded-lg overflow-hidden transition-all duration-300 group-hover:border-purple-500/30 group-focus-within:border-purple-400 group-focus-within:bg-purple-950/20">
                    <div className="h-full w-20 md:w-40 bg-zinc-900/50 border-r border-zinc-800 flex items-center justify-center text-xs md:text-sm font-bold text-purple-500 tracking-wider group-focus-within:text-purple-400 transition-colors shrink-0">
                        决策变量
                    </div>
                    <input
                      type="text"
                      value={q2} onChange={(e) => setQ2(e.target.value)}
                      placeholder="方案A、方案B... (选填)"
                      className="flex-grow bg-transparent px-4 md:px-6 text-sm md:text-base text-white placeholder:text-zinc-600 outline-none font-sans h-full tracking-wide min-w-0"
                    />
                    <div className="pr-4 text-purple-800 opacity-30 group-focus-within:opacity-100 group-focus-within:text-purple-400 transition-all hidden md:block">
                        <GitGraph size={20}/>
                    </div>
                </div>
              </div>

              {/* 输入框 3 (绿色呼吸) */}
              <div className="relative group w-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg opacity-0 group-focus-within:opacity-75 transition duration-1000 blur-md group-focus-within:animate-pulse"></div>
                <div className="relative bg-[#080808]/90 border border-zinc-800 p-0 flex items-center h-14 rounded-lg overflow-hidden transition-all duration-300 group-hover:border-emerald-500/30 group-focus-within:border-emerald-400 group-focus-within:bg-emerald-950/20">
                    <div className="h-full w-20 md:w-40 bg-zinc-900/50 border-r border-zinc-800 flex items-center justify-center text-xs md:text-sm font-bold text-emerald-500 tracking-wider group-focus-within:text-emerald-400 transition-colors shrink-0">
                        系统约束
                    </div>
                    <input
                      type="text"
                      value={q3} onChange={(e) => setQ3(e.target.value)}
                      placeholder="底线、最坏打算... (选填)"
                      className="flex-grow bg-transparent px-4 md:px-6 text-sm md:text-base text-white placeholder:text-zinc-600 outline-none font-sans h-full tracking-wide min-w-0"
                    />
                    <div className="pr-4 text-emerald-800 opacity-30 group-focus-within:opacity-100 group-focus-within:text-emerald-400 transition-all hidden md:block">
                        <Shield size={20}/>
                    </div>
                </div>
              </div>
            </div>

            <button 
              onClick={startAnalysis}
              className="group relative w-full md:w-3/4 h-16 mt-8 overflow-hidden bg-cyan-950/40 border border-cyan-500/40 cursor-pointer hover:bg-cyan-900/60 transition-all duration-500 rounded-lg shadow-[0_0_25px_rgba(6,182,212,0.2)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] hover:border-cyan-400"
            >
              <div className="flex items-center justify-center gap-3 h-full relative z-10">
                <Fingerprint className="text-cyan-400 animate-pulse group-hover:text-cyan-200" size={22}/>
                <span className="text-base font-bold tracking-[0.4em] text-cyan-100 group-hover:text-white transition-all">
                  启动推演程序
                </span>
                <ChevronRight className="text-cyan-700 group-hover:translate-x-2 transition-transform opacity-50 group-hover:opacity-100 group-hover:text-cyan-200"/>
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
                    placeholder="输入修正参数以校准模型..."
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