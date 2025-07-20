/**
 * Massachusetts Retirement System Topic Database
 * Curated topics for AI content generation
 */

import { MassachusettsRetirementTopic } from '@/types/ai-blog'

export const MASSACHUSETTS_RETIREMENT_TOPICS: MassachusettsRetirementTopic[] = [
  // Pension Planning Topics
  {
    id: 'pension-maximization-strategies',
    title: 'Maximizing Your Massachusetts Pension Benefits: A Complete Strategy Guide',
    description: 'Comprehensive strategies for Massachusetts public employees to maximize their pension benefits through career planning and retirement timing.',
    category: 'pension-planning',
    keywords: ['Massachusetts pension', 'benefit maximization', 'retirement planning', 'public employee benefits'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'intermediate',
    seasonal_relevance: ['January', 'December'],
    related_calculators: ['/calculator', '/timing-optimizer'],
    official_sources: ['mass.gov/retirement', 'MSRB guidelines']
  },
  {
    id: 'average-salary-calculation',
    title: 'Understanding Your Average Salary Calculation for Massachusetts Pension Benefits',
    description: 'How Massachusetts calculates your average salary for pension benefits, including the highest 3-year rule and strategies to maximize it.',
    category: 'pension-planning',
    keywords: ['average salary', 'Massachusetts pension calculation', 'highest 3 years', 'salary planning'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'beginner',
    related_calculators: ['/calculator', '/salary-optimizer'],
    official_sources: ['MSRB average salary rules']
  },
  {
    id: 'service-credit-maximization',
    title: 'Maximizing Service Credit in the Massachusetts Retirement System',
    description: 'How to earn and maximize service credit, including military service, sick leave, and other creditable service options.',
    category: 'pension-planning',
    keywords: ['service credit', 'Massachusetts retirement', 'military service credit', 'sick leave credit'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'intermediate',
    related_calculators: ['/calculator', '/service-credit-calculator'],
    official_sources: ['MSRB service credit guidelines']
  },

  // COLA Topics
  {
    id: 'cola-impact-analysis-2024',
    title: '2024 Massachusetts COLA Impact: How the 3% Adjustment Affects Your Retirement Income',
    description: 'Detailed analysis of the 2024 COLA adjustment and its impact on Massachusetts retirees at different benefit levels.',
    category: 'cola-adjustments',
    keywords: ['2024 COLA', 'Massachusetts cost of living', 'retirement income', '3% adjustment'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'beginner',
    seasonal_relevance: ['January', 'February'],
    related_calculators: ['/cola-calculator', '/calculator'],
    official_sources: ['MSRB COLA announcements']
  },
  {
    id: 'cola-compound-growth',
    title: 'The Power of Compound COLA Growth in Massachusetts Retirement Benefits',
    description: 'How the 3% COLA compounds over time and its long-term impact on retirement purchasing power.',
    category: 'cola-adjustments',
    keywords: ['COLA compound growth', 'Massachusetts retirement income', 'inflation protection', 'long-term benefits'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'intermediate',
    related_calculators: ['/cola-calculator', '/retirement-projector'],
    official_sources: ['MSRB COLA methodology']
  },
  {
    id: 'cola-vs-inflation',
    title: 'Massachusetts COLA vs. Inflation: How Well Protected Are Retirees?',
    description: 'Comparison of Massachusetts 3% COLA with actual inflation rates and purchasing power protection.',
    category: 'cola-adjustments',
    keywords: ['COLA vs inflation', 'Massachusetts retirement protection', 'purchasing power', 'inflation analysis'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'advanced',
    seasonal_relevance: ['December', 'January'],
    related_calculators: ['/cola-calculator', '/inflation-calculator'],
    official_sources: ['Bureau of Labor Statistics', 'MSRB COLA data']
  },

  // Group Classification Topics
  {
    id: 'group-1-retirement-guide',
    title: 'Complete Guide to Group 1 Retirement Benefits in Massachusetts',
    description: 'Comprehensive guide for Group 1 employees including teachers, clerks, and general government workers.',
    category: 'group-classifications',
    keywords: ['Group 1 retirement', 'Massachusetts teachers retirement', 'general employees', 'age 60 retirement'],
    target_groups: ['Group 1'],
    complexity_level: 'beginner',
    related_calculators: ['/calculator', '/group-1-calculator'],
    official_sources: ['MTRS guidelines', 'MSRB Group 1 rules']
  },
  {
    id: 'group-4-public-safety-benefits',
    title: 'Group 4 Public Safety Retirement: Police and Firefighter Benefits Guide',
    description: 'Specialized guide for Group 4 public safety employees including police officers, firefighters, and corrections officers.',
    category: 'group-classifications',
    keywords: ['Group 4 retirement', 'police retirement Massachusetts', 'firefighter benefits', 'public safety pension'],
    target_groups: ['Group 4'],
    complexity_level: 'intermediate',
    related_calculators: ['/calculator', '/group-4-calculator'],
    official_sources: ['MSRB Group 4 regulations', 'Public safety retirement laws']
  },
  {
    id: 'state-police-group-3-benefits',
    title: 'Massachusetts State Police Group 3 Retirement: 20-Year Career Benefits',
    description: 'Specialized guide for Massachusetts State Police officers and their unique Group 3 retirement benefits.',
    category: 'group-classifications',
    keywords: ['Group 3 retirement', 'Massachusetts State Police', '20 year retirement', 'state trooper benefits'],
    target_groups: ['Group 3'],
    complexity_level: 'intermediate',
    related_calculators: ['/calculator', '/group-3-calculator'],
    official_sources: ['Massachusetts State Police retirement regulations']
  },

  // Social Security Integration
  {
    id: 'wep-impact-massachusetts',
    title: 'Windfall Elimination Provision (WEP): Impact on Massachusetts Public Employees',
    description: 'How WEP affects Social Security benefits for Massachusetts public employees and strategies to minimize the impact.',
    category: 'social-security',
    keywords: ['WEP Massachusetts', 'Windfall Elimination Provision', 'Social Security reduction', 'public employee WEP'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'advanced',
    related_calculators: ['/social-security-calculator', '/wep-calculator'],
    official_sources: ['Social Security Administration WEP rules']
  },
  {
    id: 'gpo-spousal-benefits',
    title: 'Government Pension Offset (GPO): How It Affects Spousal Social Security Benefits',
    description: 'Understanding how Massachusetts pensions affect spousal and survivor Social Security benefits through GPO.',
    category: 'social-security',
    keywords: ['GPO Massachusetts', 'Government Pension Offset', 'spousal Social Security', 'survivor benefits'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'advanced',
    related_calculators: ['/social-security-calculator', '/gpo-calculator'],
    official_sources: ['Social Security Administration GPO rules']
  },
  {
    id: 'dual-benefit-optimization',
    title: 'Optimizing Combined Massachusetts Pension and Social Security Benefits',
    description: 'Strategies for maximizing total retirement income from both Massachusetts pension and Social Security benefits.',
    category: 'social-security',
    keywords: ['dual benefits optimization', 'Massachusetts pension Social Security', 'retirement income maximization'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'advanced',
    related_calculators: ['/calculator', '/social-security-calculator', '/dual-benefit-optimizer'],
    official_sources: ['MSRB coordination rules', 'SSA benefit coordination']
  },

  // Retirement Timing
  {
    id: 'optimal-retirement-age-analysis',
    title: 'Finding Your Optimal Retirement Age in the Massachusetts System',
    description: 'Analysis of financial factors to determine the best retirement age for Massachusetts public employees.',
    category: 'retirement-timing',
    keywords: ['optimal retirement age', 'Massachusetts retirement timing', 'benefit maximization', 'early retirement'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'intermediate',
    related_calculators: ['/calculator', '/timing-optimizer', '/early-retirement-calculator'],
    official_sources: ['MSRB retirement age guidelines']
  },
  {
    id: 'early-retirement-penalties',
    title: 'Understanding Early Retirement Penalties in Massachusetts',
    description: 'How early retirement penalties work and strategies to minimize their impact on your benefits.',
    category: 'retirement-timing',
    keywords: ['early retirement penalties', 'Massachusetts early retirement', 'benefit reductions', 'minimum retirement age'],
    target_groups: ['Group 1', 'Group 2', 'Group 4'],
    complexity_level: 'intermediate',
    related_calculators: ['/calculator', '/early-retirement-calculator'],
    official_sources: ['MSRB early retirement rules']
  },
  {
    id: 'working-after-retirement',
    title: 'Working After Retirement: Massachusetts Earnings Limitations and Rules',
    description: 'Rules and limitations for working after retirement in Massachusetts, including earnings limits and benefit impacts.',
    category: 'retirement-timing',
    keywords: ['working after retirement', 'Massachusetts earnings limits', 'post-retirement employment', 'benefit suspension'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'intermediate',
    related_calculators: ['/post-retirement-calculator'],
    official_sources: ['MSRB post-retirement employment rules']
  },

  // Benefit Calculations
  {
    id: 'pension-option-comparison',
    title: 'Massachusetts Pension Options A, B, and C: Complete Comparison Guide',
    description: 'Detailed comparison of pension options including survivor benefits, reductions, and decision factors.',
    category: 'benefit-calculations',
    keywords: ['pension options Massachusetts', 'Option A B C', 'survivor benefits', 'pension reduction'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'advanced',
    related_calculators: ['/calculator', '/option-calculator'],
    official_sources: ['MSRB pension option guidelines']
  },
  {
    id: 'benefit-multiplier-optimization',
    title: 'Maximizing Your Benefit Multiplier in the Massachusetts Retirement System',
    description: 'How benefit multipliers work for different groups and strategies to maximize your multiplier.',
    category: 'benefit-calculations',
    keywords: ['benefit multiplier', 'Massachusetts pension calculation', '2.5% multiplier', 'age-based increases'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'intermediate',
    related_calculators: ['/calculator', '/multiplier-calculator'],
    official_sources: ['MSRB benefit calculation formulas']
  },

  // Legislative Updates
  {
    id: 'recent-retirement-law-changes',
    title: '2024 Massachusetts Retirement Law Changes: What Public Employees Need to Know',
    description: 'Summary of recent changes to Massachusetts retirement laws and their impact on current and future retirees.',
    category: 'legislative-updates',
    keywords: ['Massachusetts retirement law changes', '2024 retirement updates', 'legislative changes', 'benefit modifications'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'intermediate',
    seasonal_relevance: ['January', 'July'],
    related_calculators: ['/calculator'],
    official_sources: ['Massachusetts Legislature', 'MSRB legislative updates']
  },

  // Financial Planning
  {
    id: 'retirement-income-planning',
    title: 'Comprehensive Retirement Income Planning for Massachusetts Public Employees',
    description: 'Holistic approach to retirement income planning including pensions, Social Security, and personal savings.',
    category: 'financial-planning',
    keywords: ['retirement income planning', 'Massachusetts retirement strategy', 'three-legged stool', 'comprehensive planning'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'advanced',
    related_calculators: ['/calculator', '/comprehensive-planner'],
    official_sources: ['Financial planning best practices']
  },
  {
    id: 'health-insurance-retirement',
    title: 'Health Insurance Options for Massachusetts Public Employee Retirees',
    description: 'Guide to health insurance options, costs, and strategies for Massachusetts public employee retirees.',
    category: 'financial-planning',
    keywords: ['retiree health insurance', 'Massachusetts GIC', 'Medicare coordination', 'health insurance costs'],
    target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
    complexity_level: 'intermediate',
    seasonal_relevance: ['October', 'November', 'December'],
    related_calculators: ['/health-insurance-calculator'],
    official_sources: ['Massachusetts GIC', 'Medicare.gov']
  }
]

/**
 * Get topics by category
 */
export function getTopicsByCategory(category: string): MassachusettsRetirementTopic[] {
  return MASSACHUSETTS_RETIREMENT_TOPICS.filter(topic => topic.category === category)
}

/**
 * Get topics by complexity level
 */
export function getTopicsByComplexity(level: 'beginner' | 'intermediate' | 'advanced'): MassachusettsRetirementTopic[] {
  return MASSACHUSETTS_RETIREMENT_TOPICS.filter(topic => topic.complexity_level === level)
}

/**
 * Get seasonal topics for current month
 */
export function getSeasonalTopics(month?: string): MassachusettsRetirementTopic[] {
  const currentMonth = month || new Date().toLocaleString('default', { month: 'long' })
  return MASSACHUSETTS_RETIREMENT_TOPICS.filter(topic => 
    topic.seasonal_relevance?.includes(currentMonth)
  )
}

/**
 * Get topics by target group
 */
export function getTopicsByGroup(group: 'Group 1' | 'Group 2' | 'Group 3' | 'Group 4'): MassachusettsRetirementTopic[] {
  return MASSACHUSETTS_RETIREMENT_TOPICS.filter(topic => 
    topic.target_groups.includes(group)
  )
}

/**
 * Get random topic for content generation
 */
export function getRandomTopic(filters?: {
  category?: string
  complexity?: 'beginner' | 'intermediate' | 'advanced'
  group?: 'Group 1' | 'Group 2' | 'Group 3' | 'Group 4'
}): MassachusettsRetirementTopic {
  let filteredTopics = MASSACHUSETTS_RETIREMENT_TOPICS

  if (filters?.category) {
    filteredTopics = filteredTopics.filter(topic => topic.category === filters.category)
  }
  
  if (filters?.complexity) {
    filteredTopics = filteredTopics.filter(topic => topic.complexity_level === filters.complexity)
  }
  
  if (filters?.group) {
    filteredTopics = filteredTopics.filter(topic => topic.target_groups.includes(filters.group!))
  }

  const randomIndex = Math.floor(Math.random() * filteredTopics.length)
  return filteredTopics[randomIndex] || MASSACHUSETTS_RETIREMENT_TOPICS[0]
}
