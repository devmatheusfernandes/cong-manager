"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download, Eye, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EscalaLimpeza {
  id?: string;
  grupo_id: string;
  data_limpeza: string;
  publicadores: string[];
  observacoes?: string | null;
}

interface LimpezaData {
  escalas: EscalaLimpeza[];
}

interface ProcessingResult {
  success: boolean;
  data?: LimpezaData;
  message?: string;
  warnings?: string[];
  error?: string;
  details?: string;
  validationErrors?: string[];
}

interface ImportLimpezaPdfDialogProps {
  onImportSuccess?: () => void;
}

export function ImportLimpezaPdfDialog({ onImportSuccess }: ImportLimpezaPdfDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith('.json')) {
        toast.error("Por favor, selecione um arquivo PDF ou JSON válido");
        return;
      }
      setFile(selectedFile);
      setProcessingResult(null);
      
      // Se for arquivo JSON, processar diretamente
      if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json')) {
        handleJsonFile(selectedFile);
      }
    }
  };

  const handleJsonFile = async (file: File) => {
    try {
      setIsProcessing(true);
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Validar se o JSON tem a estrutura esperada
      if (jsonData.escalas && Array.isArray(jsonData.escalas)) {
        setProcessingResult({
          success: true,
          data: jsonData,
          message: "Arquivo JSON carregado com sucesso!"
        });
        
        toast.success("Arquivo JSON carregado e validado com sucesso!");
      } else {
        setProcessingResult({
          success: false,
          error: "Estrutura JSON inválida",
          details: "O arquivo deve conter um array 'escalas'"
        });
        toast.error("Estrutura do arquivo JSON inválida");
      }
    } catch (error) {
      setProcessingResult({
        success: false,
        error: "Erro ao processar JSON",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
      toast.error("Erro ao processar arquivo JSON");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== "application/pdf" && !droppedFile.name.endsWith('.json')) {
        toast.error("Por favor, selecione um arquivo PDF ou JSON válido");
        return;
      }
      setFile(droppedFile);
      setProcessingResult(null);
      
      if (droppedFile.type === 'application/json' || droppedFile.name.endsWith('.json')) {
        handleJsonFile(droppedFile);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processPdf = async () => {
    if (!file || file.type !== "application/pdf") return;

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/limpeza/import-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setProcessingResult({
          success: true,
          data: result.data,
          message: result.message,
          warnings: result.warnings
        });
        toast.success("PDF processado com sucesso!");
      } else {
        setProcessingResult({
          success: false,
          error: result.error,
          details: result.details,
          validationErrors: Array.isArray(result.validationErrors) ? result.validationErrors : (result.details ? [result.details] : [])
        });
        toast.error(result.error || "Erro ao processar PDF");
      }
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      setProcessingResult({
        success: false,
        error: "Erro de conexão",
        details: "Não foi possível conectar com o servidor"
      });
      toast.error("Erro de conexão ao processar PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const importData = async () => {
    if (!processingResult?.data) return;

    try {
      setIsImporting(true);

      const response = await fetch("/api/limpeza/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processingResult.data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`${result.total_salvas} escalas de limpeza importadas com sucesso!`);
        
        if (result.erros && result.erros.length > 0) {
          toast.warning(`${result.total_erros} escalas tiveram problemas`);
        }

        setIsOpen(false);
        resetDialog();
        onImportSuccess?.();
      } else {
        toast.error(result.error || "Erro ao importar dados");
      }
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      toast.error("Erro de conexão ao importar");
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setProcessingResult(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadJson = () => {
    if (!processingResult?.data) return;

    const dataStr = JSON.stringify(processingResult.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "escala-limpeza.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Escala
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importar Escala de Limpeza
          </DialogTitle>
          <DialogDescription>
            Faça upload de um PDF com a escala de limpeza para extrair automaticamente,
            ou carregue um arquivo JSON previamente processado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="pdf-upload">Arquivo PDF ou JSON</Label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Input
                ref={fileInputRef}
                id="pdf-upload"
                type="file"
                accept=".pdf,.json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="space-y-2">
                <FileText className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium">
                    {file ? file.name : "Clique para selecionar ou arraste um arquivo PDF ou JSON"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF: Para extrair escala automaticamente<br/>
                    JSON: Para reutilizar dados previamente processados
                  </p>
                </div>
              </div>
            </div>

            {file && file.type === "application/pdf" && (
              <Button 
                onClick={processPdf} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processando..." : "Processar PDF"}
              </Button>
            )}
          </div>

          {/* Results Section */}
          <AnimatePresence>
            {processingResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card className={`border-l-4 ${
                  processingResult.success 
                    ? "border-l-teal-500 bg-teal-50" 
                    : "border-l-rose-500 bg-rose-50"
                }`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {processingResult.success ? (
                        <CheckCircle className="h-5 w-5 text-teal-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                      {processingResult.success ? "Processamento Concluído" : "Erro no Processamento"}
                    </CardTitle>
                    <CardDescription>
                      {processingResult.message || processingResult.error}
                    </CardDescription>
                  </CardHeader>

                  {processingResult.success && processingResult.data && (
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {processingResult.data.escalas.length} escalas
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            {showPreview ? "Ocultar" : "Visualizar"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadJson}
                            className="gap-1"
                          >
                            <Download className="h-3 w-3" />
                            Baixar JSON
                          </Button>
                        </div>
                      </div>

                      {processingResult.warnings && processingResult.warnings.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-800">
                              Avisos ({processingResult.warnings.length})
                            </span>
                          </div>
                          <ul className="text-xs text-amber-700 space-y-1">
                            {processingResult.warnings.map((warning, index) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <AnimatePresence>
                        {showPreview && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border rounded-lg"
                          >
                            <ScrollArea className="h-64">
                              <div className="p-4 space-y-3">
                                {processingResult.data.escalas.map((escala, index) => (
                                  <div key={index} className="border rounded-lg p-3 bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium text-sm">
                                          {formatDate(escala.data_limpeza)}
                                        </span>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {escala.grupo_id}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Users className="h-3 w-3" />
                                      <span>{escala.publicadores.length} publicador(es)</span>
                                    </div>
                                    {escala.observacoes && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {escala.observacoes}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  )}

                  {!processingResult.success && (
                    <CardContent>
                      <div className="text-sm text-rose-700">
                        {processingResult.details && (
                          <p className="mb-2">{processingResult.details}</p>
                        )}
                        {processingResult.validationErrors && Array.isArray(processingResult.validationErrors) && (
                          <ul className="list-disc list-inside space-y-1">
                            {processingResult.validationErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={resetDialog}>
            Limpar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            {processingResult?.success && (
              <Button 
                onClick={importData} 
                disabled={isImporting}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isImporting ? "Importando..." : "Importar Escalas"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}