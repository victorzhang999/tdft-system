import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

    const { userQuestion, context } = await req.json();

    // 构建提示词：如果是补充信息，就加上前文
    const userContent = context 
      ? `【背景信息】：${context}\n\n【用户补充的新信息】：${userQuestion}\n\n请结合新信息重新修正推演结果。`
      : userQuestion;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个基于“热力学决策场论”的决策分析系统。
            
            核心任务：
            1. 计算 Entropy (熵), Activation (激活能), Stability (稳定性)。
            2. 计算【推荐指数】(Probability Score, 0-100)。
               - 0-40: 红色高危。
               - 40-75: 黄色观望。
               - 75-100: 绿色推荐。

            **重要处理逻辑**：
            - 如果用户输入的信息缺失（例如只填了现状，没填选项），**不要拒绝回答**。
            - 必须基于现有信息进行模糊推演，但在【结论】和【建议】中明确指出“数据不足导致精度下降”。
            - **在 suggeston 字段中，必须针对缺失的部分提出具体的追问**（例如：“为了更精准，请告诉我你的备选方案是什么？”）。

            请输出纯 JSON 格式：
            {
              "entropy": 0-100,
              "activation": 0-100,
              "stability": 0-100,
              "probability_score": 0-100,
              "probability_desc": "一句话评价 (例如：信息不全，暂定为高风险观望状态)",
              "conclusion": "诊断结论 (如果信息缺，请强调模型处于‘欠拟合’状态)",
              "theory_support": "物理学依据",
              "suggestion": "行动策略 + 缺失信息追问"
            }`
          },
          { role: 'user', content: userContent }
        ],
        stream: false
      })
    });

    if (!response.ok) throw new Error('DeepSeek API Error');
    const data = await response.json();
    const content = data.choices[0].message.content.replace(/```json|```/g, '').trim();
    
    return NextResponse.json(JSON.parse(content));

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}