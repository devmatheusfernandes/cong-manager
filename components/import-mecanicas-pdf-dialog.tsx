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
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Pessoa {
  nome: string;
  id: string;
}

interface DesignacaoMecanica {
  id: string;
  data: string;
  tipo_reuniao: "meio_semana" | "fim_semana";
  presidente: Pessoa | null;
  leitor: Pessoa | null;
  indicador_entrada: Pessoa | null;
  indicador_auditorio: Pessoa | null;
  audio_video: Pessoa | null;
  volante: Pessoa | null;
  palco: Pessoa | null;
}

interface MecanicasData {
  designacoes_mecanicas: DesignacaoMecanica[];
}

interface ProcessingResult {
  success: boolean;
  data?: MecanicasData;
  message?: string;
  warnings?: string[];
  error?: string;
  details?: string;
  validationErrors?: string[];
}

interface ImportMecanicasPdfDialogProps {
  onImportSuccess?: () => void;
}

export function ImportMecanicasPdfDialog({ onImportSuccess }: ImportMecanicasPdfDialogProps) {
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
      if (jsonData.designacoes_mecanicas && Array.isArray(jsonData.designacoes_mecanicas)) {
        setProcessingResult({
          success: true,
          data: jsonData,
          message: "Arquivo JSON carregado com sucesso!"
        });
        
        toast.success("Arquivo JSON carregado e validado com sucesso!");
      } else {
        setProcessingResult({
          success: false,
          error: "Estrutura inválida",
          details: "Arquivo JSON não possui a estrutura esperada para designações mecânicas."
        });
        toast.error("Arquivo JSON não possui a estrutura esperada para designações mecânicas.");
      }
    } catch (error) {
      console.error("Erro ao processar arquivo JSON:", error);
      setProcessingResult({
        success: false,
        error: "Erro de formato",
        details: "Erro ao processar arquivo JSON. Verifique se o formato está correto."
      });
      toast.error("Erro ao processar arquivo JSON. Verifique se o formato está correto.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== "application/pdf") {
        toast.error("Por favor, selecione um arquivo PDF válido");
        return;
      }
      setFile(droppedFile);
      setProcessingResult(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("/api/mecanicas/import-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setProcessingResult({
          success: true,
          data: result.data,
          message: result.message,
          warnings: result.warnings,
        });
        toast.success("PDF processado com sucesso!");
      } else {
        setProcessingResult({
          success: false,
          error: result.error,
          details: result.details,
          validationErrors: result.validationErrors,
        });
        toast.error("Erro ao processar PDF");
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      setProcessingResult({
        success: false,
        error: "Erro de conexão",
        details: "Não foi possível conectar ao servidor",
      });
      toast.error("Erro de conexão");
    } finally {
      setIsProcessing(false);
    }
  };

  const importData = async () => {
    if (!processingResult?.data) return;

    setIsImporting(true);

    try {
      const response = await fetch("/api/mecanicas/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processingResult.data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`${result.total_salvas} designações importadas com sucesso!`);
        
        if (result.erros && result.erros.length > 0) {
          toast.warning(`${result.total_erros} designações tiveram problemas`);
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
    link.download = "designacoes-mecanicas.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTipoReuniao = (tipo: string) => {
    return tipo === "meio_semana" ? "Meio de Semana" : "Fim de Semana";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Arquivo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importar Designações
          </DialogTitle>
          <DialogDescription>
            Faça upload de um PDF com as designações mecânicas para extrair automaticamente,
            ou carregue um arquivo JSON previamente processado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="pdf-upload">Arquivo PDF</Label>
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
                    PDF: Para extrair designações automaticamente<br/>
                    JSON: Para reutilizar dados previamente processados
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Badge variant="secondary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
                <Button
                  onClick={processFile}
                  disabled={isProcessing}
                  size="sm"
                >
                  {isProcessing ? "Processando..." : "Processar"}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Processing Results */}
          <AnimatePresence>
            {processingResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Separator />
                
                {processingResult.success ? (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-green-800">
                          Processamento Concluído
                        </CardTitle>
                      </div>
                      <CardDescription className="text-green-700">
                        {processingResult.message}
                      </CardDescription>
                    </CardHeader>
                    
                    {processingResult.warnings && processingResult.warnings.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-700">
                              Avisos ({processingResult.warnings.length})
                            </span>
                          </div>
                          <ScrollArea className="h-20">
                            <ul className="text-xs space-y-1 text-amber-600">
                              {processingResult.warnings.map((warning, index) => (
                                <li key={index}>• {warning}</li>
                              ))}
                            </ul>
                          </ScrollArea>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ) : (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-red-800">
                          Erro no Processamento
                        </CardTitle>
                      </div>
                      <CardDescription className="text-red-700">
                        {processingResult.error}
                      </CardDescription>
                    </CardHeader>
                    
                    {(processingResult.details || processingResult.validationErrors) && (
                      <CardContent>
                        {processingResult.details && (
                          <p className="text-sm text-red-600 mb-2">
                            {processingResult.details}
                          </p>
                        )}
                        
                        {processingResult.validationErrors && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-red-700">
                              Erros de validação:
                            </span>
                            <ScrollArea className="h-20">
                              <ul className="text-xs space-y-1 text-red-600">
                                {processingResult.validationErrors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </ScrollArea>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Preview and Actions */}
                {processingResult.success && processingResult.data && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        {showPreview ? "Ocultar" : "Visualizar"} Dados
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadJson}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Baixar JSON
                      </Button>
                    </div>

                    <AnimatePresence>
                      {showPreview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Dados Extraídos ({processingResult.data.designacoes_mecanicas.length} designações)
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-60">
                                <div className="space-y-3">
                                  {processingResult.data.designacoes_mecanicas.map((designacao, index) => (
                                    <div key={index} className="p-3 border rounded-lg space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{designacao.data}</span>
                                        <Badge variant="outline">
                                          {formatTipoReuniao(designacao.tipo_reuniao)}
                                        </Badge>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        {designacao.presidente && (
                                          <div><strong>Presidente:</strong> {designacao.presidente.nome}</div>
                                        )}
                                        {designacao.leitor && (
                                          <div><strong>Leitor:</strong> {designacao.leitor.nome}</div>
                                        )}
                                        {designacao.indicador_entrada && (
                                          <div><strong>Indicador Entrada:</strong> {designacao.indicador_entrada.nome}</div>
                                        )}
                                        {designacao.indicador_auditorio && (
                                          <div><strong>Indicador Auditório:</strong> {designacao.indicador_auditorio.nome}</div>
                                        )}
                                        {designacao.audio_video && (
                                          <div><strong>Áudio e Vídeo:</strong> {designacao.audio_video.nome}</div>
                                        )}
                                        {designacao.volante && (
                                          <div><strong>Volante:</strong> {designacao.volante.nome}</div>
                                        )}
                                        {designacao.palco && (
                                          <div><strong>Palco:</strong> {designacao.palco.nome}</div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              resetDialog();
            }}
          >
            Cancelar
          </Button>
          {processingResult?.success && (
            <Button
              onClick={importData}
              disabled={isImporting}
              className="gap-2"
            >
              {isImporting ? "Importando..." : "Importar Dados"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}