import { ArrowRight, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient py-20 sm:py-28">
      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 fill-white" />
          <span>Top-rated tech store</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Discover the Latest
          <br />
          <span className="text-white/80">Tech &amp; Gadgets!</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
          Upgrade your life with our curated selection of innovative gadgets.
          Premium quality, unbeatable prices.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#products"
            className="inline-flex items-center justify-center gap-2 bg-white text-teal font-bold px-8 py-3.5 rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Shop Now
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#products"
            className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/25 transition-all duration-200 backdrop-blur-sm"
          >
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
}
