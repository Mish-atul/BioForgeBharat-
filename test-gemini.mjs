const apiKey = "AIzaSyAl4SH4hMQjsGcrbbGwzO89OQfCg7QcPiE";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`;

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey,
  },
  body: JSON.stringify({
    contents: [{ role: "user", parts: [{ text: "Hello" }] }],
  })
}).then(res => res.json()).then(console.log).catch(console.error);
