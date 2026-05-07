// Quick test of gemini-2.0-flash from this machine
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("Set GEMINI_API_KEY env var first"); process.exit(1); }

const models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"];

for (const model of models) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Say hello in 3 words" }] }],
      }),
    });
    const data = await res.json();
    if (res.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
      console.log(`✅ ${model}: ${res.status} — "${text.trim().slice(0, 50)}"`);
    } else {
      console.log(`❌ ${model}: ${res.status} — ${data.error?.message?.slice(0, 80)}`);
    }
  } catch (e) {
    console.log(`❌ ${model}: ${e.message}`);
  }
}
