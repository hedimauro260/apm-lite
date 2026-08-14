import { useRef, useState } from "react";
import { ArrowLeft, Download, FileUp, Upload } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { APP_VERSION } from "../../lib/utils";
import { useToast } from "../ui/Toast";
import {
  downloadBackup,
  exportBackup,
  importBackup,
  parseBackup,
  type BackupPayload,
} from "../../lib/backup";

export interface BackupRestoreModalProps {
  open: boolean;
  onClose: () => void;
}

type View = "menu" | "export" | "import";

export function BackupRestoreModal({ open, onClose }: BackupRestoreModalProps) {
  const { toast } = useToast();
  const [view, setView] = useState<View>("menu");
  const [pending, setPending] = useState(false);
  const [backup, setBackup] = useState<BackupPayload | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setView("menu");
    setPending(false);
    setBackup(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleExport = async () => {
    try {
      setPending(true);
      const payload = await exportBackup();
      downloadBackup(payload);
      toast({
        type: "success",
        title: "Backup created",
        message: "Your data was exported successfully.",
      });
      handleClose();
    } catch {
      toast({
        type: "error",
        title: "Backup failed",
        message: "Something went wrong while exporting your data.",
      });
    } finally {
      setPending(false);
    }
  };

  const handleFileChange = (file: File | undefined) => {
    setBackup(null);
    setFileName(file?.name ?? "");
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = parseBackup(String(reader.result ?? ""));
        setBackup(payload);
      } catch (error) {
        toast({
          type: "error",
          title: "Invalid backup file",
          message: error instanceof Error ? error.message : "Could not read the file.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      toast({
        type: "error",
        title: "Invalid backup file",
        message: "Could not read the selected file.",
      });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!backup) return;
    try {
      setPending(true);
      await importBackup(backup);
      toast({
        type: "success",
        title: "Restore complete",
        message: "Your data was restored successfully.",
      });
      handleClose();
    } catch {
      toast({
        type: "error",
        title: "Restore failed",
        message: "Something went wrong while restoring your data.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={view === "menu" ? "Backup & Restore" : view === "export" ? "Export Data (Backup)" : "Import Data (Restore)"}
      description={
        view === "menu"
          ? "Choose an option to backup or restore your portfolio data."
          : undefined
      }
      size="md"
    >
      <div className="space-y-4">
        {view === "menu" && (
          <>
            <button
              type="button"
              onClick={() => setView("export")}
              className="flex w-full items-start gap-4 rounded-lg border border-border bg-surface-elevated/50 p-4 text-left transition-colors hover:bg-surface-elevated"
            >
              <div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary">
                <Download className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">Export Data (Backup)</p>
                <p className="mt-0.5 text-xs text-text-muted leading-relaxed">
                  Download a JSON file with all your data. Use it to restore or move to another device.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setView("import")}
              className="flex w-full items-start gap-4 rounded-lg border border-border bg-surface-elevated/50 p-4 text-left transition-colors hover:bg-surface-elevated"
            >
              <div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">Import Data (Restore)</p>
                <p className="mt-0.5 text-xs text-text-muted leading-relaxed">
                  Restore your data from a previously exported JSON backup file.
                </p>
              </div>
            </button>
          </>
        )}

        {view === "export" && (
          <>
            <div className="rounded-lg border border-border bg-surface-elevated/50 p-4">
              <p className="text-sm font-medium text-text-primary">What gets exported</p>
              <p className="mt-1 text-xs text-text-muted leading-relaxed">
                The backup includes all wallets, transactions, assets, positions and movements,
                goals and their snapshots, websites and website movements. The file also records
                the app version (v{APP_VERSION}) used to create it.
              </p>
            </div>

            <p className="text-xs text-text-muted">
              A JSON file named <span className="text-text-primary">apm-lite-backup-YYYY-MM-DD.json</span>{" "}
              will be downloaded to your device.
            </p>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setView("menu")}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleExport} isLoading={pending}>
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </>
        )}

        {view === "import" && (
          <>
            <div className="rounded-lg border border-danger/20 bg-danger/10 p-4">
              <p className="text-sm font-medium text-danger">Warning</p>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                Restoring a backup will replace all current data in this app. Any existing
                wallets, transactions, assets, goals and websites will be permanently deleted.
                This action cannot be undone.
              </p>
            </div>

            <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-elevated/50 px-4 py-8 text-center transition-colors hover:bg-surface-elevated">
              <FileUp className="h-6 w-6 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">
                {fileName || "Choose a backup JSON file"}
              </span>
              <span className="text-xs text-text-muted">
                Click to select or drag a .json file here
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
            </label>

            {backup && (
              <div className="rounded-lg border border-border bg-surface-elevated/50 p-4">
                <p className="text-sm font-medium text-text-primary">Backup file detected</p>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  This backup was created with app version{" "}
                  <span className="font-semibold text-text-primary">v{backup.appVersion}</span> on{" "}
                  <span className="text-text-primary">
                    {new Date(backup.exportedAt).toLocaleString()}
                  </span>
                  .
                  {backup.appVersion !== APP_VERSION &&
                    " The current app version is " +
                      `v${APP_VERSION}` +
                      " — some data may not be fully compatible."}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setView("menu")}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button variant="danger" onClick={handleImport} disabled={!backup} isLoading={pending}>
                <Upload className="h-4 w-4" />
                Restore Data
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}