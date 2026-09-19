export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
}

export interface DatasetColumn {
  id: number;
  column_name: string;
  data_type: string;
  missing_count: number;
  unique_count: number;
  sample_values?: any[];
  semantic_role?: string | null;
}

export interface Dataset {
  id: number;
  name: string;
  file_type: string;
  row_count: number;
  column_count: number;
  is_demo: boolean;
  is_active: boolean;
  status: string;
  created_at: string;
  columns: DatasetColumn[];
}

export interface QualityMetricItem {
  label: string;
  value: any;
  unit?: string;
  is_available: boolean;
  notice?: string | null;
}

export interface DashboardSummary {
  is_demo: boolean;
  total_units: QualityMetricItem;
  inspected_units: QualityMetricItem;
  accepted_units: QualityMetricItem;
  defective_units: QualityMetricItem;
  defect_rate: QualityMetricItem;
  current_throughput: QualityMetricItem;
  wip: QualityMetricItem;
  bottleneck_station: QualityMetricItem;
  avg_cycle_time: QualityMetricItem;
  utilization: QualityMetricItem;
  downtime: QualityMetricItem;
  scrap_cost: QualityMetricItem;
  rework_cost: QualityMetricItem;
  downtime_loss: QualityMetricItem;
  production_loss: QualityMetricItem;
  revenue: QualityMetricItem;
  estimated_margin: QualityMetricItem;
  defect_distribution: { name: string; value: number; color: string }[];
  station_performance: { station: string; cycle_time: number; utilization: number; throughput: number }[];
  quality_trend: { hour: string; defect_rate: number; throughput: number }[];
  recent_inspections: any[];
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
  label: string;
}

export interface InspectionResult {
  id?: number;
  image_name: string;
  prediction: string;
  confidence: number;
  confidence_percentage: string;
  uncertainty_level: 'LOW' | 'MEDIUM' | 'HIGH';
  is_novel: boolean;
  novelty_warning?: string;
  bounding_boxes?: BoundingBox[];
  heatmap_available?: boolean;
  localization_supported: boolean;
  localization_message?: string;
  model_used: string;
  created_at?: string;
}

export interface BatchInspectionResponse {
  total_images: number;
  processed_count: number;
  acceptable_count: number;
  defective_count: number;
  uncertain_count: number;
  results: InspectionResult[];
}

export interface CorrelationItem {
  feature1: string;
  feature2: string;
  coefficient: number;
  p_value?: number;
  interpretation: string;
}

export interface RootCauseData {
  correlations: CorrelationItem[];
  station_defect_rates: { station: string; total_inspected: number; defective_units: number; defect_rate_pct: number }[];
  feature_importance: { feature: string; importance_score: number; category: string }[];
  key_findings: string[];
  evidence_notes: string[];
}

export interface StationMetrics {
  station: string;
  cycle_time: number;
  utilization_pct: number;
  wip: number;
  downtime_mins: number;
  throughput: number;
  is_bottleneck: boolean;
}

export interface BottleneckData {
  stations: StationMetrics[];
  primary_bottleneck: string;
  capacity_constraint_rank: string[];
  notes: string[];
}

export interface EconomicsData {
  scrap_cost?: number;
  rework_cost?: number;
  downtime_loss?: number;
  production_loss?: number;
  revenue?: number;
  estimated_margin?: number;
  estimated_profit?: number;
  is_data_available: boolean;
  unsupported_fields: string[];
  cost_breakdown: { category: string; amount: number; percentage: number }[];
}

export interface SimulationResult {
  target_station: string;
  baseline: Record<string, any>;
  simulated: Record<string, any>;
  delta: Record<string, any>;
  chart_data: any[];
  advisory_disclaimer: string;
}

export interface RecommendationCard {
  id: number;
  title: string;
  observation: string;
  evidence: string;
  potential_association: string;
  impact: string;
  suggested_action: string;
  simulation_result?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  limitations: string;
}

export interface ModelEntry {
  id: number;
  name: string;
  version: string;
  framework: string;
  model_type: 'classification' | 'detection' | 'segmentation';
  classes?: string[];
  input_dimensions: string;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
  metadata_json?: Record<string, any>;
}

export interface DataQualityReport {
  dataset_name: string;
  row_count: number;
  column_count: number;
  missing_values_total: number;
  duplicate_rows: number;
  invalid_records: number;
  images_available: number;
  labels_available: number;
  warnings: string[];
  column_issues: Record<string, string[]>;
}
