import type { Employee } from "@/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "emp_01",
    mei_id: "mei_01",
    name: "Marcus Silva",
    contract_type: "CLT",
    salary: 15000,
    charges: 10500,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "emp_02",
    mei_id: "mei_01",
    name: "Elena Costa",
    contract_type: "PJ",
    salary: 18000,
    charges: 0,
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "emp_03",
    mei_id: "mei_01",
    name: "Rafael Torres",
    contract_type: "CLT",
    salary: 11500,
    charges: 8050,
    created_at: "2024-03-01T00:00:00Z",
  },
];

export interface EmployeeStats {
  totalPayroll: number;
  headcount: number;
  cltCount: number;
  pjCount: number;
  cltCharges: number;
  pjTotal: number;
  newThisMonth: number;
}

export const employeesService = {
  async getAll(meiId: string): Promise<Employee[]> {
    await delay(400);
    // TODO: api.get(`/meis/${meiId}/employees`)
    void meiId;
    return MOCK_EMPLOYEES;
  },

  async getStats(meiId: string): Promise<EmployeeStats> {
    await delay(300);
    void meiId;
    const emps = MOCK_EMPLOYEES;
    const clt = emps.filter((e) => e.contract_type === "CLT");
    const pj = emps.filter((e) => e.contract_type === "PJ");
    return {
      totalPayroll: emps.reduce(
        (s, e) => s + (e.salary ?? 0) + (e.charges ?? 0),
        0,
      ),
      headcount: emps.length,
      cltCount: clt.length,
      pjCount: pj.length,
      cltCharges: clt.reduce((s, e) => s + (e.charges ?? 0), 0),
      pjTotal: pj.reduce((s, e) => s + (e.salary ?? 0), 0),
      newThisMonth: 1,
    };
  },

  async create(
    meiId: string,
    data: Omit<Employee, "id" | "mei_id" | "created_at">,
  ): Promise<Employee> {
    await delay(500);
    // TODO: api.post(`/meis/${meiId}/employees`, data)
    return {
      ...data,
      id: `emp_${Date.now()}`,
      mei_id: meiId,
      created_at: new Date().toISOString(),
    };
  },

  async delete(meiId: string, id: string): Promise<void> {
    await delay(300);
    // TODO: api.delete(`/meis/${meiId}/employees/${id}`)
    void meiId;
    void id;
  },
};
