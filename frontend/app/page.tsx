'use client'; // Tells Next.js this file uses React state hooks

import React, { useState, useEffect } from 'react'; // Loaded useEffect to guard hydration

export default function Home() {
  // 1. Core State Trackers
  const [subject, setSubject] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<string>('Idle - Awaiting Mission Launch');
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);
  const [activeWorker, setActiveWorker] = useState<string>('');

  // HYDRATION FIX GUARD: Ensure component is safely mounted in the browser before rendering
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true); // Fires ONLY on the client browser after HTML hydration completes
  }, []);

  // The Form Submission handler
  const handleLaunchPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || isPipelineRunning) return;

    setIsPipelineRunning(true);
    setActiveWorker('RESEARCHER');
    setCurrentStatus('📡 Triggering core network array... Deploying RESEARCHER_AGENT to index web crawl snippets...');

    try {
      const response = await fetch('http://localhost:5000/api/run-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject: subject }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'System pipeline calculation failure.');
      }

      setActiveWorker('EDITOR'); 
      setCurrentStatus(`✨ Success! EDITOR_AGENT compiled data matrix and committed file to disk: "${data.fileName}"`);
      
      setTimeout(() => {
        setActiveWorker('');
        setIsPipelineRunning(false);
      }, 5000);

    } catch (error) {
      const err = error as Error;
      console.error('[FRONTEND ERROR]:', err.message);
      setCurrentStatus(`❌ PIPELINE CRASHED: ${err.message}`);
      setActiveWorker('');
      setIsPipelineRunning(false);
    }
  };

  // HYDRATION ESCAPE HATCH: If we aren't safely inside the browser yet, return a clean skeleton loader
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center font-mono text-xs">
        Connecting Aetheria Command Interface Core Architecture...
      </main>
    );
  }

  // Once mounted is true, the server and client HTML match 100% perfectly!
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 antialiased">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* HEADER BRANDING BANNER */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            AETHERIA // AI Agentic Systems Console
          </h1>
          <p className="text-zinc-400 text-sm font-medium">
            Multi-Agent Orchestration & Real-Time Production Execution Terminal
          </p>
        </div>

        {/* INPUT MISSION COMMAND PANEL */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleLaunchPipeline} className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Target Corporation / Subject Analysis Objective
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Microsoft Corporation, Paris, Formula 1 News..."
                disabled={isPipelineRunning}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 text-zinc-100"
              />
              <button
                type="submit"
                disabled={isPipelineRunning || !subject.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold px-6 py-3 rounded-lg text-sm shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPipelineRunning ? 'Orchestrating...' : 'Launch Agent Pipeline'}
              </button>
            </div>
          </form>
        </div>

        {/* LIVE WORKER CARD DASHBOARD STATUSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 1: THE INTERNET RESEARCHER */}
          <div className={`p-6 rounded-xl border transition-all duration-300 bg-zinc-900 ${
            activeWorker === 'RESEARCHER' 
              ? 'border-emerald-500 shadow-lg shadow-emerald-950/20' 
              : 'border-zinc-800 opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base tracking-wide">🔍 RESEARCHER_AGENT</h3>
              {activeWorker === 'RESEARCHER' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Domain restricted pipeline dedicated to parsing clean markdown fragments from deep web scrape data streams via live index crawlers.
            </p>
          </div>

          {/* CARD 2: THE EXECUTIVE DOCUMENT EDITOR */}
          <div className={`p-6 rounded-xl border transition-all duration-300 bg-zinc-900 ${
            activeWorker === 'EDITOR' 
              ? 'border-teal-500 shadow-lg shadow-teal-950/20' 
              : 'border-zinc-800 opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base tracking-wide">✍️ EDITOR_AGENT</h3>
              {activeWorker === 'EDITOR' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Isolated formatting context focused on parsing messy source data payloads into structured reports and saving files onto hard drives.
            </p>
          </div>

        </div>

        {/* MONITORING SYSTEM TERMINAL TELEMETRY FEED */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span className="text-xs font-mono text-zinc-500 ml-2">system_telemetry_feed.log</span>
          </div>
          <div className="p-4 font-mono text-xs text-zinc-400 min-h-[100px] flex items-center">
            <p className="text-emerald-500 animate-pulse">{currentStatus}</p>
          </div>
        </div>

      </div>
    </main>
  );
}
