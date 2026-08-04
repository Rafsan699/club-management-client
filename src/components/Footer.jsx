import React from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';

const Footer = ({ content }) => {
  return (
    <footer id="contact" className="bg-[#0b132b] text-white border-t-2 border-emerald-500/40">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm sm:text-base">
        
        {/* 1. Office */}
        <div className="space-y-3">
          <h4 className="font-black text-base uppercase text-amber-400 border-b border-blue-900/60 pb-2 mb-3 tracking-wide">
            OFFICE
          </h4>
          <p className="font-medium text-gray-200 leading-relaxed">
            <span className="font-bold text-white">Address:</span> {content?.contact?.address || 'N/A'}
          </p>
          <p className="font-medium text-gray-200">
            <span className="font-bold text-white">Office Hours:</span> {content?.contact?.officeHours || 'N/A'}
          </p>
        </div>

        {/* 2. Contact */}
        <div className="space-y-3">
          <h4 className="font-black text-base uppercase text-amber-400 border-b border-blue-900/60 pb-2 mb-3 tracking-wide">
            CONTACT
          </h4>
          <p className="font-medium text-gray-200">
            <span className="font-bold text-white">Phone:</span> {content?.contact?.phone || 'N/A'}
          </p>
          <p className="font-medium text-gray-200">
            <span className="font-bold text-white">Email:</span> {content?.contact?.email || 'N/A'}
          </p>
        </div>

        {/* 3. Location */}
        <div className="space-y-3">
          <h4 className="font-black text-base uppercase text-amber-400 border-b border-blue-900/60 pb-2 mb-3 tracking-wide">
            LOCATION
          </h4>
          {content?.contact?.googleMapUrl ? (
            <div className="overflow-hidden rounded-xl h-28 border border-slate-700 shadow-inner">
              <iframe 
                src={content.contact.googleMapUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                title="Google Map"
              ></iframe>
            </div>
          ) : (
            <p className="text-gray-400 text-xs">Map location not provided.</p>
          )}
        </div>

        {/* 4. Social */}
        <div className="space-y-3">
          <h4 className="font-black text-base uppercase text-amber-400 border-b border-blue-900/60 pb-2 mb-3 tracking-wide">
            SOCIAL
          </h4>
          <div className="flex space-x-4 text-2xl pt-2">
            {content?.social?.facebook && (
              <a href={content.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-500 transition">
                <FaFacebook />
              </a>
            )}
            {content?.social?.instagram && (
              <a href={content.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-pink-500 transition">
                <FaInstagram />
              </a>
            )}
            {content?.social?.youtube && (
              <a href={content.social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-500 transition">
                <FaYoutube />
              </a>
            )}
            {content?.social?.linkedin && (
              <a href={content.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition">
                <FaLinkedin />
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Copyright Line */}
      <div className="bg-[#050b18] py-5 text-center text-xs sm:text-sm font-bold text-gray-400 border-t border-slate-800">
        {content?.copyrightText 
          ? content.copyrightText 
          : `© ${new Date().getFullYear()} ${content?.universityName || 'BRAHMAPUTRA INTERNATIONAL UNIVERSITY'} SPORTS CLUB`}
      </div>
    </footer>
  );
};

export default Footer;