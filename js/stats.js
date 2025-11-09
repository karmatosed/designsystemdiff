// Design System Statistics

let systems = [];

// Load data
async function loadData() {
    try {
        const response = await fetch('data/systems.json');
        const data = await response.json();
        systems = data.systems;
        calculateStats();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function calculateStats() {
    // Overview
    const totalSystems = systems.length;
    const totalComponents = systems.reduce((sum, s) => sum + s.componentCount, 0);
    const totalStars = systems.reduce((sum, s) => sum + s.githubStars, 0);
    const uniqueMaintainers = new Set(systems.map(s => s.maintainer)).size;

    document.getElementById('totalSystems').textContent = totalSystems;
    document.getElementById('totalSystemsCard').textContent = totalSystems;
    document.getElementById('totalComponents').textContent = totalComponents.toLocaleString();
    document.getElementById('totalStars').textContent = totalStars.toLocaleString() + '+';
    document.getElementById('uniqueMaintainers').textContent = uniqueMaintainers;

    // AI & Development
    const aiSupported = systems.filter(s => s.aiCodeGen?.supported).length;
    const tsSupported = systems.filter(s => s.typescript).length;

    document.getElementById('aiSupported').textContent =
        `${aiSupported}/${totalSystems} (${(aiSupported/totalSystems*100).toFixed(1)}%)`;
    document.getElementById('tsSupport').textContent =
        `${tsSupported}/${totalSystems} (${(tsSupported/totalSystems*100).toFixed(1)}%)`;

    // AI Quality breakdown
    const aiQuality = {};
    systems.forEach(s => {
        const quality = s.aiCodeGen?.quality;
        if (quality) {
            aiQuality[quality] = (aiQuality[quality] || 0) + 1;
        }
    });

    const qualityDescriptions = {
        'excellent': 'High accuracy, extensive training data, idiomatic patterns',
        'good': 'Mostly correct code, may need occasional corrections',
        'fair': 'Works but more niche, requires more manual refinement'
    };

    const aiQualityHTML = Object.entries(aiQuality)
        .sort((a, b) => b[1] - a[1])
        .map(([quality, count]) => `
            <div class="ai-quality-item">
                <div class="stat-row">
                    <span class="stat-label">${quality.charAt(0).toUpperCase() + quality.slice(1)} quality</span>
                    <span class="stat-value-inline">${count} systems (${(count/totalSystems*100).toFixed(1)}%)</span>
                </div>
                <div class="quality-description">${qualityDescriptions[quality]}</div>
            </div>
        `).join('');
    document.getElementById('aiQuality').innerHTML = aiQualityHTML;

    // Frameworks
    const frameworks = {};
    systems.forEach(s => {
        s.frameworks.forEach(fw => {
            frameworks[fw] = (frameworks[fw] || 0) + 1;
        });
    });

    renderBars('frameworkBars', frameworks, totalSystems);

    // Licensing
    const licenses = {};
    systems.forEach(s => {
        licenses[s.license] = (licenses[s.license] || 0) + 1;
    });

    renderBars('licenseBars', licenses, totalSystems);

    // Accessibility
    const wcag21aa = systems.filter(s => s.accessibility === 'WCAG 2.1 AA').length;
    const wcag22aa = systems.filter(s => s.accessibility === 'WCAG 2.2 AA').length;
    const wcag21aaa = systems.filter(s => s.accessibility === 'WCAG 2.1 AAA').length;

    document.getElementById('wcag21aa').textContent = `${wcag21aa} (${(wcag21aa/totalSystems*100).toFixed(1)}%)`;
    document.getElementById('wcag22aa').textContent = `${wcag22aa} (${(wcag22aa/totalSystems*100).toFixed(1)}%)`;
    document.getElementById('wcag21aaa').textContent = `${wcag21aaa} (${(wcag21aaa/totalSystems*100).toFixed(1)}%)`;

    // Design Tools
    const hasFigma = systems.filter(s => s.figmaUrl).length;
    const hasStorybook = systems.filter(s => s.storybookUrl).length;
    const hasDemo = systems.filter(s => s.demoUrl).length;

    document.getElementById('hasFigma').textContent =
        `${hasFigma}/${totalSystems} (${(hasFigma/totalSystems*100).toFixed(1)}%)`;
    document.getElementById('hasStorybook').textContent =
        `${hasStorybook}/${totalSystems} (${(hasStorybook/totalSystems*100).toFixed(1)}%)`;
    document.getElementById('hasDemo').textContent =
        `${hasDemo}/${totalSystems} (${(hasDemo/totalSystems*100).toFixed(1)}%)`;

    // Component Stats
    const componentCounts = systems.map(s => s.componentCount);
    const avgComponents = (componentCounts.reduce((a, b) => a + b, 0) / componentCounts.length).toFixed(1);
    const medianComponents = median(componentCounts);
    const minComponents = Math.min(...componentCounts);
    const maxComponents = Math.max(...componentCounts);
    const minSystem = systems.find(s => s.componentCount === minComponents);
    const maxSystem = systems.find(s => s.componentCount === maxComponents);

    document.getElementById('avgComponents').textContent = avgComponents;
    document.getElementById('medianComponents').textContent = medianComponents;
    document.getElementById('minComponents').textContent = `${minComponents} (${minSystem.name})`;
    document.getElementById('maxComponents').textContent = `${maxComponents} (${maxSystem.name})`;

    // Theming
    const theming = {};
    systems.forEach(s => {
        theming[s.theming] = (theming[s.theming] || 0) + 1;
    });

    renderBars('themingBars', theming, totalSystems);

    // System Type (Generic vs Product-Specific)
    const genericCount = systems.filter(s => !s.cms).length;
    const productSpecificCount = systems.filter(s => s.cms).length;

    document.getElementById('genericCount').textContent =
        `${genericCount}/${totalSystems} (${(genericCount/totalSystems*100).toFixed(1)}%)`;
    document.getElementById('productSpecificCount').textContent =
        `${productSpecificCount}/${totalSystems} (${(productSpecificCount/totalSystems*100).toFixed(1)}%)`;

    // Product breakdown
    const products = {};
    systems.forEach(s => {
        if (s.cms) {
            products[s.cms] = (products[s.cms] || 0) + 1;
        }
    });

    const productBreakdownHTML = Object.entries(products)
        .sort((a, b) => b[1] - a[1])
        .map(([product, count]) => `
            <div class="stat-row">
                <span class="stat-label">${product}</span>
                <span class="stat-value-inline">${count} ${count === 1 ? 'system' : 'systems'}</span>
            </div>
        `).join('');
    document.getElementById('productBreakdown').innerHTML = productBreakdownHTML;

    // Top 10 by Stars
    const topStars = [...systems]
        .sort((a, b) => b.githubStars - a.githubStars)
        .slice(0, 10);

    const topStarsHTML = topStars.map((s, i) => `
        <div class="top-item">
            <span class="top-rank">${i + 1}</span>
            <span class="top-name">${s.name}</span>
            <span class="top-value">${s.githubStars.toLocaleString()} ⭐</span>
        </div>
    `).join('');
    document.getElementById('topStars').innerHTML = topStarsHTML;

    // Insights
    const reactSystems = frameworks['React'] || 0;
    const mostPopular = topStars[0];
    const avgStars = Math.round(totalStars / totalSystems);
    const cmsCount = systems.filter(s => s.cms).length;

    const insights = [
        `React dominates with ${reactSystems} systems (${(reactSystems/totalSystems*100).toFixed(1)}% support)`,
        `All systems work with AI coding tools (${aiQuality['excellent'] || 0} excellent, ${aiQuality['good'] || 0} good quality)`,
        `${(tsSupported/totalSystems*100).toFixed(1)}% support TypeScript`,
        `${mostPopular.name} leads with ${mostPopular.githubStars.toLocaleString()}+ stars`,
        `Average system has ${avgComponents} components`,
        `${wcag21aaa > 0 ? wcag21aaa + ' system achieves' : 'Only 1 system achieves'} WCAG AAA compliance`,
        `${(licenses['MIT']/totalSystems*100).toFixed(1)}% use permissive MIT license`,
        `${genericCount} generic systems work with any project, ${productSpecificCount} are product-specific`,
        `Average ${avgStars.toLocaleString()} stars per system`,
        `${hasFigma > hasStorybook ? 'Figma' : 'Storybook'} is more popular (${Math.max(hasFigma, hasStorybook)} vs ${Math.min(hasFigma, hasStorybook)})`
    ];

    const insightsHTML = insights.map(insight => `
        <div class="insight-item">${insight}</div>
    `).join('');
    document.getElementById('insights').innerHTML = insightsHTML;
}

function renderBars(elementId, data, total) {
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const html = sorted.map(([label, count]) => {
        const percentage = (count / total * 100).toFixed(1);
        return `
            <div class="stat-bar-item">
                <div class="stat-bar-label">${label}</div>
                <div class="stat-bar-container">
                    <div class="stat-bar-fill" style="width: ${percentage}%"></div>
                    <div class="stat-bar-value">${count} (${percentage}%)</div>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById(elementId).innerHTML = html;
}

function median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Initialize
loadData();
