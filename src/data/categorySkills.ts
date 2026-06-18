export const CATEGORY_SKILLS: Record<string, { label: string; skills: string[] }> = {
  development: {
    label: "Development",
    skills: ["React", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "GraphQL", "REST APIs", "PostgreSQL", "Docker", "Next.js", "Vue.js"],
  },
  "design-ux": {
    label: "Design & UX",
    skills: ["Figma", "Sketch", "UX Research", "Prototyping", "Design Systems", "Wireframing", "User Testing", "Visual Design"],
  },
  "qa-testing": {
    label: "QA & Testing",
    skills: ["Playwright", "Cypress", "Selenium", "Jest", "API Testing", "Performance Testing", "Manual Testing", "Test Automation"],
  },
  "devops-infra": {
    label: "DevOps & Infrastructure",
    skills: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Docker", "CI/CD", "Linux", "Prometheus", "Grafana"],
  },
  "data-analytics": {
    label: "Data & Analytics",
    skills: ["SQL", "Python", "R", "Tableau", "Power BI", "dbt", "Apache Spark", "Airflow", "Data Modeling", "Statistics"],
  },
  "ai-automation": {
    label: "AI & Automation",
    skills: ["Python", "LLM Ops", "Automation", "Data Pipelines", "Machine Learning", "Prompt Engineering"],
  },
};

export function calculateSkillMatch(requiredSkills: string[], consultantSkills: string[]) {
  if (requiredSkills.length === 0) return 0;
  const overlap = requiredSkills.filter((skill) =>
    consultantSkills.some((entry) => entry.toLowerCase() === skill.toLowerCase()),
  ).length;
  return Math.round((overlap / requiredSkills.length) * 100);
}
