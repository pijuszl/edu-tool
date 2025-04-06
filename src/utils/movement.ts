import { WorldData } from '../types/game-types'

// Updated canMoveToPosition function to support stair climbing
export const canMoveToPosition = (
  newX: number,
  newY: number,
  layer: number,
  worldData: WorldData
): boolean => {
  // Check if target position is within bounds
  if (
    layer < 0 ||
    layer >= worldData.layers.length ||
    newY < 0 ||
    newY >= worldData.layers[layer].length ||
    newX < 0 ||
    newX >= worldData.layers[layer][newY].length
  ) {
    console.log(`Position out of bounds: (${newX}, ${newY}, ${layer})`)
    return false
  }

  // Check ground layer (must have ground beneath)
  const groundLayerIndex = layer - 1
  if (groundLayerIndex < 0) {
    // No ground check needed for bottom layer
    if (layer !== 0) {
      console.log(`No layer beneath bottom layer`)
      return false
    }
  } else if (groundLayerIndex < worldData.layers.length) {
    const groundLayerData = worldData.layers[groundLayerIndex]
    if (
      newY >= groundLayerData.length ||
      newX >= groundLayerData[newY].length ||
      groundLayerData[newY][newX] !== 1
    ) {
      console.log(`No ground beneath: (${newX}, ${newY}, ${layer})`)
      return false
    }
  }

  // Check for obstacles on current layer
  const currentLayerData = worldData.layers[layer]
  if (
    currentLayerData[newY][newX] === 1 ||
    currentLayerData[newY][newX] === 2
  ) {
    console.log(`Obstacle on current layer: (${newX}, ${newY}, ${layer})`)
    return false
  }

  // Check for obstacles one layer above
  if (layer + 1 < worldData.layers.length) {
    const upperLayerData = worldData.layers[layer + 1]
    if (
      newY < upperLayerData.length &&
      newX < upperLayerData[newY].length &&
      (upperLayerData[newY][newX] === 1 || upperLayerData[newY][newX] === 2)
    ) {
      console.log(`Obstacle one layer above: (${newX}, ${newY}, ${layer})`)
      return false
    }
  }

  return true
}
