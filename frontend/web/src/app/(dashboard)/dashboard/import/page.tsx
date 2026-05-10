import type { Metadata } from "next";

export const metadata: Metadata = { title: "Data Ingestion — LUMEMEI" };

const IMPORT_LEDGER = [
  {
    name: "Q3_Transaction_Log.csv",
    size: "2.4 MB",
    date: "12 Oct 2024",
    status: "processing",
    icon: "description",
  },
  {
    name: "EMEA_Product_Matrix.xlsx",
    size: "841 KB",
    date: "11 Oct 2024",
    status: "pending",
    icon: "table_chart",
  },
  {
    name: "Historical_Ledger.csv",
    size: "12.1 MB",
    date: "05 Oct 2024",
    status: "completed",
    icon: "description",
  },
  {
    name: "Corrupted_Data_Dump.json",
    size: "312 KB",
    date: "01 Oct 2024",
    status: "failed",
    icon: "data_object",
  },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; text: string }
> = {
  processing: {
    label: "Processing",
    dot: "bg-tertiary",
    text: "text-tertiary",
  },
  pending: {
    label: "Pending",
    dot: "bg-on-surface-variant",
    text: "text-on-surface-variant",
  },
  completed: { label: "Completed", dot: "bg-primary", text: "text-primary" },
  failed: { label: "Failed", dot: "bg-error", text: "text-error" },
};

export default function ImportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-display-sm font-bold text-on-surface">
          Data Ingestion
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Upload transaction logs, product matrices, and ledger exports for
          LUMEMEI analysis.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Zone + Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <div className="bg-surface-container rounded-xl p-8 border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4 text-center min-h-48 hover:border-primary/40 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                cloud_upload
              </span>
            </div>
            <div>
              <p className="text-on-surface font-headline font-semibold text-base mb-1">
                Drop your files here
              </p>
              <p className="text-on-surface-variant text-sm">
                CSV, XLSX, JSON — up to 50 MB
              </p>
            </div>
            <button className="px-5 py-2 prism-gradient rounded-lg text-[#002979] text-sm font-semibold hover:brightness-110 transition-all">
              Browse files
            </button>
          </div>

          {/* Import Ledger */}
          <div className="bg-surface-container rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <p className="font-headline font-bold text-on-surface text-sm">
                Import Ledger
              </p>
              <button className="flex items-center gap-1 text-on-surface-variant text-xs hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-base">
                  filter_list
                </span>
                Filter
              </button>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {IMPORT_LEDGER.map((item) => {
                const cfg = STATUS_CONFIG[item.status];
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-high transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">
                        {item.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-on-surface text-sm font-semibold truncate">
                        {item.name}
                      </p>
                      <p className="text-on-surface-variant text-xs mt-0.5">
                        {item.size} · {item.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      <span className={`text-xs font-semibold ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* LUMEMEI AI Summary Panel */}
        <div className="space-y-4">
          <div className="bg-surface-container rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <span
                className="material-symbols-outlined text-tertiary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
              <p className="font-headline font-bold text-on-surface text-sm">
                LUMEMEI AI Summary
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                  Entities Parsed
                </p>
                <p className="font-headline font-black text-3xl text-on-surface">
                  14,208
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                  Anomalies Detected
                </p>
                <p className="font-headline font-black text-3xl text-error">
                  23
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                  Confidence Score
                </p>
                <p className="font-headline font-black text-3xl text-primary">
                  98.4%
                </p>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full prism-gradient rounded-full"
                    style={{ width: "98.4%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Supported formats */}
          <div className="bg-surface-container rounded-xl p-5">
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-3">
              Supported Formats
            </p>
            <div className="space-y-2">
              {["CSV", "XLSX / XLS", "JSON", "OFX / QFX"].map((fmt) => (
                <div key={fmt} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">
                    check_circle
                  </span>
                  <span className="text-on-surface-variant text-sm">{fmt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
