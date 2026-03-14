import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

type Props = {
  code: string;
  language?: string;
};

export default function CodeBlock({ code, language = "tsx" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="relative">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ padding: "1rem", borderRadius: "0.5rem" }}
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-white bg-gray-700 hover:bg-gray-600 p-2 rounded"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}
