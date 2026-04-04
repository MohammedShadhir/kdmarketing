import { useState, useMemo, useEffect } from "react";
import { useSubContractorsStore } from "@/store/subcontractors.store";
import { useProjectsStore } from "@/store/projects.store";
import { getCurrentYearMonth, formatCurrency } from "@/lib/dates";
import { calcProjectSaved, calcProjectSimulated, sumRows } from "@/lib/calc";

export function CalculatorPage() {
  const subContractors = useSubContractorsStore((s) => s.subContractors);
  const loading = useSubContractorsStore((s) => s.loading);
  const fetchSubContractors = useSubContractorsStore(
    (s) => s.fetchSubContractors
  );
  const listBySubContractorAndMonth = useProjectsStore(
    (s) => s.listBySubContractorAndMonth
  );
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);

  useEffect(() => {
    fetchSubContractors();
    fetchProjects();
  }, [fetchSubContractors, fetchProjects]);

  const [selectedSubContractorId, setSelectedSubContractorId] =
    useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [subconPct, setSubconPct] = useState<number | undefined>(undefined);
  const [salesPct, setSalesPct] = useState<number | undefined>(undefined);
  const [display, setDisplay] = useState("0");
  const [currentInput, setCurrentInput] = useState("");
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const projects = useMemo(() => {
    if (!selectedSubContractorId) return [];
    return listBySubContractorAndMonth(selectedSubContractorId, selectedMonth);
  }, [selectedSubContractorId, selectedMonth, listBySubContractorAndMonth]);

  const savedTotals = useMemo(() => {
    const calculations = projects.map(calcProjectSaved);
    return sumRows(calculations);
  }, [projects]);

  const simulatedTotals = useMemo(() => {
    const calculations = projects.map((p) =>
      calcProjectSimulated(p, subconPct, salesPct)
    );
    return sumRows(calculations);
  }, [projects, subconPct, salesPct]);

  const hasOverrides = subconPct !== undefined || salesPct !== undefined;

  const handleKeypad = (key: string) => {
    if (key === "C") {
      setDisplay("0");
      setCurrentInput("");
    } else if (key === "AC") {
      setDisplay("0");
      setCurrentInput("");
      setMemory(0);
      setHistory([]);
    } else if (key === "=") {
      try {
        let expression = currentInput
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/π/g, Math.PI.toString())
          .replace(/e/g, Math.E.toString());

        const result = eval(expression);
        const roundedResult = Math.round(result * 100000000) / 100000000;
        setDisplay(roundedResult.toString());
        setHistory([...history, `${currentInput} = ${roundedResult}`]);
        setCurrentInput(roundedResult.toString());
      } catch {
        setDisplay("Error");
        setCurrentInput("");
      }
    } else if (key === "backspace") {
      const newInput = currentInput.slice(0, -1) || "0";
      setCurrentInput(newInput);
      setDisplay(newInput);
    } else if (key === "√") {
      try {
        const num = parseFloat(currentInput || "0");
        const result = Math.sqrt(num);
        setDisplay(result.toString());
        setHistory([...history, `√${num} = ${result}`]);
        setCurrentInput(result.toString());
      } catch {
        setDisplay("Error");
      }
    } else if (key === "x²") {
      try {
        const num = parseFloat(currentInput || "0");
        const result = num * num;
        setDisplay(result.toString());
        setHistory([...history, `${num}² = ${result}`]);
        setCurrentInput(result.toString());
      } catch {
        setDisplay("Error");
      }
    } else if (key === "xʸ") {
      setCurrentInput(currentInput + "**");
      setDisplay(currentInput + "^");
    } else if (key === "1/x") {
      try {
        const num = parseFloat(currentInput || "0");
        if (num === 0) {
          setDisplay("Cannot divide by 0");
          setCurrentInput("");
        } else {
          const result = 1 / num;
          setDisplay(result.toString());
          setHistory([...history, `1/${num} = ${result}`]);
          setCurrentInput(result.toString());
        }
      } catch {
        setDisplay("Error");
      }
    } else if (key === "%") {
      try {
        const num = parseFloat(currentInput || "0");
        const result = num / 100;
        setDisplay(result.toString());
        setCurrentInput(result.toString());
      } catch {
        setDisplay("Error");
      }
    } else if (key === "+/-") {
      try {
        const num = parseFloat(currentInput || "0");
        const result = -num;
        setDisplay(result.toString());
        setCurrentInput(result.toString());
      } catch {
        setDisplay("Error");
      }
    } else if (key === "sin" || key === "cos" || key === "tan") {
      try {
        const num = parseFloat(currentInput || "0");
        const radians = (num * Math.PI) / 180;
        let result;
        if (key === "sin") result = Math.sin(radians);
        else if (key === "cos") result = Math.cos(radians);
        else result = Math.tan(radians);

        const roundedResult = Math.round(result * 100000000) / 100000000;
        setDisplay(roundedResult.toString());
        setHistory([...history, `${key}(${num}°) = ${roundedResult}`]);
        setCurrentInput(roundedResult.toString());
      } catch {
        setDisplay("Error");
      }
    } else if (key === "log" || key === "ln") {
      try {
        const num = parseFloat(currentInput || "0");
        const result = key === "log" ? Math.log10(num) : Math.log(num);
        setDisplay(result.toString());
        setHistory([...history, `${key}(${num}) = ${result}`]);
        setCurrentInput(result.toString());
      } catch {
        setDisplay("Error");
      }
    } else if (key === "π" || key === "e") {
      const value = key === "π" ? Math.PI.toString() : Math.E.toString();
      setCurrentInput(currentInput + value);
      setDisplay(currentInput + key);
    } else if (key === "MC") {
      setMemory(0);
    } else if (key === "MR") {
      setCurrentInput(memory.toString());
      setDisplay(memory.toString());
    } else if (key === "M+") {
      try {
        const num = parseFloat(currentInput || "0");
        setMemory(memory + num);
      } catch {
        setDisplay("Error");
      }
    } else if (key === "M-") {
      try {
        const num = parseFloat(currentInput || "0");
        setMemory(memory - num);
      } catch {
        setDisplay("Error");
      }
    } else if (key === "×" || key === "÷") {
      const newInput = currentInput + key;
      setCurrentInput(newInput);
      setDisplay(newInput);
    } else {
      const newInput = currentInput === "0" && key !== "." ? key : currentInput + key;
      setCurrentInput(newInput);
      setDisplay(newInput);
    }
  };

  const selectedSubContractor = subContractors.find(
    (c) => c.id === selectedSubContractorId
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Calculator</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Simulate project calculations with different percentages
          </p>
        </div>

        {}
        <div className="card p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sub-Contractor *
              </label>
              <select
                value={selectedSubContractorId}
                onChange={(e) => setSelectedSubContractorId(e.target.value)}
                className="input-field w-full"
                disabled={loading}
              >
                <option value="">
                  {loading
                    ? "Loading sub-contractors..."
                    : "Select a sub-contractor..."}
                </option>
                {subContractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {subContractors.length > 0 && !loading && (
                <p className="text-xs text-gray-600 mt-1">
                  {subContractors.length} sub-contractor
                  {subContractors.length !== 1 ? "s" : ""} available
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Month (YYYY-MM)
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        {selectedSubContractorId && (
          <>
            {}
            <div className="card p-4 sm:p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Monthly Summary
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedSubContractor?.name}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="metric-card bg-[#8B5CF6]/10 border-[#8B5CF6]/20">
                  <div className="text-sm font-semibold text-[#8B5CF6] uppercase tracking-wide">
                    Gross
                  </div>
                  <div className="text-3xl font-bold text-[#8B5CF6] mt-2">
                    {formatCurrency(savedTotals.gross)}
                  </div>
                </div>
                <div className="metric-card bg-[#F59E0B]/10 border-[#F59E0B]/20">
                  <div className="text-sm font-semibold text-[#F59E0B] uppercase tracking-wide">
                    Subcon
                  </div>
                  <div className="text-3xl font-bold text-[#F59E0B] mt-2">
                    {formatCurrency(savedTotals["subcon$"])}
                  </div>
                </div>
                <div className="metric-card bg-[#3B82F6]/10 border-[#3B82F6]/20">
                  <div className="text-sm font-semibold text-[#3B82F6] uppercase tracking-wide">
                    Sales
                  </div>
                  <div className="text-3xl font-bold text-[#3B82F6] mt-2">
                    {formatCurrency(savedTotals["sales$"])}
                  </div>
                </div>
                <div className="metric-card bg-[#10B981]/10 border-[#10B981]/20">
                  <div className="text-sm font-semibold text-[#10B981] uppercase tracking-wide">
                    Profit
                  </div>
                  <div className="text-3xl font-bold text-[#10B981] mt-2">
                    {formatCurrency(savedTotals["company$"])}
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="card p-4 sm:p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    What-If Simulation
                  </h2>
                  <p className="text-sm text-gray-600">
                    Override percentages to see simulated results
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subcontractor % Override
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      placeholder="Leave empty for saved values"
                      value={subconPct ?? ""}
                      onChange={(e) =>
                        setSubconPct(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      className="input-field w-full pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sales % Override
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      placeholder="Leave empty for saved values"
                      value={salesPct ?? ""}
                      onChange={(e) =>
                        setSalesPct(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      className="input-field w-full pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {}
            {hasOverrides && (
              <div className="card p-4 sm:p-6 mb-6 border-2 border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Simulated Totals
                    </h2>
                    <p className="text-sm text-emerald-700">
                      With override percentages applied
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  <div className="metric-card bg-[#8B5CF6]/10 border-[#8B5CF6]/20">
                    <div className="text-sm font-semibold text-[#8B5CF6] uppercase tracking-wide">
                      Gross
                    </div>
                    <div className="text-3xl font-bold text-[#8B5CF6] mt-2">
                      {formatCurrency(simulatedTotals.gross)}
                    </div>
                  </div>
                  <div className="metric-card bg-[#F59E0B]/10 border-[#F59E0B]/20">
                    <div className="text-sm font-semibold text-[#F59E0B] uppercase tracking-wide">
                      Subcon
                    </div>
                    <div className="text-3xl font-bold text-[#F59E0B] mt-2">
                      {formatCurrency(simulatedTotals["subcon$"])}
                    </div>
                    <div className="text-xs text-[#F59E0B]/70 mt-2 font-medium">
                      Diff:{" "}
                      {formatCurrency(
                        simulatedTotals["subcon$"] - savedTotals["subcon$"]
                      )}
                    </div>
                  </div>
                  <div className="metric-card bg-[#3B82F6]/10 border-[#3B82F6]/20">
                    <div className="text-sm font-semibold text-[#3B82F6] uppercase tracking-wide">
                      Sales
                    </div>
                    <div className="text-3xl font-bold text-[#3B82F6] mt-2">
                      {formatCurrency(simulatedTotals["sales$"])}
                    </div>
                    <div className="text-xs text-[#3B82F6]/70 mt-2 font-medium">
                      Diff:{" "}
                      {formatCurrency(
                        simulatedTotals["sales$"] - savedTotals["sales$"]
                      )}
                    </div>
                  </div>
                  <div className="metric-card bg-[#10B981]/10 border-[#10B981]/20">
                    <div className="text-sm font-semibold text-[#10B981] uppercase tracking-wide">
                      Profit
                    </div>
                    <div className="text-3xl font-bold text-[#10B981] mt-2">
                      {formatCurrency(simulatedTotals["company$"])}
                    </div>
                    <div className="text-xs text-[#10B981]/70 mt-2 font-medium">
                      Diff:{" "}
                      {formatCurrency(
                        simulatedTotals["company$"] - savedTotals["company$"]
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {}
            <div className="card p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Scientific Calculator
                    </h2>
                    <p className="text-sm text-gray-600">Advanced mathematical calculations</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="btn-secondary text-sm px-3 py-2"
                >
                  {showHistory ? "Hide" : "Show"} History
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {}
                <div className="lg:col-span-2">
                  {}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl mb-4 shadow-xl border-2 border-gray-700">
                    <div className="text-right">
                      {memory !== 0 && (
                        <div className="text-xs text-emerald-400 mb-1 font-mono">
                          M: {memory}
                        </div>
                      )}
                      <div className="text-xl sm:text-3xl lg:text-4xl font-mono font-bold text-white break-all min-h-[3rem]">
                        {display}
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2 mb-2 sm:mb-3">
                    {["MC", "MR", "M+", "M-", "AC"].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeypad(key)}
                        className="px-2 py-2 sm:px-3 sm:py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  {}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2 mb-2 sm:mb-3">
                    {["sin", "cos", "tan", "log", "ln"].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeypad(key)}
                        className="px-2 py-2 sm:px-3 sm:py-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  {}
                  <div className="grid grid-cols-6 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    {["√", "x²", "xʸ", "1/x", "π", "e"].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeypad(key)}
                        className="px-1.5 py-2 sm:px-3 sm:py-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg min-h-[40px]"
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  {}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {}
                    <button
                      onClick={() => handleKeypad("(")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                    >
                      (
                    </button>
                    <button
                      onClick={() => handleKeypad(")")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                    >
                      )
                    </button>
                    <button
                      onClick={() => handleKeypad("%")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                    >
                      %
                    </button>
                    <button
                      onClick={() => handleKeypad("backspace")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                    >
                      ⌫
                    </button>
                    <button
                      onClick={() => handleKeypad("C")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                    >
                      C
                    </button>

                    {}
                    {["7", "8", "9"].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeypad(key)}
                        className="px-2 py-2.5 sm:px-4 sm:py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-sm hover:shadow-md text-gray-800 min-h-[44px]"
                      >
                        {key}
                      </button>
                    ))}
                    <button
                      onClick={() => handleKeypad("÷")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 rounded-lg font-semibold text-lg sm:text-xl transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                    >
                      ÷
                    </button>
                    <button
                      onClick={() => handleKeypad("+/-")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                    >
                      +/-
                    </button>

                    {}
                    {["4", "5", "6"].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeypad(key)}
                        className="px-2 py-2.5 sm:px-4 sm:py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-sm hover:shadow-md text-gray-800 min-h-[44px]"
                      >
                        {key}
                      </button>
                    ))}
                    <button
                      onClick={() => handleKeypad("×")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 rounded-lg font-semibold text-lg sm:text-xl transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                    >
                      ×
                    </button>
                    <button
                      onClick={() => handleKeypad("-")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 rounded-lg font-semibold text-lg sm:text-xl transition-all duration-200 shadow-md hover:shadow-lg row-span-2 min-h-[44px]"
                    >
                      -
                    </button>

                    {}
                    {["1", "2", "3"].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeypad(key)}
                        className="px-2 py-2.5 sm:px-4 sm:py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-sm hover:shadow-md text-gray-800 min-h-[44px]"
                      >
                        {key}
                      </button>
                    ))}
                    <button
                      onClick={() => handleKeypad("+")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 rounded-lg font-semibold text-lg sm:text-xl transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                    >
                      +
                    </button>

                    {}
                    <button
                      onClick={() => handleKeypad("0")}
                      className="col-span-2 px-2 py-2.5 sm:px-4 sm:py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-sm hover:shadow-md text-gray-800 min-h-[44px]"
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleKeypad(".")}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-sm hover:shadow-md text-gray-800 min-h-[44px]"
                    >
                      .
                    </button>
                    <button
                      onClick={() => handleKeypad("=")}
                      className="col-span-2 px-2 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold text-lg sm:text-xl transition-all duration-200 shadow-lg hover:shadow-xl min-h-[44px]"
                    >
                      =
                    </button>
                  </div>
                </div>

                {}
                {showHistory && (
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 h-full max-h-[600px] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Calculation History</h3>
                        {history.length > 0 && (
                          <button
                            onClick={() => setHistory([])}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      {history.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No calculations yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {history.slice().reverse().map((calc, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer"
                              onClick={() => {
                                const result = calc.split(" = ")[1];
                                setCurrentInput(result);
                                setDisplay(result);
                              }}
                            >
                              <p className="text-xs text-gray-600 font-mono break-all">
                                {calc}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Quick Reference:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs text-blue-800">
                  <div><span className="font-semibold">MC:</span> Memory Clear</div>
                  <div><span className="font-semibold">MR:</span> Memory Recall</div>
                  <div><span className="font-semibold">M+:</span> Memory Add</div>
                  <div><span className="font-semibold">M-:</span> Memory Subtract</div>
                  <div><span className="font-semibold">AC:</span> All Clear</div>
                  <div><span className="font-semibold">sin/cos/tan:</span> Trig (degrees)</div>
                  <div><span className="font-semibold">log:</span> Base 10</div>
                  <div><span className="font-semibold">ln:</span> Natural log</div>
                  <div><span className="font-semibold">xʸ:</span> Power (x^y)</div>
                  <div><span className="font-semibold">π:</span> Pi (3.14159...)</div>
                </div>
              </div>
            </div>

            {}
            <div className="card overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Per-Project Breakdown
                    </h2>
                    <p className="text-sm text-gray-600">
                      Detailed comparison of saved vs simulated values
                    </p>
                  </div>
                </div>
              </div>
              {projects.length === 0 ? (
                <div className="text-center py-16">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium">No projects found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Select a different month or add projects
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead>
                      <tr className="table-header">
                        <th className="table-cell text-left">Project</th>
                        <th className="table-cell text-right">Saved Subcon</th>
                        <th className="table-cell text-right">Saved Sales</th>
                        <th className="table-cell text-right">Saved Profit</th>
                        {hasOverrides && (
                          <>
                            <th className="table-cell text-right bg-[#F59E0B]/5">
                              Sim. Subcon
                            </th>
                            <th className="table-cell text-right bg-[#3B82F6]/5">
                              Sim. Sales
                            </th>
                            <th className="table-cell text-right bg-[#10B981]/5">
                              Sim. Profit
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p) => {
                        const saved = calcProjectSaved(p);
                        const simulated = calcProjectSimulated(
                          p,
                          subconPct,
                          salesPct
                        );
                        return (
                          <tr key={p.id} className="table-row">
                            <td className="table-cell">
                              <span className="font-semibold text-gray-900">
                                {p.title}
                              </span>
                            </td>
                            <td className="table-cell text-right">
                              <span className="text-gray-700">
                                {formatCurrency(saved["subcon$"])}
                              </span>
                            </td>
                            <td className="table-cell text-right">
                              <span className="text-gray-700">
                                {formatCurrency(saved["sales$"])}
                              </span>
                            </td>
                            <td className="table-cell text-right">
                              <span className="text-gray-700">
                                {formatCurrency(saved["company$"])}
                              </span>
                            </td>
                            {hasOverrides && (
                              <>
                                <td className="table-cell text-right bg-[#F59E0B]/5">
                                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] font-semibold text-sm">
                                    {formatCurrency(simulated["subcon$"])}
                                  </span>
                                </td>
                                <td className="table-cell text-right bg-[#3B82F6]/5">
                                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] font-semibold text-sm">
                                    {formatCurrency(simulated["sales$"])}
                                  </span>
                                </td>
                                <td className="table-cell text-right bg-[#10B981]/5">
                                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#10B981]/10 text-[#10B981] font-semibold text-sm">
                                    {formatCurrency(simulated["company$"])}
                                  </span>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {!selectedSubContractorId && (
          <div className="card text-center py-16">
            <svg
              className="w-20 h-20 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-gray-600 font-semibold text-lg">
              Select a sub-contractor to begin
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Choose a sub-contractor from the dropdown above to view
              calculations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
