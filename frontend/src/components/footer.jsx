import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaTiktok } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 px-6 md:px-12 py-10 border-t mt-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-lg font-bold mb-3 text-gray-800">MOLA</h4>
          <p className="text-sm">Temukan Tren Fashion Terbaru yang Bikin Tampil Percaya Diri!</p>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-3 text-gray-800">Layanan Pelanggan</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-blue-500 cursor-pointer"> <a
              href="https://wa.me/087798645253"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 cursor-pointer"
            >
              Hubungi Kami
            </a></li>
            <li className="hover:text-blue-500 cursor-pointer">Ekspedisi</li>
          </ul>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-3 text-gray-800">Tentang Kami</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-blue-500 cursor-pointer">
              <Link to="/profilepage">Profil Perusahaan</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-3 text-gray-800">Ikuti Kami :</h4>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-600">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-pink-500">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-black">
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-md text-gray-400">
        &copy; {new Date().getFullYear()} MOLA. Semua hak dilindungi. <br />
      </div>
    </footer>
  );
};

export default Footer;
