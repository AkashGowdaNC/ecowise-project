// Profile page specific functionality
const API_BASE = 'http://localhost:5000';
let currentUser = 'EcoStudent';

console.log("👤 EcoWise Profile Page Loaded");

// Load user profile data
async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser}`);
        const profile = await response.json();
        
        if (profile.error) {
            throw new Error(profile.error);
        }
        
        updateProfileUI(profile);
        loadUserHistory();
        
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profileUsername').textContent = 'Error Loading';
    }
}

function updateProfileUI(profile) {
    // Update basic info
    document.getElementById('profileUsername').textContent = profile.username;
    document.getElementById('profileLevel').textContent = profile.level;
    
    // Update stats
    document.getElementById('statPoints').textContent = profile.eco_points;
    document.getElementById('statItems').textContent = profile.items_recycled;
    document.getElementById('statCarbon').textContent = `${profile.carbon_saved_kg}kg`;
    
    // Update achievements based on points
    updateAchievements(profile.eco_points, profile.items_recycled);
}

async function loadUserHistory() {
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser}/history`);
        const data = await response.json();
        
        const historyList = document.getElementById('historyList');
        
        if (data.history && data.history.length > 0) {
            historyList.innerHTML = data.history.map(item => `
                <div class="history-item">
                    <div class="history-icon">📸</div>
                    <div class="history-details">
                        <strong>${item.filename}</strong>
                        <span class="history-date">${new Date(item.processed_at).toLocaleDateString()}</span>
                    </div>
                    <div class="history-points">+${item.points_earned} pts</div>
                </div>
            `).join('');
        } else {
            historyList.innerHTML = `
                <div class="no-history">
                    <p>No recycling history yet.</p>
                    <a href="analyze.html" class="cta-link">Start analyzing items! 📸</a>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading history:', error);
        document.getElementById('historyList').innerHTML = `
            <div class="error-history">
                <p>Unable to load history. Please try again later.</p>
            </div>
        `;
    }
}

function updateAchievements(points, items) {
    const achievements = document.querySelectorAll('.achievement');
    
    achievements.forEach(achievement => {
        const achievementText = achievement.querySelector('strong').textContent;
        
        if (achievementText === 'First Step' && items > 0) {
            achievement.classList.remove('locked');
            achievement.classList.add('unlocked');
        } else if (achievementText === 'Eco Warrior' && points >= 200) {
            achievement.classList.remove('locked');
            achievement.classList.add('unlocked');
        } else if (achievementText === 'Consistent Saver' && items >= 50) {
            achievement.classList.remove('locked');
            achievement.classList.add('unlocked');
        }
    });
}

function refreshHistory() {
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.textContent = '🔄 Loading...';
    refreshBtn.disabled = true;
    
    loadUserHistory().finally(() => {
        setTimeout(() => {
            refreshBtn.textContent = '🔄 Refresh';
            refreshBtn.disabled = false;
        }, 1000);
    });
}

// Include export and leaderboard functions from previous script
async function exportUserData() {
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser}`);
        const userData = await response.json();
        
        const historyResponse = await fetch(`${API_BASE}/user/${currentUser}/history`);
        const historyData = await historyResponse.json();
        
        const exportData = {
            user: userData,
            history: historyData.history,
            exported_at: new Date().toISOString(),
            total_carbon_saved: userData.carbon_saved_kg,
            total_items_recycled: userData.items_recycled
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ecowise_data_${currentUser}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        alert('📊 Your EcoWise data has been exported!');
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ Failed to export data');
    }
}

async function showLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/leaderboard`);
        const data = await response.json();
        
        let leaderboardHtml = '<h3>🏆 Eco Leaderboard</h3><div class="leaderboard-list">';
        
        data.forEach((user, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            leaderboardHtml += `
                <div class="leaderboard-item ${user.username === currentUser ? 'current-user' : ''}">
                    <span class="rank">${medal}</span>
                    <span class="username">${user.username}</span>
                    <span class="points">${user.eco_points} pts</span>
                    <span class="level">${user.level}</span>
                </div>
            `;
        });
        
        leaderboardHtml += '</div>';
        
        alert(leaderboardHtml.replace(/<[^>]*>/g, '\n')); // Simple text display
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        alert('Unable to load leaderboard. Please try again later.');
    }
}

// Load profile when page loads
document.addEventListener('DOMContentLoaded', loadProfile);