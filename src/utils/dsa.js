/**
 * EarthGram DSA Utility
 * Implementing high-performance data structures for the marketplace.
 */

// 1. TRIE (Prefix Tree) for ultra-fast search suggestions
export class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.data = []; // Store references to providers or categories
    }
}

export class SearchTrie {
    constructor() {
        this.root = new TrieNode();
    }

    // Insert a word and its associated data (e.g., a provider object)
    insert(word, data) {
        let node = this.root;
        const cleanWord = word.toLowerCase();
        for (let char of cleanWord) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
            // Store unique data items at each node for partial matches
            if (!node.data.some(item => item.id === data.id)) {
                node.data.push(data);
            }
        }
        node.isEndOfWord = true;
    }

    // Search for all items starting with a given prefix
    search(prefix) {
        let node = this.root;
        const cleanPrefix = prefix.toLowerCase();
        for (let char of cleanPrefix) {
            if (!node.children[char]) return [];
            node = node.children[char];
        }
        return node.data; // Returns all data points that pass through this prefix
    }
}

// 2. MIN-HEAP for sorting providers by distance or rating efficiently
export class MinHeap {
    constructor(compareFn) {
        this.heap = [];
        this.compareFn = compareFn || ((a, b) => a - b);
    }

    push(val) {
        this.heap.push(val);
        this.bubbleUp();
    }

    pop() {
        if (this.size() === 0) return null;
        if (this.size() === 1) return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown();
        return top;
    }

    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.compareFn(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else break;
        }
    }

    bubbleDown() {
        let index = 0;
        while (true) {
            let leftChild = 2 * index + 1;
            let rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < this.heap.length && this.compareFn(this.heap[leftChild], this.heap[smallest]) < 0) {
                smallest = leftChild;
            }
            if (rightChild < this.heap.length && this.compareFn(this.heap[rightChild], this.heap[smallest]) < 0) {
                smallest = rightChild;
            }

            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else break;
        }
    }

    size() {
        return this.heap.length;
    }

    getSorted() {
        const result = [];
        const originalHeap = [...this.heap];
        while (this.size() > 0) {
            result.push(this.pop());
        }
        this.heap = originalHeap; // Restore heap
        return result;
    }
}
