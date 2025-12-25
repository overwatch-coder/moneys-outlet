import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { dataService } from "@/lib/dataService";
import type { Brand } from "@/types";

export default function BrandSection() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    dataService
      .getBrands()
      .then((data) => {
        setBrands(data.slice(0, 3));
      })
      .catch(console.error);
  }, []);

  const designConfigs = [
    {
      promo: "UP to 80% OFF",
      color: "bg-[#2B2B2B]",
      badgeColor: "bg-white/10",
      textColor: "text-white",
      defaultImage: "/images/nike.png",
    },
    {
      promo: "UP TO 50% OFF",
      color: "bg-[#FFF4CA]",
      badgeColor: "bg-[#F7E18B]",
      textColor: "text-[#4A4226]",
      hasPattern: true,
      defaultImage: "/images/nike.png",
    },
    {
      promo: "UP TO 50% OFF",
      color: "bg-primary",
      badgeColor: "bg-[#FFD1B0]",
      textColor: "text-black",
      hasCircle: true,
      defaultImage: "/images/nike.png",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-8">
        <h2 className="text-center text-muted font-bold uppercase tracking-[0.3em] mb-12">
          Top Brands
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brands.map((brand, index) => {
            const design = designConfigs[index] || designConfigs[0];

            return (
              <div
                key={brand.id}
                className={cn(
                  "group relative h-48 rounded-2xl overflow-hidden p-6 cursor-pointer border border-white/5 hover:border-white/10 transition-all",
                  design.color
                )}
              >
                {/* Background Elements */}
                {design.hasPattern && (
                  <div className="absolute -right-16 -top-14 opacity-90 flex items-center justify-center">
                    <div className="w-52 h-52 rounded-full bg-transparent border border-[#EDE734] rotate-45 transform"></div>
                    <div className="absolute w-48 h-48 rounded-full bg-[#F6DE8D] border border-[#EDE734] rotate-45 transform"></div>
                  </div>
                )}

                {design.hasCircle && (
                  <div className="absolute -right-16 -top-14 opacity-90 flex items-center justify-center">
                    <div className="w-52 h-52 rounded-full bg-transparent border border-[#FFD1B0] rotate-45 transform"></div>
                    <div className="absolute w-48 h-48 rounded-full bg-[#FFD1B0] border border-[#FFD1B0] rotate-45 transform"></div>
                  </div>
                )}

                <div className="relative z-10 h-full flex flex-col justify-between">
                  {/* Top Badge */}
                  <div className="flex flex-col gap-4">
                    <div
                      className={cn(
                        "inline-flex items-center justify-center px-6 py-2 rounded-md text-[10px] font-black tracking-widest leading-none self-start uppercase",
                        design.badgeColor,
                        design.textColor
                      )}
                    >
                      {brand.name}
                    </div>

                    {/* Logo Box */}
                    <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-sm">
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "font-black italic text-2xl uppercase leading-tight",
                      design.textColor
                    )}
                  >
                    UP TO {brand.promoPercentage || (index === 0 ? 80 : 50)}%
                    OFF
                  </div>
                </div>

                <img
                  src={brand.defaultImage || design.defaultImage}
                  alt={brand.name}
                  className="absolute right-[-10%] bottom-[-2%] md:bottom-[-10%] h-48 w-48 md:h-60 md:w-60 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-5deg] drop-shadow-2xl"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
