import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          reputation_score: number;
          contributions_count: number;
          created_at: string;
        };
      };
      sources: {
        Row: {
          id: string;
          source_type: 'domain' | 'creator' | 'platform' | 'publisher';
          identifier: string;
          name: string;
          trust_score: number;
          analysis_count: number;
          created_at: string;
          updated_at: string;
        };
      };
      content_submissions: {
        Row: {
          id: string;
          user_id: string | null;
          url: string | null;
          title: string;
          content_text: string | null;
          source_id: string | null;
          trust_score: number;
          status: 'analyzing' | 'completed' | 'flagged';
          created_at: string;
          updated_at: string;
        };
      };
      trust_score_components: {
        Row: {
          id: string;
          submission_id: string;
          source_credibility: number;
          creator_history: number;
          bias_score: number;
          community_validation: number;
          fact_check_results: number;
          updated_at: string;
        };
      };
      bias_signals: {
        Row: {
          id: string;
          submission_id: string;
          bias_type: 'political' | 'emotional' | 'selection' | 'framing' | 'source' | 'confirmation';
          description: string;
          severity: 'low' | 'medium' | 'high';
          detected_at: string;
        };
      };
      community_validations: {
        Row: {
          id: string;
          submission_id: string;
          user_id: string;
          validation_type: 'trustworthy' | 'questionable' | 'misleading' | 'verified';
          confidence_level: number;
          notes: string | null;
          created_at: string;
        };
      };
      creator_history: {
        Row: {
          id: string;
          creator_identifier: string;
          platform: string;
          total_content: number;
          accuracy_rate: number;
          bias_tendency: 'left' | 'center-left' | 'neutral' | 'center-right' | 'right' | 'unknown';
          last_updated: string;
        };
      };
    };
  };
};
