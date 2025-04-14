// src/components/CodeEditor/BlocklyConfig.ts
import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

/**
 * Define custom blocks for the game commands
 */
export const defineCustomBlocks = (): void => {
  // Move Forward block
  Blockly.Blocks['move_forward'] = {
    init: function () {
      this.appendDummyInput().appendField('Move Forward')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(120) // Green
      this.setTooltip('Move the character forward')
    },
  }

  // Turn Left block
  Blockly.Blocks['turn_left'] = {
    init: function () {
      this.appendDummyInput().appendField('Turn Left')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230) // Blue
      this.setTooltip('Turn the character left')
    },
  }

  // Turn Right block
  Blockly.Blocks['turn_right'] = {
    init: function () {
      this.appendDummyInput().appendField('Turn Right')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230) // Blue
      this.setTooltip('Turn the character right')
    },
  }

  // Define JavaScript generators
  javascriptGenerator.forBlock['move_forward'] = function () {
    return 'forward();\n'
  }

  javascriptGenerator.forBlock['turn_left'] = function () {
    return 'left();\n'
  }

  javascriptGenerator.forBlock['turn_right'] = function () {
    return 'right();\n'
  }
}

/**
 * Create toolbox configuration for the Blockly editor
 */
export const createToolbox = () => {
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Movement',
        colour: '120',
        contents: [
          { kind: 'block', type: 'move_forward' },
          { kind: 'block', type: 'turn_left' },
          { kind: 'block', type: 'turn_right' },
        ],
      },
      {
        kind: 'category',
        name: 'Loops',
        colour: '290',
        contents: [
          {
            kind: 'block',
            type: 'controls_repeat_ext',
            inputs: {
              TIMES: {
                shadow: {
                  type: 'math_number',
                  fields: { NUM: 5 },
                },
              },
            },
          },
          {
            kind: 'block',
            type: 'controls_for',
            inputs: {
              FROM: {
                shadow: {
                  type: 'math_number',
                  fields: { NUM: 1 },
                },
              },
              TO: {
                shadow: {
                  type: 'math_number',
                  fields: { NUM: 10 },
                },
              },
              BY: {
                shadow: {
                  type: 'math_number',
                  fields: { NUM: 1 },
                },
              },
            },
          },
          { kind: 'block', type: 'controls_whileUntil' },
        ],
      },
      {
        kind: 'category',
        name: 'Logic',
        colour: '210',
        contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
        ],
      },
      {
        kind: 'category',
        name: 'Math',
        colour: '230',
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' },
        ],
      },
      {
        kind: 'category',
        name: 'Variables',
        custom: 'VARIABLE',
        colour: '330',
      },
    ],
  }
}

/**
 * Create the Blockly theme
 */
export const createBlocklyTheme = () => {
  return Blockly.Theme.defineTheme('gameTheme', {
    base: Blockly.Themes.Classic,
    name: 'gameTheme',
    componentStyles: {
      workspaceBackgroundColour: '#f5f5f5',
      toolboxBackgroundColour: '#e0e0e0',
      toolboxForegroundColour: '#333',
      flyoutBackgroundColour: '#eee',
      flyoutForegroundColour: '#333',
      flyoutOpacity: 0.9,
      scrollbarColour: '#ccc',
      scrollbarOpacity: 0.8,
    },
  })
}

/**
 * Create the Blockly injection options
 */
export const createBlocklyOptions = (toolbox: any) => {
  return {
    toolbox,
    trashcan: false,
    scrollbars: true,
    horizontalLayout: false,
    sounds: false,
    move: {
      drag: true,
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
    },
    grid: {
      spacing: 20,
      length: 3,
      colour: '#ccc',
      snap: true,
    },
    theme: createBlocklyTheme(),
  }
}
