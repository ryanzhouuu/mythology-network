// Ancient Greek Mythology Network Visualizer with D3.js

// Wait for the DOM to be fully loaded before executing any code
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing D3.js network...");
  initNetwork();
});

/**
 * Main function to initialize the mythological network visualization
 * This function handles data loading, parsing, and D3.js network creation
 */
async function initNetwork() {
  try {
    console.log("Starting D3.js network initialization...");

    // Step 1: Load CSV data files
    console.log("Loading CSV data files...");
    const nodesText = await fetch("nodes.csv");
    const edgesText = await fetch("edges.csv");

    if (!nodesText.ok || !edgesText.ok) {
      throw new Error(
        "Failed to load CSV files. Please ensure nodes.csv and edges.csv are in the same directory."
      );
    }

    const nodesCsv = await nodesText.text();
    const edgesCsv = await edgesText.text();

    console.log("CSV files loaded successfully");

    // Step 2: Parse CSV data into JavaScript objects
    console.log("Parsing CSV data...");
    const nodes = parseCSV(nodesCsv);
    const edges = parseCSV(edgesCsv);

    console.log(`Parsed ${nodes.length} nodes and ${edges.length} edges`);

    // Step 3: Transform data for D3.js
    console.log("Transforming data for D3.js...");
    const transformedNodes = nodes.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      description: node.description,
      size: getNodeSize(node.id, node.name, node.type),
      color: getNodeColor(node.type),
    }));

    const transformedEdges = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      relationship_type: edge.relationship_type,
      myth_summary: edge.myth_summary,
      color: getEdgeColor(edge.relationship_type),
      width: getEdgeWidth(edge.relationship_type),
      isDashed: edge.relationship_type.includes("affair"),
      label: formatRelationshipLabel(edge.relationship_type),
    }));

    console.log("Transformed nodes:", transformedNodes);
    console.log("Transformed edges:", transformedEdges);

    // Step 4: Create D3.js visualization
    console.log("Creating D3.js network...");
    createD3Network(transformedNodes, transformedEdges);

    console.log("D3.js network initialization complete!");
  } catch (error) {
    console.error("Error initializing network:", error);
    displayError(error.message);
  }
}

/**
 * Format relationship label for display
 * @param {string} relationshipType - The type of relationship
 * @returns {string} Formatted label
 */
function formatRelationshipLabel(relationshipType) {
  if (relationshipType === "affair_abduction") return "affair (abduction)";
  if (relationshipType === "affair_deception") return "affair (deception)";
  return relationshipType;
}

/**
 * Create the D3.js force-directed network visualization
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 */
function createD3Network(nodes, edges) {
  // Get the container dimensions
  const container = document.getElementById("myth-network");
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Create SVG
  const svg = d3
    .select("#myth-network")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "transparent");

  const wrapper = svg.append("g");

  // Create tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Create force simulation with better parameters
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(edges)
        .id((d) => d.id)
        .distance(function (d) {
          if (d.relationship_type === "parent_of") {
            return 280; // Longer distance for children
          }
          return 150; // Shorter distance for wives/lovers
        }) // Increased distance
    )
    .force("charge", d3.forceManyBody().strength(-700)) // Stronger repulsion
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "collision",
      d3.forceCollide().radius((d) => d.size + 10) // Increased collision radius
    )
    .force("x", d3.forceX(width / 2).strength(0.1)) // Keep nodes centered horizontally
    .force("y", d3.forceY(height / 2).strength(0.1)); // Keep nodes centered vertically

  // Create links (edges)
  const link = wrapper
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(edges)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", (d) => d.color)
    .style("stroke-width", (d) => d.width)
    .style("stroke-dasharray", (d) => (d.isDashed ? "8,4" : "none"))
    .style("stroke-opacity", 0.7)
    .on("mouseover", function (event, d) {
      d3.select(this)
        .style("stroke-opacity", 1)
        .style("stroke-width", d.width + 2);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `
                <strong>${d.label}</strong><br/>
                ${d.myth_summary}
            `
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .style("stroke-opacity", 0.7)
        .style("stroke-width", d.width);
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Create nodes
  const node = wrapper
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  // Add circles to nodes
  node
    .append("circle")
    .attr("r", (d) => d.size)
    .style("fill", (d) => d.color)
    .style("stroke", "#8b4513")
    .style("stroke-width", 2)
    .style("filter", "drop-shadow(2px 2px 4px rgba(139, 69, 19, 0.3))");

  // Add text labels to nodes
  node
    .append("text")
    .attr("class", "node-text")
    .attr("dy", ".35em")
    .text((d) => d.name)
    .style("font-size", (d) => Math.max(10, d.size / 2) + "px");

  // Add hover effects for nodes
  node
    .on("mouseover", function (event, d) {
      d3.select(this)
        .select("circle")
        .style("stroke-width", 4)
        .style("stroke", "#2c1810");

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `
            <strong>${d.name}</strong><br/>
            <em>${d.type}</em><br/>
            ${d.description}
        `
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .select("circle")
        .style("stroke-width", 2)
        .style("stroke", "#8b4513");

      tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("click", function (event, d) {
      console.log("Clicked on node:", d);
      // Highlight connected nodes and edges
      highlightConnections(d.id);
    });

  // Update positions on simulation tick
  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });

  // Drag functions with improved behavior
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    // Don't fix position after drag to allow natural movement
    d.fx = null;
    d.fy = null;
  }

  function highlightConnections(nodeId) {
    const isConnected = (d) => d.source.id === nodeId || d.target.id === nodeId;
    const isConnectedNode = (n) =>
      n.id === nodeId ||
      edges.some(
        (edge) =>
          (edge.source.id === n.id && edge.target.id === nodeId) ||
          (edge.target.id === n.id && edge.source.id === nodeId)
      );

    // Fade everything
    node.style("opacity", 0.2);
    link.style("opacity", 0.1);

    // Highlight connected links
    link.filter(isConnected).style("opacity", 1);

    // Highlight connected nodes
    node.filter(isConnectedNode).style("opacity", 1);
  }

  // You might also want a function to reset the highlighting
  // when clicking the background.
  svg.on("click", () => {
    node.style("opacity", 1);
    link.style("opacity", 0.7);
  });

  // Important: Make sure the node click stops propagation so it doesn't
  // trigger the svg click.
  node.on("click", function (event, d) {
    event.stopPropagation(); // Prevents the svg click from firing
    highlightConnections(d.id);
  });

  // Add zoom functionality
  const zoom = d3
    .zoom()
    .scaleExtent([0.5, 3])
    .on("zoom", (event) => {
      wrapper.attr("transform", event.transform);
    });

  svg.call(zoom);
}

