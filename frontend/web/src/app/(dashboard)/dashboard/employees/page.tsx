import { employeesService } from "@/services/employees.service";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/cn";
import type { Metadata } from "next";
import type { Employee } from "@/types";

export const metadata: Metadata = { title: "Employees — LUMEMEI" };

async function getData() {
  const [employees, stats] = await Promise.all([
    employeesService.getAll("mei_01"),
    employeesService.getStats("mei_01"),
  ]);
  return { employees, stats };
}

export default async function EmployeesPage() {
  const { employees, stats } = await getData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-display-sm font-bold text-on-surface">
            Employee Directory
          </h1>
          <p className="text-on-muted text-sm mt-1">
            Manage payroll and team structure.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-muted transition-colors">
          👤 Add Employee
        </button>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 bg-obsidian-card rounded-card border border-obsidian-elevated p-5 flex items-center justify-between">
          <div>
            <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-1">
              Total Monthly Payroll
            </p>
            <p className="font-display text-3xl font-bold text-accent-light">
              {formatCurrency(stats.totalPayroll)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center text-2xl">
            🏦
          </div>
        </div>

        <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
          <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-1">
            Headcount
          </p>
          <p className="font-display text-3xl font-bold text-on-surface">
            {stats.headcount}
          </p>
          <p className="text-status-success text-xs mt-1">
            +{stats.newThisMonth} this month
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-accent">• CLT</span>
              <span className="text-on-surface font-semibold">
                {stats.cltCount}
              </span>
            </div>
            <div className="w-full h-1 bg-obsidian-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{
                  width: `${(stats.cltCount / stats.headcount) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-status-warning">• PJ</span>
              <span className="text-on-surface font-semibold">
                {stats.pjCount}
              </span>
            </div>
            <div className="w-full h-1 bg-obsidian-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-status-warning rounded-full"
                style={{ width: `${(stats.pjCount / stats.headcount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5 space-y-3">
          <div>
            <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-1">
              CLT Charges (INSS/FGTS)
            </p>
            <p className="font-display text-xl font-bold text-on-surface">
              {formatCurrency(stats.cltCharges)}
            </p>
          </div>
          <div>
            <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-1">
              PJ Contracts Total
            </p>
            <p className="font-display text-xl font-bold text-on-surface">
              {formatCurrency(stats.pjTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-obsidian-elevated text-on-muted hover:text-on-surface text-sm transition-colors">
          ≡ All Contracts
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-obsidian-elevated text-on-muted hover:text-on-surface text-sm transition-colors">
          ≡ Sort by Dept
        </button>
      </div>

      {/* Table */}
      <div className="bg-obsidian-card rounded-card border border-obsidian-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-obsidian-elevated">
              <th className="text-left px-4 py-3 text-on-muted text-xs uppercase tracking-widest font-semibold">
                Employee
              </th>
              <th className="text-left px-4 py-3 text-on-muted text-xs uppercase tracking-widest font-semibold">
                Role / Dept
              </th>
              <th className="text-left px-4 py-3 text-on-muted text-xs uppercase tracking-widest font-semibold">
                Type
              </th>
              <th className="text-right px-4 py-3 text-on-muted text-xs uppercase tracking-widest font-semibold">
                Base Salary
              </th>
              <th className="text-right px-4 py-3 text-on-muted text-xs uppercase tracking-widest font-semibold">
                Total Cost
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian-elevated">
            {employees.map((emp) => (
              <EmployeeRow key={emp.id} employee={emp} />
            ))}
          </tbody>
        </table>
        <button className="w-full py-3 text-accent text-sm font-semibold flex items-center justify-center gap-2 hover:text-accent-light transition-colors border-t border-obsidian-elevated">
          Load More Employees ▾
        </button>
      </div>
    </div>
  );
}

function EmployeeRow({ employee }: { employee: Employee }) {
  const totalCost = (employee.salary ?? 0) + (employee.charges ?? 0);
  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <tr className="hover:bg-obsidian-elevated/30 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm shrink-0">
            {initials}
          </div>
          <span className="text-on-surface font-semibold text-sm">
            {employee.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-4 text-on-muted text-sm">—</td>
      <td className="px-4 py-4">
        <span
          className={cn(
            "px-2 py-1 rounded text-xs font-bold",
            employee.contract_type === "CLT"
              ? "bg-accent/15 text-accent"
              : "bg-status-warning/15 text-status-warning",
          )}
        >
          {employee.contract_type ?? "—"}
        </span>
      </td>
      <td className="px-4 py-4 text-right text-on-surface text-sm">
        {formatCurrency(employee.salary ?? 0)}
      </td>
      <td className="px-4 py-4 text-right font-bold text-accent-light text-sm">
        {formatCurrency(totalCost)}
      </td>
    </tr>
  );
}
