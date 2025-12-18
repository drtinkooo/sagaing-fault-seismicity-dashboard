// =====================================================
// Sagaing Fault Seismicity Dashboard - Main Application
// =====================================================

// Global variables
let map;
let earthquakeLayer;
let tectonicLayer;
const allQuakes = earthquakeData.features;

// Chart instances
let timelineChart, magnitudeChart, depthChart, cumulativeChart, monthlyChart, scatterChart;

// =====================================================
// Initialization
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeCharts();
    updateStats();
    populateMajorEventsTable();
    setupEventListeners();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 1000);
});

// =====================================================
// Map Functions
// =====================================================

function initializeMap() {
    // Create map centered on Sagaing Fault region
    map = L.map('map', {
        center: [21.9, 96.0],
        zoom: 7,
        zoomControl: true
    });

    // Dark basemap
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
    }).addTo(map);

    // Add earthquakes layer
    createEarthquakeLayer();
    
    // Load tectonic lineaments
    loadTectonicData();
}

function getMarkerStyle(magnitude) {
    let radius, color;
    if (magnitude >= 7.0) { radius = 14; color = '#8B0000'; }
    else if (magnitude >= 6.0) { radius = 11; color = '#DC143C'; }
    else if (magnitude >= 5.0) { radius = 8; color = '#FF4500'; }
    else if (magnitude >= 4.0) { radius = 6; color = '#FF6347'; }
    else { radius = 4; color = '#FFA07A'; }
    
    return {
        radius: radius,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
    };
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function createEarthquakeLayer() {
    if (earthquakeLayer) {
        map.removeLayer(earthquakeLayer);
    }
    
    earthquakeLayer = L.geoJSON(allQuakes, {
        pointToLayer: function(feature, latlng) {
            const props = feature.properties;
            const coords = feature.geometry.coordinates;
            
            const marker = L.circleMarker(latlng, getMarkerStyle(props.mag));
            
            const popupContent = `
                <div style="font-family: 'Inter', sans-serif; min-width: 200px;">
                    <h3 style="margin: 0 0 8px; color: #ef4444; font-size: 1.1rem;">M ${props.mag} Earthquake</h3>
                    <p style="margin: 4px 0;"><strong>Location:</strong> ${props.place}</p>
                    <p style="margin: 4px 0;"><strong>Date:</strong> ${formatDate(props.time)}</p>
                    <p style="margin: 4px 0;"><strong>Depth:</strong> ${coords[2].toFixed(1)} km</p>
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>Coords:</strong> ${coords[1].toFixed(4)}°N, ${coords[0].toFixed(4)}°E</p>
                    ${props.felt ? `<p style="margin: 4px 0; color: #3b82f6;"><strong>Felt Reports:</strong> ${props.felt}</p>` : ''}
                    ${props.url && props.url !== '#' ? `<a href="${props.url}" target="_blank" style="color: #3b82f6; text-decoration: none;">View on USGS →</a>` : ''}
                </div>
            `;
            
            marker.bindPopup(popupContent);
            return marker;
        }
    }).addTo(map);
}

function loadTectonicData() {
    fetch(tectonicDataUrl)
        .then(response => response.json())
        .then(data => {
            tectonicLayer = L.geoJSON(data, {
                style: {
                    color: '#3b82f6',
                    weight: 2.5,
                    opacity: 0.8
                },
                onEachFeature: function(feature, layer) {
                    if (feature.properties) {
                        let content = '<div style="font-family: Inter, sans-serif;"><h4 style="color: #3b82f6; margin: 0 0 6px;">Tectonic Feature</h4>';
                        for (let key in feature.properties) {
                            if (feature.properties[key]) {
                                content += `<p style="margin: 2px 0; font-size: 11px;"><strong>${key}:</strong> ${feature.properties[key]}</p>`;
                            }
                        }
                        layer.bindPopup(content + '</div>');
                    }
                }
            }).addTo(map);
        })
        .catch(error => {
            console.warn('Could not load tectonic data:', error);
        });
}

// =====================================================
// Statistics Functions
// =====================================================

function updateStats() {
    const magnitudes = allQuakes.map(f => f.properties.mag);
    const depths = allQuakes.map(f => f.geometry.coordinates[2]);
    
    // Total events
    document.getElementById('total-events').textContent = allQuakes.length;
    
    // Max magnitude
    document.getElementById('max-magnitude').textContent = Math.max(...magnitudes).toFixed(1);
    
    // Strong events (M >= 5.0)
    const strongEvents = allQuakes.filter(f => f.properties.mag >= 5.0).length;
    document.getElementById('strong-events').textContent = strongEvents;
    
    // Average depth
    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
    document.getElementById('avg-depth').textContent = avgDepth.toFixed(1);
    
    // Daily average
    const times = allQuakes.map(f => f.properties.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const daysDiff = (maxTime - minTime) / (1000 * 60 * 60 * 24);
    const dailyAvg = allQuakes.length / Math.max(daysDiff, 1);
    document.getElementById('daily-avg').textContent = dailyAvg.toFixed(2);
}

function populateMajorEventsTable() {
    const majorEvents = allQuakes
        .filter(f => f.properties.mag >= 5.0)
        .sort((a, b) => b.properties.mag - a.properties.mag);
    
    const tbody = document.querySelector('#major-events-table tbody');
    tbody.innerHTML = '';
    
    majorEvents.forEach(event => {
        const props = event.properties;
        const coords = event.geometry.coordinates;
        const date = new Date(props.time);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td><span class="mag-badge ${props.mag >= 6 ? 'mag-high' : 'mag-medium'}">M ${props.mag}</span></td>
            <td>${coords[2].toFixed(1)} km</td>
            <td>${props.place}</td>
        `;
        
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            map.setView([coords[1], coords[0]], 10);
        });
        
        tbody.appendChild(row);
    });
}

// =====================================================
// Chart Functions
// =====================================================

const chartColors = {
    primary: 'rgba(59, 130, 246, 1)',
    primaryFaded: 'rgba(59, 130, 246, 0.3)',
    secondary: 'rgba(16, 185, 129, 1)',
    secondaryFaded: 'rgba(16, 185, 129, 0.3)',
    danger: 'rgba(239, 68, 68, 1)',
    dangerFaded: 'rgba(239, 68, 68, 0.3)',
    warning: 'rgba(245, 158, 11, 1)',
    warningFaded: 'rgba(245, 158, 11, 0.3)',
    text: '#94a3b8',
    grid: 'rgba(51, 65, 85, 0.5)'
};

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: chartColors.text,
                font: { family: 'Inter' }
            }
        }
    },
    scales: {
        x: {
            ticks: { color: chartColors.text },
            grid: { color: chartColors.grid }
        },
        y: {
            ticks: { color: chartColors.text },
            grid: { color: chartColors.grid }
        }
    }
};

function initializeCharts() {
    createTimelineChart();
    createMagnitudeChart();
    createDepthChart();
    createCumulativeChart();
    createMonthlyChart();
    createScatterChart();
}

function createTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    
    // Group events by date
    const eventsByDate = {};
    allQuakes.forEach(event => {
        const date = new Date(event.properties.time).toISOString().split('T')[0];
        eventsByDate[date] = (eventsByDate[date] || 0) + 1;
    });
    
    const sortedDates = Object.keys(eventsByDate).sort();
    
    timelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedDates.map(d => {
                const date = new Date(d);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
                label: 'Earthquakes per Day',
                data: sortedDates.map(d => eventsByDate[d]),
                backgroundColor: chartColors.primaryFaded,
                borderColor: chartColors.primary,
                borderWidth: 1
            }]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { 
                        color: chartColors.text,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { display: false }
                },
                y: {
                    ...chartDefaults.scales.y,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Events',
                        color: chartColors.text
                    }
                }
            }
        }
    });
}

function createMagnitudeChart() {
    const ctx = document.getElementById('magnitudeChart').getContext('2d');
    
    // Group by magnitude ranges
    const magRanges = {
        'M 2.5-3.9': 0,
        'M 4.0-4.9': 0,
        'M 5.0-5.9': 0,
        'M 6.0-6.9': 0,
        'M 7.0+': 0
    };
    
    allQuakes.forEach(event => {
        const mag = event.properties.mag;
        if (mag >= 7.0) magRanges['M 7.0+']++;
        else if (mag >= 6.0) magRanges['M 6.0-6.9']++;
        else if (mag >= 5.0) magRanges['M 5.0-5.9']++;
        else if (mag >= 4.0) magRanges['M 4.0-4.9']++;
        else magRanges['M 2.5-3.9']++;
    });
    
    magnitudeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(magRanges),
            datasets: [{
                data: Object.values(magRanges),
                backgroundColor: [
                    '#FFA07A',
                    '#FF6347',
                    '#FF4500',
                    '#DC143C',
                    '#8B0000'
                ],
                borderColor: '#1e293b',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: chartColors.text,
                        font: { family: 'Inter', size: 11 },
                        padding: 10
                    }
                }
            }
        }
    });
}

function createDepthChart() {
    const ctx = document.getElementById('depthChart').getContext('2d');
    
    // Group by depth ranges
    const depthRanges = {
        '0-10 km': 0,
        '10-20 km': 0,
        '20-30 km': 0,
        '30+ km': 0
    };
    
    allQuakes.forEach(event => {
        const depth = event.geometry.coordinates[2];
        if (depth <= 10) depthRanges['0-10 km']++;
        else if (depth <= 20) depthRanges['10-20 km']++;
        else if (depth <= 30) depthRanges['20-30 km']++;
        else depthRanges['30+ km']++;
    });
    
    depthChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(depthRanges),
            datasets: [{
                label: 'Number of Events',
                data: Object.values(depthRanges),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(59, 130, 246, 0.7)'
                ],
                borderColor: [
                    '#ef4444',
                    '#f59e0b',
                    '#10b981',
                    '#3b82f6'
                ],
                borderWidth: 1
            }]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: chartColors.text },
                    grid: { display: false }
                },
                y: {
                    ...chartDefaults.scales.y,
                    beginAtZero: true
                }
            }
        }
    });
}

function createCumulativeChart() {
    const ctx = document.getElementById('cumulativeChart').getContext('2d');
    
    // Sort events by time and calculate cumulative
    const sortedEvents = [...allQuakes].sort((a, b) => a.properties.time - b.properties.time);
    
    const cumulativeData = sortedEvents.map((event, index) => ({
        x: new Date(event.properties.time),
        y: index + 1
    }));
    
    cumulativeChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Cumulative Events',
                data: cumulativeData,
                borderColor: chartColors.secondary,
                backgroundColor: chartColors.secondaryFaded,
                fill: true,
                tension: 0.1,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    ticks: { color: chartColors.text },
                    grid: { color: chartColors.grid }
                },
                y: {
                    ticks: { color: chartColors.text },
                    grid: { color: chartColors.grid },
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Events',
                        color: chartColors.text
                    }
                }
            }
        }
    });
}

function createMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    // Group by month
    const monthlyData = {};
    allQuakes.forEach(event => {
        const date = new Date(event.properties.time);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMonths.map(m => {
                const [year, month] = m.split('-');
                const date = new Date(year, parseInt(month) - 1);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }),
            datasets: [{
                label: 'Events per Month',
                data: sortedMonths.map(m => monthlyData[m]),
                backgroundColor: chartColors.warningFaded,
                borderColor: chartColors.warning,
                borderWidth: 1
            }]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: chartColors.text },
                    grid: { display: false }
                },
                y: {
                    ...chartDefaults.scales.y,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Events',
                        color: chartColors.text
                    }
                }
            }
        }
    });
}

function createScatterChart() {
    const ctx = document.getElementById('scatterChart').getContext('2d');
    
    const scatterData = allQuakes.map(event => ({
        x: event.geometry.coordinates[2],
        y: event.properties.mag
    }));
    
    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Earthquakes',
                data: scatterData,
                backgroundColor: chartColors.dangerFaded,
                borderColor: chartColors.danger,
                borderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Depth: ${context.parsed.x} km, Mag: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: chartColors.text },
                    grid: { color: chartColors.grid },
                    title: {
                        display: true,
                        text: 'Depth (km)',
                        color: chartColors.text
                    }
                },
                y: {
                    ticks: { color: chartColors.text },
                    grid: { color: chartColors.grid },
                    title: {
                        display: true,
                        text: 'Magnitude',
                        color: chartColors.text
                    }
                }
            }
        }
    });
}

// =====================================================
// Event Listeners
// =====================================================

function setupEventListeners() {
    // Toggle earthquakes layer
    document.getElementById('toggle-earthquakes').addEventListener('change', function() {
        if (this.checked) {
            earthquakeLayer.addTo(map);
        } else {
            map.removeLayer(earthquakeLayer);
        }
    });
    
    // Toggle faults layer
    document.getElementById('toggle-faults').addEventListener('change', function() {
        if (this.checked && tectonicLayer) {
            tectonicLayer.addTo(map);
        } else if (tectonicLayer) {
            map.removeLayer(tectonicLayer);
        }
    });
}

// =====================================================
// Utility Functions
// =====================================================

function analyzeData() {
    const analysis = {
        totalEvents: allQuakes.length,
        magnitudeStats: getMagnitudeStats(),
        depthStats: getDepthStats(),
        temporalStats: getTemporalStats()
    };
    
    console.log('Earthquake Analysis:', analysis);
    return analysis;
}

function getMagnitudeStats() {
    const mags = allQuakes.map(f => f.properties.mag);
    return {
        min: Math.min(...mags),
        max: Math.max(...mags),
        mean: (mags.reduce((a, b) => a + b, 0) / mags.length).toFixed(2),
        eventsAbove5: mags.filter(m => m >= 5).length,
        eventsAbove6: mags.filter(m => m >= 6).length
    };
}

function getDepthStats() {
    const depths = allQuakes.map(f => f.geometry.coordinates[2]);
    return {
        min: Math.min(...depths).toFixed(1),
        max: Math.max(...depths).toFixed(1),
        mean: (depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(1),
        shallow: depths.filter(d => d <= 10).length,
        intermediate: depths.filter(d => d > 10 && d <= 30).length,
        deep: depths.filter(d => d > 30).length
    };
}

function getTemporalStats() {
    const times = allQuakes.map(f => f.properties.time);
    const minTime = new Date(Math.min(...times));
    const maxTime = new Date(Math.max(...times));
    const daysDiff = (maxTime - minTime) / (1000 * 60 * 60 * 24);
    
    return {
        startDate: minTime.toISOString().split('T')[0],
        endDate: maxTime.toISOString().split('T')[0],
        durationDays: Math.round(daysDiff),
        eventsPerDay: (allQuakes.length / daysDiff).toFixed(2)
    };
}

// Run analysis on load
analyzeData();
