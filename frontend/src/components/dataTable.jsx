const DataTable = ({ title, data, columns }) => (
  <div className="mb-10">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3 text-left capitalize text-gray-700">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              {columns.map((col, j) => (
                <td key={j} className="px-4 py-2">{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DataTable;
