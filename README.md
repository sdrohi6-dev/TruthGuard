# TruthGuard - Trust Verification Platform

A comprehensive web platform that helps users verify trust and credibility in an AI-dominated internet. The system analyzes content sources, creator history, and bias signals in real-time, providing transparent trust scores and community-validated insights.

## Features

### Core Functionality

- **Content Submission**: Users can submit URLs or text content for comprehensive trust analysis
- **Multi-Factor Trust Scoring**: Analyzes content across multiple dimensions:
  - Source credibility
  - Creator history
  - Bias detection
  - Fact-check results
  - Community validation

### Real-Time Analysis

- **Bias Signal Detection**: Automatically identifies various types of bias:
  - Political bias
  - Emotional manipulation
  - Selection bias
  - Framing bias
  - Source bias
  - Confirmation bias

- **Severity Assessment**: Each bias signal is categorized as low, medium, or high severity

### Community Validation

- **Transparent Voting**: Users can validate content with four categories:
  - Verified
  - Trustworthy
  - Questionable
  - Misleading

- **Confidence Levels**: Rate your confidence in validation from 1-5
- **Contextual Notes**: Add reasoning and context to your validations

### Source Tracking

- **Historical Data**: Tracks sources over time with cumulative analysis
- **Creator Reputation**: Maintains historical records of content creators
- **Platform-Specific Metrics**: Different tracking for different platforms

## Database Schema

The platform uses Supabase with the following tables:

- `profiles`: User accounts with reputation scores
- `sources`: Content source tracking and trust metrics
- `content_submissions`: User-submitted content for analysis
- `trust_score_components`: Detailed breakdown of trust factors
- `bias_signals`: Detected bias indicators
- `community_validations`: User votes and validations
- `creator_history`: Historical creator credibility data

## User Experience

1. **Sign Up/Sign In**: Create an account to submit and validate content
2. **Submit Content**: Enter a URL or paste text for analysis
3. **View Trust Scores**: See comprehensive breakdowns with visual indicators
4. **Expand Details**: Click on any submission to view:
   - Trust score breakdown by component
   - Detected bias signals with severity
   - Community validation statistics
5. **Add Validation**: Contribute your assessment with confidence levels and notes

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Getting Started

1. The Supabase database is already configured
2. Sign up for an account
3. Start submitting content for analysis
4. Participate in community validation to build reputation

## Mission

To reduce misinformation and restore confidence in digital knowledge by providing transparent, community-driven trust verification for online content.
