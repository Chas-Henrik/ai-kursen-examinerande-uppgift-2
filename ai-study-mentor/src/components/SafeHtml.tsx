import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string | undefined;
}

const SafeHtml: React.FC<SafeHtmlProps> = ({ html }) => {
  if (!html) return null;
  const sanitizedHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};

export default SafeHtml;
