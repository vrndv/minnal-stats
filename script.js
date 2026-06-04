const BASE_URL = 'https://raw.githubusercontent.com/vrndv/minnal-stats/main/src';

const CATEGORY_ICONS = {
    'minecraft:mined': 'iron_pickaxe',
    'minecraft:crafted': 'crafting_table',
    'minecraft:used': 'iron_sword',
    'minecraft:broken': 'anvil',
    'minecraft:picked_up': 'chest',
    'minecraft:dropped': 'hopper',
    'minecraft:killed': 'diamond_sword',
    'minecraft:killed_by': 'skeleton_skull',
    'minecraft:custom': 'compass'
};

// Strict Order enforcement for stat categories
const CATEGORY_ORDER = [
    'minecraft:custom',
    'minecraft:mined',
    'minecraft:killed',
    'minecraft:killed_by',
    'minecraft:crafted',
    'minecraft:used',
    'minecraft:broken',
    'minecraft:picked_up',
    'minecraft:dropped'
];

const CUSTOM_STAT_ICONS = {
            // Movement & Travel
            'walk_one_cm': 'leather_boots',
            'sprint_one_cm': 'leather_boots',
            'crouch_one_cm': 'leather_boots',
            'sneak_time': 'leather_boots',
            'fall_one_cm': 'iron_boots',
            'fly_one_cm': 'feather',
            'aviate_one_cm': 'elytra',
            'swim_one_cm': 'water_bucket',
            'walk_on_water_one_cm': 'lily_pad',
            'walk_under_water_one_cm': 'turtle_helmet',
            'climb_one_cm': 'ladder',
            'horse_one_cm': 'saddle',
            'boat_one_cm': 'oak_boat',
            'minecart_one_cm': 'minecart',
            'happy_ghast_one_cm': 'ghast_tear',
            
            // Time
            'play_time': 'clock',
            'play_one_minute': 'clock',
            'total_world_time': 'clock',
            'time_since_death': 'skeleton_skull',
            'time_since_rest': 'white_bed',
            
            // Combat & Damage
            'damage_dealt': 'iron_sword',
            'damage_taken': 'iron_chestplate',
            'damage_resisted': 'shield',
            'damage_blocked_by_shield': 'shield',
            'damage_absorbed': 'golden_apple',
            'mob_kills': 'diamond_sword',
            'player_kills': 'diamond_sword',
            'deaths': 'skeleton_skull',
            
            // Containers & Storage
            'open_chest': 'chest',
            'open_enderchest': 'ender_chest',
            'open_shulker_box': 'shulker_box',
            'open_barrel': 'barrel',
            'inspect_hopper': 'hopper',
            'inspect_dropper': 'dropper',
            'inspect_dispenser': 'dispenser',
            
            // Workstations & Blocks
            'interact_with_crafting_table': 'crafting_table',
            'interact_with_furnace': 'furnace',
            'interact_with_smoker': 'smoker',
            'interact_with_blast_furnace': 'blast_furnace',
            'interact_with_stonecutter': 'stonecutter',
            'interact_with_brewingstand': 'brewing_stand',
            'interact_with_beacon': 'beacon',
            'interact_with_anvil': 'anvil',
            'interact_with_loom': 'loom',
            'interact_with_smithing_table': 'smithing_table',
            'interact_with_lectern': 'lectern',
            'use_cauldron': 'cauldron',
            'fill_cauldron': 'water_bucket',
            'tune_noteblock': 'note_block',
            'play_noteblock': 'note_block',
            'bell_ring': 'bell',
            'pot_flower': 'flower_pot',
            
            // Interactions & General
            'jump': 'rabbit_foot',
            'drop': 'hopper',
            'leave_game': 'dark_oak_door',
            'sleep_in_bed': 'red_bed',
            'animals_bred': 'wheat',
            'talked_to_villager': 'emerald',
            'traded_with_villager': 'emerald'
        };

