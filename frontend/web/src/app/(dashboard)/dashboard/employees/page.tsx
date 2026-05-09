import type { Metadata } from "next";

export const metadata: Metadata = { title: "Employees — LUMEMEI" };

const EMPLOYEES = [
  {
    id: "1",
    name: "Marcus Silva",
    role: "Sr. Frontend Engineer",
    dept: "Engineering",
    type: "CLT",
    salary: 15000,
    totalCost: 25500,
    initials: "MS",
  },
  {
    id: "2",
    name: "Elena Costa",
    role: "Product Manager",
    dept: "Product",
    type: "PJ",
    salary: 18000,
    totalCost: 18000,
    initials: "EC",
  },
  {
    id: "3",
    name: "Jordan Lee",
    role: "Data Analyst",
    dept: "Analytics",
    type: "CLT",
    salary: 12000,
    totalCost: 20400,
    initials: "JL",
  },
  {
    id: "4",
    name: "Sofia Melo",
    role: "UX Designer",
    dept: "Design",
    type: "PJ",
    salary: 14000,
    totalCost: 14000,
    initials: "SM",
  },
];

export default function EmployeesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-headline text-on-surface text-2xl tracking-tight">
          Employee Directory
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Manage payroll and team structure.
        </p>
      </div>

      {/* Bento — Payroll Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Payroll */}
        <div className="md:col-span-2 bg-surface-container rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <p className="font-label text-on-surface-variant text-sm tracking-wider uppercase">
                Total Monthly Payroll
              </p>
              <h3 className="font-display text-5xl md:text-6xl text-white tracking-tighter mt-2">
                R$ 482.500
              </h3>
            </div>
            <div className="bg-surface-container-highest p-2 rounded-lg border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary-container">
                account_balance
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-surface-container-lowest p-4 rounded-lg">
              <p className="text-on-surface-variant text-xs mb-1">
                CLT Charges (INSS/FGTS)
              </p>
              <p className="font-headline text-lg text-on-surface">
                R$ 145.200
              </p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-lg">
              <p className="text-on-surface-variant text-xs mb-1">
                PJ Contracts Total
              </p>
              <p className="font-headline text-lg text-on-surface">
                R$ 120.000
              </p>
            </div>
          </div>
        </div>

        {/* Headcount */}
        <div className="bg-surface-container rounded-xl p-6 flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="font-label text-on-surface-variant text-sm tracking-wider uppercase">
                Headcount
              </p>
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                +3 this month
              </span>
            </div>
            <p className="font-display text-4xl text-white tracking-tighter">
              42
            </p>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-container" />
                  CLT
                </span>
                <span className="font-headline text-on-surface">28</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-container h-full w-[66%]" />
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-tertiary" />
                  PJ
                </span>
                <span className="font-headline text-on-surface">14</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full w-[34%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
        <div className="flex gap-2">
          <button className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg text-sm font-medium border border-outline-variant/20 hover:bg-surface-bright transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              filter_list
            </span>
            All Contracts
          </button>
          <button className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg text-sm font-medium border border-outline-variant/20 hover:bg-surface-bright transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">sort</span>
            Sort by Dept
          </button>
        </div>
        <button className="prism-gradient text-[#002979] font-label text-sm py-2 px-5 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all">
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add Employee
        </button>
      </div>

      {/* Employee List */}
      <div className="space-y-4">
        {/* Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
          <div className="col-span-4">Employee</div>
          <div className="col-span-2">Role / Dept</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2 text-right">Base Salary</div>
          <div className="col-span-2 text-right">Total Cost</div>
        </div>

        {EMPLOYEES.map((emp) => (
          <div
            key={emp.id}
            className="bg-surface-container rounded-xl p-4 md:px-6 md:py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-surface-container-high transition-colors cursor-pointer group"
          >
            {/* Employee */}
            <div className="col-span-1 md:col-span-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-headline font-bold text-sm text-on-surface-variant">
                {emp.initials}
              </div>
              <div>
                <p className="font-headline text-on-surface font-medium group-hover:text-primary-container transition-colors">
                  {emp.name}
                </p>
                <p className="text-xs text-on-surface-variant md:hidden">
                  {emp.role} • {emp.type}
                </p>
              </div>
            </div>

            {/* Role / Dept */}
            <div className="hidden md:block col-span-2">
              <p className="text-sm text-on-surface">{emp.role}</p>
              <p className="text-xs text-on-surface-variant">{emp.dept}</p>
            </div>

            {/* Type */}
            <div className="hidden md:block col-span-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  emp.type === "CLT"
                    ? "bg-primary/10 text-primary"
                    : "bg-tertiary/10 text-tertiary"
                }`}
              >
                {emp.type}
              </span>
            </div>

            {/* Base Salary */}
            <div className="col-span-1 md:col-span-2 md:text-right flex justify-between md:block">
              <span className="text-xs text-on-surface-variant md:hidden">
                Base:
              </span>
              <p className="text-sm font-headline text-on-surface">
                R$ {emp.salary.toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Total Cost */}
            <div className="col-span-1 md:col-span-2 md:text-right flex justify-between md:block">
              <span className="text-xs text-on-surface-variant md:hidden">
                Total Cost:
              </span>
              <p className="text-sm font-headline text-primary-container font-bold">
                R$ {emp.totalCost.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
