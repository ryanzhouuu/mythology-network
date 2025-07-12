# Interactive Mythology Network Visualizer

A single-page web application that displays an interactive network graph visualizing the relationships of Greek mythological figures, with a focus on Zeus's dynasty.

## Features

- **Interactive Network Graph**: Visualize mythological relationships using vis.js
- **Responsive Design**: Works on desktop and mobile devices
- **CSV Data Loading**: Loads node and edge data from CSV files
- **Interactive Features**: Hover, zoom, drag, and click interactions
- **Automatic Layout**: Physics-based positioning for optimal visualization

## Project Structure

```
cc303_final/
├── index.html          # Main HTML file
├── style.css           # CSS styling
├── script.js           # JavaScript logic
├── nodes.csv           # Character data (nodes)
├── edges.csv           # Relationship data (edges)
└── README.md           # This file
```

## How to Use

1. **Setup**: Place your `nodes.csv` and `edges.csv` files in the same directory as `index.html`
2. **Open**: Open `index.html` in a modern web browser
3. **Interact**:
   - Drag nodes to reposition them
   - Scroll to zoom in/out
   - Hover over nodes to see tooltips
   - Click nodes to see details in the console

## Data Format

### nodes.csv

Must contain columns: `id`, `label`, `group`, `title`

```csv
id,label,group,title
1,Zeus,god,King of the Gods
2,Hera,goddess,Queen of the Gods
```

### edges.csv

Must contain columns: `from`, `to`, `label`, `dashes`

```csv
from,to,label,dashes
1,2,married,false
1,3,brother,false
```

## Technical Details

- **Framework**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **Visualization Library**: vis.js Network (loaded from CDN)
- **Data Parsing**: Custom CSV parser with quoted value support
- **Error Handling**: Comprehensive error messages and console logging

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

If the network doesn't load:

1. Check that `nodes.csv` and `edges.csv` are in the same directory as `index.html`
2. Open browser developer tools (F12) and check the console for error messages
3. Ensure your CSV files follow the required format
4. Try opening the page through a local web server (not just double-clicking the file)

## Customization

You can customize the network appearance by modifying the `options` object in `script.js`:

- Change node colors and sizes
- Adjust physics settings
- Modify edge styles
- Add custom interactions
