// Design System Detail Page

class SystemDetailPage {
    constructor() {
        this.systemId = null;
        this.systemData = null;
        this.componentData = null;
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
        this.systemData = systemsData.systems.find(s => s.id === this.systemId);

        if (!this.systemData) {
            throw new Error('System not found');
        }

        // Load component data
        try {
            const componentResponse = await fetch(`data/components/${this.systemId}.json`);
            if (!componentResponse.ok) {
                throw new Error('Component data not found');
            }
            this.componentData = await componentResponse.json();
        } catch (error) {
            console.warn('Component data not available for this system');
            throw error;
        }
    }

    render() {
        // Hide loading, show content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('systemContent').style.display = 'block';

        // Set page title
        document.getElementById('pageTitle').textContent = `${this.systemData.name} - Design System Diff`;
        document.getElementById('systemName').textContent = this.systemData.name;

        // Render system overview
        this.renderOverview();

        // Render component audit
        if (this.componentData) {
            this.renderComponentAudit();
        }
    }

    renderOverview() {
        // Basic metadata
        document.getElementById('maintainer').textContent = this.systemData.maintainer;
        document.getElementById('license').innerHTML = `<a href="licenses.html#${this.systemData.license.toLowerCase().replace(/\s+/g, '-')}" class="license-link">${this.systemData.license}</a>`;
        document.getElementById('frameworks').innerHTML = this.systemData.frameworks
            .map(fw => `<span class="framework-tag">${fw}</span>`)
            .join(' ');
        document.getElementById('componentCount').textContent = this.systemData.componentCount + '+';
        document.getElementById('stars').textContent = this.formatStars(this.systemData.githubStars);
        document.getElementById('accessibility').textContent = this.systemData.accessibility;
        document.getElementById('theming').textContent = this.systemData.theming;
        document.getElementById('typescript').textContent = this.systemData.typescript ? 'Yes' : 'No';

        // Links
        const linksContainer = document.getElementById('systemLinks');
        const links = [];

        links.push(`<a href="${this.systemData.docsUrl}" class="primary-btn" target="_blank" rel="noopener">Documentation</a>`);
        links.push(`<a href="${this.systemData.githubUrl}" class="secondary-btn" target="_blank" rel="noopener">GitHub</a>`);

        if (this.systemData.storybookUrl) {
            links.push(`<a href="${this.systemData.storybookUrl}" class="secondary-btn" target="_blank" rel="noopener">Storybook</a>`);
        }

        if (this.systemData.figmaUrl) {
            links.push(`<a href="${this.systemData.figmaUrl}" class="secondary-btn" target="_blank" rel="noopener">Figma</a>`);
        }

        linksContainer.innerHTML = links.join('');

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

        categoriesContainer.innerHTML = this.componentData.components.map(category => `
            <div class="component-category">
                <h3 class="category-heading">${category.category} <span class="category-count">(${category.items.length})</span></h3>
                <div class="component-table-container">
                    <table class="component-table">
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th>Description</th>
                                <th style="width: 120px; text-align: center;">Documented</th>
                                <th style="width: 120px; text-align: center;">Accessibility</th>
                                <th style="width: 150px;">Links</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${category.items.map(component => {
                                const links = [];
                                if (component.docsUrl) {
                                    links.push(`<a href="${component.docsUrl}" class="link-btn" target="_blank" rel="noopener">Docs</a>`);
                                }
                                if (component.storybookUrl) {
                                    links.push(`<a href="${component.storybookUrl}" class="link-btn" target="_blank" rel="noopener">Storybook</a>`);
                                }
                                const linksHtml = links.length > 0 ? `<div class="links">${links.join('')}</div>` : '—';

                                return `
                                <tr>
                                    <td><strong>${component.name}</strong></td>
                                    <td>${component.description}</td>
                                    <td style="text-align: center;">${component.documented ? '✓' : '—'}</td>
                                    <td style="text-align: center;">${component.accessibility}</td>
                                    <td>${linksHtml}</td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('');
    }

    formatStars(stars) {
        if (stars >= 1000) {
            return (stars / 1000).toFixed(1) + 'k';
        }
        return stars.toString();
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
