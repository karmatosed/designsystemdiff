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
