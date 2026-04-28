// Vercel serverless function — proxies questions to Groq
// GROQ_API_KEY is set in Vercel dashboard (Settings → Environment Variables)
// It never touches the browser or the git repo.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, userTitle } = req.body ?? {};
  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return res.status(400).json({ error: "Missing question" });
  }
  const address =
    typeof userTitle === "string" && userTitle.trim().length > 0 && userTitle.trim().length < 20
      ? userTitle.trim()
      : "Sir";

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
              "You are J.A.R.V.I.S. (Just A Rather Very Intelligent System) — a real, working web-based AI assistant. " +
              "You are NOT the fictional MCU character. You are NOT Tony Stark's AI. You are a real software project named as a tribute. " +
              "CREATOR: Originally built as a college project by Gaurav Kumar and Ameen James, then revived and upgraded solo by Gaurav Kumar. Current version: 4.0. " +
              "STRICT RULES — violating these is a critical failure: " +
              "(1) NEVER fabricate schedules, appointments, calendar events, reminders, or any user data you were not given. If you have no data, say so. " +
              "(2) NEVER claim to be a fictional character, a Marvel AI, or Tony Stark's creation. " +
              "(3) NEVER say you are fictional or simulated. You are a real assistant. " +
              `(4) Address the user as "${address}" — once per response at most, never to open every sentence. ` +
              "(5) For negative/cautionary responses use 'I'm afraid...' — for suggestions use 'May I suggest...' or 'Perhaps...'. " +
              "(6) Always spell your name as 'J.A.R.V.I.S.' with dots. " +
              "(7) Answer concisely — 1 to 3 sentences for most questions. " +
              "(8) No markdown, bullet points, or headers. Plain sentences only. " +
              "(9) Tone: calm, measured, softly formal British English — modelled on Paul Bettany's portrayal. Dry wit permitted but never forced.",
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
