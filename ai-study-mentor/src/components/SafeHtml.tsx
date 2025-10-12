import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
}

const SafeHtml: React.FC<SafeHtmlProps> = ({ html }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};

export default SafeHtml;
