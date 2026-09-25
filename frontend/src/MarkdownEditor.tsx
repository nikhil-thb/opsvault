import React, { useRef, useState } from 'react';
import { Bold, Italic, Code, Link as LinkIcon, List, FileCode2, Eye, Edit3, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline) {
    return (
      <div className="relative group rounded-md overflow-hidden my-4 bg-[#1e1e1e]">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-400 text-xs font-mono border-b border-gray-700">
          <span>{language === 'text' ? 'code' : language}</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 rounded hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={language}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  }
  
  return (
    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-pink-600" {...props}>
      {children}
    </code>
  );
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}

export default function MarkdownEditor({ value, onChange, rows = 8, placeholder, required = false }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  const insertMarkdown = (prefix: string, suffix: string, block = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    if (block) {
      replacement = `\n${prefix}\n${selected || 'code'}\n${suffix}\n`;
    } else {
      replacement = `${prefix}${selected || 'text'}${suffix}`;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length + (block ? 1 : 0), start + prefix.length + (block ? 1 : 0) + (selected || (block ? 'code' : 'text')).length);
    }, 0);
  };

  return (
    <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 bg-white">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex items-center justify-between">
        
        <div className="flex items-center gap-1">
          {mode === 'write' ? (
            <>
              <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded" title="Bold">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded" title="Italic">
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button type="button" onClick={() => insertMarkdown('`', '`')} className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded" title="Inline Code">
                <Code className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => insertMarkdown('```', '```', true)} className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded" title="Code Block">
                <FileCode2 className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded" title="Link">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => insertMarkdown('\n- ', '')} className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded" title="Bullet List">
                <List className="w-4 h-4" />
              </button>
            </>
          ) : (
            <span className="text-sm font-medium text-gray-600 px-2">Preview Mode</span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-gray-200 p-0.5 rounded">
          <button 
            type="button" 
            onClick={() => setMode('write')} 
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded font-medium ${mode === 'write' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Edit3 className="w-3 h-3" /> Write
          </button>
          <button 
            type="button" 
            onClick={() => setMode('preview')} 
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded font-medium ${mode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>
      </div>

      {mode === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          required={required}
          placeholder={placeholder}
          className="block w-full border-0 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 px-4 resize-y bg-white font-mono"
        />
      ) : (
        <div className="p-4 prose max-w-none bg-gray-50 overflow-y-auto" style={{ minHeight: `${rows * 1.5}rem` }}>
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{value}</ReactMarkdown>
          ) : (
            <span className="text-gray-400 italic">Nothing to preview</span>
          )}
        </div>
      )}
    </div>
  );
}
