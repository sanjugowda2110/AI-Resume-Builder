import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { Plus, Trash2, FileText, User, Briefcase, GraduationCap, Code, Rocket, Link as LinkIcon, CheckCircle2, AlertCircle, Printer, Copy, Info, ChevronDown, ChevronRight, X, Sparkles, Github, ExternalLink, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Constants for guidance
// Constants for customization
const ACTION_VERBS = ['Built', 'Developed', 'Designed', 'Implemented', 'Led', 'Improved', 'Created', 'Optimized', 'Automated'];

const THEME_COLORS = [
  { name: 'Teal', hsl: 'hsl(168, 60%, 40%)' },
  { name: 'Navy', hsl: 'hsl(220, 60%, 35%)' },
  { name: 'Burgundy', hsl: 'hsl(345, 60%, 35%)' },
  { name: 'Forest', hsl: 'hsl(150, 50%, 30%)' },
  { name: 'Charcoal', hsl: 'hsl(0, 0%, 25%)' },
];

const TEMPLATES = [
  { id: 'Classic', name: 'Classic', description: 'Traditional & Professional' },
  { id: 'Modern', name: 'Modern', description: 'Contemporary & Bold' },
  { id: 'Minimal', name: 'Minimal', description: 'Clean & Spacious' },
];

const PROOF_STEPS = [
  { id: 1, name: 'Problem Recognition' },
  { id: 2, name: 'Market Opportunity' },
  { id: 3, name: 'Core Architecture' },
  { id: 4, name: 'High Level Design' },
  { id: 5, name: 'Low Level Design' },
  { id: 6, name: 'The Build Track' },
  { id: 7, name: 'The Test Lab' },
  { id: 8, name: 'The Ship Phase' },
];

const CHECKLIST_ITEMS = [
  'All form sections save to localStorage',
  'Live preview updates in real-time',
  'Template switching preserves data',
  'Color theme persists after refresh',
  'ATS score calculates correctly',
  'Score updates live on edit',
  'Export buttons work (copy/download)',
  'Empty states handled gracefully',
  'Mobile responsive layout works',
  'No console errors on any page',
];

const ATS_ACTION_VERBS = [
  'built',
  'led',
  'designed',
  'improved',
  'developed',
  'implemented',
  'created',
  'optimized',
  'managed',
  'launched',
  'delivered',
  'increased',
  'reduced',
];

const DEFAULT_RESUME_DATA = {
  personalInfo: { name: '', email: '', phone: '', location: '' },
  summary: '',
  education: [{ school: '', degree: '', year: '' }],
  experience: [{ company: '', role: '', period: '', description: '' }],
  projects: [{ name: '', description: '', techStack: [], liveUrl: '', githubUrl: '' }],
  skills: {
    technical: [],
    soft: [],
    tools: []
  },
  links: { github: '', linkedin: '' }
};

const normalizeResumeData = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_RESUME_DATA;
  }

  const parsed = { ...raw };

  if (typeof parsed.skills === 'string') {
    parsed.skills = {
      technical: parsed.skills.split(',').map(s => s.trim()).filter(Boolean),
      soft: [],
      tools: []
    };
  } else if (!parsed.skills) {
    parsed.skills = DEFAULT_RESUME_DATA.skills;
  }

  if (Array.isArray(parsed.projects)) {
    parsed.projects = parsed.projects.map(p => ({
      ...DEFAULT_RESUME_DATA.projects[0],
      ...p,
      techStack: p.techStack || (p.link ? [p.link] : [])
    }));
  }

  return {
    ...DEFAULT_RESUME_DATA,
    ...parsed,
    personalInfo: { ...DEFAULT_RESUME_DATA.personalInfo, ...(parsed.personalInfo || {}) },
    skills: { ...DEFAULT_RESUME_DATA.skills, ...(parsed.skills || {}) },
    links: { ...DEFAULT_RESUME_DATA.links, ...(parsed.links || {}) },
    education: Array.isArray(parsed.education) && parsed.education.length > 0 ? parsed.education : DEFAULT_RESUME_DATA.education,
    experience: Array.isArray(parsed.experience) && parsed.experience.length > 0 ? parsed.experience : DEFAULT_RESUME_DATA.experience,
    projects: Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects : DEFAULT_RESUME_DATA.projects,
  };
};

const handleBulletKeyDown = (e, section, field, idx, updateField) => {
  if (e.key === 'Enter') {
    const el = e.target;
    const val = el.value;
    const cursorPosition = el.selectionStart;
    const textBeforeCursor = val.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];

    if (currentLine.trim() === '•') {
      e.preventDefault();
      const newText = val.substring(0, cursorPosition - currentLine.length) + val.substring(cursorPosition);
      updateField(section, field, newText, idx);
      setTimeout(() => {
        el.selectionStart = cursorPosition - currentLine.length;
        el.selectionEnd = cursorPosition - currentLine.length;
      }, 0);
    } else {
      e.preventDefault();
      const insert = '\n• ';
      const newText = val.substring(0, cursorPosition) + insert + val.substring(cursorPosition);
      updateField(section, field, newText, idx);
      setTimeout(() => {
        el.selectionStart = cursorPosition + insert.length;
        el.selectionEnd = cursorPosition + insert.length;
      }, 0);
    }
  } else if (e.key === 'Backspace') {
    const el = e.target;
    const val = el.value;
    const cursorPosition = el.selectionStart;
    const textBeforeCursor = val.substring(0, cursorPosition);

    if (textBeforeCursor.endsWith('\n• ')) {
      e.preventDefault();
      const newText = val.substring(0, cursorPosition - 3) + val.substring(cursorPosition);
      updateField(section, field, newText, idx);
      setTimeout(() => {
        el.selectionStart = cursorPosition - 3;
        el.selectionEnd = cursorPosition - 3;
      }, 0);
    } else if (val === '• ') {
      e.preventDefault();
      updateField(section, field, '', idx);
    } else if (textBeforeCursor.endsWith('• ')) {
      const lines = textBeforeCursor.split('\n');
      if (lines[lines.length - 1] === '• ') {
        e.preventDefault();
        const newText = val.substring(0, cursorPosition - 2) + val.substring(cursorPosition);
        updateField(section, field, newText, idx);
        setTimeout(() => {
          el.selectionStart = cursorPosition - 2;
          el.selectionEnd = cursorPosition - 2;
        }, 0);
      }
    }
  }
};

const hasBulletPoints = (text = '') => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/^\s*[-*•]\s+\S+/m.test(trimmed)) return true;
  const nonEmptyLines = trimmed.split('\n').map(line => line.trim()).filter(Boolean);
  return nonEmptyLines.length >= 2;
};

const summaryHasActionVerb = (summary = '') => {
  return ATS_ACTION_VERBS.some((verb) => new RegExp(`\\b${verb}\\b`, 'i').test(summary));
};

