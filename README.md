# Sagaing Fault Seismicity Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Data: USGS](https://img.shields.io/badge/Data-USGS-blue.svg)](https://earthquake.usgs.gov/)
[![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub%20Pages-brightgreen.svg)](https://pages.github.com/)

An interactive dashboard visualizing earthquake activity along Myanmar's Sagaing Fault system following the devastating M 7.7 Mandalay earthquake on March 28, 2025.

![Dashboard Preview](preview.png)

## 🌟 Features

### Interactive Map
- **Earthquake markers** color-coded by magnitude
- **Tectonic fault lines** overlay from Myanmar Tectonic Map 2011
- **Click popups** with detailed earthquake information
- **Layer toggles** to show/hide data layers

### Data Visualizations
- **Timeline Chart**: Daily earthquake frequency
- **Magnitude Distribution**: Doughnut chart of magnitude ranges
- **Depth Analysis**: Bar chart of event depths
- **Cumulative Events**: Growth of earthquake sequence over time
- **Monthly Distribution**: Events grouped by month
- **Magnitude vs Depth**: Scatter plot correlation analysis

### Statistics Dashboard
- Total earthquake events
- Maximum magnitude recorded
- Strong events (M ≥ 5.0)
- Average event depth
- Daily average events

### Major Events Table
- Sortable list of significant earthquakes (M ≥ 5.0)
- Click-to-zoom functionality on map

## 🚀 Live Demo

Deploy to GitHub Pages:
1. Fork or push this repository to your GitHub account
2. Go to **Settings** → **Pages**
3. Select **Source**: Deploy from a branch
4. Select **Branch**: `main` and folder `/ (root)`
5. Click Save

Your dashboard will be available at: `https://[username].github.io/sagaing-dashboard/`

## 📁 Project Structure

```
sagaing-dashboard/
├── index.html      # Main HTML structure
├── styles.css      # Dashboard styling (responsive)
├── data.js         # Earthquake data (GeoJSON)
├── app.js          # Main application logic
└── README.md       # This file
```

## 🔧 Technologies Used

| Technology | Purpose |
|-----------|---------|
| **HTML5/CSS3** | Structure and styling |
| **JavaScript** | Application logic |
| **Leaflet.js** | Interactive mapping |
| **Chart.js** | Data visualization |
| **Google Fonts** | Typography (Inter) |

All dependencies are loaded via CDN - no build process required!

## 📊 Data Sources

### Earthquake Data
- **Source**: USGS Earthquake Hazards Program
- **API**: [FDSNWS Event Query](https://earthquake.usgs.gov/fdsnws/event/1/)
- **Time Range**: March 28 - December 10, 2025
- **Bounding Box**: 95.27°E - 96.80°E, 18.38°N - 23.87°N
- **Minimum Magnitude**: 2.5
- **Total Events**: 83 earthquakes

### Tectonic Lineaments
- **Source**: Myanmar Tectonic Map 2011
- **Repository**: [myanmar-earthquake-archive](https://github.com/drtinkooo/myanmar-earthquake-archive)

## 📈 The 2025 Myanmar Earthquake Sequence

### Main Event: M 7.7 Mandalay Earthquake

| Parameter | Value |
|-----------|-------|
| **Date & Time** | March 28, 2025, 06:20:52 UTC |
| **Epicenter** | 22.001°N, 95.925°E |
| **Depth** | 10 km |
| **Magnitude** | 7.7 Mw |
| **Rupture Length** | ~500-510 km |

### Sagaing Fault System
- **Length**: 1,200-1,500 km
- **Type**: Right-lateral strike-slip
- **Slip Rate**: 18-24 mm/year

## 🎨 Customization

### Update Earthquake Data

To refresh with latest USGS data, update `data.js`:

```javascript
// Fetch fresh data using USGS API
const apiUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2025-03-28&endtime=${new Date().toISOString().split('T')[0]}&minlatitude=18.375256&maxlatitude=23.871374&minlongitude=95.270039&maxlongitude=96.797532&minmagnitude=2.5&orderby=time-asc`;
```

### Modify Styling

Edit `styles.css` to customize:
- Color scheme (CSS variables in `:root`)
- Card layouts
- Chart dimensions
- Responsive breakpoints

## 📄 License

This project is licensed under the MIT License.

### Data Licenses

| Dataset | License |
|---------|---------|
| Earthquake data | Public domain (USGS) |
| Tectonic lineaments | Open data |

## 👤 Author

**Tin Ko Oo**
- GitHub: [@drtinkooo](https://github.com/drtinkooo)
- Affiliation: Mahidol University, Thailand

## 🙏 Acknowledgments

- [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/) for real-time earthquake data
- [Leaflet.js](https://leafletjs.com/) for the mapping library
- [Chart.js](https://www.chartjs.org/) for data visualization
- [CARTO](https://carto.com/) for dark basemap tiles
- Myanmar Geosciences Society for tectonic data

---

<p align="center">
  <i>Created for seismic hazard awareness and public education</i>
  <br>
  <i>In memory of those affected by the 2025 Myanmar earthquake</i>
</p>
