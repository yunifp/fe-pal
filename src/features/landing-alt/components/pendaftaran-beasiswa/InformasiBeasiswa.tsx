import { Card, CardContent } from "@/components/ui/card";
import { Award, GraduationCap, Wallet } from "lucide-react";

const items = [
  {
    title: "Pendidikan",
    description:
      "Beasiswa pendidikan tinggi bagi putra-putri pekebun dan SDM perkebunan kelapa sawit.",
    icon: GraduationCap,
  },
  {
    title: "Pembiayaan",
    description:
      "Mencakup biaya pendidikan, biaya hidup, buku, dan kebutuhan pendukung akademik.",
    icon: Wallet,
  },
  {
    title: "Kompetensi",
    description:
      "Mendorong peningkatan kompetensi, profesionalisme, dan daya saing SDM perkebunan.",
    icon: Award,
  },
];

const InformasiBeasiswa = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-primary">
            Informasi Program Beasiswa
          </h2>
          <p className="mt-2 text-muted-foreground">
            Beasiswa Pengembangan SDM Perkebunan Kelapa Sawit
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="shadow-none">
                <CardContent className="flex flex-col items-center text-center p-6">
                  {/* Icon Wrapper */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InformasiBeasiswa;
