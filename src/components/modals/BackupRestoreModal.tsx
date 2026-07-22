// src/components/modals/BackupRestoreModal.tsx
import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { exportData, importData } from '../../lib/backup';
import { useToast } from '../ui/Toast';
import { Download, Upload, AlertTriangle, FileJson, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BackupRestoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Callback para recarregar a página/app após o restore
}

type Tab = 'export' | 'import';

export function BackupRestoreModal({ isOpen, onClose, onSuccess }: BackupRestoreModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('export');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleExport = async () => {
        setIsProcessing(true);
        try {
            await exportData();
            toast({
                type: 'success',
                title: 'Backup exported',
                message: 'Your data has been successfully downloaded.',
                duration: 4000,
            });
        } catch (error) {
            toast({
                type: 'error',
                title: 'Export failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                duration: 5000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                toast({
                    type: 'error',
                    title: 'Invalid file',
                    message: 'Please select a valid .json file.',
                    duration: 5000,
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        try {
            await importData(selectedFile);

            // ✅ Sucesso na importação (crítico)
            toast({
                type: 'success',
                title: 'Dados restaurados com sucesso',
                message: 'O backup foi aplicado. A página será recarregada em instantes.',
                duration: 5000,
            });

            setSelectedFile(null);
            // Pequeno delay para o toast ser visto antes do reload
            setTimeout(() => {
                onClose();
                onSuccess(); // Recarrega a aplicação
            }, 1500);

        } catch (error) {
            // ✅ Erro na importação (crítico)
            toast({
                type: 'error',
                title: 'Falha na restauração',
                message: error instanceof Error ? error.message : 'O arquivo pode estar corrompido ou em formato inválido.',
                duration: 6000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const resetState = () => {
        setActiveTab('export');
        setSelectedFile(null);
        setIsProcessing(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { if (!isProcessing) { resetState(); onClose(); } }}
            title="Backup & Restore"
            size="md"
        >
            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
                <button
                    onClick={() => setActiveTab('export')}
                    className={cn(
                        'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
                        activeTab === 'export'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-muted hover:text-text-primary'
                    )}
                >
                    Export Data
                </button>
                <button
                    onClick={() => setActiveTab('import')}
                    className={cn(
                        'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
                        activeTab === 'import'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-muted hover:text-text-primary'
                    )}
                >
                    Import Data
                </button>
            </div>

            {/* Export Tab */}
            {activeTab === 'export' && (
                <div className="space-y-4">
                    <div className="p-4 bg-surface-elevated border border-border rounded-lg">
                        <div className="flex items-start gap-3">
                            <FileJson className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-text-primary">Download your data</h4>
                                <p className="text-sm text-text-muted mt-1">
                                    This will generate a JSON file containing all your wallets, assets, transactions, and goals.
                                    Keep this file safe to restore your data later.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            variant="primary"
                            onClick={handleExport}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                            ) : (
                                <><Download className="h-4 w-4 mr-2" /> Download Backup</>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Import Tab */}
            {activeTab === 'import' && (
                <div className="space-y-4">
                    <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-danger mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-danger">Warning: This will overwrite your current data</h4>
                                <p className="text-sm text-text-secondary mt-1">
                                    Importing a backup will <strong>permanently delete</strong> all current data in this browser and replace it with the backup file. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-text-secondary">
                            Select Backup File (.json)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".json,application/json"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isProcessing}
                            />
                            <div className={cn(
                                "flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-lg transition-colors",
                                selectedFile ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/50"
                            )}>
                                <Upload className={cn("h-5 w-5", selectedFile ? "text-primary" : "text-text-muted")} />
                                <span className="text-sm text-text-primary truncate">
                                    {selectedFile ? selectedFile.name : "Click to select or drag and drop a file"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            variant="ghost"
                            onClick={() => { setSelectedFile(null); }}
                            disabled={isProcessing}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleImport}
                            disabled={!selectedFile || isProcessing}
                        >
                            {isProcessing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Restoring...</>
                            ) : (
                                <><Upload className="h-4 w-4 mr-2" /> Restore Data</>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}