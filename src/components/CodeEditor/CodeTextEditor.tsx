// src/components/CodeEditor/CodeTextEditor.tsx
import React from 'react'
import { Box } from '@mui/material'
import { Editor } from '@monaco-editor/react'

interface CodeTextEditorProps {
  code: string
  onChange: (value: string | undefined) => void
}

/**
 * Text-based code editor component using Monaco editor
 */
const CodeTextEditor: React.FC<CodeTextEditorProps> = ({ code, onChange }) => {
  return (
    <Box sx={{ flex: '1 1 auto' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        value={code}
        onChange={onChange}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
        }}
      />
    </Box>
  )
}

export default CodeTextEditor
