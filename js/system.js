// Design System Detail Page

class SystemDetailPage {
    constructor() {
        this.systemId = null;
        this.systemData = null;
        this.componentData = null;
        this.allSystems = [];
        this.init();
    }

    async init() {
        // Get system ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        this.systemId = urlParams.get('id');

        if (!this.systemId) {
            this.showError();
            return;
        }

        try {
            await this.loadData();
            this.render();
        } catch (error) {
            console.error('Error loading system data:', error);
            this.showError();
        }
    }

    async loadData() {
        // Load main system data
        const systemsResponse = await fetch('data/systems.json');
        const systemsData = await systemsResponse.json();
        this.allSystems = systemsData.systems;
        this.systemData = this.allSystems.find(s => s.id === this.systemId);

        if (!this.systemData) {
            throw new Error('System not found');
        }

        // Load component data (optional)
        try {
            const componentResponse = await fetch(`data/components/${this.systemId}.json`);
            if (componentResponse.ok) {
                this.componentData = await componentResponse.json();
            }
        } catch (error) {
            console.warn('Component data not available for this system');
            // Don't throw - component data is optional
        }
    }

    render() {
        // Hide loading, show content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('systemContent').style.display = 'block';

        // Set page title
        document.getElementById('pageTitle').textContent = `${this.systemData.name} - Design System Diff`;
        document.getElementById('systemName').textContent = this.systemData.name;

        // Render statistics
        this.renderStatistics();

        // Render system overview
        this.renderOverview();

        // Render component audit
        if (this.componentData) {
            this.renderComponentAudit();
        }
    }

    renderStatistics() {
        try {
            // Calculate averages and rankings
            const totalSystems = this.allSystems.length;
            const avgStars = Math.round(this.allSystems.reduce((sum, s) => sum + s.githubStars, 0) / totalSystems);
            const avgComponents = Math.round(this.allSystems.reduce((sum, s) => sum + s.componentCount, 0) / totalSystems);

            // Rankings
            const byStars = [...this.allSystems].sort((a, b) => b.githubStars - a.githubStars);
            const byComponents = [...this.allSystems].sort((a, b) => b.componentCount - a.componentCount);
            const popularityRank = byStars.findIndex(s => s.id === this.systemId) + 1;
            const sizeRank = byComponents.findIndex(s => s.id === this.systemId) + 1;

            // Overview stats
            document.getElementById('statsStars').textContent = this.formatStars(this.systemData.githubStars) + ' ⭐';
            document.getElementById('statsComponents').textContent = this.systemData.componentCount + '+';
            document.getElementById('statsFrameworks').textContent = this.systemData.frameworks.join(', ');
            document.getElementById('statsLastUpdated').textContent = this.systemData.lastUpdated;

            // Comparison stats
            const starsVsAvg = ((this.systemData.githubStars / avgStars - 1) * 100).toFixed(0);
            const starsVsAvgText = starsVsAvg >= 0 ? `+${starsVsAvg}%` : `${starsVsAvg}%`;
            document.getElementById('statsStarsVsAvg').textContent = starsVsAvgText;

            const componentsVsAvg = ((this.systemData.componentCount / avgComponents - 1) * 100).toFixed(0);
            const componentsVsAvgText = componentsVsAvg >= 0 ? `+${componentsVsAvg}%` : `${componentsVsAvg}%`;
            document.getElementById('statsComponentsVsAvg').textContent = componentsVsAvgText;

            document.getElementById('statsPopularityRank').textContent = `#${popularityRank} of ${totalSystems}`;
            document.getElementById('statsSizeRank').textContent = `#${sizeRank} of ${totalSystems}`;

            // Features
            document.getElementById('statsTypescript').textContent = this.systemData.typescript ? '✓ Yes' : '✗ No';
            document.getElementById('statsAccessibility').textContent = this.systemData.accessibility;
            document.getElementById('statsTheming').textContent = this.systemData.theming;
            document.getElementById('statsAI').textContent = this.systemData.aiCodeGen?.quality
                ? `${this.systemData.aiCodeGen.quality.charAt(0).toUpperCase() + this.systemData.aiCodeGen.quality.slice(1)}`
                : 'Not specified';

            // Resources
            document.getElementById('statsHasDocs').textContent = this.systemData.docsUrl ? '✓ Available' : '✗ Not available';
            document.getElementById('statsHasStorybook').textContent = this.systemData.storybookUrl ? '✓ Available' : '✗ Not available';
            document.getElementById('statsHasFigma').textContent = this.systemData.figmaUrl ? '✓ Available' : '✗ Not available';
            document.getElementById('statsHasDemo').textContent = this.systemData.demoUrl ? '✓ Available' : '✗ Not available';
        } catch (error) {
            console.error('Error rendering statistics:', error);
        }
    }

