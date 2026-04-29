"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Brain,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Download,
} from "lucide-react";
import { useImports } from "@/hooks/useImports";
import { importsService } from "@/services/imports.service";
import { useMeiContext } from "@/context";
import { formatBytes, formatDate } from "@/utils/formatters";
import { cn } from "@/lib/cn";
import type { Import } from "@/types";

export default function ImportPage() {
  const { activeMei } = useMeiContext();
  const { data: imports, isLoading, refetch } = useImports();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !activeMei) return;
      setIsUploading(true);
      setUploadError(null);
      try {
        await importsService.upload(activeMei.id, file);
        await refetch();
      } catch (err) {
        setUploadError(
          (err as { message: string }).message ?? "Erro ao fazer upload.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [activeMei, refetch],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/json": [".json"],
    },
    maxSize: 500 * 1024 * 1024, // 500 MB
    multiple: false,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-display-sm font-bold text-on-surface">
            Data Ingestion
          </h1>
          <p className="text-on-muted text-sm mt-1">
            Upload transaction logs or product matrices. Oracle AI will
            automatically structure and classify incoming datasets.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-obsidian-elevated text-on-muted hover:text-on-surface text-sm transition-colors">
          <Download className="w-4 h-4" />
          Template
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Drop Zone */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-on-surface font-semibold">Drop Zone</h2>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-card p-12 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-accent bg-accent/5"
                : "border-obsidian-elevated hover:border-obsidian-highest",
              isUploading && "opacity-50 pointer-events-none",
            )}
          >
            <input {...getInputProps()} />
            <div className="w-14 h-14 rounded-xl bg-obsidian-elevated flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-on-muted" />
            </div>
            {isDragActive ? (
              <p className="text-accent font-semibold">
                Solte o arquivo aqui...
              </p>
            ) : (
              <>
                <p className="text-on-surface font-semibold mb-1">
                  Drag & drop files here
                </p>
                <p className="text-on-muted text-sm">
                  Supports .CSV, .XLSX, and .JSON. Max file size: 500MB.
                </p>
              </>
            )}
            <button className="mt-5 px-6 py-2 rounded-lg bg-accent/20 border border-accent/30 text-accent font-semibold text-sm hover:bg-accent/30 transition-colors">
              {isUploading ? "Uploading..." : "Browse Files"}
            </button>
          </div>

          {uploadError && (
            <div className="px-4 py-3 rounded-lg bg-status-error/10 border border-status-error/30 text-status-error text-sm">
              {uploadError}
            </div>
          )}

          {/* Import Ledger */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-on-surface font-semibold">Import Ledger</h2>
              <button className="text-accent text-sm hover:text-accent-light transition-colors">
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-obsidian-card rounded-card skeleton"
                    />
                  ))
                : imports?.map((imp) => <ImportRow key={imp.id} imp={imp} />)}
            </div>
          </div>
        </div>

        {/* Oracle AI Summary */}
        <div className="lg:col-span-2">
          <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-accent" />
              </div>
              <p className="text-on-surface font-semibold text-sm">
                Oracle AI Summary
              </p>
            </div>
            <p className="text-on-muted text-xs mb-4">
              Analysis of last completed import batch (ID: #IMP-8921).
            </p>

            <div className="space-y-3">
              <SummaryMetric
                label="Identified Entities"
                value="14,208"
                icon={<Zap className="w-4 h-4 text-accent" />}
              />
              <SummaryMetric
                label="Anomalies Detected"
                value="23"
                icon={<AlertCircle className="w-4 h-4 text-status-warning" />}
              />
              <SummaryMetric
                label="Confidence Score"
                value="98.4%"
                icon={<CheckCircle className="w-4 h-4 text-status-success" />}
              />
            </div>

            <button className="w-full mt-5 py-2 border border-obsidian-elevated rounded-lg text-on-muted text-sm hover:text-on-surface hover:border-obsidian-highest transition-colors">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImportRow({ imp }: { imp: Import }) {
  const statusConfig = {
    processing: {
      icon: <Clock className="w-3.5 h-3.5" />,
      color: "text-status-warning",
      label: "PROCESSING",
    },
    pending: {
      icon: <Clock className="w-3.5 h-3.5" />,
      color: "text-on-muted",
      label: "PENDING QUEUE",
    },
    completed: {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      color: "text-status-success",
      label: "COMPLETED",
    },
    failed: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      color: "text-status-error",
      label: "FAILED",
    },
  };

  const cfg = statusConfig[imp.status];
  const fileName = imp.file_url.split("/").pop() ?? imp.file_url;
  const progress =
    imp.total_rows && imp.processed_rows
      ? (imp.processed_rows / imp.total_rows) * 100
      : null;

  return (
    <div className="flex items-center gap-3 bg-obsidian-card rounded-card border border-obsidian-elevated px-4 py-3">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          imp.status === "failed"
            ? "bg-status-error/15"
            : imp.status === "completed"
              ? "bg-status-success/15"
              : "bg-status-warning/15",
        )}
      >
        <span className={cfg.color}>{cfg.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-on-surface text-sm font-semibold truncate">
          {fileName}
        </p>
        <p className="text-on-muted text-xs">
          ID: #{imp.id} • {formatDate(imp.created_at, { relative: true })}
        </p>
        {progress !== null && imp.status === "processing" && (
          <div className="mt-1.5 w-full h-1 bg-obsidian-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-status-warning rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn("text-xs font-semibold", cfg.color)}>
          • {cfg.label}
        </span>
        {imp.status === "completed" && imp.total_rows && (
          <span className="text-on-muted text-xs">
            Rows {(imp.total_rows / 1000).toFixed(1)}k
          </span>
        )}
      </div>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-on-muted text-xs uppercase tracking-widest">
          {label}
        </p>
        <p className="text-on-surface font-display font-bold text-xl mt-0.5">
          {value}
        </p>
      </div>
      <div className="w-8 h-8 rounded-lg bg-obsidian-elevated flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
