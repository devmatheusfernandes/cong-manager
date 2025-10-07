"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface ImportPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: (data: any) => void;
}

interface ProcessedData {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  details?: string;
  warnings?: string[];
  validationErrors?: string[];
}

export function ImportPdfDialog({ 
  open, 
  onOpenChange, 
  onImportSuccess 
}: ImportPdfDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Por favor, selecione apenas arquivos PDF');
        return;
      }
      setFile(selectedFile);
      setProcessedData(null);
      setShowPreview(false);
    }
  };

  const handleProcessPdf = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/nvc/import-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setProcessedData(result);
        toast.success(result.message || 'PDF processado com sucesso!');
      } else {
        setProcessedData(result);
        toast.error(result.error || 'Erro ao processar PDF');
      }
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      toast.error('Erro de conexão ao processar PDF');
      setProcessedData({
        success: false,
        error: 'Erro de conexão',
        details: 'Verifique sua conexão com a internet'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (processedData?.success && processedData.data) {
      try {
        // Salvar dados no Supabase
        const response = await fetch('/api/nvc/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(processedData.data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao salvar dados no Supabase');
        }

        const result = await response.json();
        
        onImportSuccess?.(processedData.data);
        toast.success('Dados importados e salvos no Supabase com sucesso!');
        handleClose();
      } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
        toast.error(`Erro ao salvar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
  };

  const handleClose = () => {
    setFile(null);
    setProcessedData(null);
    setShowPreview(false);
    onOpenChange(false);
  };

  const downloadJson = () => {
    if (processedData?.data) {
      const blob = new Blob([JSON.stringify(processedData.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reunioes-nvc.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Programação PDF
          </DialogTitle>
          <DialogDescription>
            Faça upload de um PDF da programação de reunião para gerar automaticamente 
            os dados das reuniões usando IA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">Arquivo PDF</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
              {file && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          {/* Process Button */}
          <Button 
            onClick={handleProcessPdf}
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando PDF...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Processar PDF
              </>
            )}
          </Button>

          {/* Results Section */}
          {processedData && (
            <Card className="p-4">
              <div className="space-y-3">
                {processedData.success ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Processamento concluído!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Erro no processamento</span>
                  </div>
                )}

                {processedData.message && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {processedData.message}
                  </p>
                )}

                {processedData.error && (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600 font-medium">
                      {processedData.error}
                    </p>
                    {processedData.details && (
                      <p className="text-xs text-red-500">
                        {processedData.details}
                      </p>
                    )}
                    {processedData.validationErrors && processedData.validationErrors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-600 font-medium mb-1">Erros de validação:</p>
                        <ul className="text-xs text-red-500 space-y-1 max-h-32 overflow-y-auto">
                          {processedData.validationErrors.map((error, index) => (
                            <li key={index} className="list-disc list-inside">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {processedData.success && processedData.warnings && processedData.warnings.length > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-600">Avisos</span>
                    </div>
                    <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 max-h-24 overflow-y-auto">
                      {processedData.warnings.map((warning, index) => (
                        <li key={index} className="list-disc list-inside">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {processedData.success && processedData.data && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {showPreview ? 'Ocultar' : 'Visualizar'} Dados
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadJson}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar JSON
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Preview Section */}
          {showPreview && processedData?.success && processedData.data && (
            <Card className="p-4 max-h-60 overflow-y-auto">
              <h4 className="font-medium mb-2">Preview dos Dados:</h4>
              <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                {JSON.stringify(processedData.data, null, 2)}
              </pre>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {processedData?.success && (
            <Button onClick={handleImport}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Importar Dados
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}