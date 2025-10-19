// Design System Finder - Wizard Logic

class DesignSystemFinder {
    constructor() {
        this.systems = [];
        this.componentData = {};
        this.answers = {
            framework: null,
            typescript: null,
            experience: null,
            priorities: [],
            components: []
        };
        this.currentStep = 1;
        this.totalSteps = 5;
        this.init();
    }

    async init() {
        await this.loadData();
        this.attachEventListeners();
        this.updateProgress();
    }

    async loadData() {
        try {
            const response = await fetch('data/systems.json');
            const data = await response.json();
            this.systems = data.systems;
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    attachEventListeners() {
        // Step 1: Framework selection
        document.querySelectorAll('#step1 .option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.answers.framework = btn.dataset.value;
                this.nextStep();
            });
        });

        // Step 2: TypeScript
        document.querySelectorAll('#step2 .option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.answers.typescript = btn.dataset.value;
                this.nextStep();
            });
        });

        // Step 3: Experience
        document.querySelectorAll('#step3 .option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.answers.experience = btn.dataset.value;
                this.nextStep();
            });
        });

        // Step 4: Priorities (multi-select)
        document.querySelectorAll('#step4 .option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.value;

                if (btn.classList.contains('selected')) {
                    // Deselect
                    btn.classList.remove('selected');
                    this.answers.priorities = this.answers.priorities.filter(p => p !== value);
                } else {
                    // Select (max 2)
                    if (this.answers.priorities.length < 2) {
                        btn.classList.add('selected');
                        this.answers.priorities.push(value);
                    }
                }

                // Enable/disable next button
                const nextBtn = document.getElementById('nextStep4Btn');
                nextBtn.disabled = this.answers.priorities.length === 0;
            });
        });

        // Step 4: Next button
        document.getElementById('nextStep4Btn').addEventListener('click', () => {
            this.nextStep();
        });

        // Step 5: Component selection (multi-select, optional)
        document.querySelectorAll('#step5 .option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.value;

                if (btn.classList.contains('selected')) {
                    // Deselect
                    btn.classList.remove('selected');
                    this.answers.components = this.answers.components.filter(c => c !== value);
                } else {
                    // Select (no limit)
                    btn.classList.add('selected');
                    this.answers.components.push(value);
                }
            });
        });

        // Find systems button
        document.getElementById('findSystemsBtn').addEventListener('click', () => {
            this.showResults();
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            this.previousStep();
        });

        // Start over button
        document.getElementById('startOverBtn').addEventListener('click', () => {
            this.reset();
        });
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateSteps();
            this.updateProgress();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateSteps();
            this.updateProgress();
        }
    }

    updateSteps() {
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
        });

        const currentStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // Show/hide back button
        const backBtn = document.getElementById('backBtn');
        backBtn.style.display = this.currentStep > 1 && this.currentStep <= this.totalSteps ? 'block' : 'none';
    }

    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${progress}%`;

        const progressBar = document.querySelector('.progress-bar');
        progressBar.setAttribute('aria-valuenow', progress);
    }

    async showResults() {
        // Load component data if components were selected
        if (this.answers.components.length > 0) {
            await this.loadComponentData();
        }

        // Calculate scores for all systems
        const scoredSystems = this.systems.map(system => ({
            ...system,
            score: this.calculateScore(system),
            reasons: this.getReasons(system)
        }));

        // Sort by score and get top 3
        const topMatches = scoredSystems
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        // Render results
        this.renderResults(topMatches);

        // Show results step
        this.currentStep = 6;
        this.updateSteps();
        this.updateProgress();
    }

    async loadComponentData() {
        // Load component data for systems that have it
        const systemsToLoad = this.systems.filter(s => s.id);

        for (const system of systemsToLoad) {
            try {
                const response = await fetch(`data/components/${system.id}.json`);
                if (response.ok) {
                    this.componentData[system.id] = await response.json();
                }
            } catch (error) {
                // Component data not available for this system
            }
        }
    }

    hasComponent(system, componentName) {
        if (!this.componentData[system.id]) {
            return false;
        }

        const data = this.componentData[system.id];
        const normalizedSearch = componentName.toLowerCase();

        // Search through all categories
        for (const category of data.components) {
            for (const component of category.items) {
                const normalizedComponentName = component.name.toLowerCase();
                if (normalizedComponentName.includes(normalizedSearch) ||
                    normalizedSearch.includes(normalizedComponentName)) {
                    return true;
                }
            }
        }

        return false;
    }

    calculateScore(system) {
        let score = 0;
        const reasons = [];

        // Framework match (highest weight: 40 points)
        if (this.answers.framework === 'any') {
            score += 20; // Any framework gets partial points
        } else if (system.frameworks.includes(this.answers.framework)) {
            score += 40;
        } else if (this.answers.framework === 'CSS' && system.frameworks.includes('CSS')) {
            score += 40;
        } else if (this.answers.framework === 'Svelte' && system.frameworks.includes('Svelte')) {
            score += 40;
        } else {
            return 0; // No framework match = not suitable
        }

        // TypeScript support (15 points)
        if (this.answers.typescript === 'required' && system.typescript) {
            score += 15;
        } else if (this.answers.typescript === 'required' && !system.typescript) {
            score -= 20; // Penalty for not having required TS
        } else if (this.answers.typescript === 'nice' && system.typescript) {
            score += 10;
        }

        // Experience level matching
        if (this.answers.experience === 'beginner') {
            // Beginners: prefer popular, well-documented systems
            if (system.githubStars > 20000) score += 10;
            if (system.aiCodeGen?.quality === 'excellent') score += 8;
            if (system.storybookUrl || system.figmaUrl) score += 5;
        } else if (this.answers.experience === 'intermediate') {
            // Intermediate: balanced
            if (system.githubStars > 5000) score += 8;
            if (system.theming === 'Advanced') score += 5;
        } else if (this.answers.experience === 'advanced') {
            // Advanced: prefer customizable, powerful systems
            if (system.theming === 'Advanced') score += 10;
            if (system.componentCount > 60) score += 8;
        }

        // Priorities matching (10 points each)
        this.answers.priorities.forEach(priority => {
            switch(priority) {
                case 'speed':
                    if (system.aiCodeGen?.quality === 'excellent') score += 10;
                    if (system.componentCount > 50) score += 5;
                    break;
                case 'customization':
                    if (system.theming === 'Advanced') score += 10;
                    if (system.frameworks.includes('React') && !system.storybookUrl) score += 5; // Headless systems
                    break;
                case 'components':
                    if (system.componentCount > 70) score += 15;
                    else if (system.componentCount > 50) score += 10;
                    else if (system.componentCount > 30) score += 5;
                    break;
                case 'community':
                    if (system.githubStars > 50000) score += 15;
                    else if (system.githubStars > 20000) score += 10;
                    else if (system.githubStars > 5000) score += 5;
                    break;
                case 'accessibility':
                    if (system.accessibility === 'WCAG 2.1 AAA') score += 15;
                    else if (system.accessibility === 'WCAG 2.2 AA') score += 12;
                    else if (system.accessibility === 'WCAG 2.1 AA') score += 10;
                    break;
                case 'ai':
                    if (system.aiCodeGen?.quality === 'excellent') score += 15;
                    else if (system.aiCodeGen?.quality === 'good') score += 10;
                    else if (system.aiCodeGen?.quality === 'fair') score += 5;
                    break;
            }
        });

        // Component matching (5 points per matched component)
        if (this.answers.components.length > 0) {
            let matchedComponents = 0;
            this.answers.components.forEach(componentName => {
                if (this.hasComponent(system, componentName)) {
                    matchedComponents++;
                    score += 5;
                }
            });

            // Bonus if all requested components are available
            if (matchedComponents === this.answers.components.length && matchedComponents > 0) {
                score += 10;
            }
        }

        return score;
    }

    getReasons(system) {
        const reasons = [];

        // Framework
        if (system.frameworks.includes(this.answers.framework)) {
            reasons.push(`Supports ${this.answers.framework}`);
        } else if (this.answers.framework === 'any') {
            reasons.push(`Supports ${system.frameworks.join(', ')}`);
        }

        // TypeScript
        if (system.typescript && this.answers.typescript !== 'no') {
            reasons.push('TypeScript support');
        }

        // Priorities
        this.answers.priorities.forEach(priority => {
            switch(priority) {
                case 'speed':
                    if (system.aiCodeGen?.quality === 'excellent') {
                        reasons.push('Excellent AI code generation');
                    }
                    break;
                case 'customization':
                    if (system.theming === 'Advanced') {
                        reasons.push('Advanced theming capabilities');
                    }
                    break;
                case 'components':
                    reasons.push(`${system.componentCount}+ components`);
                    break;
                case 'community':
                    reasons.push(`${this.formatStars(system.githubStars)} GitHub stars`);
                    break;
                case 'accessibility':
                    reasons.push(`${system.accessibility} compliant`);
                    break;
                case 'ai':
                    if (system.aiCodeGen?.quality) {
                        reasons.push(`${system.aiCodeGen.quality} AI compatibility`);
                    }
                    break;
            }
        });

        // Add design tools if available
        if (system.figmaUrl) reasons.push('Figma components available');
        if (system.storybookUrl) reasons.push('Storybook documentation');

        // Add component matches
        if (this.answers.components.length > 0) {
            const matchedComponents = this.answers.components.filter(c =>
                this.hasComponent(system, c)
            );

            if (matchedComponents.length === this.answers.components.length) {
                reasons.push(`Has all ${matchedComponents.length} requested components`);
            } else if (matchedComponents.length > 0) {
                reasons.push(`Has ${matchedComponents.length} of ${this.answers.components.length} requested components`);
            }
        }

        return reasons.slice(0, 6); // Limit to top 6 reasons
    }

    formatStars(stars) {
        if (stars >= 1000) {
            return (stars / 1000).toFixed(1) + 'k';
        }
        return stars.toString();
    }

    renderResults(topMatches) {
        const container = document.getElementById('resultsContainer');

        if (topMatches.length === 0) {
            container.innerHTML = `
                <div class="no-matches">
                    <p>No perfect matches found with your criteria.</p>
                    <p>Try adjusting your requirements or <a href="index.html">browse all systems</a>.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = topMatches.map((system, index) => `
            <div class="result-card">
                <div class="result-header">
                    <div>
                        <h3 class="result-title">
                            ${index === 0 ? '<span class="best-match">Best Match</span>' : ''}
                            ${system.name}
                        </h3>
                        <div class="result-meta">
                            ${system.frameworks.map(fw => `<span class="framework-tag">${fw}</span>`).join('')}
                        </div>
                    </div>
                    <div class="match-score">${Math.round((system.score / 100) * 100)}% match</div>
                </div>

                <div class="result-reasons">
                    <h4>Why we recommend this:</h4>
                    <ul>
                        ${system.reasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>

                <div class="result-stats">
                    <div class="stat">
                        <span class="stat-label">Components:</span>
                        <span class="stat-value">${system.componentCount}+</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Stars:</span>
                        <span class="stat-value">${this.formatStars(system.githubStars)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">License:</span>
                        <span class="stat-value">${system.license}</span>
                    </div>
                    ${system.typescript ? '<div class="stat"><span class="stat-badge">TypeScript</span></div>' : ''}
                </div>

                <div class="result-actions">
                    <a href="${system.docsUrl}" class="primary-btn" target="_blank" rel="noopener">View Docs</a>
                    <a href="${system.githubUrl}" class="secondary-btn" target="_blank" rel="noopener">GitHub</a>
                    ${system.storybookUrl ? `<a href="${system.storybookUrl}" class="secondary-btn" target="_blank" rel="noopener">Storybook</a>` : ''}
                    ${system.figmaUrl ? `<a href="${system.figmaUrl}" class="secondary-btn" target="_blank" rel="noopener">Figma</a>` : ''}
                </div>
            </div>
        `).join('');
    }

    reset() {
        this.answers = {
            framework: null,
            typescript: null,
            experience: null,
            priorities: [],
            components: []
        };
        this.currentStep = 1;

        // Clear selections
        document.querySelectorAll('.option-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });

        this.updateSteps();
        this.updateProgress();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new DesignSystemFinder();
});
