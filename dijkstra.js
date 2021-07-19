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

  addNode(node) {
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
        shortestPath = [],  // array to store shortest path nodes
        priorityQueue = [{ 'to': from, 'weight': 0 }],
        visited = {},
        distance = {},
        // previous[A] is A's neighbor such that
        // distance[A] = distance[previous[A]] + (edge b/w A and previous[A])
        previous = {};
    Object.keys(this.list).forEach(
      node => {
        // all nodes are initially unvisited
        visited[node] = false;
        // distance to every node = Infinity
        // distance to start node = 0
        distance[node] = node != from ? Infinity : 0;
      }
    );
    // run loop till priorityQueue empties or end node is reached
    while (priorityQueue.length && current != to) {
      current = priorityQueue.shift().to;  // Get current node
      visited[current] = true;  // mark current node as visited
      for (let neighbor of this.list[current]) {
        if (!visited[neighbor.to]) {
          // add neighbor to priorityQueue (weight is priority)
          enqueue(priorityQueue, neighbor, 'weight');
          // distance to neighbor through current node is newDistance
          newDistance = distance[current] + neighbor.weight;
          // if newDistance < previous distance of neighbor...
          if (newDistance < distance[neighbor.to]) {
            distance[neighbor.to] = newDistance;
            // neighbor's previous node is curreny node
            previous[neighbor.to] = current;
          }
        }
      }
    }
    // get shortest path nodes
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

// pick n elements @ random from an array
function sampleArray(A, n) {
  let sample = new Array(n),
      length = A.length,
      taken = new Array(length);
  if (n > length) {
    throw new RangeError('sampleArray: choose A.length elements or less');
  }
  while (n--) {
    let index = Math.floor(length * Math.random());
    sample[n] = A[index in taken ? taken[index] : index];
    taken[index] = --length in taken ? taken[length] : length;
  }
  return sample;
}

// return HTML of SVG circle with given styles
function nodeHTML(id, cx, cy, r, stroke, strokeWidth, fill) {
  return (
    `<circle id=node${id} cx=${cx} cy=${cy} r=${r} stroke=${stroke} `
    + `stroke-width=${strokeWidth} fill=${fill}></circle>`
  );
}

// return HTML of SVG line with given styles
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

// HTML for nodes' SVG (<circle>)
function sprinkle(field, numNodes) {
  let fieldWidth = parseInt(
        window.getComputedStyle(field).width, 10
      ),
      fieldInnerHTML = '',  // HTML of plot element
      edges = [];  // to store set of all edges (unique)
  G = new Graph();  // initialize a graph
  for (let i = 0; i < numNodes; i++) {
    fieldInnerHTML += nodeHTML(
      i,
      3 + (fieldWidth - 6) * Math.random(),
      3 + (fieldWidth - 6) * Math.random(),
      2,
      'greenyellow',
      1,
      'black'
    );  // add node HTML to field
    G.addNode(i);  // add node to graph
  } 
  // field now has HTML for all nodes
  field.innerHTML = fieldInnerHTML;  
  // create list of all possible edges (unique)
  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      edges.push(
        { 'from': i, 'to': j, 'weight': distanceBetweenNodes(i, j) }
      )
    }
  }
  return [G, edges];  // return graph and set of unique edges
}


