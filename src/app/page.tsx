'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('게시물 불러오기 실패:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">포트폴리오 블로그</h1>
        
        <div className="mb-8">
          <Link 
            href="/posts/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            새 글 작성
          </Link>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/posts/${post.id}`}
              className="block p-6 border rounded-lg hover:bg-gray-50"
            >
              <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
              <div className="text-gray-500 mb-4">
                {new Date(post.created_at).toLocaleDateString()}
              </div>
              <p className="text-gray-700 line-clamp-3">
                {post.content}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
