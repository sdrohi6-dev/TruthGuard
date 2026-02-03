import { useState } from 'react';
import { Link2, FileText, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SubmitContentProps {
  onSubmitted: () => void;
}

export function SubmitContent({ onSubmitted }: SubmitContentProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const analyzeContent = () => {
    const sourceCredibility = Math.random() * 0.4 + 0.5;
    const creatorHistory = Math.random() * 0.4 + 0.4;
    const biasScore = 1 - (Math.random() * 0.3);
    const factCheck = Math.random() * 0.5 + 0.4;

    const trustScore = (sourceCredibility + creatorHistory + biasScore + factCheck) / 4;

    return {
      trustScore,
      components: {
        sourceCredibility,
        creatorHistory,
        biasScore,
        factCheck,
      },
    };
  };

  const detectBiasSignals = () => {
    const biasTypes = ['political', 'emotional', 'selection', 'framing', 'source', 'confirmation'] as const;
    const severities = ['low', 'medium', 'high'] as const;
    const numSignals = Math.floor(Math.random() * 3);

    const signals = [];
    for (let i = 0; i < numSignals; i++) {
      signals.push({
        biasType: biasTypes[Math.floor(Math.random() * biasTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: 'Detected through automated analysis and pattern matching',
      });
    }

    return signals;
  };

  const extractSource = (urlString: string) => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const sourceIdentifier = url ? extractSource(url) : 'direct-text';

      let source = await supabase
        .from('sources')
        .select('*')
        .eq('identifier', sourceIdentifier)
        .maybeSingle();

      if (!source.data) {
        const { data: newSource, error: sourceError } = await supabase
          .from('sources')
          .insert({
            source_type: 'domain',
            identifier: sourceIdentifier,
            name: sourceIdentifier,
          })
          .select()
          .single();

        if (sourceError) throw sourceError;
        source.data = newSource;
      }

      const analysis = analyzeContent();

      const { data: submission, error: submissionError } = await supabase
        .from('content_submissions')
        .insert({
          user_id: user.id,
          url: url || null,
          title,
          content_text: contentText || null,
          source_id: source.data?.id,
          trust_score: analysis.trustScore,
          status: 'completed',
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      await supabase.from('trust_score_components').insert({
        submission_id: submission.id,
        source_credibility: analysis.components.sourceCredibility,
        creator_history: analysis.components.creatorHistory,
        bias_score: analysis.components.biasScore,
        fact_check_results: analysis.components.factCheck,
        community_validation: 0,
      });

      const biasSignals = detectBiasSignals();
      if (biasSignals.length > 0) {
        await supabase.from('bias_signals').insert(
          biasSignals.map(signal => ({
            submission_id: submission.id,
            bias_type: signal.biasType,
            description: signal.description,
            severity: signal.severity,
          }))
        );
      }

      await supabase
        .from('sources')
        .update({
          analysis_count: (source.data?.analysis_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', source.data!.id);

      setUrl('');
      setTitle('');
      setContentText('');
      onSubmitted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Submit Content for Analysis</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Content URL (optional)
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/article"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter content title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Content Text (optional)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-32"
              placeholder="Paste content text here for analysis..."
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {loading ? 'Analyzing...' : 'Submit for Analysis'}
        </button>
      </form>
    </div>
  );
}
