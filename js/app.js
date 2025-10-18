// Design System Comparison Tool - Vanilla JavaScript

class DesignSystemComparison {
    constructor() {
        this.systems = [];
        this.filteredSystems = [];
        this.currentSort = { key: null, direction: 'asc' };
        this.selectedSystems = new Set();
        this.init();
    }

    async init() {
        await this.loadData();
        this.populateFilters();
        this.renderTable();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            const response = await fetch('data/systems.json');
            const data = await response.json();
            this.systems = data.systems;
            this.filteredSystems = [...this.systems];
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    populateFilters() {
        // Get unique values for filters
        const frameworks = new Set();
        const licenses = new Set();
        const maintainers = new Set();

        this.systems.forEach(system => {
            system.frameworks.forEach(fw => frameworks.add(fw));
            licenses.add(system.license);
            maintainers.add(system.maintainer);
        });

        // Populate framework filter
        const frameworkFilter = document.getElementById('frameworkFilter');
        Array.from(frameworks).sort().forEach(fw => {
            const option = document.createElement('option');
            option.value = fw;
            option.textContent = fw;
            frameworkFilter.appendChild(option);
        });

        // Populate license filter
        const licenseFilter = document.getElementById('licenseFilter');
        Array.from(licenses).sort().forEach(license => {
            const option = document.createElement('option');
            option.value = license;
            option.textContent = license;
            licenseFilter.appendChild(option);
        });

        // Populate maintainer filter
        const maintainerFilter = document.getElementById('maintainerFilter');
        Array.from(maintainers).sort().forEach(maintainer => {
            const option = document.createElement('option');
            option.value = maintainer;
            option.textContent = maintainer;
            maintainerFilter.appendChild(option);
        });
    }

    renderTable() {
        const tbody = document.getElementById('tableBody');
        const noResults = document.getElementById('noResults');

        tbody.innerHTML = '';

        if (this.filteredSystems.length === 0) {
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';

        this.filteredSystems.forEach(system => {
            const row = document.createElement('tr');
            const aiQuality = system.aiCodeGen?.supported
                ? `<span class="ai-quality ai-quality-${system.aiCodeGen.quality}" title="${system.aiCodeGen.notes}">${system.aiCodeGen.quality}</span>`
                : '—';

            const aiTick = system.aiCodeGen?.supported ? '✓' : '';

            const isChecked = this.selectedSystems.has(system.id);

            row.innerHTML = `
                <td><input type="checkbox" class="system-checkbox" data-system-id="${system.id}" ${isChecked ? 'checked' : ''} aria-label="Select ${system.name} for comparison"></td>
                <td class="system-name">${system.name}</td>
                <td>${system.maintainer}</td>
                <td>${system.license}</td>
                <td>
                    <div class="frameworks">
                        ${system.frameworks.map(fw => `<span class="framework-tag">${fw}</span>`).join('')}
                    </div>
                </td>
                <td>${system.componentCount}+</td>
                <td>${this.formatStars(system.githubStars)}</td>
                <td>${system.accessibility}</td>
                <td>${system.theming}</td>
                <td style="text-align: center;">${aiTick}</td>
                <td>${aiQuality}</td>
                <td>
                    <div class="links">
                        ${system.figmaUrl ? `<a href="${system.figmaUrl}" class="link-btn" target="_blank" rel="noopener">Figma</a>` : ''}
                        ${system.penpotUrl ? `<a href="${system.penpotUrl}" class="link-btn" target="_blank" rel="noopener">Penpot</a>` : ''}
                        ${system.storybookUrl ? `<a href="${system.storybookUrl}" class="link-btn" target="_blank" rel="noopener">Storybook</a>` : ''}
                        ${!system.figmaUrl && !system.penpotUrl && !system.storybookUrl ? '—' : ''}
                    </div>
                </td>
                <td>
                    <div class="links">
                        <a href="${system.docsUrl}" class="link-btn" target="_blank" rel="noopener">Docs</a>
                        <a href="${system.githubUrl}" class="link-btn" target="_blank" rel="noopener">GitHub</a>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Attach checkbox listeners
        document.querySelectorAll('.system-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleCheckboxChange(e.target);
            });
        });
    }

    formatStars(stars) {
        if (stars >= 1000) {
            return (stars / 1000).toFixed(1) + 'k';
        }
        return stars.toString();
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const frameworkFilter = document.getElementById('frameworkFilter').value;
        const licenseFilter = document.getElementById('licenseFilter').value;
        const maintainerFilter = document.getElementById('maintainerFilter').value;
        const cmsFilter = document.getElementById('cmsFilter').value;
        const aiFilter = document.getElementById('aiFilter').checked;

        this.filteredSystems = this.systems.filter(system => {
            // Search filter
            const matchesSearch = !searchTerm ||
                system.name.toLowerCase().includes(searchTerm) ||
                system.maintainer.toLowerCase().includes(searchTerm);

            // Framework filter
            const matchesFramework = !frameworkFilter ||
                system.frameworks.includes(frameworkFilter);

            // License filter
            const matchesLicense = !licenseFilter ||
                system.license === licenseFilter;

            // Maintainer filter
            const matchesMaintainer = !maintainerFilter ||
                system.maintainer === maintainerFilter;

            // CMS filter
            const matchesCMS = !cmsFilter ||
                (cmsFilter === 'cms' && system.cms) ||
                (cmsFilter === 'non-cms' && !system.cms);

            // AI filter
            const matchesAI = !aiFilter || system.aiCodeGen?.supported;

            return matchesSearch && matchesFramework && matchesLicense && matchesMaintainer && matchesCMS && matchesAI;
        });

        // Reapply current sort if any
        if (this.currentSort.key) {
            this.sortBy(this.currentSort.key, false);
        }

        this.renderTable();
    }

    sortBy(key, toggleDirection = true) {
        if (toggleDirection) {
            if (this.currentSort.key === key) {
                this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                this.currentSort.key = key;
                this.currentSort.direction = 'asc';
            }
        }

        this.filteredSystems.sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];

            // Handle string comparison
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderTable();
        this.updateSortIndicators();
    }

    updateSortIndicators() {
        // Reset all sort indicators
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });

        // Add indicator to current sort column
        if (this.currentSort.key) {
            const th = document.querySelector(`th[data-sort="${this.currentSort.key}"]`);
            if (th) {
                th.classList.add(`sort-${this.currentSort.direction}`);
            }
        }
    }

    attachEventListeners() {
        // Search input
        document.getElementById('searchInput').addEventListener('input', () => {
            this.applyFilters();
        });

        // Filter dropdowns
        document.getElementById('frameworkFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('licenseFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('maintainerFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('cmsFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // AI filter checkbox
        document.getElementById('aiFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Compare button
        document.getElementById('compareBtn').addEventListener('click', () => {
            this.showDiff();
        });

        // Close diff button
        document.getElementById('closeDiff').addEventListener('click', () => {
            document.getElementById('diffView').style.display = 'none';
        });

        // Fullscreen toggle button
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Keyboard shortcut for fullscreen (F key)
        document.addEventListener('keydown', (e) => {
            // Only trigger if not typing in an input
            if (e.key === 'f' && !e.target.matches('input, select, textarea')) {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });

        // Sortable columns
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.setAttribute('tabindex', '0');
            th.setAttribute('role', 'button');
            th.setAttribute('aria-label', `Sort by ${th.textContent.trim()}`);

            th.addEventListener('click', () => {
                const sortKey = th.getAttribute('data-sort');
                this.sortBy(sortKey);
            });

            th.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const sortKey = th.getAttribute('data-sort');
                    this.sortBy(sortKey);
                }
            });
        });
    }

    handleCheckboxChange(checkbox) {
        const systemId = checkbox.dataset.systemId;

        if (checkbox.checked) {
            if (this.selectedSystems.size < 2) {
                this.selectedSystems.add(systemId);
            } else {
                checkbox.checked = false;
                alert('You can only compare 2 systems at a time');
            }
        } else {
            this.selectedSystems.delete(systemId);
        }

        this.updateCompareButton();
    }

    updateCompareButton() {
        const btn = document.getElementById('compareBtn');
        const count = this.selectedSystems.size;

        btn.textContent = `Compare Selected (${count})`;
        btn.disabled = count !== 2;
    }

    toggleFullscreen() {
        const body = document.body;
        const btn = document.getElementById('fullscreenBtn');

        if (body.classList.contains('fullscreen-mode')) {
            body.classList.remove('fullscreen-mode');
            btn.textContent = '[ ]';
            btn.setAttribute('aria-label', 'Enter fullscreen table view (press F)');
        } else {
            body.classList.add('fullscreen-mode');
            btn.textContent = '[x]';
            btn.setAttribute('aria-label', 'Exit fullscreen table view (press F)');
            // Hide diff view when entering fullscreen
            document.getElementById('diffView').style.display = 'none';
        }
    }

    showDiff() {
        if (this.selectedSystems.size !== 2) return;

        const selectedIds = Array.from(this.selectedSystems);
        const system1 = this.systems.find(s => s.id === selectedIds[0]);
        const system2 = this.systems.find(s => s.id === selectedIds[1]);

        const diffContent = document.getElementById('diffContent');
        diffContent.innerHTML = this.generateDiff(system1, system2);

        document.getElementById('diffView').style.display = 'block';
        document.getElementById('diffView').scrollIntoView({ behavior: 'smooth' });
    }

    generateDiff(system1, system2) {
        // Frameworks diff
        const frameworks1 = new Set(system1.frameworks);
        const frameworks2 = new Set(system2.frameworks);
        const allFrameworks = new Set([...frameworks1, ...frameworks2]);

        const frameworksList1 = Array.from(allFrameworks).sort().map(fw => {
            const in1 = frameworks1.has(fw);
            const in2 = frameworks2.has(fw);
            if (in1 && in2) return `<li class="common">${fw}</li>`;
            if (in1) return `<li class="added">${fw}</li>`;
            return `<li class="removed">${fw}</li>`;
        }).join('');

        const frameworksList2 = Array.from(allFrameworks).sort().map(fw => {
            const in1 = frameworks1.has(fw);
            const in2 = frameworks2.has(fw);
            if (in1 && in2) return `<li class="common">${fw}</li>`;
            if (in2) return `<li class="added">${fw}</li>`;
            return `<li class="removed">${fw}</li>`;
        }).join('');

        // Design tools
        const hasFigma1 = system1.figmaUrl ? '+ Yes' : '- No';
        const hasFigma2 = system2.figmaUrl ? '+ Yes' : '- No';
        const hasStorybook1 = system1.storybookUrl ? '+ Yes' : '- No';
        const hasStorybook2 = system2.storybookUrl ? '+ Yes' : '- No';

        return `
            <table class="diff-table">
                <thead>
                    <tr>
                        <th>Attribute</th>
                        <th>${system1.name}</th>
                        <th>${system2.name}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="diff-label">Maintainer</td>
                        <td class="diff-value ${system1.maintainer !== system2.maintainer ? 'diff-value-changed' : ''}">${system1.maintainer}</td>
                        <td class="diff-value ${system1.maintainer !== system2.maintainer ? 'diff-value-changed' : ''}">${system2.maintainer}</td>
                    </tr>
                    <tr>
                        <td class="diff-label">License</td>
                        <td class="diff-value ${system1.license !== system2.license ? 'diff-value-changed' : ''}">${system1.license}</td>
                        <td class="diff-value ${system1.license !== system2.license ? 'diff-value-changed' : ''}">${system2.license}</td>
                    </tr>
                    <tr>
                        <td class="diff-label">Frameworks</td>
                        <td><ul class="diff-list">${frameworksList1}</ul></td>
                        <td><ul class="diff-list">${frameworksList2}</ul></td>
                    </tr>
                    <tr>
                        <td class="diff-label">Components</td>
                        <td class="diff-value ${system1.componentCount !== system2.componentCount ? 'diff-value-changed' : ''}">${system1.componentCount}+</td>
                        <td class="diff-value ${system1.componentCount !== system2.componentCount ? 'diff-value-changed' : ''}">${system2.componentCount}+</td>
                    </tr>
                    <tr>
                        <td class="diff-label">GitHub Stars</td>
                        <td class="diff-value">${this.formatStars(system1.githubStars)}</td>
                        <td class="diff-value">${this.formatStars(system2.githubStars)}</td>
                    </tr>
                    <tr>
                        <td class="diff-label">Accessibility</td>
                        <td class="diff-value ${system1.accessibility !== system2.accessibility ? 'diff-value-changed' : ''}">${system1.accessibility}</td>
                        <td class="diff-value ${system1.accessibility !== system2.accessibility ? 'diff-value-changed' : ''}">${system2.accessibility}</td>
                    </tr>
                    <tr>
                        <td class="diff-label">Theming</td>
                        <td class="diff-value ${system1.theming !== system2.theming ? 'diff-value-changed' : ''}">${system1.theming}</td>
                        <td class="diff-value ${system1.theming !== system2.theming ? 'diff-value-changed' : ''}">${system2.theming}</td>
                    </tr>
                    <tr>
                        <td class="diff-label">AI Support</td>
                        <td class="diff-value ${system1.aiCodeGen?.quality !== system2.aiCodeGen?.quality ? 'diff-value-changed' : ''}">${system1.aiCodeGen?.quality || 'N/A'}</td>
                        <td class="diff-value ${system1.aiCodeGen?.quality !== system2.aiCodeGen?.quality ? 'diff-value-changed' : ''}">${system2.aiCodeGen?.quality || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td class="diff-label">Figma</td>
                        <td class="diff-value">${hasFigma1}</td>
                        <td class="diff-value">${hasFigma2}</td>
                    </tr>
                    <tr>
                        <td class="diff-label">Storybook</td>
                        <td class="diff-value">${hasStorybook1}</td>
                        <td class="diff-value">${hasStorybook2}</td>
                    </tr>
                    <tr>
                        <td class="diff-label">Maturity</td>
                        <td class="diff-value ${system1.maturity !== system2.maturity ? 'diff-value-changed' : ''}">${system1.maturity}</td>
                        <td class="diff-value ${system1.maturity !== system2.maturity ? 'diff-value-changed' : ''}">${system2.maturity}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DesignSystemComparison();
});
