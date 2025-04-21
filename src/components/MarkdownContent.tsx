'use client';

import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface MarkdownContentProps {
  content: string; // 이미 HTML 상태로 전달된 문자열
}

interface TocItem {
  text: string;
  id: string;
  level: number;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const [html, setHtml] = useState<string>('');
  const [toc, setToc] = useState<TocItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1) sanitize 먼저
    const clean = DOMPurify.sanitize(content, {
      ADD_TAGS: ['video'],
      ADD_ATTR: ['controls', 'style', 'src'],
      ALLOW_DATA_ATTR: true,
    }) as string;

    // 2) DOMParser 로 HTML → DOM 트리로 변환
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, 'text/html');

    // 3) 등장한 ID를 카운팅하기 위한 객체
    const idCount: Record<string, number> = {};

    // 4) h1~h6 요소에 id 부여 + ToC 수집
    const headings: TocItem[] = Array.from(
      doc.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')
    ).map(el => {
      const text = el.textContent?.trim() || '';

      // 4-1) 한글 포함 유니코드, 숫자, 공백, 하이픈만 남기고 slug 생성
      const rawId = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/\s+/g, '-');

      // 4-2) 중복 처리: 이미 등장했다면 suffix 붙이기
      if (idCount[rawId] == null) {
        idCount[rawId] = 1;      // 첫 등장
      } else {
        idCount[rawId] += 1;     // 두 번째 이상
      }
      const uniqueId =
        idCount[rawId] === 1 ? rawId : `${rawId}-${idCount[rawId] - 1}`;

      // 4-3) DOM에도 id 설정
      el.id = uniqueId;

      const level = Number(el.tagName.charAt(1));
      return { text, id: uniqueId, level };
    });

    setToc(headings);

    // 4) id 가 붙은 DOM → HTML 문자열로 다시 꺼내기
    const htmlWithIds = doc.body.innerHTML;

    setHtml(htmlWithIds);
  }, [content]);

  const handleTocClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <>
      {/* ToC */}
      {toc.length > 0 && (
        <nav className="mb-4">
          <ul>
            {toc.map(({ text, id, level }) => (
              <li key={id} className={`toc-level-${level}`}>
                <a
                  href={`#${id}`}
                  onClick={e => handleTocClick(e, id)}
                  className="hover:underline"
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* 본문 (id가 붙은 HTML) */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