// HTML for edges' SVG (<line>)
function connect(field, G, sample, DAG = false) {
  let from,
      to,
      fieldInnerHTML = '',
      // if graph is a DAG, then addEdge(i, j, weight)
      // will only add edge b/w i and j and not j and i
      addEdge = (
        x => x ?
          (i, j, weight) => G.addEdge(i, j, weight) :
          (i, j, weight) => {
            G.addEdge(i, j, weight);
            G.addEdge(j, i, weight);
          }
      )(DAG);
  // add HTML for each edge in sample
  for (let edge of sample) {
    from = getElement(`node${edge.from}`).getBBox();
    to = getElement(`node${edge.to}`).getBBox();
    addEdge(...Object.values(edge));
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
  return G;  // return modified graph
}


// input array like [0, 5, 3, 1]
// highlights edge b/w node 0 and 5, then node 5 and 3, and so on
// used to highlight shortest path in graph
function highlightPath(path, color, strokeWidth) {
  let line;
  for (let i = 0; i < path.length - 1; i++) {
    line = getElement(`line${path[i]}${path[i + 1]}`);
    line = line ? line : getElement(`line${path[i + 1]}${path[i]}`);
    line.style.stroke = color;
    line.style.strokeWidth = strokeWidth;
  }
}


let box = getElement('box'),
    field = getElement('field'),
    clear = getElement('clear'),
    draw = getElement('draw'),
    numNodesElement = getElement('numNodes'),
    numEdgesElement = getElement('numEdges'),
    fromElement = getElement('from'),
    toElement = getElement('to'),
    calculateShortestPath = getElement('calculateShortestPath'),
    shortestPathLengthElement = getElement('shortestPathLength'),
    shortestPathElement = getElement('shortestPath'),
    boxWidth,  // width of element containing SVG of graph
    G,  // graph!
    numNodes,  // number of nodes
    numEdges,  // number of edges
    edges,  // store set of all possible edges
    sample,  // store a sample of edges
    shortestPathLength,
    shortestPath = [];


// reset boxWidth when box is resized
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
  shortestPathLengthElement.style.display = 'none';
  shortestPathElement.style.display = 'none';
  field.innerHTML = '';
  numNodesElement.value = '';
  numEdgesElement.value = '';
  fromElement.value = '';
  toElement.value = '';
  shortestPathLengthElement.innerHTML = '';
  shortestPathElement.innerHTML = '';
  G.reset();
  edges = [];
  sample = [];
  shortestPath = [];
}


clear.onclick = () => {
  CLEAR();
}


draw.onclick = () => {
  // box's display is 'none' initially - change to 'flex'
  box.style.display = 'flex';
  // clear output
  shortestPath = [];
  shortestPathLengthElement.innerHTML = '';
  shortestPathLengthElement.style.display = 'none';
  shortestPathElement.innerHTML = '';
  shortestPathElement.style.display = 'none';
  // get number of nodes and edges
  numNodes = numNodesElement.value == '' ? 0 : parseInt(numNodesElement.value, 10);
  numEdges = numEdgesElement.value == '' ? 0 : parseInt(numEdgesElement.value, 10);
  // get graph and set of all possible edges
  [G, edges] = sprinkle(field, numNodes);
  try {
    // sample from edges
    sample = sampleArray(edges, numEdges);
  } catch {
    alert('#edges SHOULD BE <= #nodes * (#nodes - 1) / 2');
    CLEAR();
  }
  // edges HTML
  G = connect(field, G, sample);
}


calculateShortestPath.onclick = () => {
  // remove previous highlights
  highlightPath(shortestPath, 'white', 0.5);
  shortestPathElement.innerHTML = '';  // clear previous output
  // get start and end nodes
  from = parseInt(fromElement.value, 10);
  to = parseInt(toElement.value, 10);
  try {
    // dijkstra
    [shortestPathLength, shortestPath] = G.dijkstra(from, to);
  } catch {
    alert('INVALID from/to VALUES!');
    CLEAR();
  }
  if (shortestPathLength != Infinity) {
    highlightPath(shortestPath, 'yellow', 1);  // highlight shortest path
    shortestPathElement.innerHTML = (
      'start -- '
      + shortestPath.map(x => x.toString() + ' -- ').reduce((a, b) => a + b)
      + 'end'
    );  // shortest path nodes HTML
    shortestPathElement.style.display = 'flex';
  }
  // shortest path length HTML
  shortestPathLengthElement.style.display = 'flex';
  shortestPathLengthElement.innerHTML = `shortestPathLength = ${shortestPathLength}`;
}
