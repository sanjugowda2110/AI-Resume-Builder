const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update DEFAULT_RESUME_DATA and normalizeResumeData
code = code.replace(
    `  education: [{ school: '', degree: '', year: '' }],`,
    `  education: [{ level: '', institution: '', qualification: '', specialization: '', boardOrUniversity: '', startYear: '', endYear: '', gradeType: '', gradeValue: '', location: '', school: '', degree: '', year: '' }],`
);

// update normalizeResumeData
const oldNormalize = `    education: Array.isArray(parsed.education) && parsed.education.length > 0 ? parsed.education : DEFAULT_RESUME_DATA.education,`;
const newNormalize = `    education: Array.isArray(parsed.education) && parsed.education.length > 0 ? parsed.education.map(e => ({ ...DEFAULT_RESUME_DATA.education[0], ...e })) : DEFAULT_RESUME_DATA.education,`;
code = code.replace(oldNormalize, newNormalize);

// 2. Add an ATS suggestion change for education (so it works with both institution and school)
code = code.replace(`const hasEducation = data.education.some((edu) => edu.school.trim());`, `const hasEducation = data.education.some((edu) => (edu.school || edu.institution).trim());`);

// 3. Update ResumeDocument render helper
const renderEduCode = `  const renderEducationDetails = (edu) => {
    const level = edu.level || '';
    const qual = edu.qualification || edu.degree || '';
    const spec = edu.specialization || '';
    const board = edu.boardOrUniversity || '';
    
    let title = qual;
    let subtitle = '';
    
    if (level === 'Secondary School Education') {
      title = qual || 'Secondary School Education';
      if (board) subtitle = board;
    } else if (level === 'Higher Secondary Education') {
      title = qual || 'Higher Secondary Education';
      if (spec) subtitle = spec;
    } else if (level === 'Diploma') {
      title = qual || 'Diploma';
      if (spec) subtitle = spec;
    } else if (level === 'Undergraduate' || level === 'Postgraduate') {
      title = qual;
      if (qual && spec) title = \`\${qual} in \${spec}\`;
      else if (spec) title = spec;
    } else {
      title = qual;
      if (spec) subtitle = spec;
    }
    
    return { title, subtitle };
  };`;

code = code.replace(`  const renderDescription = (text) => {`, renderEduCode + `\n\n  const renderDescription = (text) => {`);

// 4. Update ResumeDocument Rendering (Modern)
const oldEduModern = `{data.education.some(e => e.school.trim()) && (
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
            )}`;

const newEduModern = `{data.education.some(e => (e.school || e.institution).trim()) && (
              <div>
                <h2 className="text-[11pt] font-bold uppercase tracking-wider mb-4 pb-1 border-b-2" style={{ borderBottomColor: themeColor }}>Education</h2>
                <div className="space-y-4">
                  {data.education.filter(e => (e.school || e.institution).trim()).map((edu, i) => {
                    const { title, subtitle } = renderEducationDetails(edu);
                    const inst = edu.institution || edu.school;
                    const years = edu.year || (edu.startYear && edu.endYear ? \`\${edu.startYear} - \${edu.endYear}\` : edu.startYear || edu.endYear);
                    return (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-[10.5pt]">{title || inst}</h3>
                        <div className="text-neutral-800 text-[10pt] font-bold">{title ? inst : subtitle}</div>
                        {title && subtitle && <div className="text-neutral-700 text-[9.5pt] font-medium">{subtitle}</div>}
                        {edu.boardOrUniversity && edu.level !== 'Secondary School Education' && <div className="text-neutral-700 text-[9pt]">{edu.boardOrUniversity}</div>}
                        {edu.gradeType && edu.gradeValue && (
                          <div className="text-neutral-600 text-[8.5pt] mt-0.5">
                            {edu.gradeType === "CGPA" ? \`CGPA: \${edu.gradeValue}\` : \`Percentage: \${edu.gradeValue}\`}
                          </div>
                        )}
                      </div>
                      <span className="text-[9pt] font-bold text-neutral-500 italic shrink-0">{years}</span>
                    </div>
                  )})}
                </div>
              </div>
            )}`;
