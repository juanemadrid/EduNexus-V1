'use client';
import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Type, AlignLeft, 
  AlignCenter, AlignRight, List, ChevronDown, Tag 
} from 'lucide-react';

interface EduNexusEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  height?: string;
}

const VARIABLES = [
  { label: 'Apellidos y nombres estudiante', value: '##ApellidosNombresEstudiante##' },
  { label: 'Nombres y apellidos estudiante', value: '##NombresApellidosEstudiante##' },
  { label: 'Identificación estudiante', value: '##IdentificacionEstudiante##' },
  { label: 'Municipio identificación', value: '##MunicipioIdentificacion##' },
  { label: 'Dirección estudiante', value: '##DireccionEstudiante##' },
  { label: 'Teléfono estudiante', value: '##TelefonoEstudiante##' },
  { label: 'Celular estudiante', value: '##CelularEstudiante##' }
];

export default function EduNexusEditor({ value, onChange, label, placeholder, height = '300px' }: EduNexusEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showVariables, setShowVariables] = useState(false);
  const [showFont, setShowFont] = useState(false);
  const [showSize, setShowSize] = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  useEffect(() => {
    // Only update innerHTML from external value if the component doesn't have focus
    // This prevents destroying selection when using toolbar dropdowns or typing
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      const componentHasFocus = containerRef.current?.contains(document.activeElement);
      if (!componentHasFocus) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleCommand = (command: string, arg?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      const sel = window.getSelection();
      if (savedRange && sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      }

      try {
        document.execCommand('styleWithCSS', false, 'true');
      } catch (e) {}

      document.execCommand(command, false, arg);
      onChange(editorRef.current.innerHTML);
      
      // Update saved range after command
      const newSel = window.getSelection();
      if (newSel && newSel.rangeCount > 0) {
        setSavedRange(newSel.getRangeAt(0));
      }
    }
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      // Only save if the selection is inside the editor
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        setSavedRange(range);
      }
    }
  };

  const insertVariable = (variable: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      const sel = window.getSelection();
      if (savedRange && sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      }

      document.execCommand('insertText', false, variable);
      onChange(editorRef.current.innerHTML);
      setShowVariables(false);
    }
  };

  return (
    <div ref={containerRef} className="edunexus-editor" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
      {/* Toolbar */}
      <div className="toolbar" style={{ 
        padding: '8px 12px', 
        background: '#f8fafc', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        gap: '4px', 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Font Custom Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onMouseDown={(e) => { e.preventDefault(); setShowFont(!showFont); setShowSize(false); setShowVariables(false); }}
            className="editor-select"
            style={{ height: '28px', padding: '0 8px', fontSize: '11px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            Fuente <ChevronDown size={10} />
          </button>
          {showFont && (
            <div style={{ 
              position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 100, 
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '150px', padding: '4px'
            }}>
              {[
                { name: 'Arial', value: 'Arial' },
                { name: 'Verdana', value: 'Verdana' },
                { name: 'Helvetica', value: 'Helvetica' },
                { name: 'Tahoma', value: 'Tahoma' },
                { name: 'Trebuchet MS', value: 'Trebuchet MS' },
                { name: 'Georgia', value: 'Georgia' },
                { name: 'Times New Roman', value: 'Times New Roman' },
                { name: 'Garamond', value: 'Garamond' },
                { name: 'Courier New', value: 'Courier New' }
              ].map((f) => (
                <div 
                  key={f.value}
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    handleCommand('fontName', f.value); 
                    setShowFont(false); 
                  }}
                  className="variable-item"
                  style={{ padding: '6px 12px', fontSize: '11px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  <span style={{ fontFamily: f.value }}>{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Size Custom Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onMouseDown={(e) => { e.preventDefault(); setShowSize(!showSize); setShowFont(false); setShowVariables(false); }}
            className="editor-select"
            style={{ height: '28px', padding: '0 8px', fontSize: '11px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            Tamaño <ChevronDown size={10} />
          </button>
          {showSize && (
            <div style={{ 
              position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 100, 
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '120px', padding: '4px'
            }}>
              {[
                { name: 'Pequeño', value: '1' },
                { name: 'Normal', value: '3' },
                { name: 'Grande', value: '5' },
                { name: 'Muy Grande', value: '7' }
              ].map((s) => (
                <div 
                  key={s.value}
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    handleCommand('fontSize', s.value); 
                    setShowSize(false); 
                  }}
                  className="variable-item"
                  style={{ padding: '6px 12px', fontSize: '11px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 4px' }} />

        {/* Formatting Buttons */}
        <button onMouseDown={(e) => { e.preventDefault(); handleCommand('bold'); }} className="toolbar-btn"><Bold size={14} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); handleCommand('italic'); }} className="toolbar-btn"><Italic size={14} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); handleCommand('underline'); }} className="toolbar-btn"><Underline size={14} /></button>
        
        <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 4px' }} />

        <button onMouseDown={(e) => { e.preventDefault(); handleCommand('justifyLeft'); }} className="toolbar-btn"><AlignLeft size={14} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); handleCommand('justifyCenter'); }} className="toolbar-btn"><AlignCenter size={14} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); handleCommand('justifyRight'); }} className="toolbar-btn"><AlignRight size={14} /></button>

        <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 4px' }} />
        
        <button onMouseDown={(e) => { e.preventDefault(); handleCommand('insertUnorderedList'); }} className="toolbar-btn"><List size={14} /></button>

        <div style={{ flex: 1 }} />

        {/* Variables Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowVariables(!showVariables); }}
            className="btn-premium"
            style={{ height: '28px', padding: '0 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Tag size={12} /> Variable <ChevronDown size={10} />
          </button>

          {showVariables && (
            <div style={{ 
              position: 'absolute', top: '100%', right: 0, marginTop: '4px', zIndex: 100, 
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '220px', padding: '4px'
            }}>
              {VARIABLES.map((v) => (
                <div 
                  key={v.value} 
                  onClick={() => insertVariable(v.value)}
                  style={{ 
                    padding: '8px 12px', fontSize: '11px', fontWeight: '700', color: '#475569', 
                    cursor: 'pointer', borderRadius: '4px', transition: '0.2s' 
                  }}
                  className="variable-item"
                >
                  {v.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div 
        ref={editorRef}
        contentEditable
        onBlur={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
        onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        style={{ 
          minHeight: height, 
          padding: '20px', 
          outline: 'none', 
          fontSize: '13px', 
          lineHeight: '1.6', 
          color: '#334155',
          overflowY: 'auto',
          cursor: 'text',
          caretColor: 'auto'
        }}
      />

      <style jsx>{`
        .toolbar-btn {
          width: 28px;
          height: 28px;
          display: flex;
          alignItems: center;
          justifyContent: center;
          border: none;
          background: transparent;
          color: #64748b;
          border-radius: 4px;
          cursor: pointer;
        }
        .toolbar-btn:hover {
          background: #f1f5f9;
          color: var(--primary);
        }
        .variable-item:hover {
          background: var(--primary-glow);
          color: var(--primary);
        }
        .editor-select {
          padding: 0 4px;
          outline: none;
        }
      `}</style>
    </div>
  );
}
