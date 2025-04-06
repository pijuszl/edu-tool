import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Hexagon } from '../components/Game/Hexagon'
import { Trees } from '../components/Game/Trees'
import { Stairs } from '../components/Game/Stairs'
import { WorldData } from '../types/game-types'

export const useGameWorld = (
  worldData: WorldData | undefined,
  convertPosition: (x: number, y: number, layer: number) => THREE.Vector3
) => {
  const objects = useMemo(() => {
    if (!worldData) return []
    const obj: React.ReactElement[] = []

    worldData.layers.forEach((layerData, layerIndex) => {
      for (let y = 0; y < layerData.length; y++) {
        for (let x = 0; x < layerData[y].length; x++) {
          const pos = convertPosition(x, y, layerIndex)
          const value = layerData[y][x]

          if (value === 1) {
            obj.push(
              React.createElement(Hexagon, {
                key: `${layerIndex}-${x}-${y}`,
                position: [pos.x, pos.y, pos.z],
                isEven: (x + y) % 2 === 0,
              })
            )
          } else if (value === 2) {
            obj.push(
              React.createElement(Trees, {
                key: `${layerIndex}-${x}-${y}`,
                position: [pos.x, pos.y, pos.z],
              })
            )
          } else if (value >= 30 && value <= 35) {
            const direction = value - 30
            obj.push(
              React.createElement(Stairs, {
                key: `${layerIndex}-${x}-${y}`,
                position: [pos.x, pos.y, pos.z],
                direction: direction,
              })
            )
          }
        }
      }
    })

    return obj
  }, [worldData, convertPosition])

  return objects
}
