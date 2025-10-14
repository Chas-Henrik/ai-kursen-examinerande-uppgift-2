import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string | undefined;
  className?: string;
}

// SafeHtml component to safely render sanitized HTML content
const SafeHtml: React.FC<SafeHtmlProps> = ({ html, className }) => {
  if (!html) return null;
  const sanitizedHtml = DOMPurify.sanitize(html);
  // Wrap the sanitized HTML with a div that has the className
  const wrappedHtml = `<div class="${className || ''}">${sanitizedHtml}</div>`;
  return <div dangerouslySetInnerHTML={{ __html: wrappedHtml }} />;
};

export default SafeHtml;
