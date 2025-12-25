import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center px-4 py-8 overflow-hidden relative">
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 border border-red-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 border border-red-500 rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl text-center space-y-8">
        {/* Error Code */}
        <div className="space-y-4">
          <h1 className="text-9xl sm:text-[150px] font-black text-red-500 leading-none">
            404
          </h1>
          <div className="h-1 w-24 bg-linear-to-r from-red-500 to-red-600 mx-auto"></div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl font-bold text-white text-balance">
            Page Not Found
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 text-balance leading-relaxed">
            Looks like you've taken a wrong turn. The sneaker you're looking for
            isn't available in our catalog. Let's get you back on track.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-white font-semibold text-base sm:text-lg py-6 sm:py-7 px-8"
            >
              <Home size={20} className="mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link to="/shop">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-neutral-600 text-white hover:bg-neutral-800 font-semibold text-base sm:text-lg py-6 sm:py-7 px-8 bg-transparent"
            >
              Browse Collection
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>

        {/* Footer Text */}
        <div className="pt-8 sm:pt-12 border-t border-neutral-800">
          <p className="text-sm sm:text-base text-neutral-500">
            Error Code:{" "}
            <span className="text-red-500 font-mono font-bold">
              404_NOT_FOUND
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