const ITEM_NAME_MAPPINGS = {
    'carrots': 'carrot', 'potatoes': 'potato', 'iron_chain': 'chain',
    'wall_torch': 'torch', 'soul_wall_torch': 'soul_torch', 
    'redstone_wall_torch': 'redstone_torch', 'cave_vines': 'glow_berries',
    'cave_vines_plant': 'glow_berries', 'weeping_vines_plant': 'weeping_vines',
    'twisting_vines_plant': 'twisting_vines', 'sweet_berry_bush': 'sweet_berries',
    'melon_stem': 'melon_seeds', 'pumpkin_stem': 'pumpkin_seeds',
    'kelp_plant': 'kelp', 'bamboo_sapling': 'bamboo', 'cocoa': 'cocoa_beans'
};

async function init() {
    try {
        const response = await fetch(`${BASE_URL}/usercache.json`);
        if (!response.ok) throw new Error("Could not fetch usercache");
        const users = await response.json();
        renderUserList(users);
    } catch (error) {
        document.getElementById('user-list').innerHTML = '<p style="color: var(--danger); padding: 20px;">Failed to load player list.</p>';
    }
}

function renderUserList(users) {
    const list = document.getElementById('user-list');
    list.innerHTML = '';
    
    users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-card';
        div.id = `user-${user.uuid}`;
        div.onclick = () => loadUserStats(user.uuid, user.name);
        
        const img = document.createElement('img');
        img.src = `https://mc-heads.net/avatar/${user.uuid}/36`; 
        img.loading = "lazy";
        
        const name = document.createElement('span');
        name.innerText = user.name;
        
        div.appendChild(img);
        div.appendChild(name);
        list.appendChild(div);
    });
}

function formatName(str) {
    if (!str) return '';
    return str.replace('minecraft:', '').split('_').join(' ');
}

function formatWikiFaceName(str, useAlternative = false) {
    const camelCaseName = str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('_');
    return `https://minecraft.wiki/images/${camelCaseName}_face${useAlternative ? '_1' : ''}.png`;
}

// Fallback Handlers
window.handleMobImgError = function(img, nextSrc1, nextSrc2, finalSrc) {
    if (!img.dataset.errorStage) {
        img.dataset.errorStage = "1"; img.src = nextSrc1; 
    } else if (img.dataset.errorStage === "1") {
        img.dataset.errorStage = "2"; img.src = nextSrc2; 
    } else if (img.dataset.errorStage === "2") {
        img.dataset.errorStage = "3"; img.onerror = null; img.src = finalSrc; 
    }
}

window.handleItemImgError = function(img, rawItemName) {
    const baseUrl = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/block/`;
    if (!img.dataset.errorStage) {
        img.dataset.errorStage = "1"; img.src = `${baseUrl}${rawItemName}.png`;
    } else if (img.dataset.errorStage === "1") {
        img.dataset.errorStage = "2"; img.src = `${baseUrl}${rawItemName}_top.png`;
    } else if (img.dataset.errorStage === "2") {
        img.dataset.errorStage = "3"; img.src = `${baseUrl}${rawItemName}_0.png`;
    } else if (img.dataset.errorStage === "3") {
        img.dataset.errorStage = "4"; img.onerror = null; 
        img.src = `https://blocksitems.com/api/v1/items/minecraft:paper/icon`;
    }
}

