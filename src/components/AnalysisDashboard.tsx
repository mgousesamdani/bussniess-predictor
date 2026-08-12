import React, { useState } from 'react';
import { BusinessPrediction } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, Clock, Wallet, 
  Volume2, Globe, ChevronRight, Info, CheckCircle2, RefreshCcw, FileDown, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { generateSpeech } from '../services/gemini';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import DoubtSolver from './DoubtSolver';

interface Props {
  prediction: BusinessPrediction;
  onNextIdea: () => void;
  isLoadingNext: boolean;
}

export default function AnalysisDashboard({ prediction, onNextIdea, isLoadingNext }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');

  const handleExportPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#020617', // slate-950
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Business-Prediction-${prediction.businessName.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('PDF Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const contextString = `Business: ${prediction.businessName}. Success: ${prediction.successProbability}%, Risk: ${prediction.failureRisk}%. Monthly Profit: ₹${prediction.monthlyNetProfit}. Break-even: ${prediction.breakEvenMonths} months.`;

  const chartData = [
    { name: 'Success Probability', value: Number(prediction.successProbability) || 0, color: '#4f46e5' },
    { name: 'Profit Margin', value: Number(prediction.profitMargin) || 0, color: '#10b981' },
    { name: 'Potential Loss', value: Number(prediction.lossMargin) || 0, color: '#ef4444' },
  ];

  const handleVoiceExplanation = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const audioUrl = await generateSpeech(prediction.explanation, selectedLang);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20" id="dashboard-content">
      <div className="flex justify-end mb-4" data-html2canvas-ignore>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl border border-slate-700 transition-all font-bold text-sm disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileDown size={16} />
          )}
          {isExporting ? 'Generating PDF...' : 'Export as PDF'}
        </button>
      </div>
      {/* Top Section: Recommendation & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommendation Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
              <TrendingUp size={16} />
              Top Recommendation
            </div>
            <h1 className="text-4xl font-black text-white mb-4">{prediction.businessName}</h1>
            <p className="text-slate-400 leading-relaxed text-lg mb-6">
              {prediction.explanation}
            </p>
            
            <button
              onClick={onNextIdea}
              disabled={isLoadingNext}
              data-html2canvas-ignore
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm transition-colors mb-6 disabled:opacity-50"
            >
              <RefreshCcw size={16} className={isLoadingNext ? "animate-spin" : ""} />
              {isLoadingNext ? "Finding another idea..." : "Not satisfied? Show me the next best idea"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Investment</div>
              <div className="text-xl font-bold text-white">₹{prediction.suggestedInvestment.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Monthly Profit</div>
              <div className="text-xl font-bold text-white">₹{prediction.monthlyNetProfit.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Break-even</div>
              <div className="text-xl font-bold text-white">{prediction.breakEvenMonths} Months</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl relative group">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                Success Rate
                <Info size={12} className="text-slate-600 cursor-help" />
              </div>
              <div className="text-xl font-bold text-indigo-400">{prediction.successProbability}%</div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-700 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-slate-600 text-center leading-tight">
                The estimated likelihood that this business will reach its break-even point and generate consistent profit within the first year, based on historical market trends.
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Risk Level</div>
              <div className="text-xl font-bold text-red-400">{prediction.failureRisk}%</div>
            </div>
          </div>
        </motion.div>

        {/* Pie Chart Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-bold text-white mb-4">Financial Outlook</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Voice Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        data-html2canvas-ignore
        className="bg-indigo-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-full">
            <Volume2 className={isSpeaking ? "animate-pulse" : ""} />
          </div>
          <div>
            <h4 className="font-bold">AI Voice Explanation</h4>
            <p className="text-indigo-200 text-sm">Listen to the detailed analysis in your preferred language.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="English" className="text-slate-900">English</option>
            <option value="Hindi" className="text-slate-900">Hindi</option>
            <option value="Marathi" className="text-slate-900">Marathi</option>
            <option value="Tamil" className="text-slate-900">Tamil</option>
            <option value="Bengali" className="text-slate-900">Bengali</option>
          </select>
          <button 
            onClick={handleVoiceExplanation}
            disabled={isSpeaking}
            className="bg-white text-indigo-900 font-bold px-6 py-2 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50"
          >
            {isSpeaking ? 'Speaking...' : 'Play Audio'}
          </button>
        </div>
      </motion.div>

      {/* Insights Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Seasonal Impact */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase mb-3">
            <Clock size={14} />
            Seasonal Impact
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{prediction.seasonalImpact}</p>
        </div>

        {/* Regional Demand */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-3">
            <Globe size={14} />
            Regional Demand
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{prediction.regionalDemand}</p>
        </div>

        {/* Market Competition */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase mb-3">
            <TrendingUp size={14} />
            Competition
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{prediction.marketCompetition}</p>
        </div>

        {/* Key Risk Factors */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-3">
            <AlertTriangle size={14} />
            Key Risks
          </div>
          <ul className="space-y-2">
            {prediction.keyRiskFactors.map((risk, i) => (
              <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Doubt Solver Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        data-html2canvas-ignore
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white">Still Have Doubts?</h2>
          <p className="text-slate-400">Our AI consultant is here to help you clarify any professional uncertainties.</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <DoubtSolver context={contextString} />
        </div>
      </motion.div>
    </div>
  );
}
