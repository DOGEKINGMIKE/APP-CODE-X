import React from 'react';
import { FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
  fileName?: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, fileName }) => {
  return (
    <div className="h-full flex flex-col bg-editor-background">
      <div className="h-8 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <FileText className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">Preview: {fileName || 'Markdown'}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose prose-sm prose-invert max-w-3xl mx-auto [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:border-b [&_h1]:border-border [&_h1]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_p]:leading-relaxed [&_pre]:bg-background/50 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:text-xs [&_code]:text-primary [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded-lg [&_table]:w-full [&_th]:bg-muted [&_th]:px-3 [&_th]:py-1.5 [&_td]:px-3 [&_td]:py-1.5 [&_td]:border-t [&_td]:border-border [&_ul]:list-disc [&_ol]:list-decimal [&_li]:my-1 [&_hr]:border-border">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;
