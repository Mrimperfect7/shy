interface SafeHTMLProps extends React.HTMLAttributes<HTMLDivElement> {
  html: string;
}

export default function SafeHTML({ html, ...props }: SafeHTMLProps) {
  return <div dangerouslySetInnerHTML={{ __html: html || "" }} {...props} />;
}
