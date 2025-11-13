import { useEffect, useState } from "react";
import { ordersAPI } from '../../services/restaurantDashboardService';
import { format } from 'date-fns';
import * as XLSX from "xlsx";
import toast from 'react-hot-toast';


const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [stats, setStats] = useState({
    salesGrowth: 0,
    topCategory: "",
    averageOrder: 0,
    peakHour: "",
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [dateRangeText, setDateRangeText] = useState("");

  useEffect(() => {
    fetchReportsData();

    const interval = setInterval(() => {
      fetchReportsData();
    }, 30000);

    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date();
      const previousStartDate = new Date();
      const previousEndDate = new Date();

      if (dateRange === "today") {
        startDate.setHours(0, 0, 0, 0);
        previousStartDate.setDate(today.getDate() - 1);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate.setDate(today.getDate() - 1);
        previousEndDate.setHours(23, 59, 59, 999);
      } else if (dateRange === "week") {
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        previousStartDate.setDate(today.getDate() - 14);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate.setDate(today.getDate() - 8);
        previousEndDate.setHours(23, 59, 59, 999);
      } else if (dateRange === "month") {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        previousStartDate.setTime(lastMonth.getTime());
        previousStartDate.setHours(0, 0, 0, 0);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        previousEndDate.setTime(lastMonthEnd.getTime());
        previousEndDate.setHours(23, 59, 59, 999);
      } else if (dateRange === "year") {
        startDate.setFullYear(today.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        previousStartDate.setFullYear(today.getFullYear() - 1, 0, 1);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate.setFullYear(today.getFullYear() - 1, 11, 31);
        previousEndDate.setHours(23, 59, 59, 999);
      }

      const dateRangeLabel = dateRange === "today" ? "Today" 
        : dateRange === "week" ? "Last 7 Days"
        : dateRange === "month" ? "This Month"
        : "This Year";
      setDateRangeText(`${dateRangeLabel} - ${format(startDate, "MMM dd, yyyy")} to ${format(endDate, "MMM dd, yyyy")}`);

      const allOrders = await ordersAPI.getAll();
      
      const currentOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && 
               orderDate <= endDate && 
               order.status === "completed";
      });

      const currentOrdersWithItems = await Promise.all(
        currentOrders.map(async (order) => {
          try {
            const items = await ordersAPI.getItems(order.id);
            return { ...order, order_items: items };
          } catch {
            return { ...order, order_items: [] };
          }
        })
      );

      const previousOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= previousStartDate && 
               orderDate <= previousEndDate && 
               order.status === "completed";
      });

      const currentRevenue = (currentOrdersWithItems || []).reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      );

      const previousRevenue = (previousOrders || []).reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      );

      const salesGrowth = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0 ? 100 : 0;

      const totalOrders = currentOrdersWithItems?.length || 0;
      const averageOrder = totalOrders > 0 ? currentRevenue / totalOrders : 0;

      const uniqueCustomers = new Set(
        (currentOrdersWithItems || [])
          .map((o) => o.customer_name)
          .filter((name) => name)
      );

      const categoryMap = new Map();
      (currentOrdersWithItems || []).forEach((order) => {
        (order.order_items || []).forEach((item) => {
          const category = item.menu_items?.category || "Unknown";
          const quantity = item.quantity || 0;
          const revenue = (item.price || 0) * quantity;
          const existing = categoryMap.get(category) || { quantity: 0, revenue: 0 };
          categoryMap.set(category, {
            quantity: existing.quantity + quantity,
            revenue: existing.revenue + revenue
          });
        });
      });

      const categoryArray = Array.from(categoryMap.entries())
        .map(([name, data]) => ({ name, value: data.quantity, revenue: data.revenue }))
        .sort((a, b) => b.value - a.value);

      const topCategory = categoryArray.length > 0 ? categoryArray[0].name : "N/A";

        const hourMap = new Map();
      (currentOrdersWithItems || []).forEach((order) => {
        const hour = new Date(order.created_at).getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      });

      const hourlyArray = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        orders: hourMap.get(i) || 0,
      }));

      const peakHourEntry = hourlyArray.reduce((max, curr) =>
        curr.orders > max.orders ? curr : max
      );
      const peakHour = peakHourEntry.orders > 0
        ? (() => {
            const hour = parseInt(peakHourEntry.hour.split(':')[0]);
            const nextHour = hour + 1;
            return `${hour} ${hour < 12 ? 'AM' : 'PM'} - ${nextHour} ${nextHour < 12 ? 'AM' : 'PM'}`;
          })()
        : "N/A";

      const dailyRevenueMap = new Map();
      (currentOrdersWithItems || []).forEach((order) => {
        const date = format(new Date(order.created_at), "MMM dd");
        dailyRevenueMap.set(
          date,
          (dailyRevenueMap.get(date) || 0) + Number(order.total_amount)
        );
      });

      const revenueArray = Array.from(dailyRevenueMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setStats({
        salesGrowth,
        topCategory,
        averageOrder,
        peakHour,
        totalRevenue: currentRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers.size,
      });

      setCategoryData(categoryArray.slice(0, 6));
      setHourlyData(hourlyArray);
      setRevenueData(revenueArray);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        ["Reports Summary"],
        ["Date Range", dateRangeText],
        ["Generated On", format(new Date(), "MMM dd, yyyy HH:mm")],
        [""],
        ["Metric", "Value"],
        ["Sales Growth", `${stats.salesGrowth >= 0 ? '+' : ''}${stats.salesGrowth.toFixed(1)}%`],
        ["Top Category", stats.topCategory],
        ["Average Order", `frw ${stats.averageOrder.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
        ["Peak Hours", stats.peakHour],
        ["Total Revenue", `frw ${stats.totalRevenue.toLocaleString()}`],
        ["Total Orders", stats.totalOrders],
        ["Total Customers", stats.totalCustomers],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      const revenueHeaders = [["Date", "Revenue (RWF)"]];
      const revenueRows = revenueData.map(item => [item.date, item.revenue]);
      const revenueSheetData = [...revenueHeaders, ...revenueRows];
      const revenueSheet = XLSX.utils.aoa_to_sheet(revenueSheetData);
      XLSX.utils.book_append_sheet(workbook, revenueSheet, "Revenue Trend");

      const categoryHeaders = [["Category", "Quantity", "Revenue (RWF)", "Percentage"]];
      const totalCategory = categoryData.reduce((sum, cat) => sum + cat.value, 0);
      const categoryRows = categoryData.map(item => {
        const percentage = totalCategory > 0 ? ((item.value / totalCategory) * 100).toFixed(1) : 0;
        return [item.name, item.value, item.revenue || 0, `${percentage}%`];
      });
      const categorySheetData = [...categoryHeaders, ...categoryRows];
      const categorySheet = XLSX.utils.aoa_to_sheet(categorySheetData);
      XLSX.utils.book_append_sheet(workbook, categorySheet, "Category Distribution");

      const filename = `reports_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      XLSX.writeFile(workbook, filename);
      toast.success("Report exported to Excel successfully!");
    } catch (error) {
      toast.error("Failed to export to Excel");
    }
  };

  return (
    <>
      <style>{`
        .print-title {
          display: none;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-tables-only, .print-tables-only * {
            visibility: visible;
          }
          .print-tables-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
          }
          body {
            background: white !important;
          }
          .print-title {
            display: block;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ddd;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 1cm;
            background: white;
          }
          .print-tables-only .card {
            break-inside: avoid;
            margin-bottom: 30px;
            page-break-inside: avoid;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            padding: 0;
            margin: 0 0 30px 0;
          }
          .print-tables-only .card-header {
            display: block;
            padding: 0;
            margin-bottom: 10px;
            background: white;
            border: none;
          }
          .print-tables-only .card-title {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            padding: 0;
            color: #000;
            background: white;
          }
          .print-tables-only .card-content {
            padding: 0;
            background: white;
          }
          .print-tables-only .print-table-wrapper {
            border: none !important;
            border-radius: 0 !important;
            overflow: visible;
            background: white;
          }
          .print-tables-only table {
            border-collapse: collapse;
            width: 100%;
            border: 1px solid #000 !important;
            margin-bottom: 20px;
            border-radius: 0 !important;
            background: white;
          }
          .print-tables-only th,
          .print-tables-only td {
            border: 1px solid #000 !important;
            padding: 5px 8px;
            text-align: left;
            font-size: 12px;
            border-radius: 0 !important;
            background: white;
          }
          .print-tables-only th {
            background-color: #f0f0f0 !important;
            font-weight: bold;
            text-align: center;
          }
          .print-tables-only td {
            background-color: white !important;
          }
          .print-tables-only .table-row {
            border: none;
            background: white;
          }
          .print-tables-only * {
            background-color: white !important;
          }
          .print-tables-only th {
            background-color: #f0f0f0 !important;
          }
          .print-title h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .print-title p {
            font-size: 14px;
            color: #666;
          }
        }
      `}</style>
      <div className="p-3 space-y-3 animate-fade-in printable-content">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Reports</h1>
            <p className="text-xs text-muted-foreground">Analytics and insights for your business</p>
            {dateRangeText && (
              <p className="text-xs text-muted-foreground mt-0.5" id="print-date-range">
                {dateRangeText} | Generated on {format(new Date(), "MMM dd, yyyy HH:mm")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="no-print">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="w-[140px] h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <button 
              onClick={handleExportToExcel}
              className="no-print bg-green-600 hover:bg-green-700 text-white border border-green-600 h-8 px-3 text-xs rounded"
            >
              Export to Excel
            </button>
            <button 
              onClick={handlePrint}
              className="no-print bg-green-600 hover:bg-green-700 text-white border border-green-600 h-8 px-3 text-xs rounded"
            >
              Print
            </button>
          </div>
        </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white border border-gray-200 rounded border-l-2 border-l-green-600">
              <div className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-xs font-medium">Sales Growth</h3>
              </div>
              <div className="px-2 pb-2">
                <div className={`text-sm font-bold ${stats.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.salesGrowth >= 0 ? '+' : ''}{stats.salesGrowth.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  vs previous {dateRange === "today" ? "day" : dateRange === "week" ? "week" : dateRange === "month" ? "month" : "year"}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded border-l-2 border-l-blue-600">
              <div className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-xs font-medium">Top Category</h3>
              </div>
              <div className="px-2 pb-2">
                <div className="text-sm font-bold text-blue-600">{stats.topCategory}</div>
                <p className="text-xs text-gray-500 mt-0.5">Most ordered</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded border-l-2 border-l-purple-600">
              <div className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-xs font-medium">Average Order</h3>
              </div>
              <div className="px-2 pb-2">
                <div className="text-sm font-bold text-purple-600">
                  frw {stats.averageOrder.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Per transaction</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded border-l-2 border-l-green-600">
              <div className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-xs font-medium">Peak Hours</h3>
              </div>
              <div className="px-2 pb-2">
                <div className="text-sm font-bold text-green-600">{stats.peakHour}</div>
                <p className="text-xs text-gray-500 mt-0.5">Busiest time</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <div className="bg-white border border-gray-200 rounded">
              <div className="pb-1 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-xs font-medium">Total Revenue</h3>
              </div>
              <div className="px-2 pb-2">
                <div className="text-lg font-bold text-green-600">
                  frw {stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {stats.totalOrders} orders completed
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded">
              <div className="pb-1 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-xs font-medium">Total Orders</h3>
              </div>
              <div className="px-2 pb-2">
                <div className="text-lg font-bold text-blue-600">
                  {stats.totalOrders}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Completed orders
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded">
              <div className="pb-1 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-xs font-medium">Total Customers</h3>
              </div>
              <div className="px-2 pb-2">
                <div className="text-lg font-bold text-purple-600">
                  {stats.totalCustomers}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Unique customers
                </p>
              </div>
            </div>
          </div>

          <div className="print-tables-only">
            <div className="mb-3 print-title">
              <h1 className="text-lg font-bold">Reports</h1>
              {dateRangeText && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dateRangeText} | Generated on {format(new Date(), "MMM dd, yyyy HH:mm")}
                </p>
              )}
            </div>
            <div className="grid gap-2 md:grid-cols-2">
            <div className="bg-white border border-gray-200 rounded">
              <div className="pb-1 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold">Revenue Trend</h3>
              </div>
              <div className="p-2">
                {revenueData.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg print-table-wrapper">
                    <table className="w-full">
                      <thead>
                        <tr className="h-7 border-b border-gray-200">
                          <th className="px-2 py-1 text-xs text-left">Date</th>
                          <th className="px-2 py-1 text-xs text-right">Revenue (RWF)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="px-2 py-1 text-xs">{item.date}</td>
                            <td className="px-2 py-1 text-xs text-right font-medium">
                              {item.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[150px]">
                    <p className="text-xs text-gray-500">No data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded">
              <div className="pb-1 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold">Category Distribution</h3>
              </div>
              <div className="p-2">
                {categoryData.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg print-table-wrapper">
                    <table className="w-full">
                      <thead>
                        <tr className="h-7 border-b border-gray-200">
                          <th className="px-2 py-1 text-xs text-left">Category</th>
                          <th className="px-2 py-1 text-xs text-right">Quantity</th>
                          <th className="px-2 py-1 text-xs text-right">Revenue (RWF)</th>
                          <th className="px-2 py-1 text-xs text-right">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryData.map((item, index) => {
                          const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
                          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                          return (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="px-2 py-1 text-xs">{item.name}</td>
                              <td className="px-2 py-1 text-xs text-right font-medium">
                                {item.value}
                              </td>
                              <td className="px-2 py-1 text-xs text-right font-medium">
                                {(item.revenue || 0).toLocaleString()}
                              </td>
                              <td className="px-2 py-1 text-xs text-right font-medium">
                                {percentage}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[150px]">
                    <p className="text-xs text-gray-500">No data available</p>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </>
      )}
      </div>
    </>
  );
};

export default Reports;
