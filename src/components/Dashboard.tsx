import { useState } from 'react';
import { Header } from './Header';
import { SubmitContent } from './SubmitContent';
import { ContentAnalysis } from './ContentAnalysis';

export function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleContentSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Verify Trust in Digital Content
          </h2>
          <p className="text-slate-600">
            Submit content for analysis and receive transparent trust scores based on source credibility,
            creator history, bias detection, and community validation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <SubmitContent onSubmitted={handleContentSubmitted} />
          </div>

          <div className="lg:col-span-2">
            <ContentAnalysis refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}
