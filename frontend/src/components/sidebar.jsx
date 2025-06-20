import {
    FaChartBar,
    FaBox,
    FaTags,
    FaUser,
    FaClipboardList,
    FaCreditCard,
    FaStar,
    FaHeart,
    FaCog,
} from "react-icons/fa";

const sidebarItems = [
    { label: "Dashboard", icon: <FaChartBar />, path: "/admin" },
    { label: "Products", icon: <FaBox />, path: "/admin/products" },
    { label: "Categories", icon: <FaTags />, path: "/admin/categories" },
    { label: "Users", icon: <FaUser />, path: "/admin/users" },
    { label: "Orders", icon: <FaClipboardList />, path: "/admin/orders" },
    { label: "Payments", icon: <FaCreditCard />, path: "/admin/payments" },
    { label: "Reviews", icon: <FaStar />, path: "/admin/reviews" },
    { label: "Wishlists", icon: <FaHeart />, path: "/admin/wishlists" },
    { label: "Settings", icon: <FaCog />, path: "/admin/settings" },
];

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white h-screen fixed top-0 left-0 shadow-lg z-10 hidden md:block">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-indigo-600">Admin Panel</h1>
            </div>
            <nav className="p-4 space-y-3">
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
    );
};

export default Sidebar;
