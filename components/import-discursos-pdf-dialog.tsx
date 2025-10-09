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
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download, Eye, Calendar, Users, Mic } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Discurso {
  id?: string;
  orador: string;
  tema: string;
  data: string;
  cantico?: string | null;
  hospitalidade?: string | null;
  tem_imagem?: boolean;
}

interface DiscursosData {
  discursos: Discurso[];
}

interface ProcessingResult {
  success: boolean;
  data?: DiscursosData;
  message?: string;
  warnings?: string[];
  error?: string;
  details?: string;
  validationErrors?: string[];
}

interface ImportDiscursosPdfDialogProps {
  onImportSuccess?: () => void;
}

export function ImportDiscursosPdfDialog({ onImportSuccess }: ImportDiscursosPdfDialogProps) {
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
      if (jsonData.discursos && Array.isArray(jsonData.discursos)) {
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
          details: "O arquivo deve conter um array 'discursos'"
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

      const response = await fetch("/api/discursos/import-pdf", {
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

      const response = await fetch("/api/discursos/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processingResult.data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`${result.total_salvos} discursos importados com sucesso!`);
        
        if (result.erros && result.erros.length > 0) {
          toast.warning(`${result.total_erros} discursos tiveram problemas`);
        }

        setIsOpen(false);
        setFile(null);
        setProcessingResult(null);
        
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        toast.error(result.error || "Erro ao importar discursos");
      }
    } catch (error) {
      console.error("Erro ao importar discursos:", error);
      toast.error("Erro de conexão ao importar discursos");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadJson = () => {
    if (!processingResult?.data) return;

    const dataStr = JSON.stringify(processingResult.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `discursos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Arquivo JSON baixado com sucesso!");
  };

  const resetDialog = () => {
    setFile(null);
    setProcessingResult(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Importar Arranjo de Oradores
          </DialogTitle>
          <DialogDescription>
            Faça upload de um PDF do arranjo de oradores ou um arquivo JSON para importar os discursos
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Clique para selecionar ou arraste um arquivo
            </p>
            <p className="text-sm text-gray-500">
              Arquivos PDF ou JSON (máx. 10MB)
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File Info */}
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">{file.name}</p>
                <p className="text-sm text-blue-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {file.type === "application/pdf" && !processingResult && (
                <Button
                  onClick={processPdf}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Processar PDF
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          )}

          {/* Processing Result */}
          <AnimatePresence>
            {processingResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Status Card */}
                <Card className={`border-l-4 ${
                  processingResult.success 
                    ? 'border-l-green-500 bg-green-50' 
                    : 'border-l-red-500 bg-red-50'
                }`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {processingResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      {processingResult.success ? "Processamento Concluído" : "Erro no Processamento"}
                    </CardTitle>
                    <CardDescription className={
                      processingResult.success ? 'text-green-700' : 'text-red-700'
                    }>
                      {processingResult.message || processingResult.error}
                    </CardDescription>
                  </CardHeader>
                  
                  {processingResult.success && processingResult.data && (
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary" className="gap-1">
                          <Mic className="h-3 w-3" />
                          {processingResult.data.discursos.length} discursos
                        </Badge>
                        
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
                    </CardContent>
                  )}
                </Card>

                {/* Warnings */}
                {processingResult.warnings && processingResult.warnings.length > 0 && (
                  <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-yellow-800">
                        <AlertTriangle className="h-5 w-5" />
                        Avisos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1 text-sm text-yellow-700">
                        {processingResult.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-1">•</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Validation Errors */}
                {processingResult.validationErrors && processingResult.validationErrors.length > 0 && (
                  <Card className="border-l-4 border-l-red-500 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-red-800">
                        <XCircle className="h-5 w-5" />
                        Erros de Validação
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1 text-sm text-red-700">
                        {processingResult.validationErrors.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Preview */}
                {showPreview && processingResult.success && processingResult.data && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Prévia dos Discursos
                      </CardTitle>
                      <CardDescription>
                        Verifique os dados antes de importar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {processingResult.data.discursos.map((discurso, index) => (
                            <div key={index} className="p-3 border rounded-lg bg-gray-50">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-sm">
                                      {formatDate(discurso.data)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">
                                      {discurso.orador}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {discurso.tema}
                                  </p>
                                  {discurso.cantico && (
                                    <p className="text-xs text-gray-600">
                                      Cântico: {discurso.cantico}
                                    </p>
                                  )}
                                  {discurso.hospitalidade && (
                                    <p className="text-xs text-gray-600">
                                      Hospitalidade: {discurso.hospitalidade}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          
          {processingResult?.success && (
            <Button
              onClick={importData}
              disabled={isImporting}
              className="gap-2"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Importar Discursos
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}