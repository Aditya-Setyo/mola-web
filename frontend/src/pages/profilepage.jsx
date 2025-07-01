import React from "react";
import Navbar from "../components/navbar";
import ilustrasidashboard from "../assets/iklan1.png";
import Footer from "../components/footer";
import IlustrasiProfile from "../assets/profile1.jpg";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import Hero from "../components/hero";

const ProfilePage = () => {
    return (
        <div>
            <Navbar />
            <Hero />
            <section className="px-4 py-12 md:px-20 md:py-16 bg-white mt-30 mb-30">
                <div className="max-w-10xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10">

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug text-gray-900">
                        MOLA Gaya Hidup Modern & Sehat
                    </h1>

                    <div>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                            MOLA hadir untuk menginspirasi setiap individu agar tampil percaya diri, sehat, dan bergaya melalui produk fashion, skincare, dan aksesoris berkualitas.Kami percaya bahwa penampilan yang baik dimulai dari perawatan diri yang tepat dan pilihan gaya yang sesuai. Oleh karena itu, MOLA berkomitmen menyediakan produk yang tidak hanya estetik, tetapi juga aman, ramah lingkungan, dan terjangkau.
                        </p>
                        <button className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition flex items-center space-x-2">
                            <span>Read more</span>
                            <span className="ml-2">→</span>
                        </button>
                    </div>

                </div>
            </section>
            <section className="flex justify-center items-center flex-col py-12">
                <img
                    src={IlustrasiProfile}
                    alt="Foto Perusahaan"
                    className="rounded-xl shadow-md max-w-full w-[400px] md:w-[800px] object-contain shadow-xl mb-4"
                />
            </section>
            <section className="py-16 bg-white px-6 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                    {/* Kiri - Fitur Utama */}
                    <div className="space-y-10">
                        <h1 className="text-3xl md:text-6xl font-bold text-gray-900">
                            Produk & Layanan Unggulan Kami
                        </h1>

                        {/* Fashion */}
                        <div className="flex items-start space-x-4 mt-20">
                            <Link to="/shopclothes">
                                <div className="text-3xl">👗</div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                        Produk Fashion Stylish
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Temukan pakaian yang dirancang untuk menunjang gaya personalmu, dari kasual hingga formal, dengan kenyamanan terbaik.
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Skincare */}
                        <div className="flex items-start space-x-4">
                            <Link to="/shopskincare">
                                <div className="text-3xl">🧴</div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                        Skincare Berkualitas
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Rangkaian skincare alami dan teruji untuk menjaga kesehatan dan kecantikan kulitmu setiap hari.
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Aksesoris */}
                        <div className="flex items-start space-x-4">
                            <Link to="/shopasesoris">
                                <div className="text-3xl">👜</div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                        Aksesoris Elegan
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Lengkapi penampilanmu dengan koleksi aksesoris yang trendi dan timeless – mulai dari tas, perhiasan, hingga kacamata.
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Kanan - Gambar & Teks */}
                    <div className="relative space-y-6">
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                            <strong className="text-gray-800">MOLA</strong> hadir untuk menginspirasi setiap individu agar tampil percaya diri, sehat, dan bergaya melalui produk fashion, skincare, dan aksesoris berkualitas. Kami percaya bahwa penampilan yang baik dimulai dari perawatan diri yang tepat dan pilihan gaya yang sesuai. Oleh karena itu, MOLA berkomitmen menyediakan produk yang tidak hanya estetik, tetapi juga aman, ramah lingkungan, dan terjangkau.
                        </p>

                        <div className="relative">
                            <img
                                src={IlustrasiProfile}
                                alt="Volunteer Image"
                                className="w-full max-h-[400px] rounded-lg shadow-md object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-12 md:px-20 md:py-16 bg-white mt-[-50px]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug text-gray-900">
                        Koleksi Terbaru <br />
                        MOLA Spring Edition 2025
                    </h1>
                    <HashLink smooth to="/dashboard#newarrival">
                        <button className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition flex items-center whitespace-nowrap self-start md:self-auto">
                            <span>See more</span>
                            <span className="ml-2">→</span>
                        </button>
                    </HashLink>
                </div>
            </section>
            <section className="px-4 py-12 md:px-20 md:py-10 mb-10">
                <h2 className="md:text-3xl font-bold mb-8 text-center mx-6 md:mx-26 text-gray-800">
                    What People Say
                </h2>

                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-10 justify-items-center">
                    {[
                        {
                            quote:
                                "Saya sudah mencoba banyak produk skincare sebelumnya, tapi baru kali ini kulit saya terasa benar-benar sehat dan glowing alami. Teksturnya ringan, cepat meresap, dan tidak menimbulkan iritasi. Highly recommended untuk yang punya kulit sensitif seperti saya!",
                            name: "Alisha Ramadhani",
                            role: "Beauty Enthusiast",
                            image: "/images/alisha.jpg", // ganti sesuai path gambarmu
                        },
                        {
                            quote:
                                "Koleksi aksesoris di sini benar-benar unik dan elegan. Setiap detailnya terlihat eksklusif dan cocok banget dipakai untuk daily look maupun acara formal. Saya selalu dapat pujian setiap kali memakainya!",
                            name: "Nadya Pramesti",
                            role: "Fashion Blogger",
                            image: "/images/nadya.jpg",
                        },
                        {
                            quote:
                                "Baju-bajunya stylish dan super nyaman dipakai. Bahannya adem, potongannya modern, dan ukurannya pas. Belanja di sini bikin saya tampil percaya diri tanpa harus keluar banyak biaya.",
                            name: "Dwi Anindya",
                            role: "Mahasiswi & Content Creator",
                            image: "/images/dwi.jpg",
                        },
                        {
                            quote:
                                "Saya sudah mencoba banyak produk skincare sebelumnya, tapi baru kali ini kulit saya terasa benar-benar sehat dan glowing alami. Teksturnya ringan, cepat meresap, dan tidak menimbulkan iritasi. Highly recommended untuk yang punya kulit sensitif seperti saya!",
                            name: "Alisha Ramadhani",
                            role: "Beauty Enthusiast",
                            image: "/images/alisha.jpg", // ganti sesuai path gambarmu
                        },
                        {
                            quote:
                                "Koleksi aksesoris di sini benar-benar unik dan elegan. Setiap detailnya terlihat eksklusif dan cocok banget dipakai untuk daily look maupun acara formal. Saya selalu dapat pujian setiap kali memakainya!",
                            name: "Nadya Pramesti",
                            role: "Fashion Blogger",
                            image: "/images/nadya.jpg",
                        },
                        {
                            quote:
                                "Baju-bajunya stylish dan super nyaman dipakai. Bahannya adem, potongannya modern, dan ukurannya pas. Belanja di sini bikin saya tampil percaya diri tanpa harus keluar banyak biaya.",
                            name: "Dwi Anindya",
                            role: "Mahasiswi & Content Creator",
                            image: "/images/dwi.jpg",
                        },
                    ].map((person, index) => (
                        <div
                            key={index}
                            className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            <div className="p-6">
                                <p className="text-gray-600 text-sm mb-6 italic">"{person.quote}"</p>
                                <div className="flex items-center">
                                    <img
                                        src={person.image}
                                        alt={person.name}
                                        className="w-10 h-10 rounded-full mr-4 object-cover"
                                    />
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800">{person.name}</h3>
                                        <p className="text-xs text-gray-500">{person.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );

};

export default ProfilePage;