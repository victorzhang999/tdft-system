import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userQuestion, context } = await req.json();

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    const systemPrompt = `
      你是一个基于“热力学决策场论(TDFT)”的高维决策分析系统。
      你的任务是根据用户的现状、方案和约束，计算成功的概率，并提供专业的物理学分析。

      请严格按照以下 JSON 格式返回数据（不要包含任何 markdown 格式，只返回纯 JSON）：
      {
        "probability_score": 0-100之间的整数,
        "conclusion": "这里用高度学术化、物理学术语（如熵增、势能壁垒、相变、吸引子）进行的严谨分析，字数100字左右。",
        "vernacular": "这里是【大白话版本】：用通俗易懂的语言（比如比喻成开车、盖房子、谈恋爱）翻译上面的结论。要一针见血，直白甚至带点犀利，告诉用户到底行不行，字数100字左右。",
        "suggestion": "这里提供3条具体的行动建议。"
      }

      评分标准：
      - 0-40分：高风险，系统处于高熵态，建议放弃或彻底重构。
      - 40-75分：中等风险，处于亚稳态，需要注入大量激活能（资源/努力）。
      - 75-100分：推荐，系统处于低熵稳态，势能壁垒已突破。
    `;

    const userPrompt = `
      ${context ? `历史上下文：${context}` : ''}
      用户当前输入：${userQuestion}
    `;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0].message.content) {
      throw new Error('API response invalid');
    }

    const result = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}