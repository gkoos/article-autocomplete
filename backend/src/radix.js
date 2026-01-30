// src/radix.js

export class RadixNode {
  constructor(label = '') {
    this.label = label;            // string stored at this node
    this.children = new Map();     // child nodes
    this.count = 0;                // popularity count if this node ends a word
  }
}

export class RadixTree {
  constructor() {
    this.root = new RadixNode();
  }

  /**
   * Insert a phrase into the radix tree and increment its count.
   * Handles splitting edges on partial matches.
   */
  insert(phrase) {
    this._insert(this.root, phrase);
  }

  _insert(node, phrase) {
    // If phrase is empty, we've reached the node for the full phrase
    if (phrase.length === 0) {
      node.count += 1;
      return;
    }

    for (const [childLabel, childNode] of node.children.entries()) {
      const commonLength = this._commonPrefixLength(phrase, childLabel);
      if (commonLength === 0) continue;

      if (commonLength < childLabel.length) {
        // Split the existing child
        const splitLabel = childLabel.slice(commonLength);
        const newChild = new RadixNode(splitLabel);
        newChild.children = childNode.children;
        newChild.count = childNode.count;

        const prefixLabel = childLabel.slice(0, commonLength);
        childNode.label = prefixLabel;
        childNode.children = new Map([[splitLabel, newChild]]);
        childNode.count = 0;

        // Re-key the parent's children map to reflect the updated label
        node.children.delete(childLabel);
        node.children.set(prefixLabel, childNode);

        // Insert the remaining part of the phrase as a new child
        const remaining = phrase.slice(commonLength);
        if (remaining.length === 0) {
          childNode.count = 1;
        } else {
          const newLeaf = new RadixNode(remaining);
          newLeaf.count = 1;
          childNode.children.set(remaining, newLeaf);
        }
        return;
      }

      if (commonLength === childLabel.length) {
        // Full match of this edge, continue recursively
        this._insert(childNode, phrase.slice(commonLength));
        return;
      }
    }
    // No match at all: add new child for the remaining phrase
    const newNode = new RadixNode(phrase);
    newNode.count = 1;
    node.children.set(phrase, newNode);
  }

  /**
   * Return the top-K phrases starting with a given prefix, sorted by count descending.
   */
  search(prefix, topK = 5) {
    const results = [];
    const nodeInfo = this._traverseToPrefix(this.root, prefix);
    if (!nodeInfo) return results;
    const { node, built, remainingPrefix } = nodeInfo;
    // If remainingPrefix exists, the prefix ends in the middle of an edge.
    // In this case, start collecting completions from the built + remainingPrefix.
    if (remainingPrefix && remainingPrefix.length > 0) {
      this._collect(node, built + remainingPrefix, results);
    } else {
      this._collect(node, built, results);
    }
    return results.sort((a, b) => b.count - a.count).slice(0, topK);
  }


  /**
   * Traverse tree to find node that matches the prefix.
   * Returns { node, builtPrefix } or null if not found.
   */
  _traverseToPrefix(node, prefix, built = '') {
    if (!prefix) return { node, built, remainingPrefix: '' };
    for (const [childLabel, childNode] of node.children.entries()) {
      const commonLength = this._commonPrefixLength(prefix, childLabel);
      if (commonLength === 0) continue;
      if (commonLength < prefix.length && commonLength < childLabel.length) {
        // Diverges within this edge; try other children
        continue;
      }
      if (commonLength === prefix.length) {
        // Prefix ends inside this edge or at the end of the edge
        return { node: childNode, built: built + childLabel.slice(0, commonLength), remainingPrefix: childLabel.slice(commonLength) };
      }
      // Continue deeper
      return this._traverseToPrefix(childNode, prefix.slice(commonLength), built + childLabel);
    }
    return null; // no match
  }

  /**
   * Depth-first search to collect all complete phrases under a node
   */
  _collect(node, built, results) {
    if (node.count > 0 && built.length > 0) {
      results.push({ phrase: built, count: node.count });
    }
    for (const [childLabel, childNode] of node.children.entries()) {
      this._collect(childNode, built + childNode.label, results);
    }
  }

  /**
   * Utility: length of common prefix of two strings
   */
  _commonPrefixLength(s1, s2) {
    let i = 0;
    while (i < s1.length && i < s2.length && s1[i] === s2[i]) i++;
    return i;
  }
}
