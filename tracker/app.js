(function() {
    'use strict';

    const steps = [
        { id: '01-problem', title: 'Problem Recognition', description: 'Deep dive into the resume crisis and applicant tracking system (ATS) bottlenecks.', prompt: 'Identify the top 5 problems job seekers face with current resume builders, specifically focusing on ATS optimization and keyword relevance.' },
        { id: '02-market', title: 'Market Opportunity', description: 'Analyzing the high-growth AI-powered career services market.', prompt: 'Summarize the current market trends for AI career tools. Contrast existing generic builders with the need for niche, high-fidelity AI resume generators.' },
        { id: '03-architecture', title: 'Core Architecture', description: 'Defining the tech stack and system flow for Project 3.', prompt: 'Design a system architecture diagram for an AI Resume Builder. User -> React Frontend -> Node.js API -> OpenAI GPT-4 -> PDF Generation Service.' },
        { id: '04-hld', title: 'High Level Design', description: 'The blueprint for scalable resume generation.', prompt: 'Outline the core modules: Real-time Preview Engine, Skill Extractor, Dynamic Formatting, and PDF Exporter.' },
        { id: '05-lld', title: 'Low Level Design', description: 'Schema and logic for the generator engine.', prompt: 'Define the data schema for a resume object in JSON. Include nested objects for Experience, Education, and Skills with validation rules.' },
        { id: '06-build', title: 'The Build Track', description: 'Accelerated development in the Lovable environment.', prompt: 'Implement the basic Resume Form component with React and Tailwind CSS. Ensure fields are linked to the JSON schema defined in Step 5.' },
        { id: '07-test', title: 'The Test Lab', description: 'QA and verification of the resume output.', prompt: 'Create a test suite checklist for the AI Resume Builder: 1. PDF Export quality, 2. Field validation, 3. Mobile responsiveness, 4. ATS compatibility score.' },
        { id: '08-ship', title: 'The Ship Phase', description: 'Ready to deploy to the world.', prompt: 'Prepare the deployment script and environment variables for Vercel. Document the final hand-off protocol.' }
    ];

    const router = {
        currentPath: '',
        init() {
            window.addEventListener('popstate', () => {
                this.navigate(window.location.pathname, false);
            });
            this.navigate(window.location.pathname);
        },
        navigate(path, push = true) {
            const normalizedPath = path === '/' || path === '/index.html' ? '/rb/01-problem' : path;
            this.currentPath = normalizedPath;
            if (push) {
                history.pushState({}, '', normalizedPath);
            }
            renderPage(normalizedPath);
        }
    };

    function getStepFromPath(path) {
        if (path === '/rb/proof') return 'proof';
        const match = path.match(/\/rb\/(\d+)/);
        if (match) {
            const index = parseInt(match[1]) - 1;
            return steps[index] || null;
        }
        return null;
    }

    function getArtifact(stepId) {
        return localStorage.getItem(`rb_step_${stepId}_artifact`);
    }

    function saveArtifact(stepId, data) {
        localStorage.setItem(`rb_step_${stepId}_artifact`, data);
        updateUI();
    }

    function isStepUnlocked(stepIndex) {
        if (stepIndex === 0) return true;
        // Previous step must have an artifact
        const prevStep = steps[stepIndex - 1];
        return !!getArtifact(prevStep.id);
    }

    function renderPage(path) {
        const workspace = document.getElementById('workspace-content');
        const step = getStepFromPath(path);

        // Reset UI elements
        const lovablePrompt = document.getElementById('lovable-prompt');
        lovablePrompt.value = '';
        const uploadText = document.getElementById('upload-text');
        uploadText.textContent = 'Upload Artifact (Screenshot)';
        const artifactStatus = document.getElementById('artifact-status');
        artifactStatus.textContent = 'No artifact uploaded yet.';
        const nextBtn = document.getElementById('next-btn');

        if (path === '/rb/proof') {
            renderProofPage(workspace);
            return;
        }

        if (!step) {
            workspace.innerHTML = '<h2>404</h2><p>Page not found.</p>';
            return;
        }

        const stepIndex = steps.indexOf(step);
        
        // Gating Check
        if (!isStepUnlocked(stepIndex)) {
            workspace.innerHTML = `
                <div class="artifact-card">
                    <h2>Step Locked</h2>
                    <p>You must complete the previous step and upload an artifact to proceed.</p>
                    <button class="primary-btn" onclick="window.router.navigate('/rb/${String(stepIndex).padStart(2, '0')}-problem')">Go Back</button>
                </div>
            `;
            updateTopBar(step, stepIndex);
            return;
        }

        workspace.innerHTML = `
            <h2>${step.title}</h2>
            <p>${step.description}</p>
            <div class="artifact-card">
                <h3>Build Instructions</h3>
                <p>Click the button below to generate the build prompt for this step.</p>
                <button class="primary-btn" id="gen-prompt-btn">Generate PROMPT</button>
            </div>
        `;

        document.getElementById('gen-prompt-btn').onclick = () => {
            lovablePrompt.value = step.prompt;
        };

        // Update Panel
        const artifact = getArtifact(step.id);
        if (artifact) {
            artifactStatus.textContent = '✓ Artifact uploaded.';
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }

        updateTopBar(step, stepIndex);
        updateFooter(stepIndex);
    }

    function updateTopBar(step, stepIndex) {
        document.getElementById('page-title').textContent = step.title;
        document.getElementById('step-indicator').textContent = `Project 3 — Step ${stepIndex + 1} of 8`;
        
        const statusBadge = document.getElementById('project-status');
        const totalArtifacts = steps.filter(s => !!getArtifact(s.id)).length;
        
        if (totalArtifacts === 8) {
            statusBadge.textContent = 'SHIPPED';
            statusBadge.className = 'status-badge shipped';
        } else if (totalArtifacts > 0) {
            statusBadge.textContent = 'IN PROGRESS';
            statusBadge.className = 'status-badge in-progress';
        } else {
            statusBadge.textContent = 'NOT STARTED';
            statusBadge.className = 'status-badge';
        }
    }

    function updateFooter(stepIndex) {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.className = 'dot';
            if (i === stepIndex) dot.classList.add('active');
            if (getArtifact(steps[i].id)) dot.classList.add('completed');
        });
    }

    function renderProofPage(container) {
        document.getElementById('page-title').textContent = 'Submission Proof';
        document.getElementById('step-indicator').textContent = 'Project 3 — Final Step';

        const totalArtifacts = steps.filter(s => !!getArtifact(s.id)).length;
        
        container.innerHTML = `
            <div class="proof-grid">
                <h2>Build Track Status</h2>
                <div class="step-summary-grid">
                    ${steps.map((s, i) => `
                        <div class="step-card">
                            <div class="step-info">
                                <span class="step-num">${i + 1}</span>
                                <div>
                                    <h4 class="step-status">${s.title}</h4>
                                    <span class="hint">${getArtifact(s.id) ? '✓ Completed' : '○ Pending'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <h2>Project Artifacts</h2>
                <div class="link-inputs">
                    <div class="form-field">
                        <label for="lovable-link">Lovable Project Link</label>
                        <input type="url" id="lovable-link" placeholder="https://lovable.dev/projects/..." value="${localStorage.getItem('rb_lovable_link') || ''}">
                    </div>
                    <div class="form-field">
                        <label for="github-link">GitHub Link</label>
                        <input type="url" id="github-link" placeholder="https://github.com/..." value="${localStorage.getItem('rb_github_link') || ''}">
                    </div>
                    <div class="form-field">
                        <label for="deploy-link">Deploy Link</label>
                        <input type="url" id="deploy-link" placeholder="https://..." value="${localStorage.getItem('rb_deploy_link') || ''}">
                    </div>
                    <button class="primary-btn" id="save-proof-btn">Save Submission Links</button>
                    <button class="secondary-btn" id="copy-final-btn" ${totalArtifacts < 8 ? 'disabled' : ''}>Copy Final Submission</button>
                </div>
            </div>
        `;

        document.getElementById('save-proof-btn').onclick = () => {
            localStorage.setItem('rb_lovable_link', document.getElementById('lovable-link').value);
            localStorage.setItem('rb_github_link', document.getElementById('github-link').value);
            localStorage.setItem('rb_deploy_link', document.getElementById('deploy-link').value);
            alert('✓ Links saved!');
        };

        document.getElementById('copy-final-btn').onclick = () => {
            const text = `AI Resume Builder — Project 3 Final Submission
Lovable: ${document.getElementById('lovable-link').value}
GitHub: ${document.getElementById('github-link').value}
Deploy: ${document.getElementById('deploy-link').value}`;
            navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
        };
    }

    function updateUI() {
        const path = window.location.pathname;
        renderPage(path === '/' || path === '/index.html' ? '/rb/01-problem' : path);
    }

    // Initialize
    window.onload = () => {
        router.init();
        window.router = router;

        // Global Event Listeners
        document.getElementById('copy-prompt-btn').onclick = () => {
            const val = document.getElementById('lovable-prompt').value;
            if (val) {
                navigator.clipboard.writeText(val).then(() => alert('Prompt copied!'));
            }
        };

        document.getElementById('next-btn').onclick = () => {
            const step = getStepFromPath(router.currentPath);
            if (step) {
                const index = steps.indexOf(step);
                if (index < steps.length - 1) {
                    router.navigate(`/rb/${String(index + 2).padStart(2, '0')}-${steps[index + 1].id.split('-')[1]}`);
                } else {
                    router.navigate('/rb/proof');
                }
            }
        };

        const artifactUpload = document.getElementById('artifact-upload');
        artifactUpload.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const step = getStepFromPath(router.currentPath);
                if (step) {
                    saveArtifact(step.id, 'uploaded'); // In a real app, this would be the file data or URL
                }
            }
        };

        document.getElementById('status-worked').onclick = () => alert('Great! Now upload the screenshot to proceed.');
        document.getElementById('status-error').onclick = () => alert('Check the console or error log, then try again.');
        document.getElementById('status-screenshot').onclick = () => artifactUpload.click();
    };

})();