const calculateATSScore = (inputData) => {
  const data = normalizeResumeData(inputData);
  let score = 0;
  const suggestions = [];

  if (data.personalInfo.name.trim()) score += 10;
  else suggestions.push('Add your full name (+10 points)');

  if (data.personalInfo.email.trim()) score += 10;
  else suggestions.push('Add your email address (+10 points)');

  if (data.summary.trim().length > 50) score += 10;
  else suggestions.push('Add a professional summary (+10 points)');

  const hasExperienceWithBullets = data.experience.some((exp) => exp.company.trim() && hasBulletPoints(exp.description || ''));
  if (hasExperienceWithBullets) score += 15;
  else suggestions.push('Add experience with bullet-style achievements (+15 points)');

  const hasEducation = data.education.some((edu) => edu.school.trim());
  if (hasEducation) score += 10;
  else suggestions.push('Add at least one education entry (+10 points)');

  const allSkills = [...data.skills.technical, ...data.skills.soft, ...data.skills.tools].filter(Boolean);
  if (allSkills.length >= 5) score += 10;
  else suggestions.push('Add at least five skills (+10 points)');

  const hasProject = data.projects.some((project) => project.name.trim());
  if (hasProject) score += 10;
  else suggestions.push('Add at least one project (+10 points)');

  if (data.personalInfo.phone.trim()) score += 5;
  else suggestions.push('Add your phone number (+5 points)');

  if (data.links.linkedin.trim()) score += 5;
  else suggestions.push('Add your LinkedIn profile (+5 points)');

  if (data.links.github.trim()) score += 5;
  else suggestions.push('Add your GitHub profile (+5 points)');

  if (summaryHasActionVerb(data.summary)) score += 10;
  else suggestions.push('Use action verbs in your summary (+10 points)');

  return { score: Math.min(100, score), suggestions };
};

const getScoreStatus = (score) => {
  if (score <= 40) return { label: 'Needs Work', color: '#dc2626', bgClass: 'bg-red-50', textClass: 'text-red-700' };
  if (score <= 70) return { label: 'Getting There', color: '#d97706', bgClass: 'bg-amber-50', textClass: 'text-amber-700' };
  return { label: 'Strong Resume', color: '#16a34a', bgClass: 'bg-green-50', textClass: 'text-green-700' };
};

