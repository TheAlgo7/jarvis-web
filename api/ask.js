// Vercel serverless function — proxies questions to Groq
// GROQ_API_KEY is set in Vercel dashboard (Settings → Environment Variables)
// It never touches the browser or the git repo.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body ?? {};
  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return res.status(400).json({ error: "Missing question" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured" });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), " +
              "Tony Stark's AI assistant. Answer concisely — 1 to 3 sentences " +
              "for most questions, more only when technical depth is needed. " +
              "Always address the user as 'Sir'. Use precise, measured language. " +
              "Do not use markdown, bullet points, or headers. Plain sentences only.",
          },
          { role: "user", content: question.trim() },
        ],
        max_tokens: 300,
        temperature: 0.65,
      }),
    });

    if (!groqRes.ok) {
      const text = await groqRes.text();
      return res.status(groqRes.status).json({ error: text });
    }

    const data = await groqRes.json();
    res.status(200).json({ answer: data.choices[0].message.content.trim() });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
}
