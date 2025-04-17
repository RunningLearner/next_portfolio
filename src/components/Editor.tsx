'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const Editor = ({ content, onChange }: EditorProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: '내용을 입력하세요...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.path) {
        editor?.chain().focus().setImage({ src: data.path }).run();
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  const handleVideoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.path) {
        const videoHtml = `<video controls src="${data.path}" style="max-width: 100%;"></video>`;
        editor?.chain().focus().insertContent(videoHtml).run();
      }
    } catch (error) {
      console.error('비디오 업로드 실패:', error);
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        await handleImageUpload(file);
      } else if (file.type.startsWith('video/')) {
        await handleVideoUpload(file);
      }
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        const markdown = file.type.startsWith('image/') 
          ? `![${file.name}](${data.path})`
          : `[${file.name}](${data.path})`;
        
        editor?.chain().focus().insertContent(markdown).run();
      }
    } catch (error) {
      console.error('파일 업로드 실패:', error);
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm'],
    },
    noClick: true,
  });

  const addLink = useCallback(() => {
    const url = window.prompt('URL을 입력하세요');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          굵게
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          기울임
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${editor.isActive('heading') ? 'bg-gray-200' : ''}`}
        >
          제목
        </button>
        <button
          onClick={addLink}
          className={`p-2 rounded ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
        >
          링크
        </button>
      </div>

      <div
        {...getRootProps()}
        className="min-h-[300px] prose max-w-none"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input {...getInputProps()} />
        <EditorContent editor={editor} />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
            <p>업로드 중...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor; 