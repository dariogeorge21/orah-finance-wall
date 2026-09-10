/**
 * Weighted Random Tile Reveal Algorithm for ORAH 2026
 * 
 * Simulates organic "frost melting" or droplet clearing:
 * Biases selection towards unrevealed tiles adjacent to already-revealed ones (~35% of the time)
 * while maintaining 65% uniform randomness to seed new organic clusters.
 */

export function getAdjacentTiles(tileIndex: number, cols: number, rows: number): number[] {
  const r = Math.floor(tileIndex / cols);
  const c = tileIndex % cols;
  const neighbors: number[] = [];

  const deltas = [
    [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal directions
    [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
  ];

  for (const [dr, dc] of deltas) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      neighbors.push(nr * cols + nc);
    }
  }

  return neighbors;
}

export function pickWeightedTiles(
  alreadyRevealed: Set<number>,
  countToReveal: number,
  cols: number = 40,
  rows: number = 24
): number[] {
  const totalTiles = cols * rows;
  const unrevealed: number[] = [];

  for (let i = 0; i < totalTiles; i++) {
    if (!alreadyRevealed.has(i)) {
      unrevealed.push(i);
    }
  }

  if (unrevealed.length === 0) return [];
  const targetCount = Math.min(countToReveal, unrevealed.length);

  // Set up set of newly chosen tiles
  const newlyChosen: number[] = [];
  const chosenSet = new Set<number>(alreadyRevealed);

  // Collect candidate neighbor tiles adjacent to already revealed tiles
  const neighborCandidates = new Set<number>();
  for (const revealedId of alreadyRevealed) {
    const neighbors = getAdjacentTiles(revealedId, cols, rows);
    for (const n of neighbors) {
      if (!chosenSet.has(n)) {
        neighborCandidates.add(n);
      }
    }
  }

  while (newlyChosen.length < targetCount && chosenSet.size < totalTiles) {
    let pickedTile: number | undefined;

    // 35% bias towards adjacent tiles if any exist
    if (neighborCandidates.size > 0 && Math.random() < 0.35) {
      const candidatesArray = Array.from(neighborCandidates);
      const randomIndex = Math.floor(Math.random() * candidatesArray.length);
      pickedTile = candidatesArray[randomIndex];
    } else {
      // Pick random from all remaining unrevealed tiles
      const remainingUnrevealed = unrevealed.filter(id => !chosenSet.has(id));
      if (remainingUnrevealed.length === 0) break;
      const randomIndex = Math.floor(Math.random() * remainingUnrevealed.length);
      pickedTile = remainingUnrevealed[randomIndex];
    }

    if (pickedTile !== undefined && !chosenSet.has(pickedTile)) {
      chosenSet.add(pickedTile);
      newlyChosen.push(pickedTile);
      neighborCandidates.delete(pickedTile);

      // Add newly picked tile's neighbors to candidate set
      const newNeighbors = getAdjacentTiles(pickedTile, cols, rows);
      for (const n of newNeighbors) {
        if (!chosenSet.has(n)) {
          neighborCandidates.add(n);
        }
      }
    }
  }

  return newlyChosen;
}

