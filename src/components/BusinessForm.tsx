import React, { useState } from 'react';
import { BusinessInput, INDIAN_STATES, MONTHS } from '../types';
import { Briefcase, MapPin, Calendar, IndianRupee, Loader2, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onSubmit: (input: BusinessInput) => void;
  isLoading: boolean;
}

export default function BusinessForm({ onSubmit, isLoading }: Props) {
  const [formData, setFormData] = useState<BusinessInput>({
    budget: 10000,
    state: 'Andhra Pradesh',
    city: 'Vijayawada',
    startMonth: 'April'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800 max-w-xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-600 rounded-lg text-white">
          <Briefcase size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Start Your Journey</h2>
          <p className="text-slate-400 text-sm">Fill in your details for a data-driven business prediction.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-6">
          {/* Budget */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <IndianRupee size={16} className="text-indigo-400" />
              Investment Budget (₹)
            </label>
            <input
              type="number"
              required
              min="10000"
              value={formData.budget || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFormData({ ...formData, budget: isNaN(val) ? 0 : val });
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="e.g. 10000"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-400" />
              Select State
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            >
              {INDIAN_STATES.map(state => (
                <option key={state} value={state} className="bg-slate-800">{state}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-400 opacity-50" />
              City / Town (Optional)
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="e.g. Mumbai"
            />
          </div>

          {/* Month */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Calendar size={16} className="text-indigo-400" />
              Starting Month
            </label>
            <select
              value={formData.startMonth}
              onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            >
              {MONTHS.map(month => (
                <option key={month} value={month} className="bg-slate-800">{month}</option>
              ))}
            </select>
          </div>

          {/* Liked Profession */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Heart size={16} className="text-pink-500" />
              Liked Profession / Interest (Optional)
            </label>
            <input
              type="text"
              value={formData.likedProfession || ''}
              onChange={(e) => setFormData({ ...formData, likedProfession: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="e.g. Organic Farming, Tech Startup, Cafe"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/50 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Analyzing Market Data...
            </>
          ) : (
            'Predict Best Business'
          )}
        </button>
      </form>
    </motion.div>
  );
}