code = code.replace(oldEduModern, newEduModern);

// 5. Update ResumeDocument Rendering (Classic/Minimal)
const oldEduClassic = `{data.education.some(e => e.school.trim()) && (
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
          )}`;

const newEduClassic = `{data.education.some(e => (e.school || e.institution).trim()) && (
            <div className="break-inside-avoid">
              <h2 className={cn("text-[11pt] font-bold uppercase tracking-wider pb-1 mb-4", template === 'Classic' ? "border-b border-neutral-300" : "")} style={{ color: template === 'Minimal' ? themeColor : 'inherit' }}>
                Education
              </h2>
              <div className="space-y-4">
                {data.education.filter(e => (e.school || e.institution).trim()).map((edu, i) => {
                  const { title, subtitle } = renderEducationDetails(edu);
                  const inst = edu.institution || edu.school;
                  const years = edu.year || (edu.startYear && edu.endYear ? \`\${edu.startYear} - \${edu.endYear}\` : edu.startYear || edu.endYear);
                  return (
                  <div key={i} className="flex justify-between items-start break-inside-avoid">
                    <div>
                      <h3 className="font-bold text-[10.5pt]">{title || inst}</h3>
                      <div className="text-neutral-800 text-[10pt] font-bold" style={{ color: template === 'Classic' ? themeColor : 'inherit' }}>{title ? inst : subtitle}</div>
                      {title && subtitle && <div className="text-neutral-700 text-[9.5pt] font-medium">{subtitle}</div>}
                      {edu.boardOrUniversity && edu.level !== 'Secondary School Education' && <div className="text-neutral-700 text-[9pt]">{edu.boardOrUniversity}</div>}
                      {edu.gradeType && edu.gradeValue && (
                        <div className="text-neutral-600 text-[8.5pt] mt-0.5">
                          {edu.gradeType === "CGPA" ? \`CGPA: \${edu.gradeValue}\` : \`Percentage: \${edu.gradeValue}\`}
                        </div>
                      )}
                    </div>
                    <span className="text-[9pt] font-bold text-neutral-500 italic shrink-0">{years}</span>
                  </div>
                )})}
              </div>
            </div>
          )}`;
code = code.replace(oldEduClassic, newEduClassic);

// 6. Update Load sample logic
const oldSample = `education: [{ school: 'IIT Bombay', degree: 'B.Tech in Computer Science', year: '2021' }],`;
const newSample = `education: [{ level: 'Undergraduate', institution: 'IIT Bombay', qualification: 'B.Tech', specialization: 'Computer Science', year: '2021', gradeType: 'CGPA', gradeValue: '8.5 / 10' }],`;
code = code.replace(oldSample, newSample);

// 7. Update addEntry for education
const oldAddEntry = `section === 'education' ? { school: '', degree: '', year: '' } :`;
const newAddEntry = `section === 'education' ? { level: '', institution: '', qualification: '', specialization: '', boardOrUniversity: '', startYear: '', endYear: '', gradeType: '', gradeValue: '', location: '', school: '', degree: '', year: '' } :`;
code = code.replace(oldAddEntry, newAddEntry);

// 8. Update Editor Accordion Form for Education
const oldForm = `<Accordion title="Education" icon={GraduationCap}>
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
            </Accordion>`;

