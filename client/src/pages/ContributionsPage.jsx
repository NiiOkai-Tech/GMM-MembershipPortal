// File: src/pages/ContributionsPage.jsx
// Page for managing member contributions.
import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import Card from "../components/ui/Card";
import useToast from "../hooks/useToast";
import { debounce } from "lodash";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const ContributionsPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [sheetData, setSheetData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const fetchSheetData = async (selectedYear) => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/contributions/sheet", {
        params: { year: selectedYear },
      });
      setSheetData(data);
    } catch (error) {
      addToast("Failed to fetch contribution data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData(year);
  }, [year]);

  const handlePledgeChange = (memberId, newAmount) => {
    const updatedData = sheetData.map((row) =>
      row.id === memberId ? { ...row, pledgedAmount: newAmount } : row
    );
    setSheetData(updatedData);
    debouncedSavePledge(memberId, year, newAmount);
  };

  const handleContributionChange = (memberId, monthIndex, newAmount) => {
    const updatedData = sheetData.map((row) => {
      if (row.id === memberId) {
        const newContributions = {
          ...row.contributions,
          [monthIndex + 1]: newAmount,
        };
        return { ...row, contributions: newContributions };
      }
      return row;
    });
    setSheetData(updatedData);
    debouncedSaveContribution(memberId, year, monthIndex + 1, newAmount);
  };

  const debouncedSavePledge = useCallback(
    debounce(async (memberId, year, amount) => {
      try {
        await api.post("/contributions/pledge", { memberId, year, amount });
        addToast("Pledge saved!", "success");
      } catch (error) {
        addToast("Failed to save pledge.", "error");
      }
    }, 1000),
    []
  );

  const debouncedSaveContribution = useCallback(
    debounce(async (memberId, year, month, amount) => {
      try {
        await api.post("/contributions/payment", {
          memberId,
          year,
          month,
          amount,
        });
        addToast("Contribution saved!", "success");
      } catch (error) {
        addToast("Failed to save contribution.", "error");
      }
    }, 1000),
    []
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contributions</h1>
        <div>
          <label htmlFor="year-select" className="mr-2 font-medium">
            Year:
          </label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="input w-32"
          >
            <option>{new Date().getFullYear() + 1}</option>
            <option>{new Date().getFullYear()}</option>
            <option>{new Date().getFullYear() - 1}</option>
          </select>
        </div>
      </div>
      <Card>
        {isLoading ? (
          <p>Loading data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border-collapse ">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th sticky left-0 bg-gray-50 z-20 w-48">
                    Full Name
                  </th>
                  <th className="th sticky left-32 bg-gray-50 z-20 w-40">
                    Amount Pledged
                  </th>
                  {MONTHS.map((month) => (
                    <th key={month} className="th">
                      {month}
                    </th>
                  ))}
                  <th className="th sticky bg-gray-50 z-10 right-56 w-32">
                    Total Paid
                  </th>
                  <th className="th sticky bg-gray-50 z-10 right-32 border-l w-32">
                    Pledge For The Year
                  </th>
                  <th className="th sticky bg-gray-50 z-10 right-0 border-l w-32">
                    Outstanding
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sheetData.map((row) => {
                  const totalPaid = Object.values(row.contributions).reduce(
                    (sum, amount) => sum + (Number(amount) || 0),
                    0
                  );
                  const pledgeForTheYear = row.pledgedAmount * 12;
                  const outstanding =
                    (Number(pledgeForTheYear) || 0) - totalPaid;
                  return (
                    <tr key={row.id}>
                      <td className="td sticky left-0 bg-white z-20 font-medium w-48">{`${row.firstName} ${row.surname}`}</td>
                      <td className="td sticky left-32 bg-white z-20">
                        <input
                          type="number"
                          min="0"
                          value={row.pledgedAmount || ""}
                          onChange={(e) =>
                            handlePledgeChange(row.id, e.target.value)
                          }
                          className="input w-28"
                        />
                      </td>
                      {MONTHS.map((month, index) => (
                        <td key={month} className="td">
                          <input
                            type="number"
                            min="0"
                            value={row.contributions[index + 1] || ""}
                            onChange={(e) =>
                              handleContributionChange(
                                row.id,
                                index,
                                e.target.value
                              )
                            }
                            className="input w-24"
                          />
                        </td>
                      ))}
                      <td className="td font-medium sticky bg-white z-10 right-56 w-32">
                        {totalPaid.toFixed(2)}
                      </td>
                      <td className="td font-medium sticky bg-white z-10 border-l right-32 w-32">
                        {pledgeForTheYear.toFixed(2)}
                      </td>
                      <td
                        className={`td font-medium sticky bg-white z-10 right-0 border-l w-32 ${
                          outstanding > 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {Math.max(outstanding, 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ContributionsPage;