/**
 * Get node color based on character type
 * @param {string} type - The character type
 * @returns {string} Color for the node
 */
function getNodeColor(type) {
  const colors = {
    deity: "#d2691e", // Chocolate for deities
    titaness: "#cd853f", // Peru for titanesses
    nymph: "#daa520", // Goldenrod for nymphs
    mortal: "#8B4513", // Saddle brown for mortals
    hero: "#a0522d", // NEW: Sienna for heroes
    demigod: "#b8860b", // NEW: Dark goldenrod for demigods
    group: "#708090", // NEW: Slate gray for groups (Muses, Fates, etc.)
  };
  return colors[type] || "#666"; // Default color
}

/**
 * Get node size based on character type and importance
 * @param {string} id - The node id
 * @param {string} name - The character name
 * @param {string} type - The character type
 * @returns {number} Size for the node
 */
function getNodeSize(id, name, type) {
  // Zeus should be the largest
  if (name === "Zeus" || id === "zeus") {
    return 35;
  }

  // Other deities and heroes should be large
  if (type === "deity" || type === "hero") {
    // NEW: heroes are also large
    return 25;
  }

  // Titanesses should be medium-large
  if (type === "titaness") {
    return 22;
  }

  // Demigods are medium
  if (type === "demigod") {
    // NEW
    return 20;
  }

  // Nymphs should be smaller
  if (type === "nymph") {
    return 18;
  }

  // Groups are next
  if (type === "group") {
    // NEW
    return 16;
  }

  // Mortals should be the smallest
  if (type === "mortal") {
    return 15;
  }

  return 20; // Default size
}

/**
 * Get edge color based on relationship type - matching legend colors
 * @param {string} relationshipType - The type of relationship
 * @returns {string} Color for the edge
 */
function getEdgeColor(relationshipType) {
  // Corrected order: Most specific checks first!
  if (relationshipType.includes("marriage")) return "#2e8b57"; // Sea green
  if (relationshipType.includes("abduction")) return "#ff8c00"; // Dark orange
  if (relationshipType.includes("deception")) return "#9932cc"; // Dark orchid
  if (relationshipType.includes("affair")) return "#dc143c"; // Crimson
  if (relationshipType.includes("parent_of")) return "#666666"; // NEW: Dark gray for parent-child links

  return "#8b4513"; // Saddle brown default
}

/**
 * Get edge width based on relationship type
 * @param {string} relationshipType - The type of relationship
 * @returns {number} Width for the edge
 */
function getEdgeWidth(relationshipType) {
  if (relationshipType.includes("marriage")) return 3;
  if (relationshipType.includes("affair")) return 2;
  if (relationshipType.includes("parent_of")) return 1.5; // NEW: Thin line for parent-child

  return 2;
}

/**
 * Parse CSV text into an array of JavaScript objects
 * @param {string} csvText - The raw CSV text content
 * @returns {Array} Array of objects where keys are column headers
 */
function parseCSV(csvText) {
  // Split the CSV text into lines
  const lines = csvText.trim().split("\n");

  if (lines.length < 2) {
    throw new Error(
      "CSV file must have at least a header row and one data row"
    );
  }

  // Parse the header row to get column names
  const headers = lines[0].split(",").map((header) => header.trim());

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue; // Skip empty lines

    // Split the line by commas, but handle quoted values
    const values = splitCSVLine(line);

    // Create an object for this row
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    data.push(row);
  }

  return data;
}

/**
 * Split a CSV line by commas, properly handling quoted values
 * @param {string} line - A single CSV line
 * @returns {Array} Array of values
 */
function splitCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last value
  result.push(current.trim());

  return result;
}

/**
 * Display error message to the user
 * @param {string} message - Error message to display
 */
function displayError(message) {
  const container = document.getElementById("myth-network");
  if (container) {
    container.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #721c24;
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 4px;
                padding: 20px;
                text-align: center;
                font-family: 'Crimson Text', serif;
            ">
                <div>
                    <h3>Error Loading Network</h3>
                    <p>${message}</p>
                    <p>Please check the browser console for more details.</p>
                </div>
            </div>
        `;
  }
}
