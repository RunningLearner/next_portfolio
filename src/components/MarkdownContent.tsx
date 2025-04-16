'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { decode } from 'html-entities';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const decodedContent = decode(content);
      const cleanHtml = DOMPurify.sanitize(decodedContent, {
        ADD_TAGS: ['video'],
        ADD_ATTR: ['controls', 'style', 'src'],
        ALLOW_DATA_ATTR: true,
      });
      setHtml(cleanHtml);
    }
  }, [content]);

  return (
    <div 
      className="prose prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
