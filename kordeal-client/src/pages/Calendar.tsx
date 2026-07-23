import React from "react";
import PageMeta from "../components/common/PageMeta";

const Calendar: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Calendar | KORDEAL"
        description="Calendar page is temporarily disabled due to dependency issues."
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Calendar (Temporarily Disabled)
        </h2>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          We are currently resolving dependency issues with FullCalendar. Please check back later.
        </p>
      </div>
    </>
  );
};

export default Calendar;
