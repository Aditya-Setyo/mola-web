const DashboardCard = ({ label, value, color }) => (
  <div className={`p-6 rounded-xl shadow-md ${color} text-white`}>
    <p className="text-sm">{label}</p>
    <h2 className="text-2xl font-bold">{value}</h2>
  </div>
);

export default DashboardCard;
