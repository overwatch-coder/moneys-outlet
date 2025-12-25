import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function Hero() {
    const navigate = useNavigate()

    return (
        <section className="relative h-screen w-full flex flex-col overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-105"
                style={{
                    backgroundImage: "url('/images/hero.png')",
                    backgroundColor: "#0F0F0F"
                }}
            >
                {/* Dark Overlay to match design precisely */}
                <div className="absolute inset-0 bg-black/20 backdrop-brightness-[0.8]"></div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-7xl mx-auto px-4">

                {/* Brand Box - Perfectly matched to screenshot */}
                <div className="border-[1.5px] border-white px-8 md:px-16 py-6 md:py-8 mb-6 bg-black/10 backdrop-blur-[2px] animate-in fade-in zoom-in duration-1000">
                    <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-[0.15em] leading-none">
                        MONEY'S OUTLET
                    </h1>
                </div>

                {/* Slogan - Clean white text below the box */}
                <h2 className="text-xl md:text-2xl font-medium text-white tracking-tight animate-in fade-in slide-in-from-top-4 duration-1000 delay-300 pt-5 md:pt-10">
                    Where Style Meets Value
                </h2>
            </div>

            {/* Bottom Buttons - Positioned at the very bottom edge like the screenshot */}
            <div className="relative z-10 w-full flex flex-col space-y-4 md:space-y-0 md:flex-row items-center justify-around animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 mx-auto max-w-5xl bottom-20">
                <Button
                    className="bg-[#1A1A1A]/95 text-white hover:bg-white hover:text-black uppercase py-4 md:py-7 px-10 text-base md:text-lg transition-all duration-300 rounded-none tracking-widest font-medium"
                    onClick={() => navigate('/shop?category=sneakers')}
                >
                    SHOP SNEAKERS
                </Button>

                <Button
                    variant="outline"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black uppercase py-4 md:py-6 px-10 text-base md:text-lg transition-all duration-300 rounded-none tracking-widest font-medium"
                    onClick={() => navigate('/shop?category=clothing')}
                >
                    SHOP CLOTHING
                </Button>
            </div>
        </section>
    )
}
