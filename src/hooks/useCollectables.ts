import React, { useState, useEffect, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { Collectable } from '../components/Game/Collectable'
import { GridPosition, WorldData } from '../types/game-types'
import { HEX_METRICS } from '../config/game-config'

export const useCollectables = (
  worldData: WorldData | undefined,
  characterPos: GridPosition,
  convertPosition: (x: number, y: number, layer: number) => THREE.Vector3
) => {
  const [collectedItems, setCollectedItems] = useState<boolean[]>([])
  const [score, setScore] = useState<number>(0)

  useEffect(() => {
    if (worldData?.collectables) {
      setCollectedItems(new Array(worldData.collectables.length).fill(false))
      setScore(0)
    }
  }, [worldData])

  const collectableElements = useMemo(() => {
    if (!worldData?.collectables) return []

    return worldData.collectables.map((item, index) => {
      const pos = convertPosition(item.x, item.y, item.layer)
      pos.y += HEX_METRICS.height * 0.5

      return React.createElement(Collectable, {
        key: `collectable-${index}`,
        position: pos.toArray() as [number, number, number],
        isCollected: collectedItems[index],
      })
    })
  }, [worldData?.collectables, collectedItems, convertPosition])

  const checkCollectables = useCallback(() => {
    if (worldData?.collectables) {
      const newCollectedItems = [...collectedItems]
      let collectedCount = 0

      worldData.collectables.forEach((collectable, index) => {
        const samePosition =
          collectable.x === characterPos.x && collectable.y === characterPos.y
        const sameLayer = collectable.layer === characterPos.layer

        if (!collectedItems[index] && samePosition && sameLayer) {
          newCollectedItems[index] = true
          collectedCount++
        }
      })

      if (collectedCount > 0) {
        setCollectedItems(newCollectedItems)
        setScore((prevScore) => prevScore + collectedCount)
      }
    }
  }, [worldData?.collectables, characterPos, collectedItems])

  const resetCollectables = useCallback(() => {
    if (worldData?.collectables) {
      setCollectedItems(new Array(worldData.collectables.length).fill(false))
      setScore(0)
    }
  }, [worldData?.collectables])

  return {
    collectableElements,
    collectedItems,
    score,
    checkCollectables,
    resetCollectables,
  }
}
