/**
 * Type definitions for analytics JSON data
 */

export interface ScoreData {
  detail_distribution?: {
    high?: number;
    medium?: number;
    low?: number;
  };
  final_score?: number;
  scoring_logic?: string;
}

export interface OverviewData {
  summary?: string;
  main_topics?: string[];
  ideological_focus?: string;
}

export interface PatternsData {
  repetitions?: string[];
  tensions?: string[];
  consistent_themes?: string[];
}

export interface DetailLevelsData {
  alto?: string[];
  medio?: string[];
  bajo?: string[];
}

// DetailLevels can also be a record of topic -> level arrays
export type DetailLevelsByTopic = Record<string, string[]>;

