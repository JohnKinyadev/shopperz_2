import { useState } from "react";
import { getProductAdvice, hasLiveAiEndpoint } from "../lib/ai";

const defaultPrompts = [
  "Is this product right for my daily use?",
  "What kind of buyer is this best for?",
  "Help me compare this with a cheaper option.",
];

function AIAssistantCard({ product, profile }) {
  const [prompt, setPrompt] = useState(defaultPrompts[0]);
  const [answer, setAnswer] = useState(product.aiTip);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const liveMode = hasLiveAiEndpoint();

  async function handleAsk(nextPrompt = prompt) {
    setPrompt(nextPrompt);
    setLoading(true);
    setError("");

    try {
      const result = await getProductAdvice(product, profile, nextPrompt);
      setAnswer(result);
    } catch (requestError) {
      setError(
        requestError.message ||
          "The AI assistant could not respond right now. Try again after checking the API setup.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel assistant-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">AI shopping assistant</p>
          <h3>Guidance for this product</h3>
        </div>
        <span className="status-badge">{liveMode ? "Live endpoint" : "Demo fallback"}</span>
      </div>

      <div className="assistant-prompts">
        {defaultPrompts.map((item) => (
          <button key={item} type="button" onClick={() => handleAsk(item)}>
            {item}
          </button>
        ))}
      </div>

      <label className="assistant-input">
        <span>Your question</span>
        <textarea
          rows="4"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Example: I need something compact with strong battery life."
        />
      </label>

      <button className="primary-button" type="button" onClick={() => handleAsk()} disabled={loading}>
        {loading ? "Thinking..." : "Ask assistant"}
      </button>

      <div className="assistant-answer">
        <p>{answer}</p>
        {error ? <small>{error}</small> : null}
      </div>
    </section>
  );
}

export default AIAssistantCard;