const ATSScoreCard = ({ score, suggestions }) => {
  const status = getScoreStatus(score);
  const radius = 56;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
            <circle
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              stroke="#e5e7eb"
              strokeWidth={stroke}
              fill="transparent"
            />
            <circle
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              stroke={status.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 300ms ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold font-serif">{score}</div>
            <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">ATS Score</div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-bold', status.bgClass, status.textClass)}>
            {status.label}
          </div>
          <p className="text-sm text-neutral-600">
            Score updates automatically as resume data changes.
          </p>
          {suggestions.length > 0 && (
            <div className="space-y-2 pt-1">
              {suggestions.map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Template Thumbnail Component
const TemplateThumbnail = ({ id, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "relative w-[120px] aspect-[1/1.4] rounded-lg border-2 transition-all p-1.5 bg-neutral-50 overflow-hidden group shrink-0",
      active ? "border-accent ring-2 ring-accent/10" : "border-neutral-200 hover:border-neutral-300"
    )}
  >
    <div className="w-full h-full bg-white rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-2 flex flex-col gap-1 pointer-events-none">
      {id === 'Classic' && (
        <>
          <div className="w-2/3 h-1.5 bg-neutral-200 mx-auto" />
          <div className="w-full h-px bg-neutral-100 my-1" />
          <div className="space-y-1">
            <div className="w-full h-1 bg-neutral-100" />
            <div className="w-full h-1 bg-neutral-100" />
            <div className="w-3/4 h-1 bg-neutral-100" />
          </div>
          <div className="w-full h-px bg-neutral-100 my-1" />
          <div className="space-y-1">
            <div className="w-full h-1 bg-neutral-100" />
            <div className="w-2/3 h-1 bg-neutral-100" />
          </div>
        </>
      )}
      {id === 'Modern' && (
        <div className="flex h-full gap-1.5">
          <div className="w-1/3 h-full bg-neutral-100 rounded-sm" />
          <div className="flex-1 space-y-1.5">
            <div className="w-3/4 h-1.5 bg-neutral-200" />
            <div className="w-full h-1 bg-neutral-100" />
            <div className="w-full h-1 bg-neutral-100" />
            <div className="w-1/3 h-1 bg-neutral-100" />
          </div>
        </div>
      )}
      {id === 'Minimal' && (
        <div className="space-y-2 pt-2">
          <div className="w-1/2 h-2 bg-neutral-200" />
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-neutral-50" />
            <div className="w-full h-1.5 bg-neutral-50" />
            <div className="w-5/6 h-1.5 bg-neutral-50" />
          </div>
        </div>
      )}
    </div>
    {active && (
      <div className="absolute top-1 right-1 bg-accent rounded-full p-0.5 shadow-md">
        <CheckCircle2 className="w-3 h-3 text-white" />
      </div>
    )}
    <span className="absolute bottom-1 left-0 right-0 text-[8px] font-bold uppercase tracking-tighter text-neutral-500 bg-white/80 backdrop-blur-sm py-0.5">
      {id}
    </span>
  </button>
);

// Color Picker Component
const ColorPicker = ({ activeColor, onColorSelect }) => (
  <div className="flex items-center gap-2">
    {THEME_COLORS.map(color => (
      <button
        key={color.hsl}
        onClick={() => onColorSelect(color.hsl)}
        className={cn(
          "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
          activeColor === color.hsl ? "border-neutral-800 scale-110 shadow-sm" : "border-transparent"
        )}
        style={{ backgroundColor: color.hsl }}
        title={color.name}
      />
    ))}
  </div>
);

// Main Resume Document Component
const ResumeDocument = ({ data, template, themeColor }) => {
  const renderDescription = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const result = [];
    let currentBullets = [];

    lines.forEach((line, i) => {
      if (line.trim().startsWith('•')) {
        currentBullets.push(<li key={`b-${i}`} className="ml-4 list-disc">{line.replace(/^[•\s]+/, '')}</li>);
      } else {
        if (currentBullets.length > 0) {
          result.push(<ul key={`ul-${i}`} className="mb-1">{currentBullets}</ul>);
          currentBullets = [];
        }
        if (line.trim()) {
          result.push(<span key={`t-${i}`} className="block mb-1">{line}</span>);
        }
      }
    });
    if (currentBullets.length > 0) {
      result.push(<ul key={`ul-last`} className="mb-1 mb-0 pb-0">{currentBullets}</ul>);
    }
    return result;
  };
  return (
    <div id="resume-preview" className={cn(
      "bg-white shadow-2xl transition-all duration-300 overflow-hidden print:overflow-visible print:shadow-none print:transform-none print:transition-none",
      template === 'Classic' ? "font-serif" : "font-sans",
      template === 'Minimal' && "shadow-none border border-neutral-100 print:border-none"
    )} style={{ '--accent': themeColor }}>
      {/* Conditional Layout Rendering */}
      {template === 'Modern' ? (
        <div className="grid grid-cols-[35%_65%] h-full min-h-[297mm]">
          {/* Sidebar */}
          <div className="p-8 space-y-8 text-white h-full" style={{ backgroundColor: themeColor }}>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold uppercase tracking-widest leading-none mb-6">
                {data.personalInfo.name || 'YOUR NAME'}
              </h1>
              <div className="space-y-3 text-white/90 text-[9pt] font-medium break-words">
                {data.personalInfo.location && <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 shrink-0" /> {data.personalInfo.location}</div>}
                {data.personalInfo.phone && <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 shrink-0" /> {data.personalInfo.phone}</div>}
                {data.personalInfo.email && <div className="flex items-center gap-2"><Info className="w-3.5 h-3.5 shrink-0" /> {data.personalInfo.email}</div>}
              </div>
            </div>

            {(data.skills.technical.length > 0 || data.skills.soft.length > 0 || data.skills.tools.length > 0) && (
              <div className="pt-8 border-t border-white/20">
                <h2 className="text-[10pt] font-bold uppercase tracking-widest mb-6">Expertise</h2>
                <div className="space-y-6">
                  {data.skills.technical.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[8pt] font-bold uppercase tracking-widest text-white/70">Technical</span>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.technical.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-white/10 rounded font-bold text-[7pt] uppercase tracking-wider">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.skills.soft.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[8pt] font-bold uppercase tracking-widest text-white/70">Soft Skills</span>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.soft.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-white/10 rounded font-bold text-[7pt] uppercase tracking-wider">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-white/20">
              <h2 className="text-[10pt] font-bold uppercase tracking-widest mb-4">Connections</h2>
              <div className="space-y-2 text-[8.5pt]">
                {data.links.github && <div className="text-white/90">{data.links.github.replace(/https?:\/\//, '')}</div>}
                {data.links.linkedin && <div className="text-white/90">{data.links.linkedin.replace(/https?:\/\//, '')}</div>}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-10 space-y-10 bg-white">
            {data.summary.trim() && (
              <div>
                <h2 className="text-[11pt] font-bold uppercase tracking-wider mb-3 pb-1 border-b-2" style={{ borderBottomColor: themeColor }}>Summary</h2>
                <p className="text-neutral-800 leading-relaxed text-justify text-[9.5pt]">{data.summary}</p>
              </div>
            )}

            {data.experience.some(e => e.company.trim()) && (
              <div>
                <h2 className="text-[11pt] font-bold uppercase tracking-wider mb-4 pb-1 border-b-2" style={{ borderBottomColor: themeColor }}>Experience</h2>
                <div className="space-y-6">
                  {data.experience.filter(e => e.company.trim()).map((exp, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-[10.5pt]" style={{ color: themeColor }}>{exp.role || 'Title'}</h3>
                        <span className="text-[9pt] font-medium italic text-neutral-500">{exp.period}</span>
                      </div>
                      <div className="text-[10pt] font-bold mb-1.5">{exp.company}</div>
                      <div className="text-neutral-800 leading-relaxed text-[9.5pt]">{renderDescription(exp.description)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.projects.some(p => p.name.trim()) && (
              <div>
                <h2 className="text-[11pt] font-bold uppercase tracking-wider mb-4 pb-1 border-b-2" style={{ borderBottomColor: themeColor }}>Selected Projects</h2>
                <div className="space-y-6">
                  {data.projects.filter(p => p.name.trim()).map((proj, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-bold text-[10.5pt]" style={{ color: themeColor }}>{proj.name}</h3>
                        <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                          {(proj.techStack || []).map((tech, j) => (
                            <span key={j} className="text-[7pt] font-bold px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded uppercase tracking-tighter">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-800 leading-relaxed text-[9.5pt] text-justify">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.education.some(e => e.school.trim()) && (
              <div>
                <h2 className="text-[11pt] font-bold uppercase tracking-wider mb-4 pb-1 border-b-2" style={{ borderBottomColor: themeColor }}>Education</h2>
                <div className="space-y-4">
                  {data.education.filter(e => e.school.trim()).map((edu, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div><h3 className="font-bold text-[10.5pt]">{edu.school}</h3><div className="text-neutral-700 text-[9.5pt] font-medium">{edu.degree}</div></div>
                      <span className="text-[9pt] font-bold text-neutral-500 italic shrink-0">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={cn(
          "px-8 py-8 md:px-12 md:py-10 print:py-[15mm] print:px-[20mm] space-y-8",
          template === 'Minimal' ? "max-w-[160mm] mx-auto print:max-w-none print:px-[30mm]" : ""
        )}>
          {/* Header for Classic & Minimal */}
          <div className={cn("pb-6 mb-2", template === 'Classic' ? "border-b-2 border-black text-center" : "text-left")}>
            <h1 className={cn("font-bold uppercase tracking-widest mb-3", template === 'Classic' ? "text-4xl" : "text-5xl")} style={{ color: template === 'Classic' ? 'black' : themeColor }}>
              {data.personalInfo.name || 'YOUR NAME'}
            </h1>
            <div className={cn("flex flex-wrap gap-x-3 gap-y-1 text-neutral-600 text-[9pt] font-medium", template === 'Classic' && "justify-center")}>
              {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
              {data.personalInfo.location && (data.personalInfo.phone || data.personalInfo.email) && <span className="text-neutral-300">•</span>}
              {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
              {data.personalInfo.phone && data.personalInfo.email && <span className="text-neutral-300">•</span>}
              {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            </div>
          </div>

          {data.summary.trim() && (
            <div className="break-inside-avoid">
              <h2 className={cn("text-[11pt] font-bold uppercase tracking-wider pb-1 mb-3", template === 'Classic' ? "border-b border-neutral-300" : "")} style={{ color: template === 'Minimal' ? themeColor : 'inherit' }}>
                Professional Summary
              </h2>
              <p className="text-neutral-800 leading-relaxed text-justify text-[9.5pt]">{data.summary}</p>
            </div>
          )}

          {data.experience.some(e => e.company.trim()) && (
            <div className="break-inside-avoid">
              <h2 className={cn("text-[11pt] font-bold uppercase tracking-wider pb-1 mb-4", template === 'Classic' ? "border-b border-neutral-300" : "")} style={{ color: template === 'Minimal' ? themeColor : 'inherit' }}>
                Experience
              </h2>
              <div className="space-y-6">
                {data.experience.filter(e => e.company.trim()).map((exp, i) => (
                  <div key={i} className="break-inside-avoid mb-4 last:mb-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[10.5pt]">{exp.role || 'Title'}</h3>
                      <span className="text-[9pt] font-medium italic text-neutral-500">{exp.period}</span>
                    </div>
                    <div className="text-[10pt] font-bold mb-1.5" style={{ color: template === 'Classic' ? themeColor : 'inherit' }}>{exp.company}</div>
                    <div className="text-neutral-800 leading-relaxed text-[9.5pt]">{renderDescription(exp.description)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.projects.some(p => p.name.trim()) && (
            <div className="break-inside-avoid">
              <h2 className={cn("text-[11pt] font-bold uppercase tracking-wider pb-1 mb-4", template === 'Classic' ? "border-b border-neutral-300" : "")} style={{ color: template === 'Minimal' ? themeColor : 'inherit' }}>
                Projects
              </h2>
              <div className="space-y-5">
                {data.projects.filter(p => p.name.trim()).map((proj, i) => (
                  <div key={i} className="break-inside-avoid mb-4 last:mb-0">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-bold text-[10.5pt]">{proj.name}</h3>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                        {(proj.techStack || []).map((tech, j) => (
                          <span key={j} className="text-[7pt] font-bold px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded uppercase tracking-tighter">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-neutral-800 leading-relaxed text-[9.5pt] text-justify">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(data.skills.technical.length > 0 || data.skills.soft.length > 0 || data.skills.tools.length > 0) && (
            <div className="break-inside-avoid">
              <h2 className={cn("text-[11pt] font-bold uppercase tracking-wider pb-1 mb-4", template === 'Classic' ? "border-b border-neutral-300" : "")} style={{ color: template === 'Minimal' ? themeColor : 'inherit' }}>
                Skills & Expertise
              </h2>
              <div className="space-y-4">
                {data.skills.technical.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-neutral-800 text-[9pt]">
                    <span className="font-bold text-neutral-900 shrink-0">Technical:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.technical.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md font-bold text-[7pt] uppercase tracking-wider border border-neutral-200">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.soft.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-neutral-800 text-[9pt]">
                    <span className="font-bold text-neutral-900 shrink-0">Soft Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.soft.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md font-bold text-[7pt] uppercase tracking-wider border border-neutral-200">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {data.education.some(e => e.school.trim()) && (
            <div className="break-inside-avoid">
              <h2 className={cn("text-[11pt] font-bold uppercase tracking-wider pb-1 mb-4", template === 'Classic' ? "border-b border-neutral-300" : "")} style={{ color: template === 'Minimal' ? themeColor : 'inherit' }}>
                Education
              </h2>
              <div className="space-y-4">
                {data.education.filter(e => e.school.trim()).map((edu, i) => (
                  <div key={i} className="flex justify-between items-start break-inside-avoid">
                    <div><h3 className="font-bold text-[10.5pt]">{edu.school}</h3><div className="text-neutral-700 text-[9.5pt] font-medium">{edu.degree}</div></div>
                    <span className="text-[9pt] font-bold text-neutral-500 italic shrink-0">{edu.year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Inline Bullet Guidance Component
const BulletGuidance = ({ text }) => {
  if (!text.trim()) return null;
  const firstWord = text.trim().split(' ')[0].replace(/[.,/#!$%^&*;:{}=_`~()-]/g, "");
  const startsWithVerb = ACTION_VERBS.some(v => v.toLowerCase() === firstWord.toLowerCase());
  const hasNumber = /[\d]+[%kX]/.test(text) || /\d+/.test(text);

  if (startsWithVerb && hasNumber) return null;

  return (
    <div className="mt-2 space-y-1">
      {!startsWithVerb && (
        <div className="flex items-center gap-1.5 text-[8pt] font-semibold text-amber-600">
          <AlertCircle className="w-3 h-3" /> Start with a strong action verb (e.g. Led, Built, Optimized).
        </div>
      )}
      {!hasNumber && (
        <div className="flex items-center gap-1.5 text-[8pt] font-semibold text-amber-600">
          <AlertCircle className="w-3 h-3" /> Add measurable impact (numbers, %, metrics).
        </div>
      )}
    </div>
  );
};

// Layout Component
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 z-50 no-print">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-lg">R</div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">AI Resume Builder</span>
        </Link>
        <nav className="flex items-center gap-8">
          <NavLink to="/builder" className={({ isActive }) => cn("text-sm font-medium transition-colors", isActive ? "text-accent border-b-2 border-accent pb-5 -mb-5" : "text-neutral-500 hover:text-neutral-900")}>Builder</NavLink>
          <NavLink to="/preview" className={({ isActive }) => cn("text-sm font-medium transition-colors", isActive ? "text-accent border-b-2 border-accent pb-5 -mb-5" : "text-neutral-500 hover:text-neutral-900")}>Preview</NavLink>
          <NavLink to="/proof" className={({ isActive }) => cn("text-sm font-medium transition-colors", isActive ? "text-accent border-b-2 border-accent pb-5 -mb-5" : "text-neutral-500 hover:text-neutral-900")}>Proof</NavLink>
        </nav>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

// Accordion Component
const Accordion = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            isOpen ? "bg-accent/10 text-accent" : "bg-neutral-100 text-neutral-400 group-hover:bg-neutral-200"
          )}>
            {React.createElement(icon, { className: 'w-4 h-4' })}
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-800">
            {title}
          </h3>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
      </button>
      {isOpen && (
        <div className="pb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

// Tag Input Component
const TagInput = ({ tags = [], onAdd, onRemove, placeholder = "Type and press Enter..." }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onAdd(input.trim());
      }
      setInput('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-full border border-neutral-200 group transition-all hover:bg-neutral-200">
            {tag}
            <button
              onClick={() => onRemove(tag)}
              className="hover:text-accent transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        className="input-field text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
};


// Project Item Component
const ProjectItem = ({ proj, idx, isLast, updateField, removeEntry }) => {
  const [isProjectOpen, setIsProjectOpen] = useState(isLast);
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50">
      <button
        onClick={() => setIsProjectOpen(!isProjectOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-neutral-50 transition-colors"
      >
        <span className="font-bold text-sm text-neutral-800">{proj.name || `New Project ${idx + 1}`}</span>
        <div className="flex items-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); removeEntry('projects', idx); }} className="text-neutral-400 hover:text-accent transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          {isProjectOpen ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
        </div>
      </button>
      {isProjectOpen && (
        <div className="p-5 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-4">
            <div className="form-field">
              <label className="input-label">Project Title</label>
              <input className="input-field bg-white text-sm" value={proj.name} onChange={e => updateField('projects', 'name', e.target.value, idx)} placeholder="e.g. AI Resume Builder" />
            </div>

            <div className="form-field">
              <div className="flex justify-between items-center mb-2">
                <label className="input-label mb-0">Description</label>
                <span className={cn("text-[10px] font-bold", (proj.description || "").length > 200 ? "text-accent" : "text-neutral-400")}>
                  {(proj.description || "").length}/200
                </span>
              </div>
              <textarea
                className="input-field bg-white h-24 resize-none text-sm"
                value={proj.description || ""}
                maxLength={200}
                onChange={e => updateField('projects', 'description', e.target.value.slice(0, 200), idx)}
                placeholder="Describe your project and its impact..."
              />
              <BulletGuidance text={proj.description || ""} />
            </div>

            <div className="form-field">
              <label className="input-label">Tech Stack</label>
              <TagInput
                tags={proj.techStack || []}
                onAdd={(tag) => {
                  const newStack = [...(proj.techStack || []), tag];
                  updateField('projects', 'techStack', newStack, idx);
                }}
                onRemove={(tag) => {
                  const newStack = (proj.techStack || []).filter(t => t !== tag);
                  updateField('projects', 'techStack', newStack, idx);
                }}
                placeholder="Add technology (e.g. React, Node.js)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-field">
                <label className="input-label">Live URL</label>
                <input className="input-field bg-white text-sm" value={proj.liveUrl || ''} onChange={e => updateField('projects', 'liveUrl', e.target.value, idx)} placeholder="https://..." />
              </div>
              <div className="form-field">
                <label className="input-label">GitHub URL</label>
                <input className="input-field bg-white text-sm" value={proj.githubUrl || ''} onChange={e => updateField('projects', 'githubUrl', e.target.value, idx)} placeholder="https://github.com/..." />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Home Page
const Home = () => {
  return (
    <div className="max-w-4xl mx-auto px-8 py-24 text-center">
      <h1 className="text-7xl font-bold mb-6 leading-tight">Build a Resume That <br /><span className="text-accent underline decoration-red-200">Gets Read.</span></h1>
      <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto">AI-powered optimization, premium minimalist layouts, and ATS-friendly exports. The most efficient way to build your career document.</p>
      <Link to="/builder" className="btn-primary inline-flex items-center gap-2 text-lg px-8">
        Start Building <Rocket className="w-5 h-5" />
      </Link>
    </div>
  );
};

// Builder Page
const Builder = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('resumeBuilderData');
    if (!saved) return DEFAULT_RESUME_DATA;
    try {
      return normalizeResumeData(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to parse saved data", e);
      return DEFAULT_RESUME_DATA;
    }
  });

  const [template, setTemplate] = useState(() => {
    return localStorage.getItem('resumeTemplate') || 'Modern';
  });

  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('resumeThemeColor') || 'hsl(168, 60%, 40%)';
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setIsGenerating(false);
  }, [data, template]);


  useEffect(() => {
    localStorage.setItem('resumeBuilderData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('resumeTemplate', template);
  }, [template]);

  useEffect(() => {
    localStorage.setItem('resumeThemeColor', themeColor);
  }, [themeColor]);

  const atsResult = useMemo(() => calculateATSScore(data), [data]);
  const scoreStatus = useMemo(() => getScoreStatus(atsResult.score), [atsResult.score]);

  const loadSample = () => {
    setData({
      personalInfo: { name: 'Alex Johnson', email: 'alex.j@example.com', phone: '+91 98765 43210', location: 'Bengaluru, India' },
      summary: 'Passionate Full Stack Developer with 3+ years of experience in building scalable web applications. Expert in React, Node.js, and cloud architecture. Successfully optimized database queries resulting in a 40% reduction in latency.',
      education: [{ school: 'IIT Bombay', degree: 'B.Tech in Computer Science', year: '2021' }],
      experience: [{ company: 'TechCorp Solutions', role: 'Senior Developer', period: '2021 - Present', description: 'Led a team of 5 to develop a cloud-native ERP system. Improved deployment speed by 25% using Docker and CI/CD pipelines.' }],
      projects: [
        { name: 'AI Resume Builder', description: 'Real-time resume generator with ATS optimization scoring. Reached 100+ stars on GitHub.', techStack: ['React', 'Vite', 'Tailwind CSS', 'Lucide React'], liveUrl: 'https://resume-ai.demo', githubUrl: 'https://github.com/alex/rb' },
        { name: 'E-commerce API', description: 'Scalable backend handling 10k requests/min. Implemented advanced caching strategies.', techStack: ['Node.js', 'Redis', 'PostgreSQL'], liveUrl: '', githubUrl: 'https://github.com/alex/api' }
      ],
      skills: {
        technical: ["TypeScript", "React", "Node.js", "PostgreSQL", "GraphQL"],
        soft: ["Team Leadership", "Problem Solving", "Communication"],
        tools: ["Git", "Docker", "AWS", "Figma"]
      },
      links: { github: 'https://github.com/alexj', linkedin: 'https://linkedin.com/in/alexj' }
    });
  };

  const updateField = (section, field, value, index = null) => {
    setData(prev => {
      if (index !== null) {
        const newList = [...prev[section]];
        newList[index] = { ...newList[index], [field]: value };
        return { ...prev, [section]: newList };
      }
      if (typeof prev[section] === 'object' && !Array.isArray(prev[section])) {
        return { ...prev, [section]: { ...prev[section], [field]: value } };
      }
      return { ...prev, [section]: value };
    });
  };

  const addEntry = (section) => {
    setData(prev => ({
      ...prev,
      [section]: [...prev[section],
      section === 'education' ? { school: '', degree: '', year: '' } :
        section === 'experience' ? { company: '', role: '', period: '', description: '' } :
          { name: '', description: '', techStack: [], liveUrl: '', githubUrl: '' }
      ]
    }));
  };

  const [isSuggesting, setIsSuggesting] = useState(false);

  const suggestSkills = () => {
    setIsSuggesting(true);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        skills: {
          technical: Array.from(new Set([...prev.skills.technical, "TypeScript", "React", "Node.js", "PostgreSQL", "GraphQL"])),
          soft: Array.from(new Set([...prev.skills.soft, "Team Leadership", "Problem Solving"])),
          tools: Array.from(new Set([...prev.skills.tools, "Git", "Docker", "AWS"]))
        }
      }));
      setIsSuggesting(false);
    }, 1000);
  };

  const updateSkill = (category, action, value) => {
    setData(prev => {
      const current = prev.skills[category];
      let updated;
      if (action === 'add') {
        updated = [...current, value];
      } else {
        updated = current.filter(s => s !== value);
      }
      return {
        ...prev,
        skills: { ...prev.skills, [category]: updated }
      };
    });
  };

  const removeEntry = (section, index) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handlePrint = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (isGenerating) return;
    setIsGenerating(true);

    try {
      document.body.classList.add("printing");
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.body.classList.remove("printing");
          setIsGenerating(false);
        }, 500);
      }, 100);
    } catch (error) {
      console.error("PDF Generation Failed", error);
      document.body.classList.remove("printing");
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-neutral-50 print:h-auto print:overflow-visible print:bg-white">
      {/* Sidebar (45%) */}
      <div className="w-full lg:w-[45%] border-r border-neutral-200 overflow-y-auto px-4 md:px-8 py-8 md:py-10 bg-white no-print">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-serif">Resume Editor</h2>
          <button onClick={loadSample} className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
            Load Sample Data
          </button>
        </div>

        {/* Template Tabs and Score */}
        <div className="mb-10 space-y-6">
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            {['Classic', 'Modern', 'Minimal'].map(t => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                  template === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">ATS Readiness Score</span>
              <span className={cn("text-2xl font-bold font-serif", scoreStatus.textClass)}>
                {atsResult.score}/100
              </span>
            </div>
            <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden mb-6">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${atsResult.score}%`, backgroundColor: scoreStatus.color }}
              />
            </div>
            {atsResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10pt] font-bold text-neutral-400">Improvement Suggestions:</span>
                {atsResult.suggestions.slice(0, 3).map((imp, i) => (
                  <div key={i} className="flex items-start gap-2 text-[9pt] font-medium text-neutral-600 leading-tight">
                    <AlertCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    {imp}
                  </div>
                ))}
              </div>
            )}
            {atsResult.score === 100 && (
              <div className="flex items-start gap-2 text-[9pt] font-medium text-green-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                Perfect! Highly optimized for ATS.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-12 pb-24">
          <div className="pb-24">
            <Accordion title="Personal" icon={User} defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-field"><label className="input-label">Full Name</label><input className="input-field" value={data.personalInfo.name} onChange={e => updateField('personalInfo', 'name', e.target.value)} placeholder="Alex Johnson" /></div>
                <div className="form-field"><label className="input-label">Email</label><input className="input-field" value={data.personalInfo.email} onChange={e => updateField('personalInfo', 'email', e.target.value)} placeholder="alex.j@example.com" /></div>
                <div className="form-field"><label className="input-label">Phone</label><input className="input-field" value={data.personalInfo.phone} onChange={e => updateField('personalInfo', 'phone', e.target.value)} placeholder="+91 98765 43210" /></div>
                <div className="form-field"><label className="input-label">Location</label><input className="input-field" value={data.personalInfo.location} onChange={e => updateField('personalInfo', 'location', e.target.value)} placeholder="Bengaluru, India" /></div>
              </div>
            </Accordion>

            <Accordion title="Summary" icon={FileText}>
              <textarea className="input-field h-32 resize-none py-3" value={data.summary} onChange={e => updateField('summary', null, e.target.value)} placeholder="Highlight achievements..." />
            </Accordion>

            <Accordion title="Experience" icon={Briefcase}>
              <div className="space-y-6">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-4 relative group">
                    <button onClick={() => removeEntry('experience', idx)} className="absolute top-4 right-4 text-neutral-400 hover:text-accent transition-colors"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input className="input-field bg-white text-sm" value={exp.company} onChange={e => updateField('experience', 'company', e.target.value, idx)} placeholder="Company" />
                      <input className="input-field bg-white text-sm" value={exp.role} onChange={e => updateField('experience', 'role', e.target.value, idx)} placeholder="Role" />
                    </div>
                    <input className="input-field bg-white text-sm" value={exp.period} onChange={e => updateField('experience', 'period', e.target.value, idx)} placeholder="Period (e.g. Jan 2021 - Present)" />
                    <textarea className="input-field bg-white h-24 resize-none text-sm" value={exp.description} onChange={e => updateField('experience', 'description', e.target.value, idx)} onKeyDown={e => handleBulletKeyDown(e, 'experience', 'description', idx, updateField)} placeholder="Describe measurable impact..." />
                    <BulletGuidance text={exp.description} />
                  </div>
                ))}
                <button onClick={() => addEntry('experience')} className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 font-bold text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>
            </Accordion>

            <Accordion title="Education" icon={GraduationCap}>
              <div className="space-y-6">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-4 relative group">
                    <button onClick={() => removeEntry('education', idx)} className="absolute top-4 right-4 text-neutral-400 hover:text-accent transition-colors"><Trash2 className="w-4 h-4" /></button>
                    <input className="input-field bg-white text-sm" value={edu.school} onChange={e => updateField('education', 'school', e.target.value, idx)} placeholder="University" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input className="input-field bg-white text-sm" value={edu.degree} onChange={e => updateField('education', 'degree', e.target.value, idx)} placeholder="Degree" />
                      <input className="input-field bg-white text-sm" value={edu.year} onChange={e => updateField('education', 'year', e.target.value, idx)} placeholder="Year" />
                    </div>
                  </div>
                ))}
                <button onClick={() => addEntry('education')} className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 font-bold text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
            </Accordion>

            <Accordion title="Projects" icon={Rocket}>
              <div className="space-y-6">
                {data.projects.map((proj, idx) => (
                  <ProjectItem
                    key={idx}
                    proj={proj}
                    idx={idx}
                    isLast={idx === data.projects.length - 1}
                    updateField={updateField}
                    removeEntry={removeEntry}
                  />
                ))}

                <button onClick={() => addEntry('projects')} className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 font-bold text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>
            </Accordion>

            <Accordion title="Skills" icon={Code}>
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Skill Sets</span>
                  <button
                    onClick={suggestSkills}
                    disabled={isSuggesting}
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent/5 text-accent rounded-lg text-xs font-bold hover:bg-accent/10 transition-all disabled:opacity-50"
                  >
                    {isSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Suggest Skills
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="form-field">
                    <label className="input-label">Technical Skills {data.skills.technical.length > 0 && `(${data.skills.technical.length})`}</label>
                    <TagInput
                      tags={data.skills.technical}
                      onAdd={(val) => updateSkill('technical', 'add', val)}
                      onRemove={(val) => updateSkill('technical', 'delete', val)}
                      placeholder="e.g. TypeScript, React, Docker"
                    />
                  </div>

                  <div className="form-field">
                    <label className="input-label">Soft Skills {data.skills.soft.length > 0 && `(${data.skills.soft.length})`}</label>
                    <TagInput
                      tags={data.skills.soft}
                      onAdd={(val) => updateSkill('soft', 'add', val)}
                      onRemove={(val) => updateSkill('soft', 'delete', val)}
                      placeholder="e.g. Leadership, Problem Solving"
                    />
                  </div>

                  <div className="form-field">
                    <label className="input-label">Tools & Technologies {data.skills.tools.length > 0 && `(${data.skills.tools.length})`}</label>
                    <TagInput
                      tags={data.skills.tools}
                      onAdd={(val) => updateSkill('tools', 'add', val)}
                      onRemove={(val) => updateSkill('tools', 'delete', val)}
                      placeholder="e.g. Git, Figma, AWS"
                    />
                  </div>
                </div>
              </div>
            </Accordion>

            <Accordion title="Social Proof" icon={LinkIcon}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-field">
                  <label className="input-label">GitHub</label>
                  <input className="input-field" value={data.links.github} onChange={e => updateField('links', 'github', e.target.value)} placeholder="github.com/username" />
                </div>
                <div className="form-field">
                  <label className="input-label">LinkedIn</label>
                  <input className="input-field" value={data.links.linkedin} onChange={e => updateField('links', 'linkedin', e.target.value)} placeholder="linkedin.com/in/username" />
                </div>
              </div>
            </Accordion>
          </div>
        </div>
      </div >

      {/* Preview (55%) */}
      <div className="flex-1 bg-neutral-100 overflow-y-auto p-4 md:p-12 print:p-0 print:bg-white print:overflow-visible relative" style={{ '--accent': themeColor }}>
        <div className="max-w-[210mm] mx-auto mb-10 space-y-8 print:m-0 print:space-y-0">
          {/* Template & Color Selectors */}
          <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-xl space-y-8 no-print">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Select Layout</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                  {TEMPLATES.map(t => (
                    <TemplateThumbnail
                      key={t.id}
                      id={t.id}
                      active={template === t.id}
                      onClick={() => setTemplate(t.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Color Theme</span>
                </div>
                <ColorPicker activeColor={themeColor} onColorSelect={setThemeColor} />
                <button
                  onClick={handlePrint}
                  disabled={isGenerating}
                  className="w-full mt-4 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Printer className={cn("w-4 h-4", isGenerating && "animate-pulse")} /> {isGenerating ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </div>
          </div>

          <ResumeDocument data={data} template={template} themeColor={themeColor} />


          {!data.personalInfo.name && !data.summary && (
            <div className="flex flex-col items-center justify-center h-[180mm] text-neutral-300 animate-pulse">
              <FileText className="w-16 h-16 mb-4" />
              <p className="font-serif text-xl italic text-neutral-400">Your live preview will appear here...</p>
            </div>
          )}
        </div>
      </div>

    </div >
  );
};

// Preview Route
const PreviewView = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('resumeBuilderData');
    if (!saved) return null;
    try {
      return normalizeResumeData(JSON.parse(saved));
    } catch {
      return null;
    }
  });

  const [template, setTemplate] = useState(() => {
    return localStorage.getItem('resumeTemplate') || 'Modern';
  });

  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('resumeThemeColor') || 'hsl(168, 60%, 40%)';
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setIsGenerating(false);
  }, [data, template]);

  const [copied, setCopied] = useState(false);
  const atsResult = useMemo(() => calculateATSScore(data || DEFAULT_RESUME_DATA), [data]);

  useEffect(() => {
    const syncFromStorage = () => {
      const saved = localStorage.getItem('resumeBuilderData');
      if (!saved) {
        setData(null);
        return;
      }
      try {
        setData(normalizeResumeData(JSON.parse(saved)));
      } catch {
        setData(null);
      }
    };

    const onStorage = (event) => {
      if (event.key !== 'resumeBuilderData') return;
      syncFromStorage();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) syncFromStorage();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', syncFromStorage);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', syncFromStorage);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);


  const isIncomplete = !data?.personalInfo.name ||
    (data?.experience.filter(e => e.company.trim()).length === 0 &&
      data?.projects.filter(p => p.name.trim()).length === 0);

  const handlePrint = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (isGenerating) return;
    setIsGenerating(true);

    try {
      document.body.classList.add("printing");
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.body.classList.remove("printing");
          setIsGenerating(false);
        }, 500);
      }, 100);
    } catch (error) {
      console.error("PDF Generation Failed", error);
      document.body.classList.remove("printing");
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    const sections = [];

    // 1. Name
    sections.push((data.personalInfo.name || 'YOUR NAME').toUpperCase());

    // 2. Contact
    const contact = [data.personalInfo.location, data.personalInfo.phone, data.personalInfo.email].filter(Boolean).join(' | ');
    if (contact) sections.push(contact);

    // 3. Summary
    if (data.summary?.trim()) {
      sections.push('\nSUMMARY');
      sections.push(data.summary.trim());
    }

    // 4. Education
    const education = data.education.filter(e => e.school.trim());
    if (education.length > 0) {
      sections.push('\nEDUCATION');
      education.forEach(e => {
        sections.push(`${e.degree}, ${e.school} (${e.year})`);
      });
    }

    // 5. Experience
    const experience = data.experience.filter(e => e.company.trim());
    if (experience.length > 0) {
      sections.push('\nEXPERIENCE');
      experience.forEach(e => {
        sections.push(`${e.role}, ${e.company} (${e.period})\n${e.description}`);
      });
    }

    // 6. Projects
    const projects = data.projects.filter(p => p.name.trim());
    if (projects.length > 0) {
      sections.push('\nPROJECTS');
      projects.forEach(p => {
        const stack = p.techStack?.length > 0 ? ` [${p.techStack.join(', ')}]` : '';
        sections.push(`${p.name}${stack}\n${p.description}${p.liveUrl ? `\nLive: ${p.liveUrl}` : ''}${p.githubUrl ? `\nGitHub: ${p.githubUrl}` : ''}`);
      });
    }

    // 7. Skills
    const skillCategories = [];
    if (data.skills.technical.length > 0) skillCategories.push(`Technical: ${data.skills.technical.join(', ')}`);
    if (data.skills.soft.length > 0) skillCategories.push(`Soft Skills: ${data.skills.soft.join(', ')}`);
    if (data.skills.tools.length > 0) skillCategories.push(`Tools: ${data.skills.tools.join(', ')}`);

    if (skillCategories.length > 0) {
      sections.push('\nSKILLS');
      sections.push(skillCategories.join('\n'));
    }

    // 8. Links
    const links = [];
    if (data.links.github) links.push(`GitHub: ${data.links.github}`);
    if (data.links.linkedin) links.push(`LinkedIn: ${data.links.linkedin}`);
    if (links.length > 0) {
      sections.push('\nLINKS');
      sections.push(links.join('\n'));
    }

    const text = sections.join('\n').trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data || (!data.personalInfo.name && !data.summary)) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-white p-8">
        <FileText className="w-16 h-16 text-neutral-100 mb-6" />
        <h2 className="text-3xl font-bold font-serif mb-3">No Data Found</h2>
        <Link to="/builder" className="btn-primary">Go to Builder</Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-[calc(100vh-64px)] py-12 scroll-smooth">
      <div className="max-w-[210mm] mx-auto space-y-8 no-print px-4">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-neutral-200 shadow-xl relative z-10" style={{ '--accent': themeColor }}>
          <div className="flex flex-col gap-6 w-full lg:w-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Layout</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {TEMPLATES.map(t => (
                  <TemplateThumbnail key={t.id} id={t.id} active={template === t.id} onClick={() => { setTemplate(t.id); localStorage.setItem('resumeTemplate', t.id); }} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Theme Color</span>
              </div>
              <ColorPicker activeColor={themeColor} onColorSelect={(c) => { setThemeColor(c); localStorage.setItem('resumeThemeColor', c); }} />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto h-fit">
            <button onClick={handleCopyText} className="btn-secondary py-3 px-6 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center">
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button onClick={handlePrint} disabled={isGenerating} className="btn-primary py-3 px-8 flex items-center gap-2 text-sm group flex-1 lg:flex-none justify-center disabled:opacity-50">
              <Printer className={cn("w-4 h-4", isGenerating ? "animate-pulse" : "group-hover:animate-pulse")} />
              {isGenerating ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>

        <ATSScoreCard score={atsResult.score} suggestions={atsResult.suggestions} />

        {/* Incomplete Warning */}
        {isIncomplete && (
          <div className="flex items-center gap-3 bg-neutral-100 border border-neutral-200 p-4 rounded-2xl text-neutral-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <Info className="w-5 h-5 text-neutral-400 shrink-0" />
            Your resume may look incomplete. Add your name and at least one experience or project.
          </div>
        )}
      </div>

      <div className="max-w-[210mm] mx-auto mt-8 print:mt-0">
        <ResumeDocument data={data} template={template} themeColor={themeColor} />
      </div>
    </div>
  );
};

// Proof Route
const Proof = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [insightResult, setInsightResult] = useState(null);

  // Lazy initialization to load saved data without triggering cascading renders
  const [resumeText] = useState(() => {
    const saved = localStorage.getItem('resumeBuilderData');
    if (saved) {
      try {
        const data = normalizeResumeData(JSON.parse(saved));
        return [
          data.summary,
          data.experience.map(e => `${e.role} ${e.description}`).join(' '),
          data.education.map(e => `${e.degree} ${e.school}`).join(' '),
          data.projects.map(p => `${p.name} ${p.description} ${p.techStack.join(' ')}`).join(' '),
          data.skills.technical.join(' '),
          data.skills.soft.join(' '),
          data.skills.tools.join(' ')
        ].join(' ');
      } catch {
        console.warn('Failed to parse saved resume data');
      }
    }
    return '';
  });

  const analyzeResume = () => {
    if (!jobDescription.trim() || !resumeText.trim()) return;

    const jobWords = jobDescription.toLowerCase().match(/\b\w+\b/g) || [];
    const resumeWords = resumeText.toLowerCase().match(/\b\w+\b/g) || [];
    const jobUniqueWords = [...new Set(jobWords.filter(w => w.length > 3))];
    const resumeUniqueWords = new Set(resumeWords);

    const importantKeywords = ['react', 'node', 'javascript', 'typescript', 'api', 'cloud', 'aws', 'docker', 'sql', 'agile', 'database', 'backend', 'frontend', 'manager', 'leadership', 'design', 'architecture', 'testing', 'ci/cd', 'python', 'java'];
    const targetKeywords = jobUniqueWords.filter(w => importantKeywords.includes(w));
    if (targetKeywords.length === 0) targetKeywords.push('communication', 'teamwork', 'problem-solving', 'development');

    const matched = targetKeywords.filter(w => resumeUniqueWords.has(w));
    const missing = targetKeywords.filter(w => !resumeUniqueWords.has(w));

    const matchPercentage = targetKeywords.length > 0 ? Math.round((matched.length / targetKeywords.length) * 100) : 100;

    const verbCount = ATS_ACTION_VERBS.filter(v => resumeUniqueWords.has(v)).length;
    const verbsScore = Math.min(100, Math.round((verbCount / 5) * 100));

    const hasNumbers = /\d/.test(resumeText);
    const quantifiedScore = hasNumbers ? Math.floor(Math.random() * 20) + 80 : 40;

    setInsightResult({
      matchPercentage,
      missingKeywords: missing.slice(0, 5),
      suggestedKeywords: missing.slice(0, 5).map(w => w + ' experience'),
      scores: {
        structure: 90,
        verbs: verbsScore,
        quantification: quantifiedScore,
        alignment: matchPercentage
      },
      recommendations: [
        verbCount < 3 ? "Add more action verbs (e.g., Developed, Led) to your experience." : "Strong use of action verbs.",
        !hasNumbers ? "Include more numbers and metrics to quantify your achievements." : "Great job quantifying your impact.",
        missing.length > 0 ? `Incorporate missing keywords like: ${missing.slice(0, 3).join(', ')}.` : "Your resume aligns well with the job keywords.",
        "Ensure your summary highlights your most relevant skills for this specific role."
      ]
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-20 overflow-y-auto h-full pb-32">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <h2 className="text-5xl font-bold font-serif">Resume Insights</h2>
        <span className={cn(
          'inline-flex items-center px-4 py-2 rounded-full text-sm font-bold w-fit',
          insightResult ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
        )}>
          {insightResult ? 'Analyzed' : 'Awaiting Input'}
        </span>
      </div>

      <div className="space-y-8">
        <div className="section-card">
          <h3 className="text-2xl font-bold font-serif mb-6">Job Description</h3>
          <div>
            <label className="input-label">Paste the target job description here:</label>
            <textarea
              className="input-field h-40 resize-none text-sm bg-white"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Software Engineer Intern... Requirements..."
            />
            <button
              onClick={analyzeResume}
              className="btn-primary mt-4 py-3 px-6 flex items-center justify-center gap-2"
              disabled={!jobDescription.trim() || !resumeText.trim()}
            >
              <Sparkles className="w-4 h-4" /> Run AI Analysis
            </button>
          </div>
        </div>

        {insightResult && (
          <>
            <div className="section-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold font-serif">Keyword Match Scanner</h3>
                <span className="text-3xl font-bold text-accent">{insightResult.matchPercentage}% Match</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {insightResult.missingKeywords.length > 0 ? insightResult.missingKeywords.map((k, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">{k}</span>
                    )) : <span className="text-sm font-medium text-neutral-500">None detected. Great job!</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Suggested Additions</h4>
                  <div className="flex flex-wrap gap-2">
                    {insightResult.missingKeywords.length > 0 ? insightResult.missingKeywords.map((k, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">{k}</span>
                    )) : <span className="text-sm font-medium text-neutral-500">Your keywords are well optimized.</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3 className="text-2xl font-bold font-serif mb-6">Impact Score Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Structure', score: insightResult.scores.structure },
                  { label: 'Impact Verbs', score: insightResult.scores.verbs },
                  { label: 'Quantification', score: insightResult.scores.quantification },
                  { label: 'Skills Alignment', score: insightResult.scores.alignment }
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1 font-bold text-sm">
                      <span>{s.label}</span>
                      <span className={s.score > 70 ? "text-green-600" : s.score > 40 ? "text-amber-600" : "text-red-600"}>{s.score}/100</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all duration-500", s.score > 70 ? "bg-green-500" : s.score > 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${s.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <h3 className="text-2xl font-bold font-serif mb-6">Action Recommendations</h3>
              <div className="space-y-3">
                {insightResult.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 bg-white">
                    <AlertCircle className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-sm text-neutral-800">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/preview" element={<PreviewView />} />
          <Route path="/proof" element={<Proof />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
