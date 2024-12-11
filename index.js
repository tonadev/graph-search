class ListNode {
    constructor(id) {
        this.id = id;
        this.color = "white";
        this.next = null;
    }
}

class LinkedList {
    constructor(head) {
        this.head = head;
    }

    size() {
        let count = 0;
        let node = this.head;
        while (node) {
            count++;
            node = node.next;
        }

        return count;
    }

    clear() {
        this.head = null;
    }

    has(node) {
        let current = this.head;
        if (current) {
            while(current) {
                if (current.id === node.id) {
                    return true;
                }
            }
        }
        return false;
    }

    getLast() {
        let lastNode = this.head;
        if (lastNode) {
            while(lastNode.next) {
                lastNode = lastNode.next;
            }
        }
        return lastNode;
    }

    getFirst() {
        return this.head;
    }

    addNode(node) {
        let lastNode = this.getLast();

        lastNode.next = node;
    }
}

class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        return this.items.shift();
    }

    peek() {
        return this.items[0];
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

class Graph {
    constructor() {
        this.adjacencyList = new Map();
    }

    addNode(node) {
        if (!this.adjacencyList.has(node.id)) {
            this.adjacencyList.set(node.id, new LinkedList(node));
        }
    }

    addEdge(node1, node2) {
        if (this.adjacencyList.has(node1) && this.adjacencyList.has(node2)) {
            this.adjacencyList.get(node1).addNode(new ListNode(node2));
            this.adjacencyList.get(node2).addNode(new ListNode(node1));
        }
    }
}

var nodes = new vis.DataSet([]);

// create an array with edges
var edges = new vis.DataSet([]);

// create a network
var container = document.getElementById("graph");
var data = {
    nodes: nodes,
    edges: edges,
};
var options = {
    interaction: {
        navigationButtons: true,
        keyboard: true,
    },
    manipulation: {
        enabled: true,
    }
};
var network = new vis.Network(container, data, options);

var simulationContainer = document.getElementById("search");

var simulationNodes = new vis.DataSet([]);
var simulationEdges = new vis.DataSet([]);

var simulationData = {
    nodes: simulationNodes,
    edges: simulationEdges,
};

var simulationOptions = {
    interaction: {
        navigationButtons: true,
        keyboard: true,
    },
};

var simulationNetwork = new vis.Network(simulationContainer, simulationData, simulationOptions);

network.on("doubleClick", function(node) {
   var modal = document.getElementById("editNodeModal");
   modal.style.display = "block";
})

function renameNode() {
    var nodeNameTextInput = document.getElementById("nodeNameTextInput");
    var selectedNode = network.getSelection().nodes[0];

    closeModal();

    nodes.update({id: selectedNode, label: nodeNameTextInput.value});
    nodeNameTextInput.value = "";
}

function closeModal() {
    var modal = document.getElementById("editNodeModal");

    modal.style.display = "none";
}

async function startSearch() {
    simulationNodes.clear();
    simulationEdges.clear();

    let allNodes = network.body.data.nodes.get();

    // Get all edges
    let allEdges = network.body.data.edges.get();

    const graph = new Graph();
    for (const nodeIdx in allNodes) {
        let nodeId = allNodes[nodeIdx].id;

        simulationNodes.update({id: allNodes[nodeIdx].id, label: allNodes[nodeIdx].label});

        graph.addNode(new ListNode(nodeId));
    }

    for (const edgeIdx in allEdges) {
        let from = allEdges[edgeIdx].from;
        let to = allEdges[edgeIdx].to;

        simulationEdges.update({from: from, to: to});

        graph.addEdge(from, to);
    }

    let dfsRadioButton = document.getElementById("dfsRadioButton");
    let bfsRadioButton = document.getElementById("bfsRadioButton");

    if (dfsRadioButton.checked) {
        await depthFirstSearch(graph);
    } else if (bfsRadioButton.checked) {
        await breadthFirstSearch(graph);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function depthFirstSearch(graph) {
    let visited = [];

    for (const nodeIdx of graph.adjacencyList.keys()) {
        let currentNode = graph.adjacencyList.get(nodeIdx);

        if (!visited.includes(currentNode.head.id)) {

            visited = visited.concat(await dfsVisit(graph, currentNode.head, visited));
        }
    }
}

async function dfsVisit(graph, node, visited) {
    visited.push(node.id);

    await sleep(1000);
    simulationNodes.update({id: node.id, color: "#CCCCCC", font: { color: "white" }});

    let currentNode = node;
    while (currentNode.next) {
        if (!visited.includes(currentNode.next.id)) {
            let adjacentNode = graph.adjacencyList.get(currentNode.next.id).head;

            visited = visited.concat(await dfsVisit(graph, adjacentNode, visited));
        }
        currentNode = currentNode.next;
    }

    await sleep(1000);
    simulationNodes.update({id: node.id, color: "#000000", font: { color: "white" }});

    return visited;
}

async function breadthFirstSearch(graph) {
    let visited = [];

    for (const nodeIdx of graph.adjacencyList.keys()) {
        let currentNode = graph.adjacencyList.get(nodeIdx);

        if (!visited.includes(currentNode.head.id)) {

            visited = visited.concat(await bfsVisit(graph, currentNode.head, visited));
        }
    }
}

async function bfsVisit(graph, node, visited) {
    let queue = new Queue();

    visited.push(node.id);

    await sleep(1000);
    simulationNodes.update({id: node.id, color: "#CCCCCC", font: { color: "white" }});

    queue.enqueue(node.id);
    while (!queue.isEmpty()) {
        let currentNodeIdx = queue.dequeue();
        let currentNode = graph.adjacencyList.get(currentNodeIdx).head;

        while (currentNode.next) {
            if (!visited.includes(currentNode.next.id)) {
                visited.push(currentNode.next.id);

                await sleep(1000);
                simulationNodes.update({id: currentNode.next.id, color: "#CCCCCC", font: { color: "white" }});

                queue.enqueue(currentNode.next.id);
            }

            currentNode = currentNode.next;
        }

        currentNode = graph.adjacencyList.get(currentNodeIdx).head;

        await sleep(1000);
        simulationNodes.update({id: currentNode.id, color: "#000000", font: { color: "white" }});
    }
    return visited;
}