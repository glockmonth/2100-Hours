// ============================================
// CONFIG
// ============================================
const CSV_URL = './statbot.csv'; // Make sure this CSV is in the same folder as your HTML

// ============================================
// LOAD CSV AND PARSE MEMBERS
// ============================================
async function loadCSV() {
    try {
        const res = await fetch(CSV_URL);
        const text = await res.text();
        const rows = text.split('\n').slice(1); // skip header

        const members = rows.map(row => {
            if (!row.trim()) return null;
            // Split CSV correctly even if username has quotes/commas
            const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
            if (!cols || cols.length < 4) return null;
            const name = cols[1].replace(/^"|"$/g, '').trim();
            const rank = cols[2] ? cols[2].replace(/^"|"$/g, '').trim() : 'Member';
            let hours = parseFloat(cols[3]);
            if (isNaN(hours)) hours = 0;
            const status = cols[4] ? cols[4].replace(/^"|"$/g, '').trim() : 'Active';
            return { name, rank, hours, status };
        }).filter(Boolean);

        return members;
    } catch (err) {
        console.error('Error loading CSV:', err);
        return [];
    }
}

// ============================================
// RENDER LEADERBOARD UI
// ============================================
function renderLeaderboard(members) {
    // Sort descending by hours
    members.sort((a, b) => b.hours - a.hours);

    // STATS BAR
    document.getElementById('total-members').textContent = members.length;
    const totalHours = members.reduce((sum, m) => sum + m.hours, 0);
    document.getElementById('total-hours').textContent = totalHours.toFixed(1);
    document.getElementById('avg-hours').textContent = (totalHours / members.length).toFixed(1);

    // PODIUM
    const podiumSelectors = ['.podium-place.first', '.podium-place.second', '.podium-place.third'];
    podiumSelectors.forEach((selector, i) => {
        const el = document.querySelector(selector);
        if (!el || !members[i]) return;
        el.querySelector('.player-name').textContent = members[i].name;
        el.querySelector('.player-hours').textContent = members[i].hours;
        const prizeEl = el.querySelector('.prize-value');
        if (prizeEl) prizeEl.textContent = members[i].prize || '—';
    });

    // FULL TABLE
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';
    members.forEach((m, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="rank-cell">${i + 1}</td>
            <td class="name-cell">${m.name}</td>
            <td>${m.rank}</td>
            <td class="hours-cell">${m.hours.toFixed(1)} hrs</td>
            <td style="color:${statusColor(m.status)};">● ${m.status}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================
// HELPER: STATUS COLOR
// ============================================
function statusColor(status) {
    switch(status.toLowerCase()) {
        case 'active': return '#00ff00';
        case 'idle': return '#ffaa00';
        case 'offline': return '#ff0000';
        default: return '#00ff00';
    }
}

// ============================================
// INIT
// ============================================
async function initLeaderboard() {
    const members = await loadCSV();
    renderLeaderboard(members);
}

initLeaderboard();
