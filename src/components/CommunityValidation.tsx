import { useState } from 'react';
import { ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../lib/supabase';

type Validation = Database['public']['Tables']['community_validations']['Row'];

interface CommunityValidationProps {
  submissionId: string;
  existingValidations: Validation[];
  onValidated: () => void;
}

export function CommunityValidation({ submissionId, existingValidations, onValidated }: CommunityValidationProps) {
  const [validationType, setValidationType] = useState<'trustworthy' | 'questionable' | 'misleading' | 'verified'>('trustworthy');
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const userHasValidated = existingValidations.some(v => v.user_id === user?.id);

  const validationCounts = {
    trustworthy: existingValidations.filter(v => v.validation_type === 'trustworthy').length,
    verified: existingValidations.filter(v => v.validation_type === 'verified').length,
    questionable: existingValidations.filter(v => v.validation_type === 'questionable').length,
    misleading: existingValidations.filter(v => v.validation_type === 'misleading').length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      if (userHasValidated) {
        await supabase
          .from('community_validations')
          .update({
            validation_type: validationType,
            confidence_level: confidence,
            notes: notes || null,
          })
          .eq('submission_id', submissionId)
          .eq('user_id', user.id);
      } else {
        await supabase.from('community_validations').insert({
          submission_id: submissionId,
          user_id: user.id,
          validation_type: validationType,
          confidence_level: confidence,
          notes: notes || null,
        });
      }

      setNotes('');
      onValidated();
    } catch (err) {
      console.error('Error submitting validation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-slate-200 pt-6">
      <h5 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Community Validation ({existingValidations.length})
      </h5>

      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-green-700">{validationCounts.verified}</div>
          <div className="text-xs text-green-600">Verified</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <ThumbsUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-blue-700">{validationCounts.trustworthy}</div>
          <div className="text-xs text-blue-600">Trustworthy</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-yellow-700">{validationCounts.questionable}</div>
          <div className="text-xs text-yellow-600">Questionable</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <ThumbsDown className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-red-700">{validationCounts.misleading}</div>
          <div className="text-xs text-red-600">Misleading</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your Validation
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'verified', label: 'Verified', color: 'green' },
              { value: 'trustworthy', label: 'Trustworthy', color: 'blue' },
              { value: 'questionable', label: 'Questionable', color: 'yellow' },
              { value: 'misleading', label: 'Misleading', color: 'red' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValidationType(option.value as any)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  validationType === option.value
                    ? `bg-${option.color}-600 text-white`
                    : `bg-${option.color}-50 text-${option.color}-700 hover:bg-${option.color}-100`
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confidence Level: {confidence}/5
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={confidence}
            onChange={(e) => setConfidence(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Share your reasoning..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : userHasValidated ? 'Update Validation' : 'Submit Validation'}
        </button>
      </form>
    </div>
  );
}
