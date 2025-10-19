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
        this.updateFilterStatus();
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

        const fragment = document.createDocumentFragment();

        this.filteredSystems.forEach(system => {
            const row = document.createElement('tr');
            const isChecked = this.selectedSystems.has(system.id);
            const licenseSlug = this.getLicenseSlug(system.license);

            // Checkbox cell
            const checkboxCell = row.insertCell();
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'system-checkbox';
            checkbox.dataset.systemId = system.id;
            checkbox.checked = isChecked;
            checkbox.setAttribute('aria-label', `Select ${system.name} for comparison`);
            checkbox.addEventListener('change', (e) => {
                this.handleCheckboxChange(e.target);
            });
            checkboxCell.appendChild(checkbox);

            // System name cell
            const nameCell = row.insertCell();
            nameCell.className = 'system-name';
            const nameLink = document.createElement('a');
            nameLink.href = `system.html?id=${system.id}`;
            nameLink.className = 'system-link';
            nameLink.textContent = system.name;
            nameCell.appendChild(nameLink);

            // Maintainer cell
            const maintainerCell = row.insertCell();
            maintainerCell.textContent = system.maintainer;

            // License cell
            const licenseCell = row.insertCell();
            const licenseLink = document.createElement('a');
            licenseLink.href = `licenses.html#${licenseSlug}`;
            licenseLink.className = 'license-link';
            licenseLink.textContent = system.license;
            licenseCell.appendChild(licenseLink);

            // Frameworks cell
            const frameworksCell = row.insertCell();
            const frameworksDiv = document.createElement('div');
            frameworksDiv.className = 'frameworks';
            system.frameworks.forEach(fw => {
                const span = document.createElement('span');
                span.className = 'framework-tag';
                span.textContent = fw;
                frameworksDiv.appendChild(span);
            });
            frameworksCell.appendChild(frameworksDiv);

            // Component count cell
            const componentCell = row.insertCell();
            componentCell.textContent = system.componentCount + '+';

            // Stars cell
            const starsCell = row.insertCell();
            starsCell.textContent = this.formatStars(system.githubStars);

            // Accessibility cell
            const a11yCell = row.insertCell();
            a11yCell.textContent = system.accessibility;

            // Theming cell
            const themingCell = row.insertCell();
            themingCell.textContent = system.theming;

            // TypeScript cell
            const tsCell = row.insertCell();
            tsCell.style.textAlign = 'center';
            tsCell.textContent = system.typescript ? '✓' : '';

            // AI tick cell
            const aiTickCell = row.insertCell();
            aiTickCell.style.textAlign = 'center';
            aiTickCell.textContent = system.aiCodeGen?.supported ? '✓' : '';

            // AI quality cell
            const aiQualityCell = row.insertCell();
            if (system.aiCodeGen?.supported) {
                const qualitySpan = document.createElement('span');
                qualitySpan.className = `ai-quality ai-quality-${system.aiCodeGen.quality}`;
                qualitySpan.title = system.aiCodeGen.notes;
                qualitySpan.textContent = system.aiCodeGen.quality;
                aiQualityCell.appendChild(qualitySpan);
            } else {
                aiQualityCell.textContent = '—';
            }

            // Design tools cell
            const designToolsCell = row.insertCell();
            const designLinksDiv = document.createElement('div');
            designLinksDiv.className = 'links';

            if (system.figmaUrl) {
                const figmaLink = document.createElement('a');
                figmaLink.href = system.figmaUrl;
                figmaLink.className = 'link-btn';
                figmaLink.target = '_blank';
                figmaLink.rel = 'noopener';
                figmaLink.textContent = 'Figma';
                designLinksDiv.appendChild(figmaLink);
            }

            if (system.penpotUrl) {
                const penpotLink = document.createElement('a');
                penpotLink.href = system.penpotUrl;
                penpotLink.className = 'link-btn';
                penpotLink.target = '_blank';
                penpotLink.rel = 'noopener';
                penpotLink.textContent = 'Penpot';
                designLinksDiv.appendChild(penpotLink);
            }

            if (system.storybookUrl) {
                const storybookLink = document.createElement('a');
                storybookLink.href = system.storybookUrl;
                storybookLink.className = 'link-btn';
                storybookLink.target = '_blank';
                storybookLink.rel = 'noopener';
                storybookLink.textContent = 'Storybook';
                designLinksDiv.appendChild(storybookLink);
            }

            if (!system.figmaUrl && !system.penpotUrl && !system.storybookUrl) {
                designLinksDiv.textContent = '—';
            }

            designToolsCell.appendChild(designLinksDiv);

            // Resources cell
            const resourcesCell = row.insertCell();
            const resourcesDiv = document.createElement('div');
            resourcesDiv.className = 'links';

            const docsLink = document.createElement('a');
            docsLink.href = system.docsUrl;
            docsLink.className = 'link-btn';
            docsLink.target = '_blank';
            docsLink.rel = 'noopener';
            docsLink.textContent = 'Docs';
            resourcesDiv.appendChild(docsLink);

            const githubLink = document.createElement('a');
            githubLink.href = system.githubUrl;
            githubLink.className = 'link-btn';
            githubLink.target = '_blank';
            githubLink.rel = 'noopener';
            githubLink.textContent = 'GitHub';
            resourcesDiv.appendChild(githubLink);

            resourcesCell.appendChild(resourcesDiv);

            fragment.appendChild(row);
        });

        tbody.appendChild(fragment);
    }

    formatStars(stars) {
        if (stars >= 1000) {
            return (stars / 1000).toFixed(1) + 'k';
        }
        return stars.toString();
    }

    getLicenseSlug(license) {
        const slugMap = {
            'MIT': 'mit',
            'Apache 2.0': 'apache-2-0',
            'GPL-2.0': 'gpl-2-0',
            'EUPL-1.2': 'eupl-1-2'
        };
        return slugMap[license] || license.toLowerCase().replace(/\s+/g, '-');
    }

    applyFilters() {
        const frameworkFilter = document.getElementById('frameworkFilter').value;
        const licenseFilter = document.getElementById('licenseFilter').value;
        const maintainerFilter = document.getElementById('maintainerFilter').value;
        const cmsFilter = document.getElementById('cmsFilter').value;
        const aiFilter = document.getElementById('aiFilter').checked;

        this.filteredSystems = this.systems.filter(system => {
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

            return matchesFramework && matchesLicense && matchesMaintainer && matchesCMS && matchesAI;
        });

        // Reapply current sort if any
        if (this.currentSort.key) {
            this.sortBy(this.currentSort.key, false);
        }

        this.renderTable();
        this.updateFilterStatus();
    }

    updateFilterStatus() {
        const totalCount = this.systems.length;
        const filteredCount = this.filteredSystems.length;
        const resultCount = document.getElementById('resultCount');

        // Only show count when filtering is active
        if (filteredCount < totalCount) {
            resultCount.textContent = `Showing ${filteredCount} of ${totalCount} systems`;
        } else {
            resultCount.textContent = '';
        }

        // Update active filters display
        this.updateActiveFilters();
    }

    updateActiveFilters() {
        const activeFiltersDiv = document.getElementById('activeFilters');
        activeFiltersDiv.innerHTML = '';

        const frameworkFilter = document.getElementById('frameworkFilter').value;
        const licenseFilter = document.getElementById('licenseFilter').value;
        const maintainerFilter = document.getElementById('maintainerFilter').value;
        const cmsFilter = document.getElementById('cmsFilter').value;
        const aiFilter = document.getElementById('aiFilter').checked;

        const filters = [];
        if (frameworkFilter) filters.push(frameworkFilter);
        if (licenseFilter) filters.push(licenseFilter);
        if (maintainerFilter) filters.push(maintainerFilter);
        if (cmsFilter) filters.push(cmsFilter === 'cms' ? 'CMS Only' : 'Non-CMS Only');
        if (aiFilter) filters.push('AI Code-Gen');

        if (filters.length === 0) {
            return;
        }

        const fragment = document.createDocumentFragment();
        filters.forEach(filterValue => {
            const span = document.createElement('span');
            span.className = 'filter-pill';
            span.textContent = filterValue;
            fragment.appendChild(span);
        });

        activeFiltersDiv.appendChild(fragment);
    }

    clearAllFilters() {
        document.getElementById('frameworkFilter').value = '';
        document.getElementById('licenseFilter').value = '';
        document.getElementById('maintainerFilter').value = '';
        document.getElementById('cmsFilter').value = '';
        document.getElementById('aiFilter').checked = false;

        this.applyFilters();
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
            th.removeAttribute('aria-sort');
        });

        // Add indicator to current sort column
        if (this.currentSort.key) {
            const th = document.querySelector(`th[data-sort="${this.currentSort.key}"]`);
            if (th) {
                th.classList.add(`sort-${this.currentSort.direction}`);
                th.setAttribute('aria-sort', this.currentSort.direction === 'asc' ? 'ascending' : 'descending');
            }
        }
    }

    attachEventListeners() {
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

        // Clear filters button
        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearAllFilters();
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
        // Create table structure
        const table = document.createElement('table');
        table.className = 'diff-table';

        // Create thead
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const thAttr = document.createElement('th');
        thAttr.textContent = 'Attribute';
        headerRow.appendChild(thAttr);

        const thSys1 = document.createElement('th');
        thSys1.textContent = system1.name;
        headerRow.appendChild(thSys1);

        const thSys2 = document.createElement('th');
        thSys2.textContent = system2.name;
        headerRow.appendChild(thSys2);

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create tbody
        const tbody = document.createElement('tbody');

        // Helper function to create a diff row
        const createDiffRow = (label, value1, value2, isDifferent = false) => {
            const row = document.createElement('tr');

            const labelCell = document.createElement('td');
            labelCell.className = 'diff-label';
            labelCell.textContent = label;
            row.appendChild(labelCell);

            const valueCell1 = document.createElement('td');
            valueCell1.className = isDifferent ? 'diff-value diff-value-changed' : 'diff-value';
            if (typeof value1 === 'string') {
                valueCell1.textContent = value1;
            } else {
                valueCell1.appendChild(value1);
            }
            row.appendChild(valueCell1);

            const valueCell2 = document.createElement('td');
            valueCell2.className = isDifferent ? 'diff-value diff-value-changed' : 'diff-value';
            if (typeof value2 === 'string') {
                valueCell2.textContent = value2;
            } else {
                valueCell2.appendChild(value2);
            }
            row.appendChild(valueCell2);

            return row;
        };

        // Maintainer
        tbody.appendChild(createDiffRow(
            'Maintainer',
            system1.maintainer,
            system2.maintainer,
            system1.maintainer !== system2.maintainer
        ));

        // License
        tbody.appendChild(createDiffRow(
            'License',
            system1.license,
            system2.license,
            system1.license !== system2.license
        ));

        // Frameworks
        const frameworks1 = new Set(system1.frameworks);
        const frameworks2 = new Set(system2.frameworks);
        const allFrameworks = new Set([...frameworks1, ...frameworks2]);

        const createFrameworkList = (systemFrameworks, otherFrameworks) => {
            const ul = document.createElement('ul');
            ul.className = 'diff-list';

            Array.from(allFrameworks).sort().forEach(fw => {
                const li = document.createElement('li');
                const inSystem = systemFrameworks.has(fw);
                const inOther = otherFrameworks.has(fw);

                if (inSystem && inOther) {
                    li.className = 'common';
                } else if (inSystem) {
                    li.className = 'added';
                } else {
                    li.className = 'removed';
                }

                li.textContent = fw;
                ul.appendChild(li);
            });

            return ul;
        };

        tbody.appendChild(createDiffRow(
            'Frameworks',
            createFrameworkList(frameworks1, frameworks2),
            createFrameworkList(frameworks2, frameworks1)
        ));

        // Components
        tbody.appendChild(createDiffRow(
            'Components',
            system1.componentCount + '+',
            system2.componentCount + '+',
            system1.componentCount !== system2.componentCount
        ));

        // GitHub Stars
        tbody.appendChild(createDiffRow(
            'GitHub Stars',
            this.formatStars(system1.githubStars),
            this.formatStars(system2.githubStars)
        ));

        // Accessibility
        tbody.appendChild(createDiffRow(
            'Accessibility',
            system1.accessibility,
            system2.accessibility,
            system1.accessibility !== system2.accessibility
        ));

        // Theming
        tbody.appendChild(createDiffRow(
            'Theming',
            system1.theming,
            system2.theming,
            system1.theming !== system2.theming
        ));

        // AI Support
        tbody.appendChild(createDiffRow(
            'AI Support',
            system1.aiCodeGen?.quality || 'N/A',
            system2.aiCodeGen?.quality || 'N/A',
            system1.aiCodeGen?.quality !== system2.aiCodeGen?.quality
        ));

        // Figma
        tbody.appendChild(createDiffRow(
            'Figma',
            system1.figmaUrl ? '+ Yes' : '- No',
            system2.figmaUrl ? '+ Yes' : '- No'
        ));

        // Storybook
        tbody.appendChild(createDiffRow(
            'Storybook',
            system1.storybookUrl ? '+ Yes' : '- No',
            system2.storybookUrl ? '+ Yes' : '- No'
        ));

        // Maturity
        tbody.appendChild(createDiffRow(
            'Maturity',
            system1.maturity,
            system2.maturity,
            system1.maturity !== system2.maturity
        ));

        table.appendChild(tbody);

        // Create a container div and return its innerHTML
        const container = document.createElement('div');
        container.appendChild(table);
        return container.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DesignSystemComparison();
});
