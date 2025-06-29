import {
    FaChartBar,
    FaBox,
    FaTags,
    FaUser,
    FaClipboardList,
    FaCreditCard,
    FaStar,
    FaCog,
    FaMegaport,
    FaChartLine,
    FaPalette,
} from "react-icons/fa";
import { useState } from "react";
import { FaBars } from "react-icons/fa";

const sidebarItems = [
    { label: "Dashboard", icon: <FaChartBar />, path: "/adminpage" },
    { label: "Products", icon: <FaBox />, path: "/admin/products" },
    {label: "Variant Products", icon: <FaPalette/>, path: "/admin/variantpage"},
    { label: "Master Data", icon: <FaTags />, path: "/admin/masterdata" },
    { label: "Users", icon: <FaUser />, path: "/admin/users" },
    { label: "Orders", icon: <FaClipboardList />, path: "/admin/orders" },
    { label: "Payments", icon: <FaCreditCard />, path: "/admin/payments" },
    { label: "Advertisement", icon: <FaMegaport />, path: "/admin/advertisement" },
    { label: "Reviews", icon: <FaStar />, path: "/admin/reviews" },
    { label: "Sales Report", icon: <FaChartLine  />, path: "/admin/salesreportpage" },
    { label: "Settings", icon: <FaCog />, path: "/admin/settings" },
];

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="md:hidden p-4 bg-white shadow z-20 fixed top-0 left-0 w-full flex justify-between items-center">
                <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-2xl text-gray-600 focus:outline-none"
                >
                    <FaBars />
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`bg-white h-screen fixed top-0 left-0 shadow-lg z-30 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } w-64 md:block`}
            >
                <div className="p-6 border-b border-gray-100 hidden md:block">
                    <h1 className="text-2xl font-bold text-indigo-600">Admin Panel</h1>
                </div>
                <nav className="p-4 space-y-3 mt-14 md:mt-0">
                    {sidebarItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.path}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition"
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                        </a>
                    ))}
                </nav>
            </aside>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-30 z-20 md:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;
