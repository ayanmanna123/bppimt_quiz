import { Facebook, Instagram, Twitter } from "lucide-react";
import React from "react";

const Footerreal = () => {
  return (
    <footer className="bg-white text-gray-800 border-t border-gray-200">
      {/* Top Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Company */}
        <div>
          <h3 className="font-bold text-lg mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-green-600">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                Jobs
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                For the Record
              </a>
            </li>
          </ul>
        </div>

        {/* Communities */}
        <div>
          <h3 className="font-bold text-lg mb-4">Communities</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-green-600">
                For Students
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                For Teachers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                Developers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                Investors
              </a>
            </li>
          </ul>
        </div>

        {/* Useful Links */}
        <div>
          <h3 className="font-bold text-lg mb-4">Useful Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-green-600">
                Support
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                Free Mobile App
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                Popular Quizzes
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                Certificates
              </a>
            </li>
          </ul>
        </div>

        {/* Plans */}
        <div>
          <h3 className="font-bold text-lg mb-4">Plans</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-green-600">
                Free Plan
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                Student Premium
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                Family Pack
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-600">
                Institutional
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Legal links */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-green-600">
              Legal
            </a>
            <a href="#" className="hover:text-green-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-green-600">
              Cookies
            </a>
            <a href="#" className="hover:text-green-600">
              Accessibility
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-4">
            <a
              href="#"
              className="p-2 rounded-full bg-gray-100 hover:bg-green-600 hover:text-white transition"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-gray-100 hover:bg-green-600 hover:text-white transition"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-gray-100 hover:bg-green-600 hover:text-white transition"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto px-6 pb-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} QuizApp — All rights reserved.
      </div>
    </footer>
  );
};

export default Footerreal;
