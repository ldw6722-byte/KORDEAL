import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">KORDEAL Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to the dashboard. If you see this, the basic rendering is working.</p>
        <div className="mt-8 p-4 border border-dashed border-gray-300 rounded-lg">
          <p>Complex components are temporarily hidden for debugging.</p>
        </div>
      </div>
    </>
  );
}
