// binary search for priority queue
function binarySearch(A, item, low, high, key) {
  let middle,
      middleItem,
      isNum = typeof item == 'number',
      value = isNum ? item : item[key];
  while (low < high) {
    middle = Math.floor((low + high) / 2);
    middleItem = isNum ? A[middle] : A[middle][key];
    if (value < middleItem) {
      high = middle;
    } else if (value > middleItem) {
      low = middle + 1;
    } else {
      return middle;
    }
  }
  return low;
}

// enqueue for priority queue
function enqueue(A, item, key) {
  A.splice(
    binarySearch(A, item, 0, A.length, key),
    0,
    item 
  );
}

class Graph {
  constructor() {
    this.numNodes = 0; 
    this.numEdges = 0;
    this.list = {};
  }

  addNode(node, x = undefined, y = undefined) {
    if (!(node in this.list)) {
      this.list[node] = [];
      this.numNodes += 1;
    } else {
      throw ('node already exists');
    }
  }

  addEdge(from, to, weight) {
    if (from in this.list && to in this.list) {
      this.list[from].push({ 'to': to, 'weight': weight });
      this.numEdges += 1;
    } else {
      throw ('node(s) do(es) not exist');
    }
  }

  dijkstra(from, to) {
    if (from > this.numNodes || to > this.numNodes) {
      throw new RangeError('INVALID from/to VALUES!');
    }
    let current,
        newDistance,
        priorityQueue = [{ 'to': from, 'weight': 0 }],
        visited = {},
        distance = {},
        // previous[A] is A's neighbor such that
        // distance[A] = distance[previous[A]] + (edge b/w A and previous[A])
        previous = {},
        shortestPath = [];
    Object.keys(this.list).forEach(
      node => {
        visited[node] = false;
        distance[node] = node != from ? Infinity : 0;
      }
    );
    while (priorityQueue.length && current != to) {
      current = priorityQueue.shift().to;
      visited[current] = true;  // mark current node as visited
      for (let neighbor of this.list[current]) {
        if (!visited[neighbor.to]) {
          enqueue(priorityQueue, neighbor, 'weight');
          // distance to neighbor through current node is newDistance
          newDistance = distance[current] + neighbor.weight;
          if (newDistance < distance[neighbor.to]) {
            distance[neighbor.to] = newDistance;
            // neighbor's previous node is current node
            previous[neighbor.to] = current;
          }
        }
      }
    }
    while (current in previous && current != from) {
      shortestPath.push(current);
      current = previous[current];
    }
    shortestPath.push(from);
    return [distance[to], shortestPath.reverse()];
  }

  reset() {
    this.numNodes = 0;
    this.numEdges = 0;
    this.list = {};
  }
}

function getElement(id) {
  return document.getElementById(id);
}

function arraySample(A, n) {
  let sample = new Array(n),
      length = A.length,
      taken = new Array(length);
  if (n > length) {
    throw new RangeError('n > array length');
  }
  while (n--) {
    let index = Math.floor(length * Math.random());
    sample[n] = A[index in taken ? taken[index] : index];
    taken[index] = --length in taken ? taken[length] : length;
  }
  return sample;
}

// HTML for SVG circle
function nodeHTML(id, cx, cy, r, stroke, strokeWidth, fill) {
  return (
    `<circle id=node${id} cx=${cx} cy=${cy} r=${r} stroke=${stroke} `
    + `stroke-width=${strokeWidth} fill=${fill}></circle>`
  );
}

// HTML for SVG line
function lineHTML(id, x1, x2, y1, y2, stroke, strokeWidth) {
  return (
    `<line id=line${id} x1=${x1} x2=${x2} y1=${y1} y2=${y2} `
    + `style='stroke: ${stroke}; stroke-width: ${strokeWidth}' />`
  );
}

// calculate Euclidean distance b/w nodes i and j,
// i.e., distance b/w elements with id's 'nodei' and 'nodej'
function distanceBetweenNodes(i, j) {
  let from = getElement(`node${i}`).getBBox(),
      to = getElement(`node${j}`).getBBox();
  return Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2);
}

// graph with n nodes has n * (n - 1) / 2 unique edges
// edge (u, v) = (v, u) if graph is undirected
function setOfAllUniqueEdges(numNodes) {
  let uniqueEdges = [];
  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      uniqueEdges.push(
        { 'from': i, 'to': j, 'weight': distanceBetweenNodes(i, j) }
      )
    }
  }
  return uniqueEdges;
}

// create random graph
function createGraph(field, numNodes) {
  let fieldWidth = parseInt(
        window.getComputedStyle(field).width, 10
      ),
      fieldInnerHTML = '',
      G = new Graph();
  // HTML for each node
  for (let i = 0; i < numNodes; i++) {
    G.addNode(i);  // add node to graph
    fieldInnerHTML += nodeHTML(
      i,
      3 + (fieldWidth - 6) * Math.random(),
      3 + (fieldWidth - 6) * Math.random(),
      2,
      'greenyellow',
      1,
      'black'
    );
  } 
  // field now has HTML for all nodes
  field.innerHTML = fieldInnerHTML;
  return G;
}

