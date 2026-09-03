import DOMPurify from 'isomorphic-dompurify';

interface SafeHTMLProps extends React.HTMLAttributes<HTMLDivElement> {
  html: string;
}

export default function SafeHTML({ html, ...props }: SafeHTMLProps) {
  const sanitizedHtml = DOMPurify.sanitize(html || "");
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} {...props} />;
}