const newForm = `<Accordion title="Education" icon={GraduationCap}>
              <div className="space-y-6">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-4 relative group">
                    <button onClick={() => removeEntry('education', idx)} className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-accent transition-colors"><Trash2 className="w-4 h-4" /></button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="form-field">
                        <label className="input-label">Education Level</label>
                        <select 
                          className="input-field bg-white text-sm" 
                          value={edu.level || ''} 
                          onChange={e => updateField('education', 'level', e.target.value, idx)}
                        >
                          <option value="">Select Level</option>
                          <option value="Secondary School Education">Secondary School Education</option>
                          <option value="Higher Secondary Education">Higher Secondary Education</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Undergraduate">Undergraduate</option>
                          <option value="Postgraduate">Postgraduate</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="input-label">Institution</label>
                        <input className="input-field bg-white text-sm" value={edu.institution !== undefined ? edu.institution : edu.school || ''} onChange={e => updateField('education', 'institution', e.target.value, idx)} placeholder="Institution Name" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-field">
                        <label className="input-label">Qualification / Degree</label>
                        <input className="input-field bg-white text-sm" value={edu.qualification !== undefined ? edu.qualification : edu.degree || ''} onChange={e => updateField('education', 'qualification', e.target.value, idx)} placeholder="e.g. B.Tech, XII, 10th" />
                      </div>
                      <div className="form-field">
                        <label className="input-label">Specialization / Stream</label>
                        <input className="input-field bg-white text-sm" value={edu.specialization || ''} onChange={e => updateField('education', 'specialization', e.target.value, idx)} placeholder="e.g. Computer Science, Science" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-field">
                        <label className="input-label">Board / University</label>
                        <input className="input-field bg-white text-sm" value={edu.boardOrUniversity || ''} onChange={e => updateField('education', 'boardOrUniversity', e.target.value, idx)} placeholder="e.g. CBSE, State Board" />
                      </div>
                      <div className="form-field">
                        <label className="input-label">Years</label>
                        <input className="input-field bg-white text-sm" value={edu.year || ''} onChange={e => updateField('education', 'year', e.target.value, idx)} placeholder="e.g. 2018 - 2022" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-field">
                        <label className="input-label">Grade Format</label>
                        <select 
                          className="input-field bg-white text-sm" 
                          value={edu.gradeType || ''} 
                          onChange={e => {
                            updateField('education', 'gradeType', e.target.value, idx);
                            if(!e.target.value) updateField('education', 'gradeValue', '', idx);
                          }}
                        >
                          <option value="">None</option>
                          <option value="CGPA">CGPA</option>
                          <option value="Percentage">Percentage</option>
                        </select>
                      </div>
                      {edu.gradeType && (
                        <div className="form-field">
                          <label className="input-label">Grade</label>
                          <input 
                            className="input-field bg-white text-sm" 
                            value={edu.gradeValue || ''} 
                            onChange={e => updateField('education', 'gradeValue', e.target.value, idx)} 
                            placeholder={edu.gradeType === 'CGPA' ? 'e.g., 8.6 / 10' : 'e.g., 87%'} 
                          />
                        </div>
                      )}
                    </div>

                  </div>
                ))}
                <button onClick={() => addEntry('education')} className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 font-bold text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
            </Accordion>`;
code = code.replace(oldForm, newForm);

// 9. Update copy logic in handleCopyText
const oldCopy = `    const education = data.education.filter(e => e.school.trim());
    if (education.length > 0) {
      sections.push('\\nEDUCATION');
      education.forEach(e => {
        sections.push(\`\${e.degree}, \${e.school} (\${e.year})\`);
      });
    }`;
const newCopy = `    const education = data.education.filter(e => (e.school || e.institution || '').trim());
    if (education.length > 0) {
      sections.push('\\nEDUCATION');
      education.forEach(e => {
        const inst = e.institution || e.school || '';
        const qual = e.qualification || e.degree || '';
        const years = e.year || (e.startYear && e.endYear ? \`\${e.startYear} - \${e.endYear}\` : e.startYear || e.endYear || '');
        sections.push(\`\${qual}, \${inst} (\${years})\`);
      });
    }`;
code = code.replace(oldCopy, newCopy);

// 10. Update Proof route resume analysis extraction
const oldProof = `data.education.map(e => \`\${e.degree} \${e.school}\`).join(' '),`;
const newProof = `data.education.map(e => \`\${e.qualification || e.degree || ''} \${e.institution || e.school || ''}\`).join(' '),`;
code = code.replace(oldProof, newProof);

// Write to temp file to check differences
fs.writeFileSync('src/App_new.jsx', code);
