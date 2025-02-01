// src/global.d.ts

declare module '*.gltf' {
  const url: string
  export default url
}

declare module '*.json' {
  const value: any
  export default value
}