// add edges to graph
function connectGraph(field, G, edges) {
  let from,
      to,
      fieldInnerHTML = '';
  for (let edge of edges) {
    from = getElement(`node${edge.from}`).getBBox();
    to = getElement(`node${edge.to}`).getBBox();
    // add edge to graph
    G.addEdge(edge.from, edge.to, edge.weight);
    G.addEdge(edge.to, edge.from, edge.weight);
    // HTML for each edge
    fieldInnerHTML += lineHTML(
      `${edge.from}${edge.to}`,
      from.x + from.width / 2,
      to.x + to.width / 2,
      from.y + from.width / 2,
      to.y + to.width / 2,
      'white',
      0.5
    );
  }
  field.innerHTML += fieldInnerHTML;
}

// input array like [0, 5, 3, 1]
// highlights edge b/w node 0 and 5, then node 5 and 3, and so on
// used to highlight shortest path in graph
function highlightPath(path, color, strokeWidth) {
  let line;
  for (let i = 0; i < path.length - 1; i++) {
    line = getElement(`line${path[i]}${path[i + 1]}`);
    line = line ? line : getElement(`line${path[i + 1]}${path[i]}`); 
    try {
      line.style.stroke = color;
      line.style.strokeWidth = strokeWidth;
    } catch {
      throw new RangeError(
        `line with id 'line${path[i]}${path[i + 1]}' doesn't exist`
      );
    }
  }
}

let box = getElement('box'),
    field = getElement('field'),
    numNodesElement = getElement('numNodes'),
    numEdgesElement = getElement('numEdges'),
    draw = getElement('draw'),
    clear = getElement('clear'),
    fromElement = getElement('from'),
    toElement = getElement('to'),
    calculateShortestPath = getElement('calculateShortestPath'),
    shortestPathLengthElement = getElement('shortestPathLength'),
    shortestPathElement = getElement('shortestPath'),
    boxWidth,
    numNodes,
    numEdges,
    uniqueEdges,
    edges,
    G,  // graph!
    shortestPathLength,
    shortestPath = [];

// box is always a square
let boxHeightAdjust = new ResizeObserver(
  () => {
    boxWidth = window.getComputedStyle(box).width;
    box.style.height = boxWidth;
    boxWidth = parseInt(boxWidth, 10);
  }
);
boxHeightAdjust.observe(box);

function CLEAR() {
  box.style.display = 'none';
  numNodesElement.value = '';
  numEdgesElement.value = '';
  fromElement.value = '';
  toElement.value = '';
  shortestPathLengthElement.style.display = 'none';
  shortestPathElement.style.display = 'none';
  G.reset();
  uniqueEdges = [];
  edges = [];
  shortestPath = [];
}

clear.onclick = () => {
  CLEAR();
}

draw.onclick = () => {
  box.style.display = 'flex';
  // clear previous output
  shortestPath = [];
  shortestPathLengthElement.style.display = 'none';
  shortestPathElement.style.display = 'none';
  // get #nodes and #edges
  numNodes = numNodesElement.value == '' ? 0 : parseInt(numNodesElement.value, 10);
  numEdges = numEdgesElement.value == '' ? 0 : parseInt(numEdgesElement.value, 10);
  // generate graph
  G = createGraph(field, numNodes);
  uniqueEdges = setOfAllUniqueEdges(numNodes);
  try {
    edges = arraySample(uniqueEdges, numEdges);
  } catch {
    alert('#edges SHOULD BE <= #nodes * (#nodes - 1) / 2');
    CLEAR();
  }
  connectGraph(field, G, edges);
}

calculateShortestPath.onclick = () => {
  // remove previous highlights
  highlightPath(shortestPath, 'white', 0.5);
  from = parseInt(fromElement.value, 10);
  to = parseInt(toElement.value, 10);
  try {
    [shortestPathLength, shortestPath] = G.dijkstra(from, to);
  } catch {
    alert('INVALID from/to VALUES!');
    CLEAR();
  }
  // display and highlight shortest path if 
  // shortestPathLength is not null, undefined, and Infinity
  if (shortestPathLength && shortestPathLength != Infinity) {
    highlightPath(shortestPath, 'yellow', 1);  // highlight shortest path
    // HTML for displaying shortest path nodes
    shortestPathElement.innerHTML = (
      'start'
      + shortestPath.map(x => ' - ' + x.toString() + ' - ').reduce((a, b) => a + b)
      + 'end'
    );
    shortestPathElement.style.display = 'flex';
  }
  // HTML for displaying shortest path length
  shortestPathLengthElement.style.display = 'flex';
  shortestPathLengthElement.innerHTML = `shortestPathLength = ${shortestPathLength}`;
}