    renderOverview() {
        // Basic metadata
        document.getElementById('maintainer').textContent = this.systemData.maintainer;

        // License link
        const licenseContainer = document.getElementById('license');
        licenseContainer.innerHTML = '';
        const licenseLink = document.createElement('a');
        licenseLink.href = `licenses.html#${this.systemData.license.toLowerCase().replace(/\s+/g, '-')}`;
        licenseLink.className = 'license-link';
        licenseLink.textContent = this.systemData.license;
        licenseContainer.appendChild(licenseLink);

        // Frameworks
        const frameworksContainer = document.getElementById('frameworks');
        frameworksContainer.innerHTML = '';
        this.systemData.frameworks.forEach(fw => {
            const span = document.createElement('span');
            span.className = 'framework-tag';
            span.textContent = fw;
            frameworksContainer.appendChild(span);
        });

        document.getElementById('componentCount').textContent = this.systemData.componentCount + '+';
        document.getElementById('stars').textContent = this.formatStars(this.systemData.githubStars);
        document.getElementById('accessibility').textContent = this.systemData.accessibility;
        document.getElementById('theming').textContent = this.systemData.theming;
        document.getElementById('typescript').textContent = this.systemData.typescript ? 'Yes' : 'No';

        // Links
        const linksContainer = document.getElementById('systemLinks');
        linksContainer.innerHTML = '';

        const docsLink = document.createElement('a');
        docsLink.href = this.systemData.docsUrl;
        docsLink.className = 'primary-btn';
        docsLink.target = '_blank';
        docsLink.rel = 'noopener';
        docsLink.textContent = 'Documentation';
        linksContainer.appendChild(docsLink);

        const githubLink = document.createElement('a');
        githubLink.href = this.systemData.githubUrl;
        githubLink.className = 'secondary-btn';
        githubLink.target = '_blank';
        githubLink.rel = 'noopener';
        githubLink.textContent = 'GitHub';
        linksContainer.appendChild(githubLink);

        if (this.systemData.storybookUrl) {
            const storybookLink = document.createElement('a');
            storybookLink.href = this.systemData.storybookUrl;
            storybookLink.className = 'secondary-btn';
            storybookLink.target = '_blank';
            storybookLink.rel = 'noopener';
            storybookLink.textContent = 'Storybook';
            linksContainer.appendChild(storybookLink);
        }

        if (this.systemData.figmaUrl) {
            const figmaLink = document.createElement('a');
            figmaLink.href = this.systemData.figmaUrl;
            figmaLink.className = 'secondary-btn';
            figmaLink.target = '_blank';
            figmaLink.rel = 'noopener';
            figmaLink.textContent = 'Figma';
            linksContainer.appendChild(figmaLink);
        }

        // Notes if available
        if (this.componentData && this.componentData.notes) {
            document.getElementById('systemNotes').style.display = 'block';
            document.getElementById('notesContent').textContent = this.componentData.notes;
        }
    }

    renderComponentAudit() {
        document.getElementById('lastUpdated').textContent = this.componentData.lastUpdated;
        document.getElementById('totalComponents').textContent = this.componentData.totalComponents;

        const categoriesContainer = document.getElementById('componentCategories');
        const fragment = document.createDocumentFragment();

        this.componentData.components.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'component-category';

            const heading = document.createElement('h3');
            heading.className = 'category-heading';
            heading.innerHTML = `${this.escapeHtml(category.category)} <span class="category-count">(${category.items.length})</span>`;

            const tableContainer = document.createElement('div');
            tableContainer.className = 'component-table-container';

            const table = document.createElement('table');
            table.className = 'component-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Description</th>
                        <th style="width: 120px; text-align: center;">Documented</th>
                        <th style="width: 120px; text-align: center;">Accessibility</th>
                        <th style="width: 150px;">Links</th>
                    </tr>
                </thead>
            `;

            const tbody = document.createElement('tbody');
            category.items.forEach(component => {
                const row = tbody.insertRow();

                // Component name
                const nameCell = row.insertCell();
                const nameStrong = document.createElement('strong');
                nameStrong.textContent = component.name;
                nameCell.appendChild(nameStrong);

                // Description
                const descCell = row.insertCell();
                descCell.textContent = component.description;

                // Documented
                const docCell = row.insertCell();
                docCell.style.textAlign = 'center';
                docCell.textContent = component.documented ? '✓' : '—';

                // Accessibility
                const a11yCell = row.insertCell();
                a11yCell.style.textAlign = 'center';
                a11yCell.textContent = component.accessibility || 'Full';

                // Links
                const linksCell = row.insertCell();
                if (component.storybookUrl || component.docsUrl) {
                    const linksDiv = document.createElement('div');
                    linksDiv.className = 'links';

                    const url = component.storybookUrl || component.docsUrl;
                    const linkText = component.storybookUrl ? 'Storybook' : 'Docs';

                    const link = document.createElement('a');
                    link.href = url;
                    link.className = 'link-btn';
                    link.target = '_blank';
                    link.rel = 'noopener';
                    link.textContent = linkText;

                    linksDiv.appendChild(link);
                    linksCell.appendChild(linksDiv);
                } else {
                    linksCell.textContent = '—';
                }
            });

            table.appendChild(tbody);
            tableContainer.appendChild(table);
            categoryDiv.appendChild(heading);
            categoryDiv.appendChild(tableContainer);
            fragment.appendChild(categoryDiv);
        });

        categoriesContainer.appendChild(fragment);
    }

    formatStars(stars) {
        if (stars >= 1000) {
            return (stars / 1000).toFixed(1) + 'k';
        }
        return stars.toString();
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new SystemDetailPage();
});
