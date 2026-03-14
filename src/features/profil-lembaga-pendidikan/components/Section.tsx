import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <Card className="shadow-none border border-slate-200 p-0">
    <CardHeader className="space-y-1 border-b bg-slate-50/50">
      <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-6">
        {title}
      </CardTitle>

      {subtitle && (
        <CardDescription className="text-xs font-medium text-slate-600 leading-relaxed">
          {subtitle}
        </CardDescription>
      )}
    </CardHeader>

    <CardContent className="px-5 py-5">{children}</CardContent>
  </Card>
);

export default Section;
