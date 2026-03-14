const DidukungOleh = () => {
  const partners = [
    {
      id: 1,
      name: "Partner 1",
      logo: "https://www.bpdp.or.id/uploads/logo/logo_681818fabb1cb.png",
    },
    {
      id: 2,
      name: "Partner 2",
      logo: "https://www.bpdp.or.id/uploads/images/image_750x_66de4d748dadf.jpg",
    },
    {
      id: 3,
      name: "Partner 3",
      logo: "https://www.bpdp.or.id/uploads/images/image_750x_66de4d748dadf.jpg",
    },
    {
      id: 4,
      name: "Partner 4",
      logo: "https://www.bpdp.or.id/uploads/images/image_750x_66de4d6f7c388.jpg",
    },
  ];

  return (
    <section className="py-12 bg-[#F8F9FA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">Didukung Oleh</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center max-w-5xl mx-auto">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-center p-4 transition-transform hover:scale-110 duration-300"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-24 w-24 object-contain hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DidukungOleh;
