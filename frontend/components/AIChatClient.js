'use client';

import { useSearchParams } from 'next/navigation';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { askMarketQuestion, getPortfolio, summarizePortfolio, toChatPortfolio } from '../lib/api';
import { ErrorState, LoadingState } from './ResourceStates';
import { SectionHeader } from './SectionHeader';
import { useRealtimeResource } from './useRealtimeResource';

const STORAGE_KEY = 'arthaai-chat-history';
const suggestedPrompts = [
  'Should I reduce risk in my largest holding?',
  'What is the biggest risk in my portfolio right now?',
  'Which holding deserves deeper analysis today?',
  'How should I rebalance if banking weakens?',
];

function createUserMessage(text) {
  return {
    id: `user-${Date.now()}`,
    role: 'user',
    text,
    createdAt: new Date().toISOString(),
  };
}

function createAssistantMessage(payload) {
  return {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    text: payload.answer,
    recommendation: payload.recommendation,
    riskAnalysis: payload.riskAnalysis,
    citations: payload.citations || [],
    createdAt: new Date().toISOString(),
  };
}

export function AIChatClient() {
  const searchParams = useSearchParams();
  const portfolioResource = useRealtimeResource(getPortfolio, [], 20000);
  const holdings = Array.isArray(portfolioResource.data) ? portfolioResource.data : (portfolioResource.data?.holdings || []);
  const summary = summarizePortfolio(portfolioResource.data);
  const [question, setQuestion] = useState('What is the biggest risk in my portfolio right now?');

  useEffect(() => {
    const symbol = searchParams.get('symbol');
    if (symbol) {
      setQuestion(`What is the analysis for ${symbol}?`);
    }
  }, [searchParams]);

  const [messages, setMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [streamingPayload, setStreamingPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const chatScrollRef = useRef(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages, streamingText, streamingPayload]);

  const assistantCount = useMemo(() => messages.filter((message) => message.role === 'assistant').length, [messages]);

  async function handleSubmit(event) {
    event.preventDefault();
    const prompt = question.trim();
    if (!prompt || loading) return;

    if (!holdings.length) {
      setRequestError('Add portfolio holdings before using AI chat so the answer can use real portfolio context.');
      return;
    }

    const userMessage = createUserMessage(prompt);
    setQuestion('');
    setLoading(true);
    setRequestError('');
    setMessages((current) => [...current, userMessage]);

    try {
      const result = await askMarketQuestion({
        question: prompt,
        riskProfile: 'moderate',
        portfolio: toChatPortfolio(portfolioResource.data),
      });

      const assistantMessage = createAssistantMessage(result);
      setStreamingText('');
      setStreamingPayload({
        recommendation: assistantMessage.recommendation,
        riskAnalysis: assistantMessage.riskAnalysis,
        citations: assistantMessage.citations,
      });

      let index = 0;
      const fullText = assistantMessage.text;
      const timer = setInterval(() => {
        index += 4;
        startTransition(() => {
          setStreamingText(fullText.slice(0, index));
        });
        if (index >= fullText.length) {
          clearInterval(timer);
          startTransition(() => {
            setMessages((current) => [...current, assistantMessage]);
            setStreamingText('');
            setStreamingPayload(null);
            setLoading(false);
          });
        }
      }, 18);
    } catch (caughtError) {
      setLoading(false);
      setStreamingText('');
      setStreamingPayload(null);
      setRequestError(caughtError.message || 'Unable to fetch an AI response right now.');
    }
  }

  function clearHistory() {
    setMessages([]);
    setStreamingText('');
    setStreamingPayload(null);
    setRequestError('');
    window.localStorage.removeItem(STORAGE_KEY);
  }

  if (portfolioResource.loading) {
    return <LoadingState title="Loading AI workspace..." subtitle="Fetching your portfolio so chat can use real context." />;
  }

  if (portfolioResource.error) {
    return <ErrorState title="AI chat unavailable" message={portfolioResource.error} onRetry={portfolioResource.reload} />;
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="AI Chat"
        title="Distraction-free portfolio assistant"
        subtitle="Ask questions against your real portfolio data and stream responses from the live backend chat endpoint."
        lastUpdated={messages.length ? new Date(messages[messages.length - 1].createdAt) : portfolioResource.lastUpdated}
      />

      <div className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
        <aside className="space-y-5 rounded-[1.8rem] border border-white/10 bg-white/6 p-5 backdrop-blur-2xl">
          <div className="rounded-[1.35rem] border border-white/8 bg-slate-950/35 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Portfolio Summary</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{summary.currentValue}</h3>
            <p className={`mt-2 text-sm ${summary.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{summary.pnl} total · {summary.pnlPercentage}%</p>
            <div className="mt-4 space-y-3">
              {holdings.slice(0, 3).map((holding) => (
                <div key={holding.symbol} className="flex items-center justify-between rounded-[1rem] bg-white/5 px-3 py-3 text-sm">
                  <span className="text-slate-200">{holding.symbol}</span>
                  <span className={holding.pnlPercentage >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{holding.pnlPercentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-white/8 bg-slate-950/35 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Quick Actions</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Start faster</h3>
              </div>
              <button onClick={clearHistory} className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/15">Clear</button>
            </div>
            <div className="mt-4 grid gap-3">
              {suggestedPrompts.map((prompt) => (
                <button key={prompt} onClick={() => setQuestion(prompt)} className="rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10">
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-white/8 bg-slate-950/35 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">History</p>
            <p className="mt-2 text-xl font-semibold text-white">{assistantCount} answers saved</p>
            <p className="mt-2 text-sm text-slate-400">Conversation history is stored locally for your current browser session.</p>
          </div>
        </aside>

        <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-4 backdrop-blur-2xl md:p-5">
          <div ref={chatScrollRef} className="chat-scroll h-[560px] space-y-5 overflow-y-auto pr-2">
            {!messages.length && !streamingText ? (
              <div className="rounded-[1.5rem] border border-emerald-400/15 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(255,255,255,0.04))] p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">Suggested Prompts</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {suggestedPrompts.map((prompt) => (
                    <button key={prompt} onClick={() => setQuestion(prompt)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-[1.5rem] px-5 py-4 ${message.role === 'user' ? 'bg-white text-slate-950' : 'border border-white/8 bg-slate-950/45 text-slate-100'}`}>
                  <p className="text-sm leading-7">{message.text}</p>
                  {message.role === 'assistant' ? (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-[1.1rem] bg-white/5 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/75">Recommendation</p>
                        <p className="mt-2 text-sm font-medium text-white">{message.recommendation}</p>
                      </div>
                      <div className="rounded-[1.1rem] bg-white/5 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-amber-300/75">Risk Analysis</p>
                        <p className="mt-2 text-sm text-slate-200">{message.riskAnalysis}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.citations?.map((citation, index) => (
                          <span key={`${message.id}-${index}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            {typeof citation === 'string' ? citation : citation.source}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {streamingPayload ? (
              <div className="flex justify-start">
                <div className="max-w-[88%] rounded-[1.5rem] border border-white/8 bg-slate-950/45 px-5 py-4 text-slate-100">
                  <p className="text-sm leading-7">{streamingText}<span className="ml-1 inline-block h-4 w-2 animate-pulse bg-slate-400 align-middle" /></p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[1.1rem] bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/75">Recommendation</p>
                      <p className="mt-2 text-sm font-medium text-white">{streamingPayload.recommendation}</p>
                    </div>
                    <div className="rounded-[1.1rem] bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-amber-300/75">Risk Analysis</p>
                      <p className="mt-2 text-sm text-slate-200">{streamingPayload.riskAnalysis}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={4}
              placeholder="Ask about a holding, a risk, or a trading decision..."
              className="w-full resize-none rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
            />
            {requestError ? <p className="mt-3 text-sm text-rose-300">{requestError}</p> : null}
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">No mock fallback is used. If the backend fails, the error is shown here.</p>
              <button className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300">{loading ? 'Streaming...' : 'Send'}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

