import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  // Define the primary color utility class for consistency
  const PRIMARY_COLOR = "text-brand-primary";
  const HOVER_BG = "hover:bg-brand-primary";

  return (
    // Changed bg-gray-900 to bg-gray-800 for a slightly softer dark shade
    <footer className="relative bg-brand-secondary-light overflow-hidden border-t border-brand-primary">
      <div className="w-full px-4 md:px-8 lg:px-16">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Company Info Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              {/* Logo: ZAUQ (Updated from SUMILUX) */}
              <span className={`text-4xl font-extrabold tracking-tighter ${PRIMARY_COLOR}`}>
                ZAUQ
              </span>
            </div>
            <p className="text-gray-900 leading-relaxed mb-8 max-w-md text-sm">
              Grow More Safety Institute and consulting PVT.LTD is an occupational health and safety
              institute recognized by Government if India. We offer basic and
              advance OHS Qualification.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center text-gray-900 transition-colors duration-300 hover:text-black">
                <Mail className={`w-5 h-5 ${PRIMARY_COLOR} mr-3 shrink-0`} />
                <span>info@zauq.com</span>
              </div>
              <div className="flex items-center text-gray-900 transition-colors duration-300 hover:text-black">
                <Phone className={`w-5 h-5 ${PRIMARY_COLOR} mr-3 shrink-0`} />
                <span>+91 0000000000</span>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div>
            <h4 className={`text-lg font-bold uppercase mb-6 ${PRIMARY_COLOR} border-b-2 border-brand-primary pb-2 inline-block`}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'Products', href: '/products' },
                { name: 'Collections', href: '/collections' },
                { name: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`text-gray-900 hover:${PRIMARY_COLOR} transition-all duration-300 hover:pl-2 transform text-sm`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Address & Social Section */}
          <div>
            <h4 className={`text-lg font-bold uppercase mb-6 ${PRIMARY_COLOR} border-b-2 border-brand-primary pb-2 inline-block`}>
              Contact & Address
            </h4>

            {/* Address */}
            <div className="mb-8 space-y-6">
              <div className="flex items-start text-gray-900">
                <MapPin className={`w-5 h-5 ${PRIMARY_COLOR} mr-3 mt-1 shrink-0`} />
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">Address:</p>
                  <p className="leading-relaxed">
                    Madina Gali, Nayatola, Phulwari Sharif, Patna, Bihar - 801505
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h5 className={`text-base font-bold uppercase mb-4 ${PRIMARY_COLOR}`}>
                Follow Us On
              </h5>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className={`bg-gray-900 ${HOVER_BG} p-3 rounded-full transition-all duration-300 transform hover:scale-110 border border-gray-700 hover:border-brand-primary`}
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a
                  href="#"
                  className={`bg-gray-900 ${HOVER_BG} p-3 rounded-full transition-all duration-300 transform hover:scale-110 border border-gray-700 hover:border-brand-primary`}
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a
                  href="#"
                  className={`bg-gray-900 ${HOVER_BG} p-3 rounded-full transition-all duration-300 transform hover:scale-110 border border-gray-700 hover:border-brand-primary`}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-brand-primary py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm">
              Copyright ©2025 Shop | Powered by zauq.com.
            </p>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 bg-brand-primary rounded-full animate-pulse`}></div>
              <span className="text-sm text-gray-400">Trusted & Secure</span>
            </div>
          </div>
        </div>
      </div>
      {/* Removed unnecessary decorative div */}
    </footer>
  );
};

export default Footer;