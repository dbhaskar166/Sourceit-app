import React, { useState, useEffect } from 'react';
import { Code, Plus, Trash2, ArrowLeft, Terminal, Copy, Check } from 'lucide-react';
import { C } from './types.ts';
import { api, DbSnippet } from '../api.ts';

interface SnippetsViewProps {
  onBack: () => void;
}

export function SnippetsView({ onBack }: SnippetsViewProps) {
  const [snippets, setSnippets] = useState<DbSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    try {
      setLoading(true);
      const data = await api.getSnippets();
      setSnippets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !code.trim()) return;
    try {
      const created = await api.createSnippet({
        title: title.trim(),
        description: description.trim(),
        code: code.trim(),
        language,
        authorName: 'Ramesh',
        tags: 'rural,agriculture',
      });
      setSnippets([created, ...snippets]);
      setTitle('');
      setDescription('');
      setCode('');
      setShowAdd(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteSnippet(id);
      setSnippets(snippets.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          background: C.green,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 4 }}>
          <ArrowLeft color="#fff" size={24} />
        </button>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              color: '#fff',
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Source Code & Formulas
          </h1>
          <span style={{ fontSize: 11, color: C.goldSoft, fontFamily: "'Nunito Sans', sans-serif" }}>
            PostgreSQL Snippets Repository
          </span>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: C.gold,
            border: 'none',
            borderRadius: 10,
            padding: '7px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: "'Nunito Sans', sans-serif",
            fontWeight: 800,
            fontSize: 12.5,
            color: C.greenDeep,
          }}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: C.inkSoft }}>
            Loading from database...
          </div>
        ) : snippets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: C.inkSoft }}>
            No code snippets found in database.
          </div>
        ) : (
          snippets.map((s) => (
            <div
              key={s.id}
              style={{
                background: C.card,
                border: `1px solid ${C.line}`,
                borderRadius: 16,
                padding: '14px',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink }}>
                    {s.title}
                  </div>
                  {s.description && (
                    <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>
                      {s.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  style={{ background: 'none', border: 'none', color: C.rust, padding: 4 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div
                style={{
                  background: '#1F241D',
                  borderRadius: 10,
                  padding: '10px 12px',
                  marginTop: 10,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A0A89C', fontSize: 11, fontFamily: 'monospace' }}>
                    <Terminal size={12} />
                    <span>{s.language}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(s.id, s.code)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      color: '#fff',
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {copiedId === s.id ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                    {copiedId === s.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre
                  style={{
                    color: '#E0E7DE',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    margin: 0,
                    overflowX: 'auto',
                    lineHeight: 1.45,
                  }}
                >
                  {s.code}
                </pre>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: C.inkSoft, fontFamily: "'Nunito Sans', sans-serif" }}>
                  By {s.authorName}
                </span>
                <span style={{ fontSize: 10.5, color: C.blue, fontWeight: 700, background: '#DCEAF3', padding: '2px 8px', borderRadius: 999 }}>
                  PostgreSQL Record #{s.id}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 40,
          }}
        >
          <div
            style={{
              background: C.card,
              width: '100%',
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: '20px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 18, color: C.ink }}>
                Save Code Snippet to Database
              </span>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', fontSize: 18 }}>
                ✕
              </button>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Snippet title (e.g. Irrigation Formula)"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: C.bg,
                border: `1px solid ${C.line}`,
                borderRadius: 12,
                padding: '10px 12px',
                marginBottom: 8,
                fontSize: 14,
              }}
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: C.bg,
                border: `1px solid ${C.line}`,
                borderRadius: 12,
                padding: '10px 12px',
                marginBottom: 8,
                fontSize: 14,
              }}
            />
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code snippet or formula..."
              rows={5}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: C.bg,
                border: `1px solid ${C.line}`,
                borderRadius: 12,
                padding: '10px 12px',
                fontFamily: 'monospace',
                fontSize: 13,
                marginBottom: 12,
              }}
            />
            <button
              onClick={handleCreate}
              style={{
                width: '100%',
                background: C.green,
                border: 'none',
                borderRadius: 14,
                padding: '14px 0',
                color: '#fff',
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Save to PostgreSQL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
