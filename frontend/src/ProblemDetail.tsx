import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

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

export default function ProblemDetail({ user }: { user: any }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/problems/${id}`)
      .then(res => res.json())
      .then(setProblem)
      .catch(console.error);
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this knowledge entry?")) {
      const res = await fetch(`/api/problems/${id}`, { method: 'DELETE' });
      if (res.ok) {
        navigate('/');
      } else {
        alert("Failed to delete.");
      }
    }
  };

  if (!problem) return <div className="p-8">Loading...</div>;

  return (
    <div className="bg-white shadow sm:rounded-lg p-8">
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>
          <div className="mt-2 flex gap-4 text-sm text-gray-500">
            <span className="font-semibold text-teal-600">{problem.category}</span>
            {problem.technology && <span>Tech: {problem.technology}</span>}
            {problem.environment && <span>Env: {problem.environment}</span>}
          </div>
          {problem.tags && problem.tags.length > 0 && (
            <div className="mt-2 flex gap-2">
              {problem.tags.map((t: any) => (
                <span key={t.id} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
        {(user.role === 'ORG_ADMIN' || user.id === problem.created_by) && (
          <div className="flex gap-2">
            <button className="rounded bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200">
              Edit
            </button>
            <button onClick={handleDelete} className="rounded bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="prose max-w-none">
        <h2 className="text-xl font-bold mt-6 mb-2">Problem</h2>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{problem.description}</ReactMarkdown>
        
        {problem.symptoms && (
          <>
            <h2 className="text-xl font-bold mt-6 mb-2">Symptoms</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{problem.symptoms}</ReactMarkdown>
          </>
        )}

        {problem.investigation && (
          <>
            <h2 className="text-xl font-bold mt-6 mb-2">Investigation / Troubleshooting</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{problem.investigation}</ReactMarkdown>
          </>
        )}

        {problem.root_cause && (
          <>
            <h2 className="text-xl font-bold mt-6 mb-2">Fix / Solution</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{problem.root_cause}</ReactMarkdown>
          </>
        )}

        {problem.prevention && (
          <>
            <h2 className="text-xl font-bold mt-6 mb-2">Prevention / Lessons Learned</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{problem.prevention}</ReactMarkdown>
          </>
        )}

        {problem.references && (
          <>
            <h2 className="text-xl font-bold mt-6 mb-2">References</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{problem.references}</ReactMarkdown>
          </>
        )}
      </div>
      
      <div className="mt-8 pt-4 border-t text-sm text-gray-500">
        Created Date: {new Date(problem.created_at).toLocaleString()}<br/>
        Last Updated: {new Date(problem.updated_at).toLocaleString()}
      </div>
    </div>
  );
}
