import { Zap, Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'gadget-galaxy'
  );

  return (
    <footer id="contact" className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-teal rounded-lg p-1.5">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Gadget Galaxy</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop destination for the latest and greatest tech gadgets.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {['Home', 'Products', 'Contact'].map((link) => (
                <li key={link}>
                  <a
                    href={link === 'Products' ? '#products' : '#'}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>support@gadgetgalaxy.com</li>
              <li>1-800-GADGETS</li>
              <li>Mon–Fri, 9am–6pm EST</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© {year} Gadget Galaxy. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3.5 h-3.5 fill-teal text-teal mx-0.5" />
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:text-accent transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