// Formatters
function formatTicksToTime(ticks) {
    if (!ticks || ticks === 0) return '0m';
    let totalSeconds = Math.floor(ticks / 20);
    let days = Math.floor(totalSeconds / 86400);
    let hours = Math.floor((totalSeconds % 86400) / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    
    let result = [];
    if (days > 0) result.push(`${days}d`);
    if (hours > 0) result.push(`${hours}h`);
    if (minutes > 0 || result.length === 0) result.push(`${minutes}m`);
    return result.join(' ');
}

function formatDistance(cm) {
    if (!cm || cm === 0) return '0 km';
    return `${(cm / 100000).toFixed(2)} km`;
}

function formatStatValue(key, value) {
    if (key.includes('one_cm')) return formatDistance(value);
    if (key.includes('time') || key.includes('minute')) return formatTicksToTime(value);
    if (key.includes('damage')) return (value / 2).toLocaleString() + ' ♥';
    return value.toLocaleString();
}

// Global function to toggle grid expansion
window.toggleExpand = function(gridId, btnElement) {
    const grid = document.getElementById(gridId);
    if (grid) {
        const isExpanded = grid.classList.toggle('expanded');
        const textSpan = btnElement.querySelector('span');
        textSpan.innerText = isExpanded ? 'Show Less' : 'Show All';
    }
}

// Main Loader
async function loadUserStats(uuid, username) {
    const container = document.getElementById('stats-container');
    
    container.innerHTML = `
        <div class="dashboard-grid">
            <div class="profile-panel"><div class="skeleton" style="width:140px;height:310px;margin:0 auto 20px;border-radius:12px"></div><div class="skeleton" style="width:100px;height:24px;margin:0 auto"></div></div>
            <div class="stats-content"><div class="hero-stats-grid"><div class="skeleton" style="height:120px;border-radius:20px"></div><div class="skeleton" style="height:120px;border-radius:20px"></div><div class="skeleton" style="height:120px;border-radius:20px"></div></div></div>
        </div>`;
    
    document.querySelectorAll('.user-card').forEach(el => el.classList.remove('active'));
    const activeCard = document.getElementById(`user-${uuid}`);
    if(activeCard) {
        activeCard.classList.add('active');
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    try {
        const response = await fetch(`${BASE_URL}/stats/${uuid}.json`);
        if (!response.ok) throw new Error('Stats not found');
        const data = await response.json();
        
        if (data.stats) {
            renderStats(username, uuid, data.stats);
        } else {
            container.innerHTML = `<div class="hero-empty-state"><h2>Error</h2><p>Invalid stats format for ${username}.</p></div>`;
        }
    } catch (error) {
        container.innerHTML = `<div class="hero-empty-state"><h2 style="color:var(--danger)">Error</h2><p>Could not find stat data for ${username}.</p></div>`;
    }
}

function renderStats(username, uuid, statsData) {
    const container = document.getElementById('stats-container');
    const customStats = statsData['minecraft:custom'] || {};
    
    const playTicks = customStats['minecraft:play_time'] || customStats['minecraft:play_one_minute'] || 0;
    const totalDistanceCm = Object.keys(customStats).filter(key => key.includes('one_cm')).reduce((sum, key) => sum + customStats[key], 0);
    const blocksMined = Object.values(statsData['minecraft:mined'] || {}).reduce((a, b) => a + b, 0);

    let htmlStr = `
        <div class="dashboard-grid">
            <aside class="profile-panel">
                <img src="https://mc-heads.net/body/${uuid}/right" alt="${username}" class="profile-avatar" onerror="this.src='https://crafatar.com/renders/body/${uuid}'">
                <h2 class="profile-name">${username}</h2>
                <div class="profile-uuid">${uuid}</div>
            </aside>
            
            <div class="stats-content">
                <div class="hero-stats-grid">
                    <div class="hero-stat-card">
                        <span class="hero-stat-label">Play Time</span>
                        <span class="hero-stat-value">${formatTicksToTime(playTicks)}</span>
                    </div>
                    <div class="hero-stat-card">
                        <span class="hero-stat-label">Distance Travelled</span>
                        <span class="hero-stat-value">${formatDistance(totalDistanceCm)}</span>
                    </div>
                    <div class="hero-stat-card">
                        <span class="hero-stat-label">Blocks Mined</span>
                        <span class="hero-stat-value">${blocksMined.toLocaleString()}</span>
                    </div>
                    <div class="hero-stat-card">
                        <span class="hero-stat-label">Mob Kills</span>
                        <span class="hero-stat-value">${(customStats['minecraft:mob_kills'] || 0).toLocaleString()}</span>
                    </div>
                </div>
    `;

    const availableCategories = Object.keys(statsData);
    const finalCategoryOrder = [...new Set([...CATEGORY_ORDER, ...availableCategories])];

    for (const category of finalCategoryOrder) {
        const items = statsData[category];
        if (!items || Object.keys(items).length === 0) continue;
        
        const catIconName = CATEGORY_ICONS[category] || 'chest';
        const isMobCategory = (category === 'minecraft:killed' || category === 'minecraft:killed_by');
        const isCustomCategory = (category === 'minecraft:custom');
        
        const sortedItems = Object.entries(items).sort((a, b) => b[1] - a[1]);
        const itemCount = sortedItems.length;
        const gridId = `grid-${category.replace('minecraft:', '')}`;

        // data-count is used by CSS to auto-hide the expand button on large screens if not needed
        htmlStr += `
            <section class="stat-section" data-count="${itemCount}">
                <div class="stat-section-header">
                    <img src="https://blocksitems.com/api/v1/items/minecraft:${catIconName}/icon" alt="icon">
                    <h3>${formatName(category)} <span class="stat-category-count">${itemCount}</span></h3>
                </div>
                <div class="stat-grid" id="${gridId}">
        `;

        for (const [item, value] of sortedItems) {
            const itemClean = item.replace('minecraft:', '');
            let iconHtml = '';

            if (isMobCategory) {
                if (itemClean === 'player') {
                    iconHtml = `<img src="https://tabavatars.net/avatar/?username=Steve" alt="player" loading="lazy">`;
                } else {
                    const primaryUrl = formatWikiFaceName(itemClean, false);
                    const secondaryUrl = formatWikiFaceName(itemClean, true);
                    const eggUrl = `https://blocksitems.com/api/v1/items/minecraft:${itemClean}_spawn_egg/icon`;
                    const fallbackUrl = `https://blocksitems.com/api/v1/items/minecraft:paper/icon`;
                    iconHtml = `<img src="${primaryUrl}" onerror="handleMobImgError(this, '${secondaryUrl}', '${eggUrl}', '${fallbackUrl}')" alt="mob" loading="lazy">`;
                }
            } 
            else if (isCustomCategory) {
                const mappedItem = CUSTOM_STAT_ICONS[itemClean] || 'map';
                iconHtml = `<img src="https://blocksitems.com/api/v1/items/minecraft:${mappedItem}/icon" onerror="this.src='https://blocksitems.com/api/v1/items/minecraft:paper/icon'" alt="stat_icon" loading="lazy">`;
            } 
            else {
                let resolvedName = itemClean.replace('_wall_sign', '_sign');
                const mappedItem = ITEM_NAME_MAPPINGS[resolvedName] || resolvedName;
                iconHtml = `<img src="https://blocksitems.com/api/v1/items/minecraft:${mappedItem}/icon" onerror="handleItemImgError(this, '${resolvedName}')" alt="icon" loading="lazy">`;
            }

            htmlStr += `
                <div class="stat-item">
                    ${iconHtml}
                    <div class="stat-info">
                        <span class="stat-name">${formatName(item)}</span>
                        <span class="stat-value">${formatStatValue(itemClean, value)}</span>
                    </div>
                </div>
            `;
        }
        
        htmlStr += `</div>`; // Close .stat-grid
        
        // Append Expand Button if threshold requires it (> 4 for mobile base threshold)
        if (itemCount > 4) {
            htmlStr += `
                <div class="expand-action">
                    <button class="expand-btn" onclick="toggleExpand('${gridId}', this)">
                        <span>Show All</span>
                        <svg viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
                    </button>
                </div>
            `;
        }

        htmlStr += `</section>`;
    }

    htmlStr += `</div></div>`;
    container.innerHTML = htmlStr;
}

window.onload = init;