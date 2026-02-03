import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink, Users, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { TrustScoreCard } from './TrustScoreCard';
import { CommunityValidation } from './CommunityValidation';

type Submission = Database['public']['Tables']['content_submissions']['Row'];
type TrustComponents = Database['public']['Tables']['trust_score_components']['Row'];
type BiasSignal = Database['public']['Tables']['bias_signals']['Row'];
type Validation = Database['public']['Tables']['community_validations']['Row'];

interface ContentAnalysisProps {
  refreshTrigger: number;
}

export function ContentAnalysis({ refreshTrigger }: ContentAnalysisProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [trustComponents, setTrustComponents] = useState<Record<string, TrustComponents>>({});
  const [biasSignals, setBiasSignals] = useState<Record<string, BiasSignal[]>>({});
  const [validations, setValidations] = useState<Record<string, Validation[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, [refreshTrigger]);

  const loadSubmissions = async () => {
    setLoading(true);

    const { data: submissionsData } = await supabase
      .from('content_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (submissionsData) {
      setSubmissions(submissionsData);

      const componentsPromises = submissionsData.map(s =>
        supabase.from('trust_score_components').select('*').eq('submission_id', s.id).maybeSingle()
      );
      const componentsResults = await Promise.all(componentsPromises);
      const componentsMap: Record<string, TrustComponents> = {};
      componentsResults.forEach((result, idx) => {
        if (result.data) {
          componentsMap[submissionsData[idx].id] = result.data;
        }
      });
      setTrustComponents(componentsMap);

      const biasPromises = submissionsData.map(s =>
        supabase.from('bias_signals').select('*').eq('submission_id', s.id)
      );
      const biasResults = await Promise.all(biasPromises);
      const biasMap: Record<string, BiasSignal[]> = {};
      biasResults.forEach((result, idx) => {
        if (result.data) {
          biasMap[submissionsData[idx].id] = result.data;
        }
      });
      setBiasSignals(biasMap);

      const validationPromises = submissionsData.map(s =>
        supabase.from('community_validations').select('*').eq('submission_id', s.id)
      );
      const validationResults = await Promise.all(validationPromises);
      const validationMap: Record<string, Validation[]> = {};
      validationResults.forEach((result, idx) => {
        if (result.data) {
          validationMap[submissionsData[idx].id] = result.data;
        }
      });
      setValidations(validationMap);
    }

    setLoading(false);
  };

  const getOverallTrustLabel = (score: number) => {
    if (score >= 0.8) return { label: 'Highly Trustworthy', color: 'text-green-600' };
    if (score >= 0.6) return { label: 'Generally Reliable', color: 'text-blue-600' };
    if (score >= 0.4) return { label: 'Requires Verification', color: 'text-yellow-600' };
    return { label: 'Questionable', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No content analyzed yet</h3>
        <p className="text-slate-500">Submit your first piece of content to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const components = trustComponents[submission.id];
        const signals = biasSignals[submission.id] || [];
        const communityVals = validations[submission.id] || [];
        const trustLabel = getOverallTrustLabel(submission.trust_score);
        const isExpanded = selectedSubmission === submission.id;

        return (
          <div key={submission.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div
              className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setSelectedSubmission(isExpanded ? null : submission.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{submission.title}</h3>
                  {submission.url && (
                    <a
                      href={submission.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {submission.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${trustLabel.color} mb-1`}>
                    {Math.round(submission.trust_score * 100)}%
                  </div>
                  <div className={`text-sm font-semibold ${trustLabel.color}`}>
                    {trustLabel.label}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {signals.length} bias signals
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {communityVals.length} validations
                </span>
                <span>{new Date(submission.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {isExpanded && components && (
              <div className="border-t border-slate-200 p-6 bg-slate-50">
                <h4 className="text-lg font-bold text-slate-900 mb-4">Trust Score Breakdown</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <TrustScoreCard
                    score={components.source_credibility}
                    label="Source Credibility"
                    icon="shield"
                  />
                  <TrustScoreCard
                    score={components.creator_history}
                    label="Creator History"
                    icon="trending"
                  />
                  <TrustScoreCard
                    score={components.bias_score}
                    label="Bias Analysis"
                    icon="check"
                  />
                  <TrustScoreCard
                    score={components.fact_check_results}
                    label="Fact Check Results"
                    icon="alert"
                  />
                </div>

                {signals.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-slate-900 mb-3">Detected Bias Signals</h5>
                    <div className="space-y-2">
                      {signals.map((signal) => (
                        <div
                          key={signal.id}
                          className={`flex items-start gap-3 p-3 rounded-lg ${
                            signal.severity === 'high'
                              ? 'bg-red-50 border border-red-200'
                              : signal.severity === 'medium'
                              ? 'bg-yellow-50 border border-yellow-200'
                              : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          <AlertTriangle
                            className={`w-5 h-5 mt-0.5 ${
                              signal.severity === 'high'
                                ? 'text-red-600'
                                : signal.severity === 'medium'
                                ? 'text-yellow-600'
                                : 'text-blue-600'
                            }`}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 capitalize">
                              {signal.bias_type} Bias
                              <span
                                className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                  signal.severity === 'high'
                                    ? 'bg-red-200 text-red-800'
                                    : signal.severity === 'medium'
                                    ? 'bg-yellow-200 text-yellow-800'
                                    : 'bg-blue-200 text-blue-800'
                                }`}
                              >
                                {signal.severity}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 mt-1">{signal.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <CommunityValidation
                  submissionId={submission.id}
                  existingValidations={communityVals}
                  onValidated={loadSubmissions}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
